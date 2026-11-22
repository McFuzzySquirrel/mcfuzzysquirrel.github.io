import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  lstat,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile
} from "node:fs/promises";
import { dirname, isAbsolute, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const MANIFEST = ".pages-output-manifest.json";

function hash(contents) {
  return createHash("sha256").update(contents).digest("hex");
}

function resolveInside(root, relativePath) {
  if (
    typeof relativePath !== "string" ||
    isAbsolute(relativePath) ||
    relativePath.split(/[\\/]/).some((part) => part === ".." || part === "")
  ) {
    throw new Error(`Unsafe generated path in output manifest: ${relativePath}`);
  }
  const target = resolve(root, relativePath);
  if (!target.startsWith(`${root}${sep}`)) {
    throw new Error(`Generated path escapes repository root: ${relativePath}`);
  }
  return target;
}

async function collectFiles(directory, prefix = "") {
  const files = new Map();
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) throw new Error(`Refusing symlinks in static export: ${relativePath}`);
    if (entry.isDirectory()) {
      for (const [filePath, contents] of await collectFiles(resolve(directory, entry.name), relativePath)) {
        files.set(filePath, contents);
      }
    } else if (entry.isFile()) {
      files.set(relativePath, await readFile(resolve(directory, entry.name)));
    }
  }
  return files;
}

async function readManifest(repositoryRoot) {
  try {
    const parsed = JSON.parse(await readFile(resolve(repositoryRoot, MANIFEST), "utf8"));
    if (parsed.version !== 1 || typeof parsed.files !== "object" || parsed.files === null) {
      throw new Error(`Unsupported ${MANIFEST} format.`);
    }
    for (const [filePath, digest] of Object.entries(parsed.files)) {
      resolveInside(repositoryRoot, filePath);
      if (typeof digest !== "string" || !/^[a-f0-9]{64}$/.test(digest)) {
        throw new Error(`Invalid hash for generated file: ${filePath}`);
      }
    }
    return parsed.files;
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

export async function syncGeneratedSite({ repositoryRoot, outputDirectory, branchName }) {
  if (branchName !== "gh-pages") {
    throw new Error("Static output can only be synced on the gh-pages branch.");
  }

  const root = resolve(repositoryRoot);
  const output = resolve(outputDirectory);
  const currentFiles = await collectFiles(output);
  if (!currentFiles.has(".nojekyll") || !currentFiles.has("index.html")) {
    throw new Error("Static export is incomplete: expected .nojekyll and index.html.");
  }

  const previousHashes = await readManifest(root);
  const nextHashes = Object.fromEntries(
    [...currentFiles].map(([filePath, contents]) => [filePath, hash(contents)])
  );

  for (const [filePath, previousHash] of Object.entries(previousHashes)) {
    if (currentFiles.has(filePath)) continue;
    const target = resolveInside(root, filePath);
    let existing;
    try {
      const details = await lstat(target);
      if (details.isSymbolicLink() || !details.isFile()) {
        throw new Error(`Refusing to remove non-file generated path: ${filePath}`);
      }
      existing = await readFile(target);
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    if (hash(existing) !== previousHash) {
      throw new Error(`Refusing to remove a modified generated file: ${filePath}`);
    }
    await rm(target);
  }

  for (const [filePath, contents] of currentFiles) {
    const target = resolveInside(root, filePath);
    let existing;
    try {
      const details = await lstat(target);
      if (details.isSymbolicLink() || !details.isFile()) {
        throw new Error(`Refusing to overwrite non-file path: ${filePath}`);
      }
      existing = await readFile(target);
    } catch (error) {
      if (error.code === "ENOENT") {
        existing = null;
      } else {
        throw error;
      }
    }

    if (existing) {
      const existingHash = hash(existing);
      const previousHash = previousHashes[filePath];
      const nextHash = nextHashes[filePath];
      if (previousHash && existingHash !== previousHash && existingHash !== nextHash) {
        throw new Error(`Refusing to overwrite a modified generated file: ${filePath}`);
      }
      if (!previousHash && existingHash !== nextHash) {
        throw new Error(`Generated output collides with an unowned file: ${filePath}`);
      }
    }

    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, contents);
  }

  await writeFile(
    resolve(root, MANIFEST),
    `${JSON.stringify({ version: 1, files: nextHashes }, null, 2)}\n`
  );
}

async function main() {
  const repositoryRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
  const branchName = execFileSync("git", ["branch", "--show-current"], {
    cwd: repositoryRoot,
    encoding: "utf8"
  }).trim();
  await syncGeneratedSite({
    repositoryRoot,
    outputDirectory: resolve(repositoryRoot, "dist"),
    branchName
  });
  console.log("Static export synced to the gh-pages branch root. Review the diff, then commit and push.");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

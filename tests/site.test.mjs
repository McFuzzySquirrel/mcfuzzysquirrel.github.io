import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { syncGeneratedSite } from "../scripts/sync-pages.mjs";

const output = resolve("dist");

const posts = [
  {
    slug: "skill-loom",
    legacy: "/personal/project/2026/11/22/skill-loom.html",
    title: "Skill Loom: Weaving Skills into Repeatable Chains and Shared Workflows"
  },
  {
    slug: "reflecting-on-myforge",
    legacy: "/personal/project/2026/10/06/reflecting-on-myforge.html",
    title: "Reflecting on MyForge: From Agent Forge to the Value Chain"
  },
  {
    slug: "the-unexpected-journey",
    legacy: "/personal/project/2026/08/10/the-unexpected-journey.html",
    title: "The unexpected journey of building Skill Forge"
  },
  {
    slug: "knowledge-dungeon-from-notes-to-explorable-world",
    legacy: "/personal/project/2026/05/30/knowledge-dungeon-from-notes-to-explorable-world.html",
    title: "Knowledge Dungeon: Turning Study Notes into an Explorable World"
  },
  {
    slug: "revisiting-vibn-rocket-game-17-months-later",
    legacy: "/personal/project/2026/04/18/revisiting-vibn-rocket-game-17-months-later.html",
    title: "Revisiting Vib'N: From a Pitch Experiment to a Rocket Game, 17 Months Later"
  },
  {
    slug: "complete-story-engineering-journey-system",
    legacy: "/personal/tools/2026/04/10/complete-story-engineering-journey-system.html",
    title: "The Complete Story of the Engineering Journey System"
  },
  {
    slug: "ai-assisted-research",
    legacy: "/personal/workflow/2026/03/26/ai-assisted-research.html",
    title: "The AI-Assisted Research Habit: From Questions to Informed Decisions"
  },
  {
    slug: "story-of-agent-forge",
    legacy: "/personal/update/2026/03/20/story-of-agent-forge.html",
    title: "The Story of Agent Forge: Building an AI Development Team from Scratch"
  },
  {
    slug: "offline-ai-tutor-ezansiedgeai-ejs",
    legacy: "/personal/update/2026/03/17/offline-ai-tutor-ezansiedgeai-ejs.html",
    title: "What I'm Learning from Building an Offline AI Tutor for South African Learners, and the System I Built to Remember Everything"
  }
];

function outputPath(url) {
  const clean = url.split("#")[0].split("?")[0];
  const relative = clean.replace(/^\/+/, "");
  const target = resolve(output, relative);
  if (clean === "/" || clean.endsWith("/")) return join(target, "index.html");
  return target;
}

function decodeHtml(value) {
  return value
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function page(url) {
  return readFile(outputPath(url), "utf8");
}

async function fileExists(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function htmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await htmlFiles(path)));
    else if (entry.name.endsWith(".html")) files.push(path);
  }
  return files;
}

test("builds every post at its new URL and leaves a redirect at the old URL", async () => {
  for (const post of posts) {
    const modern = await page(`/blog/${post.slug}/`);
    const heading = modern.match(/<h1>([\s\S]*?)<\/h1>/)?.[1] ?? "";
    assert.equal(decodeHtml(heading.trim()), post.title);
    assert.ok(modern.includes(`rel="canonical" href="https://mcfuzzysquirrel.github.io/blog/${post.slug}/"`));

    const legacy = await page(post.legacy);
    assert.match(legacy, /<meta name="robots" content="noindex">/);
    assert.match(legacy, new RegExp(`http-equiv="refresh" content="0; url=/blog/${post.slug}/"`));
    assert.match(legacy, new RegExp(`window.location.replace\\(`));
    assert.ok(
      legacy.includes(`<link rel="canonical" href="https://mcfuzzysquirrel.github.io/blog/${post.slug}/">`)
    );
  }
});

test("exports the main pages, feed, search index, sitemap, favicon, and static assets", async () => {
  for (const route of ["/", "/blog/", "/blog/page/2/", "/projects/", "/about/", "/404.html"]) {
    assert.ok(await fileExists(outputPath(route)), `Missing route ${route}`);
  }

  for (const file of [
    "feed.xml",
    "search-index.json",
    "sitemap-index.xml",
    "sitemap-0.xml",
    "robots.txt",
    "favicon.svg",
    ".nojekyll",
    "assets/images/squirrel-blacksmith.jpeg",
    "assets/images/squirrel-coder.jpg"
  ]) {
    assert.ok(await fileExists(resolve(output, file)), `Missing ${file}`);
  }
});

test("renders search, tag filtering, pagination, dark mode, and RSS affordances", async () => {
  const blog = await page("/blog/");
  const secondPage = await page("/blog/page/2/");

  assert.match(blog, /data-search-input/);
  assert.match(blog, /data-tag="all"/);
  assert.match(blog, /data-pagination/);
  assert.match(blog, /data-theme-toggle/);
  assert.match(blog, /\/search-index\.json/);
  assert.match(blog, /href="\/feed\.xml"/);
  assert.match(blog, /prefers-color-scheme: dark/);
  assert.match(secondPage, /rel="prev" href="\/blog\/"/);
  assert.doesNotMatch(secondPage, /rel="next"/);
});

test("renders post metadata, table of contents, related posts, navigation, and structured data", async () => {
  const post = await page("/blog/story-of-agent-forge/");

  assert.match(post, /"@type":"BlogPosting"/);
  assert.match(post, /Table of contents/);
  assert.match(post, /href="#the-spark"/);
  assert.match(post, /aria-label="Post navigation"/);
  assert.match(post, /More from the workbench/);
  assert.match(post, /min read/);
  assert.match(post, /Blog/);
});

test("keeps project ordering and the home page sections", async () => {
  const home = await page("/");
  const projectsPage = await page("/projects/");

  const projectFiles = (await readdir(resolve("src/content/projects"))).filter((name) =>
    name.endsWith(".md")
  );
  const projects = [];
  for (const file of projectFiles) {
    const source = await readFile(resolve("src/content/projects", file), "utf8");
    const title = source.match(/^title:\s*(.+)$/m)?.[1].trim();
    const order = Number(source.match(/^order:\s*(\d+)/m)?.[1] ?? 0);
    projects.push({ title, order });
  }
  projects.sort((left, right) => left.order - right.order);

  assert.equal(projects.length, 8);
  const positions = projects.map(({ title }) => projectsPage.indexOf(title));
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual(positions, [...positions].sort((left, right) => left - right));

  for (const section of ["home-introduction", "featured-project", "project-showcase", "recent-writing"]) {
    assert.ok(home.includes(`id="${section}"`), `Missing home section ${section}`);
  }
});

test("feed and sitemap advertise the new URLs without legacy redirects", async () => {
  const feed = await readFile(resolve(output, "feed.xml"), "utf8");
  assert.equal((feed.match(/<item>/g) ?? []).length, posts.length);
  for (const post of posts) {
    assert.ok(feed.includes(`https://mcfuzzysquirrel.github.io/blog/${post.slug}/`));
    assert.ok(!feed.includes(post.legacy));
  }

  const sitemap = await readFile(resolve(output, "sitemap-0.xml"), "utf8");
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.ok(locations.length >= posts.length + 4);
  assert.ok(locations.every((location) => location.endsWith("/")));
  assert.ok(locations.every((location) => !location.includes("/personal/")));
  for (const post of posts) {
    assert.ok(locations.includes(`https://mcfuzzysquirrel.github.io/blog/${post.slug}/`));
  }
});

test("search index covers published posts and points at built pages", async () => {
  const index = JSON.parse(await readFile(resolve(output, "search-index.json"), "utf8"));

  assert.equal(index.length, posts.length);
  for (const item of index) {
    assert.ok(item.title);
    assert.ok(item.excerpt);
    assert.ok(item.search.includes(item.title.toLowerCase()));
    assert.match(item.url, /^\/blog\/[a-z0-9-]+\/$/);
    assert.ok(await fileExists(outputPath(`/blog/${item.url.split("/")[2]}/`)));
  }
});

test("all internal links resolve to a built file", async () => {
  const files = await htmlFiles(output);
  const failures = [];

  for (const file of files) {
    const html = await readFile(file, "utf8");
    const links = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);

    for (const link of links) {
      if (
        !link.startsWith("/") ||
        link.startsWith("//") ||
        link.startsWith("/#") ||
        link.includes("${")
      ) {
        continue;
      }

      const clean = link.split("#")[0].split("?")[0];
      if (!clean) continue;

      let target = outputPath(clean);
      if (!extname(clean) && !clean.endsWith("/")) {
        const asDirectory = join(target, "index.html");
        const asFile = `${target}.html`;
        if (await fileExists(asDirectory)) target = asDirectory;
        else if (await fileExists(asFile)) target = asFile;
      }

      if (!(await fileExists(target))) {
        failures.push(`${file.replace(`${output}/`, "")} -> ${link}`);
      }
    }
  }

  assert.deepEqual(failures, []);
});

test("no Next.js or React runtime artifacts remain in the build", async () => {
  const files = await readdir(output);
  assert.ok(!files.includes("_next"));
  assert.deepEqual(
    files.filter((name) => name.endsWith(".txt")),
    ["robots.txt"]
  );

  const home = await page("/");
  assert.doesNotMatch(home, /__NEXT_DATA__|_next\/static/);
});

test("syncs generated pages without deleting modified or unowned files", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "static-site-sync-"));
  const repositoryRoot = join(temporary, "repo");
  const outputDirectory = join(temporary, "out");
  try {
    await mkdir(repositoryRoot);
    await mkdir(outputDirectory);
    await writeFile(join(outputDirectory, ".nojekyll"), "");
    await writeFile(join(outputDirectory, "index.html"), "first");
    await writeFile(join(outputDirectory, "old.html"), "generated old");

    await syncGeneratedSite({ repositoryRoot, outputDirectory, branchName: "gh-pages" });
    assert.equal(await readFile(join(repositoryRoot, "index.html"), "utf8"), "first");

    await writeFile(join(repositoryRoot, "old.html"), "user edit");
    await rm(join(outputDirectory, "old.html"));
    await writeFile(join(outputDirectory, "index.html"), "second");
    await assert.rejects(
      syncGeneratedSite({ repositoryRoot, outputDirectory, branchName: "gh-pages" }),
      /Refusing to remove a modified generated file/
    );
    assert.equal(await readFile(join(repositoryRoot, "old.html"), "utf8"), "user edit");

    await assert.rejects(
      syncGeneratedSite({ repositoryRoot, outputDirectory, branchName: "main" }),
      /only be synced on the gh-pages branch/
    );
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

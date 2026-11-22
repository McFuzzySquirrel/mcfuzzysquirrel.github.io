#!/usr/bin/env node
import { access, mkdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const ROOT = fileURLToPath(new URL("../../../../", import.meta.url));

function usage() {
  console.log(`Create a draft post for McFuzzySquirrel's Playground.

Usage:
  node .opencode/skills/blog-publisher/scripts/new-post.mjs \\
    --title "Post title" \\
    [--slug post-slug] \\
    [--categories personal,project] \\
    [--tags "ai,agents"] \\
    [--date YYYY-MM-DD] \\
    [--publish] [--dry-run]

Options:
  --title       Required. The post title.
  --slug        URL slug. Defaults to a slug derived from the title.
  --categories  Comma-separated categories. Default: personal,project
  --tags        Comma-separated tags. Default: none
  --date        Date prefix and frontmatter date. Default: today in Johannesburg.
  --publish     Do not add draft: true.
  --dry-run     Print the path and content without writing files.
  --help, -h    Show this message.
`);
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function johannesburgNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    timeZone: "Africa/Johannesburg",
    year: "numeric"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`
  };
}

function parseList(value) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function yamlString(value) {
  return JSON.stringify(value);
}

function yamlList(items) {
  return `[${items.map(yamlString).join(", ")}]`;
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00+02:00`);
  return !Number.isNaN(date.getTime()) && johannesburgNow(date).date === value;
}

async function main() {
  const { values } = parseArgs({
    allowPositionals: false,
    options: {
      categories: { type: "string", default: "personal,project" },
      date: { type: "string" },
      "dry-run": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
      publish: { type: "boolean", default: false },
      slug: { type: "string" },
      tags: { type: "string", default: "" },
      title: { type: "string" }
    }
  });

  if (values.help) {
    usage();
    return;
  }

  const title = values.title?.trim();
  if (!title) {
    console.error("Missing --title.\n");
    usage();
    process.exitCode = 1;
    return;
  }

  const now = johannesburgNow();
  const date = values.date?.trim() || now.date;
  if (!validDate(date)) {
    console.error(`Invalid --date "${date}". Use YYYY-MM-DD.`);
    process.exitCode = 1;
    return;
  }

  const slug = (values.slug?.trim() || slugify(title)).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    console.error(
      `Invalid slug "${slug}". Use lowercase letters, numbers, and single hyphens.`
    );
    process.exitCode = 1;
    return;
  }

  const categories = parseList(values.categories);
  const tags = parseList(values.tags);
  const draft = !values.publish;
  const filename = `${date}-${slug}.md`;
  const postPath = join(ROOT, "src", "content", "blog", filename);
  const imageDir = join(ROOT, "public", "assets", "images", `${date}-${slug}`);

  const content = [
    "---",
    `title: ${yamlString(title)}`,
    `date: ${date} ${now.time}:00 +0200`,
    `categories: ${yamlList(categories)}`,
    `tags: ${yamlList(tags)}`,
    ...(draft ? ["draft: true"] : []),
    "---",
    "",
    "Opening paragraph. Say what changed, what you learned, or why this is worth reading.",
    "",
    "<!--more-->",
    "",
    "## What I built",
    "",
    "Add the concrete story: the problem, the constraints, the decisions, the dead ends, and the result.",
    "",
    "## What I learned",
    "",
    "Add the transferable lesson. If a claim needs evidence, include the measurement or example.",
    "",
    "## What I would do next",
    "",
    "Optional. End on the next concrete step, not a summary of the post.",
    "",
    "---",
    "",
    "**Project:** [Project name](https://github.com/McFuzzySquirrel/project)",
    ""
  ].join("\n");

  if (values["dry-run"]) {
    console.log(`Would create ${postPath}\n`);
    console.log(content);
    return;
  }

  try {
    await access(postPath, constants.F_OK);
    console.error(`Post already exists: ${postPath}`);
    process.exitCode = 1;
    return;
  } catch {
    // The post does not exist yet, which is what we want.
  }

  await mkdir(join(ROOT, "src", "content", "blog"), { recursive: true });
  await writeFile(postPath, content, { flag: "wx" });
  await mkdir(imageDir, { recursive: true });
  await writeFile(join(imageDir, ".gitkeep"), "");

  console.log(`Created ${draft ? "draft" : "post"}: src/content/blog/${filename}`);
  console.log(`Image directory: public/assets/images/${date}-${slug}/`);
  console.log("");
  console.log("Preview: npm run dev");
  console.log(`Open: http://localhost:4321/blog/${slug}/`);
  if (draft) {
    console.log("Publish: remove `draft: true` or scaffold with --publish when ready.");
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

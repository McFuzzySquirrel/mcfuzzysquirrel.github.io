import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import test from "node:test";
import {
  dateParts,
  excerptFromBody,
  formatDate,
  isPublished,
  markdownToText,
  pagePosts,
  pageUrl,
  readingMinutes,
  relatedPosts,
  slugifySegment,
  summaryFromBody,
  totalPages
} from "../src/lib/post-utils.ts";

const contentRoot = resolve("src/content");

function frontmatter(source) {
  return source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
}

function field(source, name) {
  return source.match(new RegExp(`^${name}:\\s*(.+)$`, "m"))?.[1]?.trim() ?? "";
}

test("posts keep their titles, dates, arrays, and no Jekyll layout metadata", async () => {
  const files = (await readdir(join(contentRoot, "blog"))).filter((name) => name.endsWith(".md"));
  const originalPosts = [
    "2026-03-17-offline-ai-tutor-ezansiedgeai-ejs.md",
    "2026-03-20-story-of-agent-forge.md",
    "2026-03-26-ai-assisted-research.md",
    "2026-04-10-complete-story-engineering-journey-system.md",
    "2026-04-18-revisiting-vibn-rocket-game-17-months-later.md",
    "2026-05-30-knowledge-dungeon-from-notes-to-explorable-world.md",
    "2026-08-10-the-unexpected-journey.md",
    "2026-10-06-reflecting-on-myforge.md"
  ];
  for (const file of originalPosts) {
    assert.ok(files.includes(file), `Missing migrated post: ${file}`);
  }

  const slugs = new Set();
  for (const file of files) {
    const source = await readFile(join(contentRoot, "blog", file), "utf8");
    const metadata = frontmatter(source);
    assert.ok(field(metadata, "title"), `${file} is missing a title`);
    assert.ok(field(metadata, "date"), `${file} is missing a date`);
    assert.match(field(metadata, "categories"), /^\[.*\]$/, `${file} should use array categories`);
    assert.doesNotMatch(metadata, /^layout:/m, `${file} should not keep the Jekyll layout field`);

    const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
    assert.ok(!slugs.has(slug), `Duplicate slug: ${slug}`);
    slugs.add(slug);
  }
});

test("projects remain ordered and point their build stories at new URLs", async () => {
  const files = (await readdir(join(contentRoot, "projects"))).filter((name) => name.endsWith(".md"));
  assert.equal(files.length, 9);

  const projects = [];
  for (const file of files) {
    const source = await readFile(join(contentRoot, "projects", file), "utf8");
    projects.push({
      file,
      title: field(source, "title"),
      order: Number(field(source, "order")),
      storyUrl: field(source, "story_url")
    });
  }

  projects.sort((left, right) => left.order - right.order);
  assert.deepEqual(projects.map((project) => project.order), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.ok(projects.every((project) => project.title));

  for (const project of projects.filter((candidate) => candidate.storyUrl)) {
    assert.match(
      project.storyUrl,
      /^\/blog\/[a-z0-9-]+\/$/,
      `${project.file} story_url should use the new /blog/<slug>/ URL`
    );
  }
});

test("text helpers flatten Markdown for cards, search, and feeds", () => {
  const body = [
    "## A heading",
    "",
    "> A quoted intro with *emphasis*.",
    "",
    "Read the [build story](/blog/example/) and ![a squirrel](/squirrel.png).",
    "",
    "<!--more-->",
    "",
    "The rest of the post."
  ].join("\n");

  assert.equal(
    summaryFromBody(body),
    "A heading A quoted intro with emphasis. Read the build story and a squirrel."
  );
  assert.equal(excerptFromBody(body), summaryFromBody(body));
  assert.equal(excerptFromBody(body, "Custom summary"), "Custom summary");
  assert.equal(markdownToText("`code` and <strong>HTML</strong>"), "code and HTML");
  assert.equal(readingMinutes("one two three"), 1);
});

test("slug, date, pagination, and draft helpers behave predictably", () => {
  assert.equal(slugifySegment("Personal Update"), "personal-update");
  assert.equal(slugifySegment("R&D Notes"), "r-and-d-notes");
  assert.equal(slugifySegment("!!!"), "section");

  const date = new Date("2026-03-17T21:10:00Z");
  assert.equal(formatDate(date), "Mar 17, 2026");
  assert.deepEqual(dateParts(date), ["2026", "03", "17"]);

  const posts = Array.from({ length: 8 }, (_, index) => index);
  assert.equal(totalPages([]), 1);
  assert.equal(totalPages(posts), 2);
  assert.deepEqual(pagePosts(posts, 1), [0, 1, 2, 3, 4, 5]);
  assert.deepEqual(pagePosts(posts, 2), [6, 7]);
  assert.equal(pageUrl(1), "/blog/");
  assert.equal(pageUrl(2), "/blog/page/2/");

  assert.equal(isPublished({ data: { draft: true } }, false), false);
  assert.equal(isPublished({ data: { draft: true } }, true), true);
  assert.equal(isPublished({ data: { draft: false } }, false), true);
});

test("related posts prefer shared tags, then shared categories, and fill the gap", () => {
  const post = (slug, tags, categories, date) => ({
    slug,
    tags,
    categories,
    data: { date: new Date(date) }
  });

  const posts = [
    post("current", ["ai", "tools"], ["personal"], "2026-01-01"),
    post("tag-match", ["ai"], ["personal"], "2026-02-01"),
    post("category-match", ["writing"], ["personal"], "2026-03-01"),
    post("unrelated-new", [], [], "2026-04-01"),
    post("unrelated-old", [], [], "2025-12-01")
  ];

  const related = relatedPosts(posts[0], posts, 3);
  assert.deepEqual(related.map((candidate) => candidate.slug), [
    "tag-match",
    "category-match",
    "unrelated-new"
  ]);
  assert.equal(relatedPosts(posts[0], posts, 2).length, 2);
});

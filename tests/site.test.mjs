import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { getPosts, getProjects } from "../src/lib/content.js";
import { filterPostsByTag } from "../src/lib/tag-filter.js";
import { syncGeneratedSite } from "../scripts/sync-pages.mjs";

const root = process.cwd();
const output = resolve(root, "out");
const expectedPostUrls = [
  "/personal/project/2026/10/06/reflecting-on-myforge.html",
  "/personal/project/2026/08/10/the-unexpected-journey.html",
  "/personal/project/2026/05/30/knowledge-dungeon-from-notes-to-explorable-world.html",
  "/personal/project/2026/04/18/revisiting-vibn-rocket-game-17-months-later.html",
  "/personal/tools/2026/04/10/complete-story-engineering-journey-system.html",
  "/personal/workflow/2026/03/26/ai-assisted-research.html",
  "/personal/update/2026/03/20/story-of-agent-forge.html",
  "/personal/update/2026/03/17/offline-ai-tutor-ezansiedgeai-ejs.html"
];

function outputPath(url) {
  const relative = url.replace(/^\/+/, "");
  return resolve(output, url.endsWith("/") ? join(relative, "index.html") : relative);
}

async function page(url) {
  return readFile(outputPath(url), "utf8");
}

test("exports every existing post URL as a static HTML file", async () => {
  assert.deepEqual(getPosts().map((post) => post.url), expectedPostUrls);
  for (const url of expectedPostUrls) {
    await assert.doesNotReject(readFile(outputPath(url)));
  }
});

test("exports the existing page routes, feed, Jekyll bypass, and site images", async () => {
  for (const route of ["/", "/blog/", "/projects/", "/about/", "/404.html"]) {
    await assert.doesNotReject(readFile(outputPath(route)));
  }
  await assert.doesNotReject(readFile(resolve(output, "feed.xml")));
  await assert.doesNotReject(readFile(resolve(output, ".nojekyll")));
  await assert.doesNotReject(readFile(resolve(output, "assets/images/squirrel-blacksmith.jpeg")));
});

test("renders blog filtering, RSS, metadata, table of contents, and post navigation", async () => {
  const blog = await page("/blog/");
  const post = await page(expectedPostUrls[6]);

  assert.match(blog, /data-filter="all"/);
  assert.match(blog, /aria-label="Filter posts by tag"/);
  assert.match(blog, /href="\/feed\.xml"/);
  assert.match(post, /itemtype="https:\/\/schema\.org\/BlogPosting"/i);
  assert.match(post, /Table of Contents/);
  assert.match(post, /href="#the-spark"/);
  assert.match(post, /aria-label="Post navigation"/);
  assert.match(post, /min read/);
});

test("keeps projects ordered and exposes all original homepage sections", async () => {
  const home = await page("/");
  const projectsPage = await page("/projects/");
  const projectNames = getProjects().map((project) => project.title);
  const positions = projectNames.map((name) => projectsPage.indexOf(name));

  assert.equal(projectNames.length, 8);
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual(positions, [...positions].sort((left, right) => left - right));
  for (const section of ["home-introduction", "featured-project", "project-showcase", "recent-writing"]) {
    assert.ok(home.includes(`id="${section}"`), `Missing homepage section ${section}`);
  }
});

test("excludes draft posts from production output but includes them for local preview", async () => {
  const contentRoot = await mkdtemp(join(tmpdir(), "static-site-content-"));
  try {
    await mkdir(join(contentRoot, "_posts"));
    await mkdir(join(contentRoot, "_drafts"));
    await writeFile(
      join(contentRoot, "_posts", "2026-01-02-public-post.markdown"),
      "---\ntitle: Public post\ndate: 2026-01-02 12:00:00 +0200\ncategories: personal project\n---\nPublic body\n"
    );
    await writeFile(
      join(contentRoot, "_drafts", "private-post.markdown"),
      "---\ntitle: Private preview\n---\nDraft body\n"
    );

    const published = getPosts({ contentRoot });
    const withDrafts = getPosts({ contentRoot, includeDrafts: true });

    assert.equal(published.length, 1);
    assert.equal(published[0].url, "/personal/project/2026/01/02/public-post.html");
    const preview = withDrafts.find((post) => post.draft);
    assert.ok(preview);
    assert.equal(preview.previewUrl, "/drafts/private-post");
  } finally {
    await rm(contentRoot, { recursive: true, force: true });
  }

  const outputFiles = await readdir(output);
  assert.ok(!outputFiles.includes("drafts.html"));
});

test("filters posts by exact tag and restores the full list for All", () => {
  const posts = [
    { title: "One", tags: ["AI agents", "tools"] },
    { title: "Two", tags: ["writing"] }
  ];

  assert.deepEqual(filterPostsByTag(posts, "AI agents"), [posts[0]]);
  assert.deepEqual(filterPostsByTag(posts, "all"), posts);
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

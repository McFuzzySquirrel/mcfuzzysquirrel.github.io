---
name: Blog Publisher
description: Write, review, and publish posts for McFuzzySquirrel's Playground. Use when drafting a new blog post, editing or fact-checking an existing post, preparing images, running the Astro checks, syncing the gh-pages output, or verifying a live deployment.
---

# Blog Publisher

This skill covers the whole loop for the Astro blog in this repository: draft,
preview, check, publish, and verify. Read `docs/local-authoring.md` for the
current commands and `src/content.config.ts` for the frontmatter schema.

## Before writing

Ask for the parts you cannot infer:

- The story: what happened, what changed, or what the reader should learn.
- The reader: another builder, a collaborator, a future version of the author.
- The takeaway: the one thing the reader should remember.
- Any screenshots, diagrams, or repo links.
- Whether the post is a draft or ready to publish.

If the author supplies a rough draft, read it fully before editing. Preserve
their voice: first person, practical, specific, comfortable with uncertainty.
These are build stories, not marketing pages.

Before the final polish, load the `no-ai-slop` skill and run an edit pass. Ask it
to preserve the author's cadence and technical detail. Do not sand every edge
off the post.

## Create the post

Scaffold a draft with the companion script:

```sh
node .opencode/skills/blog-publisher/scripts/new-post.mjs \
  --title "What I learned from the build" \
  --categories personal,project \
  --tags "ai,agents,build-notes"
```

The script creates `src/content/blog/YYYY-MM-DD-slug.md` and an image directory
under `public/assets/images/YYYY-MM-DD-slug/`. New posts are drafts by default.
Add `--publish` when the post should go into production builds.

Useful flags:

- `--slug <slug>`: override the slug derived from the title.
- `--date YYYY-MM-DD`: override the Johannesburg date.
- `--publish`: write the post without `draft: true`.
- `--dry-run`: print the path and content without writing.
- `--help`: show the full usage.

A copyable version of the frontmatter and structure lives in
`references/post-template.md`.

## Content rules

- Published posts live in `src/content/blog/YYYY-MM-DD-slug.md`. The date prefix
  is stripped to form the slug, so `2026-11-22-my-post.md` becomes
  `/blog/my-post/`.
- Use `draft: true` while working. Drafts appear in `npm run dev` and are
  excluded from production builds.
- Put `<!--more-->` after the opening excerpt. The text before it becomes the
  card excerpt, search summary, and feed description.
- Use `categories` for the broad shelf (`personal`, `project`, `update`,
  `workflow`, `tools`) and `tags` for the specific topics. Tags are displayed as
  written, so use readable labels such as `AI agents`, not URL slugs.
- Images go in `public/assets/images/<post-filename>/` and are referenced with
  root paths such as `/assets/images/<post-filename>/screenshot.png`. Always
  write alt text. Keep the image source reasonably sized.
- Link to other posts with the current URL shape: `/blog/<slug>/`. Never link to
  the old `.html` URLs.
- The page table of contents is generated from `h2` and `h3` headings. Use those
  levels for the real structure of the post.
- Keep the frontmatter `date` and the filename date aligned. The filename date
  and categories also generate the legacy redirect at
  `/<categories>/<yyyy>/<mm>/<dd>/<slug>.html`.
- Do not rename a published post's date prefix, slug, or categories without
  adding a redirect. That changes the old URL and breaks inbound links.

## Preview and check

```sh
npm run dev
```

Open `http://localhost:4321/blog/<slug>/` and check:

- The excerpt appears correctly on `/blog/`.
- The post appears in search and under the right tag.
- The table of contents and related posts look right.
- Images load and have useful alt text.
- Light and dark mode both read well.
- Mobile layout has no horizontal scroll.

Run the checks before publishing:

```sh
npm run check
npm test
```

`npm test` builds the site and verifies every post URL, legacy redirect, feed,
sitemap, search index, and internal link.

## Publish

The site publishes from the root of the `gh-pages` branch. Source and generated
files live together there.

```sh
git switch gh-pages
git pull --ff-only origin gh-pages
npm run pages:build
```

`pages:build` writes `dist/` and syncs it into the branch root through
`.pages-output-manifest.json`. Do not edit the generated root HTML by hand, and
do not delete the manifest.

Review the diff before committing:

```sh
git status
git diff --stat
```

Stage only what belongs to the post and the generated site. Leave unrelated
untracked agent files alone. Commit, then push:

```sh
git add src/content/blog/... public/assets/images/...
git add -A -- . ':(exclude).codegraph' ':(exclude).mcp.json' \
  ':(exclude)AGENTS.md' ':(exclude)GLOSSARY.md' \
  ':(exclude)docs/agents' ':(exclude)scripts/md_index.py' \
  ':(exclude)scripts/md_mcp_server.py'
git commit -m "Add post: <title>"
git push origin gh-pages
```

Do not publish a post that still has `draft: true`.

## Verify the live site

Wait for the Pages build:

```sh
gh api repos/McFuzzySquirrel/mcfuzzysquirrel.github.io/pages/builds/latest \
  --jq '.status'
```

Poll until the status is `built`. If it is `errored`, read the message:

```sh
gh api repos/McFuzzySquirrel/mcfuzzysquirrel.github.io/pages/builds/latest \
  --jq '.error.message'
```

Then check the public routes:

```sh
curl -s -o /dev/null -w '%{http_code}\n' \
  https://mcfuzzysquirrel.github.io/blog/<slug>/
curl -s -o /dev/null -w '%{http_code}\n' \
  https://mcfuzzysquirrel.github.io/blog/
curl -s -o /dev/null -w '%{http_code}\n' \
  https://mcfuzzysquirrel.github.io/search-index.json
```

For an existing post, confirm the old URL still redirects:

```sh
curl -s https://mcfuzzysquirrel.github.io/<old-path>.html \
  | grep -o 'http-equiv="refresh"[^>]*'
```

Also confirm the post is in `feed.xml` and that its images return `200`.

## Never

- Hand-edit `index.html`, `blog/`, `personal/`, `feed.xml`, `search-index.json`,
  `sitemap-*`, or `_astro/` in the branch root.
- Delete or rename `.pages-output-manifest.json`.
- Link to old `.html` post URLs from new content.
- Publish a draft.
- Commit unrelated untracked files just to get a clean status.

## Supporting files

- `references/post-template.md`: frontmatter and section skeleton.
- `references/publishing-checklist.md`: the short checklist to run before and
  after publishing.
- `scripts/new-post.mjs`: the draft scaffolder.

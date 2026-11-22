---
name: Blog Publisher
description: Write, review, and publish posts for McFuzzySquirrel's Playground. Use when drafting a new blog post, editing or fact-checking an existing post, preparing images, running the Astro checks, syncing the gh-pages output, or verifying a live deployment.
---

# Blog Publisher

This skill covers the whole loop for the Astro blog in this repository: draft,
preview, check, publish, and verify. Read `docs/local-authoring.md` for the
current commands and `src/content.config.ts` for the frontmatter schema.

## Discovery interview

Do not start writing from a one-line topic. Run a short discovery interview
first. The goal is a confirmed story brief, not a questionnaire.

Read `references/discovery-interview.md` before the first question round.

### How to run it

1. Read everything the author supplied: draft, notes, repo, PR, screenshots,
   transcript, or outline. Extract what is already known.
2. Ask only about gaps, contradictions, and decisions the material cannot
   answer. Never ask for a fact that is already in the reference.
3. Ask in rounds of three or four questions. Use the author's own terms and
   quote the line or artifact that prompted the question.
4. Reflect each answer back in one sentence before moving on. If an answer is
   vague, ask for a number, example, or decision.
5. Branch by post type: build story, experiment, reflection, tutorial,
   announcement, or postmortem. The reference has a question set for each.
6. Stop when you can write a brief with a title direction, premise, reader,
   takeaway, sections, evidence, exclusions, images and links, categories,
   tags, and draft or publish status.
7. Show the brief and ask: "What is wrong or missing?" Do not scaffold or draft
   until the author confirms it, unless they explicitly say "just write it."
8. If the author says "just write it," state the assumptions you are making and
   draft. Do not keep interviewing.

### Must-ask areas

- The change: what happened, what was believed before, what is believed now.
- The reader: who this is for and what they already know.
- The evidence: the number, error, screenshot, commit, or result that makes it
  credible.
- The shape: build story, experiment, reflection, tutorial, announcement, or
  postmortem.
- The boundary: anything private, client-owned, unreleased, or under NDA.
- The packaging: title direction, categories, tags, images, links, length.
- The publish plan: draft or live, timing, review, series.

### Reference material

- **Draft:** read it fully. Ask about missing evidence, repeated points,
  unsupported claims, and anything that sounds unlike the author.
- **Repo or PR:** inspect README, commits, diffs, docs, tests, and screenshots.
  Ask what should be public and what should stay out.
- **Notes or transcript:** extract decisions, numbers, quotes, and dead ends.
  Ask which are publishable.
- **Screenshots:** check for secrets, stale UI, and missing context. Ask for a
  caption and alt text.

Preserve the author's voice: first person, practical, specific, comfortable with
uncertainty. These are build stories, not marketing pages.

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
sitemap, search index, and internal link. `tests/site.test.mjs` keeps a baseline
list of the original posts. When you publish a new post, add its slug and legacy
URL to that list, or update the test to derive the published list from
`src/content/blog`.

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

- `references/discovery-interview.md`: the question bank and branching by post
  type.
- `references/post-template.md`: frontmatter and section skeleton.
- `references/publishing-checklist.md`: the short checklist to run before and
  after publishing.
- `scripts/new-post.mjs`: the draft scaffolder.

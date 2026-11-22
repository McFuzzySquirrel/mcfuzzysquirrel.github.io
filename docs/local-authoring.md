# Local Markdown authoring

The site is built with [Astro](https://astro.build/) and exported as static
files for GitHub Pages. Edit Markdown content directly in the repository; no
CMS, Ruby, or Jekyll is required.

## Prerequisites

- Node.js 22.23.4 or newer and npm.
- A Git clone of the repository.

Install dependencies once and start the local preview from the repository root:

```sh
npm install
npm run dev
```

Open <http://localhost:4321/>. Drafts marked with `draft: true` appear in the
local preview and are excluded from production builds.

## Content files

- Published posts: `src/content/blog/YYYY-MM-DD-slug.md`
- Drafts: the same folder, with `draft: true` in the front matter
- Projects: `src/content/projects/NN-project-name.md`

Posts render at `/blog/<slug>/`. The date prefix is stripped from the filename
to form the slug, and the front matter `date` controls the published date.

The filename date and categories are also used to generate a redirect page at
the old Jekyll-style URL, for example
`/personal/project/2026/10/06/reflecting-on-myforge.html`. Keep the date prefix
and category spelling stable after a post has been published so old links keep
working.

Example post front matter:

```yaml
---
title: A build story
date: 2026-11-18 12:00:00 +0200
categories: [personal, project]
tags: [experiments, learning]
draft: false
---
```

`<!--more-->` separates the archive excerpt and search summary from the rest of
the post. Put images in `public/assets/images/` and reference them with
`/assets/images/...` paths. Tags appear in the tag filter and search index;
categories appear as the kicker above the post title.

## Build and checks

```sh
npm run build     # static output in dist/
npm run preview   # preview the built site
npm run check     # Astro and TypeScript checks
npm test          # build, then run the content and output tests
```

## Publish

The GitHub Pages source is the root of the `gh-pages` branch. From that branch,
build and sync the static output into the branch root:

```sh
git switch gh-pages
git pull --ff-only origin gh-pages
npm run pages:build
```

Review the source and generated-file changes with `git status` and `git diff`.
The sync script only removes or overwrites files it previously generated; it
stops if an output file was changed manually or collides with an unowned file.
It does not commit or push. Commit the intended Markdown and generated static
site changes, then push them to `origin/gh-pages` to publish. The generated
`.nojekyll` file disables GitHub Pages' Jekyll processing.

The first sync after the Astro migration also removes the old Next.js output
(`_next/`, `*.txt`, and similar files) using the hashes recorded in
`.pages-output-manifest.json`. Keep that manifest file in place.

## Generated files

Do not hand-edit the generated HTML in the branch root. These are produced by
the build:

- `/blog/<slug>/` post pages
- `/blog/page/<n>/` archive pages
- `/personal/.../*.html` redirects from old post URLs
- `feed.xml`, `search-index.json`, `sitemap-index.xml`
- hashed CSS under `_astro/`

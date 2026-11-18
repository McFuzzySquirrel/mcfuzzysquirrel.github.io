# Local Markdown authoring

The site is built with Next.js and exported as static files for GitHub Pages.
Edit Markdown content directly in the repository; no CMS, Ruby, or Jekyll is
required.

## Prerequisites

- Node.js 20.9 or newer and npm.
- A Git clone of the repository.

Install dependencies once and start the local preview from the repository root:

```sh
npm install
npm run dev
```

Open <http://localhost:3000/>. Published posts appear in the Blog. Drafts saved
under `_drafts/` appear in the local preview and are excluded from production
builds.

## Content files

- Published posts: `_posts/YYYY-MM-DD-slug.markdown`
- Drafts: `_drafts/slug.markdown`
- Projects: `_projects/NN-project-name.md`

Keep the date prefix and categories in a published post's front matter aligned
with its intended URL. The public post path is generated from the filename,
categories, and date prefix. `<!--more-->` separates the archive excerpt from
the rest of the post. Put images in `public/assets/images/` and reference them
with `/assets/images/...` paths.

Example post front matter:

```yaml
---
layout: post
title: A build story
date: 2026-11-18 12:00:00 +0200
categories: [personal, project]
tags: [experiments, learning]
---
```

## Build and publish

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

Run the production build and focused checks with:

```sh
npm run build
npm test
```

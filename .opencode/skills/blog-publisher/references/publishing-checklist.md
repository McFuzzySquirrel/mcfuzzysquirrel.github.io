# Publishing checklist

## Draft

- [ ] The discovery brief is confirmed: premise, reader, takeaway, shape, and
  evidence.
- [ ] Sensitive details are removed or cleared for publication.
- [ ] The post is in `src/content/blog/YYYY-MM-DD-slug.md`.
- [ ] `title`, `date`, `categories`, and `tags` are present.
- [ ] `draft: true` is set while the post is unfinished.
- [ ] `<!--more-->` sits after the opening excerpt.
- [ ] Images are in `public/assets/images/<post-filename>/` and have alt text.
- [ ] Internal links use `/blog/<slug>/`, not old `.html` URLs.
- [ ] The filename date and frontmatter date agree.
- [ ] The `no-ai-slop` edit pass is done and the author's voice is intact.

## Preview

- [ ] `npm run dev` shows the post at `/blog/<slug>/`.
- [ ] The excerpt is right on `/blog/`.
- [ ] Search and tag filtering find the post.
- [ ] The table of contents, related posts, and prev/next links look right.
- [ ] Images load.
- [ ] Light and dark mode both read well.
- [ ] Mobile has no horizontal scroll.

## Checks

- [ ] `npm run check` reports 0 errors.
- [ ] `npm test` passes, including the internal-link crawl.
- [ ] `draft` is removed or set to `false` for a production post.

## Publish

- [ ] On `gh-pages`, with `git pull --ff-only origin gh-pages` complete.
- [ ] `npm run pages:build` finished cleanly.
- [ ] `git status` and `git diff --stat` contain only intended changes.
- [ ] The commit is pushed to `origin/gh-pages`.
- [ ] The Pages build status is `built`.

## Live

- [ ] `/blog/<slug>/` returns `200`.
- [ ] `/blog/` returns `200` and lists the post.
- [ ] `/search-index.json` returns `200`.
- [ ] `/feed.xml` contains the post URL.
- [ ] Old URLs still redirect for edited posts.
- [ ] Images return `200`.

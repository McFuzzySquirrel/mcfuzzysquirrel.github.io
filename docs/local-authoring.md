# Local content authoring

Sveltia CMS edits the Git working tree directly. It is configured for this
repository's `_posts`, `_drafts`, and `_projects` content. Keep existing post
filenames unchanged: Jekyll derives published URLs from those filenames and
categories; changing a saved post's date alone does not rename its file.

## Prerequisites

- Ruby, Bundler, and the dependencies in `Gemfile` (`bundle install` once).
- A Chromium-based browser such as Chrome, Edge, or Brave. Sveltia's local
  repository workflow uses the File System Access API and is not supported by
  Firefox or Safari.
- Network access to load the pinned Sveltia CMS bundle from its CDN.
- A Git clone of this repository. No access token, OAuth setup, or proxy server
  is needed for local-repository mode.

## Start the editor and draft preview

From the repository root, run:

```sh
bundle install
bundle exec jekyll serve --drafts --host 127.0.0.1 --config _config.yml,_config.local.yml
```

In Chromium, open <http://localhost:4000/admin/index.html>, choose **Work with
Local Repository**, and select this repository's root directory. Save edits in
Sveltia, then preview the rendered site and drafts at <http://localhost:4000/>.
The selected directory must be a Git repository.

The admin page is excluded from a normal Jekyll build. The local-only config
overlay includes it and enables drafts for the authoring server. Review and
manage changes with Git as usual. This setup does not add a Publish action;
publishing is outside this local-editor ticket.

Sveltia is pre-1.0, so verify post metadata and URLs in the diff before relying
on an edited post. The CMS script is pinned to version `0.266.0`.

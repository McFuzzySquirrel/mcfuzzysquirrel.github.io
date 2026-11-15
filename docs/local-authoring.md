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

## Start the editor, preview, and Publish control

Start the local Jekyll preview from the repository root:

```sh
bundle install
bundle exec jekyll serve --drafts --host 127.0.0.1 --config _config.yml,_config.local.yml
```

Before publishing, check out and synchronize the deployment branch while the
working tree is clean:

```sh
git switch gh-pages
git pull --ff-only origin gh-pages
```

In another terminal, start the companion from the repository root:

```sh
python3 scripts/local_authoring.py
```

Open <http://127.0.0.1:8765/> in Chromium. The page places Sveltia beside the
local Jekyll preview and shows the exact proposed content diff. In Sveltia,
choose **Work with Local Repository** and select this repository's root
directory. The preview is served at <http://127.0.0.1:4000/>.

The Publish button remains disabled unless the local `gh-pages` branch matches
`origin/gh-pages` and the only working-tree changes are regular post or project
content files. Only additions and edits are publishable; deleting a post or
project file stops the review before any commit or push, and the companion
explains that deletions are not supported. Staged changes, unrelated edits or
untracked files, conflicts, and stale reviews also stop publishing. Review the
preview and full diff, click
**Publish reviewed content**, then confirm the browser prompt. The companion
commits only the reviewed paths and pushes only `HEAD` to
`origin:refs/heads/gh-pages`; it uses the Git remote and credentials already
configured on this machine. Nothing pushes during tests.

The server binds only to `127.0.0.1`. Stop it with Ctrl-C when finished. The
admin UI, companion script, tests, and setup guide are excluded from normal
Jekyll builds; the local config overlay includes the editor and enables drafts.
No access token, OAuth setup, or proxy server is needed for Sveltia's local
repository mode.

Sveltia is pre-1.0, so verify post metadata and URLs in the diff before relying
on an edited post. The CMS script is pinned to version `0.266.0`.

## Verify the launch and publish workflow

Build both site variants, then run the focused Python checks:

```sh
bundle exec jekyll build
bundle exec jekyll build --config _config.yml,_config.local.yml --destination _site/local-preview
python3 -m unittest discover -s tests -v
```

The browser checks require Firefox and `geckodriver`; they run headlessly against
the generated sites and an isolated repository with a local bare test remote.
They verify rendered routes, responsive layout, keyboard focus, archive
filtering, the local preview/diff/confirmation flow, and that only reviewed
content reaches the test remote. A deleted content file is rejected while the
test remote remains unchanged. They do not use or push to the production
remote. They also do not automate Sveltia's browser-specific local-folder
picker; exercise that manually in Chromium when testing the CMS itself.

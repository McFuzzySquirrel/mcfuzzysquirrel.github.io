# Local-only browser editor + publish workflow for a Jekyll / GitHub Pages site

Research date: 2026-11-15. Primary sources only (official docs, upstream repos, GitHub API metadata, licences).

## Summary & recommendation

**Least-complex workable approach: Sveltia CMS in its "local repository" workflow (no proxy, no tokens) + `jekyll serve --drafts` + a ~15-line `publish` shell script (move draft -> `_posts`, `git commit`, `git push origin gh-pages`).**

Why:
- Sveltia's local workflow needs **no proxy server and no auth**; it uses the browser File System Access API (Chromium only) against the project folder. It ignores `local_backend` and explicitly does not support `decap-server`. <https://sveltiacms.app/en/docs/workflows/local>
- It has a documented Jekyll guide: `_posts` filename slug pattern, `_drafts` collection, `_data` file collections, `permalink_field`, `aliases_field` (-> `redirect_from`). <https://sveltiacms.app/en/docs/frameworks/jekyll>
- Actively maintained (release v0.266.0 on 2026-11-14, MIT; GitHub API, see table).
- No network-exposed service, so far fewer security prerequisites than Decap's proxy.

Caveats (important):
1. **No built-in "publish = push to gh-pages" in the local workflow.** The CMS only writes files (optionally commits locally via a Developer setting); *you push with a Git client*. Sveltia's own doc says so. <https://sveltiacms.app/en/docs/workflows/local>. Sveltia's Jekyll guide also says moving a draft from `_drafts` to `_posts` with a date prefix is done **outside the CMS**. <https://sveltiacms.app/en/docs/frameworks/jekyll>. Hence the small publish script is required for *any* option here (Decap included) — it is the only custom code needed.
2. Chromium-based browser only (Chrome/Edge/Brave; Brave needs a flag); Firefox/Safari unsupported. <https://sveltiacms.app/en/docs/workflows/local>
3. Sveltia is still beta (pre-1.0, "there might still be breaking changes"). <https://sveltiacms.app/en/docs/start>
4. Existing URLs: Jekyll's default post URLs include the date from the filename; the CMS must not rename existing posts. Editing a saved post's `date` field does not change filename/URL (front matter date wins, filename/URL keep the original date). <https://sveltiacms.app/en/docs/frameworks/jekyll>. Verify with a diff after first save of each of the 8 posts that front matter (e.g. `layout`, `categories: personal update` as a string, `tags`, odd spacing `date:   2026-…`) is preserved — front-matter re-serialisation normalising is a general risk of every form-based CMS (not documented either way in the sources; test it).
5. Site context: GitHub Pages builds with Jekyll **3.10.0** / `github-pages` 232 <https://pages.github.com/versions/>; this repo pins `github-pages ~> 232` (see below). The CMS lives in a plain `admin/` folder (no gem needed) so it does not touch the Jekyll toolchain; ensure `admin/` is not published unintentionally (it would be served publicly at `/admin/` — the Sveltia Jekyll guide says the admin folder is copied to the built site). Consider excluding it (`exclude: [admin]` in `_config.yml`) and keeping it local-only, but then note that Sveltia's Jekyll guide says "make sure the admin folder is not listed in `exclude`" for it to be served by `jekyll serve` — so use a separate non-published method (e.g. a git-ignored `admin/` or a build-only exclude via a dev-only `_config.dev.yml` overlay). *Inference; not stated in docs.*

Runner-up if you want a proxy-based flow or Firefox: **Decap CMS + `decap-server`** (works in any browser, `MODE=git` commits locally, still no push).

---

## Repo context (inspected locally)

- `_config.yml`: `theme: minima`, `plugins: [jekyll-feed]`, `url: https://mcfuzzysquirrel.github.io`, `baseurl: ""`, `excerpt_separator: "<!--more-->"`. **No `permalink:` set** -> Jekyll default (`/:categories/:year/:month/:day/:title:output_ext`, i.e. dated URLs incl. categories). No `collections:` defined, no `_data` yet. (File: `/home/mcsquirrel/projects/personal/mcfuzzysquirrel.github.io/_config.yml`)
- `Gemfile`: `gem "github-pages", "~> 232", group: :jekyll_plugins`; `jekyll` gem line commented out; `minima ~> 2.5`; `jekyll-feed ~> 0.12`.
- `_posts/`: 8 files named `2026-MM-DD-slug.markdown`, front matter keys `layout: post`, `title`, `date: YYYY-MM-DD HH:MM:SS +0200`, `categories: personal update` (space-separated string), optional `tags: [a, b]`.
- Consequence: URLs depend on **filename date + categories + slug** (default permalink), so any tool that renames files or changes `categories` changes URLs. Defence: never rename existing files; optionally add explicit `permalink:` front matter / `jekyll-redirect-from` (bundled in GitHub Pages, v0.16.0 <https://pages.github.com/versions/>).
- Jekyll drafts: files in `_drafts/` without date; preview with `jekyll serve --drafts`; draft date = file modification time. <https://jekyllrb.com/docs/posts/>

## Maintenance snapshot (GitHub API `repos/<r>` and `releases/latest`, queried 2026-11-15)

| Project | Licence | Latest release | Last push |
|---|---|---|---|
| sveltia/sveltia-cms | MIT | v0.266.0, 2026-11-14 | 2026-11-14 |
| decaporg/decap-cms | MIT | decap-cms@3.17.3, 2026-10-26 | 2026-11-09 |
| tinacms/tinacms | Apache-2.0 | tinacms@3.15.2, 2026-11-09 | 2026-11-14 |
| estruyf/vscode-front-matter | MIT | v10.14.0, 2026-11-11 | 2026-11-11 |
| jekyll/jekyll-admin | MIT | v0.12.0, 2025-02-27 | 2025-06-05 |

Sources: <https://github.com/sveltia/sveltia-cms>, <https://github.com/decaporg/decap-cms>, <https://github.com/tinacms/tinacms>, <https://github.com/estruyf/vscode-front-matter>, <https://github.com/jekyll/jekyll-admin> (data via api.github.com/repos/...).

## Option comparison

### 1. Sveltia CMS (local workflow) — recommended
- **Mechanism:** Serve `admin/index.html` + `admin/config.yml` from `jekyll serve`; open `http://localhost:4000/admin/index.html` in Chromium, click "Work with Local Repository", pick project root; all edits are local file writes. <https://sveltiacms.app/en/docs/workflows/local>
- **Auth/config:** Still declare a Git backend (GitHub etc.) but "authentication not required"; repo name can be arbitrary; CMS never contacts the remote in this workflow. <https://sveltiacms.app/en/docs/workflows/local>
- **Front matter / URLs:** Jekyll guide gives a `posts` folder collection with `slug: "{{date | date('YYYY-MM-DD')}}-{{slug}}"`, fields layout(hidden)/title/date/categories/tags/body; `permalink_field` fills Jekyll `permalink`; `aliases_field` writes `redirect_from`; renaming via Slug panel. <https://sveltiacms.app/en/docs/frameworks/jekyll>
- **Projects:** Either a second folder collection (a Jekyll collection dir) or a `_data` YAML via file collection (incl. top-level list `root` option). <https://sveltiacms.app/en/docs/frameworks/jekyll>
- **Drafts/preview:** `_drafts` collection with default slug; built only with `--drafts`; publishing (move to `_posts` with date prefix) is outside the CMS. <https://sveltiacms.app/en/docs/frameworks/jekyll>. Preview = the Jekyll dev site in another tab. <https://sveltiacms.app/en/docs/workflows/local>
- **Publish:** Optional "Commit Changes to Git" (Settings > Developer) commits each save to the current local branch, only the files it saved, requires repo-local `user.name/email`, skips commit if other files are staged/merge in progress/`.git/index.lock`; "commits stay on your computer until you push them with your Git client". <https://sveltiacms.app/en/docs/workflows/local>. The remote editorial workflow (PR-based) needs a GitHub/GitLab/Gitea backend, i.e. OAuth/tokens — out of scope for local-only. <https://sveltiacms.app/en/docs/workflows/editorial>
- **Security:** No proxy -> no local HTTP write endpoint; "No proxy required: eliminates attack surfaces from compromised dependencies and unauthorized API access"; secure contexts only (localhost is a secure context). <https://sveltiacms.app/en/docs/security>. The browser asks for folder permission. Admin script is loaded from CDN (unpkg) per its start guide — pin a version (<https://sveltiacms.app/en/docs/start>).
- **Maintenance:** very active (see table); beta status.

### 2. Decap CMS + decap-server (local_backend)
- **Mechanism:** `local_backend: true` in `admin/config.yml`; run `npx decap-server` (Node >= 20) in repo root; open `/admin` on dev server. <https://decapcms.org/docs/decap-proxy/>
- **Modes:** `MODE=fs` (default) reads/writes files without committing; `MODE=git` commits every change to the *local* repo and supports editorial workflow by keeping unpublished entries on local branches. "Limitation: editorial_workflow works only when proxy runs in git mode." In git mode each commit includes **every change in the repository**, not just the CMS's — commit/stash first. <https://decapcms.org/docs/decap-proxy/>
- **Publish:** no push anywhere in the documented proxy; still need own `git push` (and own draft->post move). Decap's Jekyll guide centres on `git-gateway` / Netlify Identity (hosted auth) for production — not needed locally. <https://decapcms.org/docs/jekyll/>
- **Security (primary-source facts):** "The proxy server has no authentication: anyone who can reach it can read and write files in your repository." Defaults: port 8081, bound to 127.0.0.1/::1 (since decap-server 3.11.6; earlier versions listened on all interfaces), CORS allowed only for `^https?://(localhost|127.0.0.1)(:\d+)?$` (since 3.8.0). `BIND_HOST=0.0.0.0` only on trusted networks/containers. `.env` supported. <https://decapcms.org/docs/decap-proxy/>, <https://github.com/decaporg/decap-cms/blob/main/packages/decap-server/README.md>. => Make sure you're on a current decap-server and don't override BIND_HOST/ORIGIN.
- **Front matter/URLs/projects:** same config style as Sveltia (folder collection `_posts`, file collections for `_data`); Jekyll filename/date handling is manual (Decap's Jekyll guide config is minimal: `folder: '_posts/'`, `fields: - { name : Title }`). <https://decapcms.org/docs/jekyll/>
- **Maintenance:** maintained (3.17.3, 2026-10-26) but Sveltia describes Decap as "neglected for years" (competitor claim; treat as opinion). <https://github.com/sveltia/sveltia-cms>
- **Extra cost vs Sveltia:** second process (Node), Node 20+ requirement, unauthenticated local write endpoint. Benefit: works in any browser.

### 3. TinaCMS (self-hosted / local)
- Tina is built around a GraphQL data layer + `tina/config.ts`, init via `tina init`, `tinacms dev`; "self-hosting" means running your own backend (database adapter, auth provider, git provider) as a function — a hosted/production concept; local dev uses the local data layer. <https://tina.io/docs/self-hosted/overview>, <https://tina.io/docs/introduction/tina-init>
- It is JS-framework oriented; the framework-agnostic guide lists Nuxt/Angular as wanted, no Jekyll guide found. <https://tina.io/docs/frameworks/other> (Searched tina.io for Jekyll docs: none found.)
- Adds Node toolchain (CLI requires Node 22/24 per `@tinacms/cli` package.json <https://github.com/tinacms/tinacms/blob/main/packages/@tinacms/cli/package.json>), build-script changes, generated `tina-lock.json`. Highest complexity for a plain Jekyll site; not recommended.
- Maintenance: very active (table).

### 4. Front Matter CMS (VS Code extension)
- "Headless CMS that runs in VS Code"; supports Jekyll among others; page dashboard, site preview, custom actions/scripts; default file types md/markdown/mdx (so `.markdown` posts OK). <https://frontmatter.codes/docs/>, <https://frontmatter.codes/docs/ssg-and-frameworks>
- Jekyll draft handling: changelog notes "Automatically mark Jekyll posts in `_drafts` folder as draft" and fix for parsing draft status in Hexo/Jekyll. <https://github.com/estruyf/vscode-front-matter/blob/main/CHANGELOG.md>
- Not a *browser* editor (runs in VS Code; its dashboard/preview are webviews) — fails the "browser editor" requirement literally, but is the lowest-infrastructure option if VS Code is acceptable. Publish = VS Code Git or custom action. No server, no ports to secure. Actively maintained (table).

### 5. Jekyll Admin gem
- Plugin: Ruby HTTP API (Sinatra) + JS front end, served by `jekyll serve` at `http://localhost:4000/admin`; add `gem 'jekyll-admin', group: :jekyll_plugins`. Edits pages, posts, drafts, data files, static files, config. <https://github.com/jekyll/jekyll-admin/blob/master/README.md>
- Compatibility: gemspec `jekyll >= 3.7, < 5.0`, `sinatra ~> 4.0`, `rackup ~> 2.0` — compatible with GH Pages' Jekyll 3.10.0 on paper, but extra Sinatra/rack deps must resolve alongside `github-pages 232` in Bundler (not tested here). <https://github.com/jekyll/jekyll-admin/blob/master/jekyll-admin.gemspec>, <https://pages.github.com/versions/>
- GitHub Pages constraint: GitHub Pages only allows its whitelisted plugins; jekyll-admin is not on the list <https://pages.github.com/versions/>, so it must be dev-only (local) — fits this use case, but it adds a gem to the shared Gemfile (risk if Pages ever builds from your Gemfile, e.g. a GitHub Actions build; unverified).
- Native draft support but no documented publish/push/commit action (README lists none). Maintenance: **stale** — last release Feb 2025, last push Jun 2025. The API is served by the Jekyll process with no documented auth; keep Jekyll bound to localhost (`jekyll serve` default host is 127.0.0.1; `--host` flag changes it — Jekyll docs, not fetched here).

### 6. Custom small tool (fallback / the publish piece)
- ~20-line script: `publish <draft.md>`: `git mv _drafts/x.md _posts/$(date +%F)-x.md` (set `date:` front matter) -> `git add` -> `git commit -m` -> `git push origin gh-pages`. Uses your existing git credentials (SSH key/credential helper) — no tokens stored by the editor. Can be wired as `npm`/`make publish` or a shell alias; with Sveltia, run it after editing. Full custom editor not warranted given the above.

## Security prerequisites checklist (local-only authoring)
- Sveltia: nothing to bind/expose; only Jekyll's dev server (`127.0.0.1:4000` default) — do not pass `--host 0.0.0.0`. Grant folder access only to the project root.
- Decap: keep default `BIND_HOST`/`ORIGIN`; never run on shared network with `0.0.0.0` (no auth). <https://decapcms.org/docs/decap-proxy/>
- Don't commit `.env`/tokens; none required for local workflows. Pin CDN script versions in `admin/index.html`.
- Don't deploy `admin/` publicly (an editor UI is harmless without write access, but unnecessary surface).

## Gaps / uncertainties
- Not tested: whether Sveltia re-serialises the existing 8 posts' front matter byte-for-byte (key order/spacing/`categories` string form). Run a trial on one post and `git diff` before adopting.
- Sveltia docs for `permalink_field`/`aliases_field` detail pages not read individually; the Jekyll guide summary was used.
- Tina local-mode specifics and Jekyll support: no authoritative page found; judged by general docs only.
- Jekyll Admin + `github-pages` Bundler resolution and Pages-from-Gemfile behaviour not verified.
- GitHub docs page for Pages/Jekyll was 404 at fetched URL; used pages.github.com/versions instead.

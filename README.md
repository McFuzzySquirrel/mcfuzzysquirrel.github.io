# McFuzzySquirrel's Playground

Personal site and build-story blog for Doug McCusker. Built with Astro, exported
as static files, and published on GitHub Pages.

## Quick start

```sh
npm install
npm run dev
```

Open <http://localhost:4321/>.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the Astro dev server |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run check` | Run Astro and TypeScript checks |
| `npm test` | Build, then run content and output tests |
| `npm run pages:build` | Build and sync into the `gh-pages` branch root |

## Content

- Posts: `src/content/blog/YYYY-MM-DD-slug.md`
- Projects: `src/content/projects/NN-project-name.md`
- Images and static files: `public/`

Posts are served at `/blog/<slug>/`. Old Jekyll-style post URLs redirect to the
new URLs automatically.

See [docs/local-authoring.md](docs/local-authoring.md) for the full authoring
and publishing workflow.

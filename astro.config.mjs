import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://mcfuzzysquirrel.github.io",
  output: "static",
  build: {
    format: "preserve"
  },
  trailingSlash: "ignore",
  markdown: {
    syntaxHighlight: false
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes("/personal/") &&
        !page.includes("/drafts/") &&
        !page.endsWith("/404.html"),
      serialize: (item) => {
        if (!item.url.endsWith("/")) item.url = `${item.url}/`;
        return item;
      }
    })
  ]
});

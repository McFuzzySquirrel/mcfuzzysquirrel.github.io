import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getPosts } from "../lib/posts";
import { SITE } from "../lib/site";

export const GET: APIRoute = async (context) => {
  const posts = await getPosts({ includeDrafts: false });
  const site = context.site ?? new URL(SITE.url);

  return rss({
    title: SITE.title,
    description: SITE.description,
    site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.summary,
      link: new URL(post.url, site).toString(),
      categories: post.tags
    })),
    customData: "<language>en-us</language>"
  });
};

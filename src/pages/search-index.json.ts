import type { APIRoute } from "astro";
import { getPosts, searchIndex } from "../lib/posts";

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const body = JSON.stringify(searchIndex(posts));

  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300"
    }
  });
};

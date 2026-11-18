import { getPosts, xmlEscape } from "../../lib/content.js";

export const dynamic = "force-static";

export function GET() {
  const posts = getPosts();
  const items = posts.map((post) => `
    <item>
      <title>${xmlEscape(post.title)}</title>
      <link>https://mcfuzzysquirrel.github.io${xmlEscape(post.url)}</link>
      <guid isPermaLink="true">https://mcfuzzysquirrel.github.io${xmlEscape(post.url)}</guid>
      <pubDate>${post.date.toUTCString()}</pubDate>
      <description><![CDATA[${post.excerptHtml}]]></description>
    </item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>McFuzzySquirrel's Playground</title>
    <link>https://mcfuzzysquirrel.github.io/</link>
    <description>AI experiments, useful tools, strange prototypes, and honest notes from learning by doing.</description>
    <language>en-us</language>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" }
  });
}

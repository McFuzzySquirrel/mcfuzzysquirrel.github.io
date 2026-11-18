import { getPostByPath, getPostHref, getPosts } from "../../lib/content.js";
import { formatDate } from "../../lib/format.js";

export const dynamicParams = false;

export function generateStaticParams() {
  const includeDrafts = process.env.NODE_ENV !== "production";
  return getPosts({ includeDrafts }).map((post) => ({ postPath: post.routeSegments }));
}

export async function generateMetadata({ params }) {
  const { postPath } = await params;
  const post = getPostByPath(postPath);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerptText,
    alternates: { canonical: post.url },
    openGraph: {
      type: "article",
      publishedTime: post.date.toISOString(),
      tags: post.tags
    }
  };
}

export default async function PostPage({ params }) {
  const { postPath } = await params;
  const post = getPostByPath(postPath);
  if (!post) return null;

  const posts = getPosts();
  const publishedIndex = posts.findIndex((candidate) => candidate.url === post.url);
  const olderPost = !post.draft && publishedIndex >= 0 ? posts[publishedIndex + 1] : null;
  const newerPost = !post.draft && publishedIndex > 0 ? posts[publishedIndex - 1] : null;

  return (
    <article className="post h-entry" itemScope itemType="https://schema.org/BlogPosting">
      <header className="post-header">
        <h1 className="post-title p-name" itemProp="name headline">{post.title}</h1>
        <p className="post-meta">
          {post.draft && <strong>Draft · </strong>}
          <time className="dt-published" dateTime={post.date.toISOString()} itemProp="datePublished">
            {formatDate(post.date)}
          </time>
          {" · "}
          <span className="reading-time" title={`${post.readingMinutes * 230} words`}>
            {post.readingMinutes}&nbsp;min read
          </span>
        </p>
        {post.tags.length > 0 && (
          <div className="post-card-tags">
            {post.tags.map((tag) => <span className="post-card-tag" key={tag}>{tag}</span>)}
          </div>
        )}
      </header>

      {post.toc.length > 0 && (
        <nav className="post-toc" aria-label="Table of contents">
          <details open>
            <summary>Table of Contents</summary>
            <ul>
              {post.toc.map(({ id, title }) => <li key={id}><a href={`#${id}`}>{title}</a></li>)}
            </ul>
          </details>
        </nav>
      )}

      <div className="post-content e-content" itemProp="articleBody" dangerouslySetInnerHTML={{ __html: post.html }} />

      {!post.draft && (
        <nav className="post-nav" aria-label="Post navigation">
          {olderPost ? (
            <a className="post-nav-link post-nav-prev" href={getPostHref(olderPost)}>
              <span className="post-nav-label">← Previous</span>
              <span className="post-nav-title">{olderPost.title}</span>
            </a>
          ) : <span className="post-nav-link post-nav-prev post-nav-disabled" />}
          {newerPost ? (
            <a className="post-nav-link post-nav-next" href={getPostHref(newerPost)}>
              <span className="post-nav-label">Next →</span>
              <span className="post-nav-title">{newerPost.title}</span>
            </a>
          ) : <span className="post-nav-link post-nav-next post-nav-disabled" />}
        </nav>
      )}
      <a className="u-url" href={post.url} hidden />
    </article>
  );
}

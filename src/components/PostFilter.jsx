"use client";

import { useMemo, useState } from "react";
import { filterPostsByTag } from "../lib/tag-filter.js";
import { formatDate } from "../lib/format.js";

export default function PostFilter({ posts, development }) {
  const tags = useMemo(
    () => [...new Set(posts.flatMap((post) => post.tags))].sort((left, right) => left.localeCompare(right)),
    [posts]
  );
  const [selectedTag, setSelectedTag] = useState("all");
  const filteredPosts = filterPostsByTag(posts, selectedTag);

  return (
    <div className="blog-archive">
      <div className="post-browser" aria-label="Filter blog posts">
        <div className="post-browser-filters" role="group" aria-label="Filter posts by tag">
          <button
            className={`post-filter-chip${selectedTag === "all" ? " active" : ""}`}
            type="button"
            data-filter="all"
            aria-pressed={selectedTag === "all"}
            onClick={() => setSelectedTag("all")}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              className={`post-filter-chip${selectedTag === tag ? " active" : ""}`}
              type="button"
              data-filter={tag}
              aria-pressed={selectedTag === tag}
              key={tag}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <ul className="post-list" aria-label="Posts, newest first">
        {filteredPosts.map((post) => (
          <li data-tags={post.tags.join(",")} key={post.url}>
            <span className="post-meta">
              {post.draft ? "Draft · " : ""}
              {formatDate(post.date)} · <span className="reading-time">{post.readingMinutes}&nbsp;min read</span>
            </span>
            <h2><a className="post-link" href={development ? post.previewUrl : post.url}>{post.title}</a></h2>
            {post.tags.length > 0 && (
              <div className="post-card-tags" aria-label="Tags">
                {post.tags.map((tag) => <span className="post-card-tag" key={tag}>{tag}</span>)}
              </div>
            )}
            <div dangerouslySetInnerHTML={{ __html: post.excerptHtml }} />
          </li>
        ))}
      </ul>
      <p className="rss-subscribe">Follow new posts with the <a href="/feed.xml">RSS feed</a>.</p>
    </div>
  );
}

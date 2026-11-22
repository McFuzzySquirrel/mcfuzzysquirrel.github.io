import { getCollection, type CollectionEntry } from "astro:content";
import {
  dateParts,
  excerptFromBody,
  formatDate,
  isPublished,
  readingMinutes,
  slugifySegment,
  summaryFromBody
} from "./post-utils";

export {
  PAGE_SIZE,
  pagePosts,
  pageUrl,
  relatedPosts,
  totalPages
} from "./post-utils";

type PostEntry = CollectionEntry<"blog">;

export type PostView = PostEntry & {
  slug: string;
  url: string;
  legacyUrl: string;
  year: string;
  month: string;
  day: string;
  categories: string[];
  tags: string[];
  excerpt: string;
  summary: string;
  readingMinutes: number;
  dateLabel: string;
  isoDate: string;
};

function enrichPost(entry: PostEntry): PostView {
  const filename = entry.id;
  const datePrefix = filename.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);
  const slug = entry.data.slug ?? datePrefix?.[4] ?? filename;
  const [year, month, day] = datePrefix
    ? [datePrefix[1], datePrefix[2], datePrefix[3]]
    : dateParts(entry.data.date);

  const categories = entry.data.categories;
  const legacySegments = [
    ...categories.map(slugifySegment),
    year,
    month,
    day,
    slug
  ];

  const body = entry.body ?? "";

  return {
    ...entry,
    slug,
    url: `/blog/${slug}/`,
    legacyUrl: `/${legacySegments.join("/")}.html`,
    year,
    month,
    day,
    categories,
    tags: entry.data.tags,
    excerpt: excerptFromBody(body, entry.data.description),
    summary: summaryFromBody(body),
    readingMinutes: readingMinutes(body),
    dateLabel: formatDate(entry.data.date),
    isoDate: entry.data.date.toISOString()
  };
}

export async function getPosts({
  includeDrafts = import.meta.env.DEV
}: { includeDrafts?: boolean } = {}) {
  const posts = await getCollection("blog", ({ data }) => isPublished({ data }, includeDrafts));

  return posts
    .map(enrichPost)
    .sort((left, right) => {
      const byDate = right.data.date.getTime() - left.data.date.getTime();
      return byDate !== 0 ? byDate : left.data.title.localeCompare(right.data.title);
    });
}

export function searchIndex(posts: PostView[]) {
  return posts.map((post) => ({
    title: post.data.title,
    url: post.url,
    date: post.isoDate,
    dateLabel: post.dateLabel,
    readingMinutes: post.readingMinutes,
    tags: post.tags,
    excerpt: post.excerpt,
    search: [post.data.title, post.excerpt, ...post.tags, ...post.categories]
      .join(" ")
      .toLowerCase()
  }));
}

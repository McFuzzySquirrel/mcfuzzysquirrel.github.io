export const PAGE_SIZE = 6;
export const MORE_MARKER = "<!--more-->";

export type PostLike = {
  slug: string;
  tags: string[];
  categories: string[];
  data: { date: Date };
};

export function slugifySegment(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return slug || "section";
}

export function markdownToText(source: string) {
  return source
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^>\s?/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[*-]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/[*_~]{1,3}/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(text: string, limit = 180) {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trimEnd()}…`;
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "Africa/Johannesburg",
    year: "numeric"
  }).format(date);
}

export function dateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Africa/Johannesburg",
    year: "numeric"
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return [values.year, values.month, values.day] as const;
}

export function readingMinutes(source: string) {
  const words = markdownToText(source).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.floor(words / 230));
}

export function summaryFromBody(body: string) {
  const markerIndex = body.indexOf(MORE_MARKER);
  return markdownToText(markerIndex === -1 ? body : body.slice(0, markerIndex));
}

export function excerptFromBody(body: string, description?: string) {
  if (description?.trim()) return description.trim();
  return truncate(summaryFromBody(body), 190);
}

export function isPublished(post: { data: { draft: boolean } }, includeDrafts: boolean) {
  return includeDrafts || !post.data.draft;
}

export function totalPages(posts: unknown[]) {
  return Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
}

export function pagePosts<T>(posts: T[], page: number): T[] {
  const start = (page - 1) * PAGE_SIZE;
  return posts.slice(start, start + PAGE_SIZE);
}

export function pageUrl(page: number) {
  return page <= 1 ? "/blog/" : `/blog/page/${page}/`;
}

export function relatedPosts<T extends PostLike>(post: T, posts: T[], limit = 3): T[] {
  const postTags = new Set(post.tags.map((tag) => tag.toLowerCase()));
  const postCategories = new Set(post.categories.map((category) => category.toLowerCase()));

  const scored = posts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => {
      const tagScore = candidate.tags.filter((tag) => postTags.has(tag.toLowerCase())).length * 2;
      const categoryScore = candidate.categories.filter((category) =>
        postCategories.has(category.toLowerCase())
      ).length;
      return { post: candidate, score: tagScore + categoryScore };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.post.data.date.getTime() - left.post.data.date.getTime()
    )
    .map(({ post: candidate }) => candidate);

  if (scored.length >= limit) return scored.slice(0, limit);

  const chosen = new Set(scored.map((candidate) => candidate.slug));
  for (const candidate of posts) {
    if (scored.length >= limit) break;
    if (candidate.slug === post.slug || chosen.has(candidate.slug)) continue;
    chosen.add(candidate.slug);
    scored.push(candidate);
  }

  return scored.slice(0, limit);
}

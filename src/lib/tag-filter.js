export function filterPostsByTag(posts, tag) {
  if (!tag || tag === "all") return posts;
  return posts.filter((post) => post.tags.includes(tag));
}

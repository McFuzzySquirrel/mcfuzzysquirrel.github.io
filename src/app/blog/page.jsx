import PostFilter from "../../components/PostFilter.jsx";
import { getPosts } from "../../lib/content.js";

export const metadata = {
  title: "Blog",
  description: "Build notes, experiments, and lessons learned along the way."
};

export default function BlogPage() {
  const posts = getPosts({ includeDrafts: process.env.NODE_ENV !== "production" });

  return (
    <>
      <h1>Blog</h1>
      <p className="blog-intro">Build notes, experiments, and lessons learned along the way.</p>
      <PostFilter posts={posts} development={process.env.NODE_ENV !== "production"} />
    </>
  );
}

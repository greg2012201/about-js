import getPosts from "@/utils/getPosts";
import React from "react";
import PostListCardItem from "./post-list-card-item";

async function PostList() {
  const posts = await getPosts();
  return (
    <div className="flex flex-col">
      <ul className=" max-h-full  justify-center space-y-3 overflow-auto">
        {posts.map((post, index) => (
          <PostListCardItem key={post.data.slug} index={index} {...post} />
        ))}
      </ul>
    </div>
  );
}

export default PostList;

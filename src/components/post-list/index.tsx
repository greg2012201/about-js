import React from "react";
import PostListCardItem from "./post-list-card-item";
import { ClassNameValue, twMerge } from "tailwind-merge";
import getPosts from "@/lib/posts";

type Props = {
  className?: ClassNameValue;
};

async function PostList({ className }: Props) {
  const posts = await getPosts();
  return (
    <div className={twMerge(`flex flex-col`, className)}>
      <ul className="max-h-full  justify-center space-y-3 overflow-y-auto">
        {posts.map((post) => (
          <PostListCardItem key={post.data.slug} {...post} />
        ))}
      </ul>
    </div>
  );
}

export default PostList;

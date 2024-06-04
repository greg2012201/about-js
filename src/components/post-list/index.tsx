import getPosts from "@/utils/getPosts";
import React from "react";
import PostListCardItem from "./post-list-card-item";
import { ClassNameValue, twMerge } from "tailwind-merge";

type Props = {
  className?: ClassNameValue;
};

async function PostList({ className }: Props) {
  const posts = await getPosts();
  return (
    <div className={twMerge(`flex flex-col`, className)}>
      <ul className="max-h-full  justify-center space-y-3 overflow-auto">
        {posts.map((post, index) => (
          <PostListCardItem key={post.data.slug} index={index} {...post} />
        ))}
      </ul>
    </div>
  );
}

export default PostList;

import React from "react";
import PostListCardItem from "./post-list-card-item";
import { ClassNameValue, twMerge } from "tailwind-merge";
import getPosts from "@/services/posts";
import getLocaleServer from "@/lib/get-locale-server";

type Props = {
  className?: ClassNameValue;
};

async function PostList({ className }: Props) {
  const locale = await getLocaleServer();

  const posts = await getPosts(locale);
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

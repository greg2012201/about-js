import getPosts from "@/utils/getPosts";
import React from "react";
import { Title } from "@/components/brand-title";
import SectionWrapper from "@/components/section-wrapper";
import PostListCardItem from "./post-list-item";

async function PostList() {
  const posts = await getPosts();
  return (
    <SectionWrapper className="h-[1100px]">
      <Title className="pb-5">Posts</Title>
      <div className="flex flex-col">
        <ul className="max-h-[1000px] justify-center  space-y-3 overflow-auto sm:max-h-[500px]">
          {posts.map((post, index) => (
            <PostListCardItem key={post.data.slug} index={index} {...post} />
          ))}
        </ul>
      </div>
    </SectionWrapper>
  );
}

export default PostList;

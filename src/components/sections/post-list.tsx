import React from "react";
import Title from "@/components/title";
import SectionWrapper from "@/components/section-wrapper";
import PostListComponent from "@/components/post-list";

async function PostList() {
  return (
    <SectionWrapper className="h-[1100px]">
      <PostListComponent />
    </SectionWrapper>
  );
}

export default PostList;

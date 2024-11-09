import React from "react";
import SectionWrapper from "@/components/section-wrapper";
import dynamic from "next/dynamic";

const PostListComponent = dynamic(() => import("@/components/post-list"));

async function PostList() {
  return (
    <SectionWrapper className="h-fit pb-8">
      <PostListComponent />
    </SectionWrapper>
  );
}

export default PostList;

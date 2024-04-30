import getPosts from "@/utils/getPosts";
import React from "react";
import Title from "../title";
import SectionWrapper from "../section-wrapper";

async function PostList() {
  const posts = await getPosts();
  return (
    <SectionWrapper>
      <Title>Posts</Title>
      <div className="flex flex-col">
        <ul>
          {posts.map(({ data: { slug, title }, excerpt }) => (
            <li key={slug}>
              {title}
              {excerpt ?? ""}
            </li>
          ))}
        </ul>
      </div>
    </SectionWrapper>
  );
}

export default PostList;

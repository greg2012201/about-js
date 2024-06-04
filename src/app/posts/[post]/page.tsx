import transformPost from "@/markdown/transform-post";
import { getAllPostSlugs, getPost } from "@/utils/getPosts";
import Script from "next/script";
import React from "react";

type Props = {
  params: {
    post: string;
  };
};

function hasCodeBlock(content: string) {
  return content.includes("pre");
}

export async function generateStaticParams() {
  const allPostSlugs = await getAllPostSlugs();

  return allPostSlugs.map((postSlug) => ({ post: postSlug }));
}

async function Post({ params: { post } }: Props) {
  const postData = await getPost(post);
  const postHTML = await transformPost(postData.content);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: postHTML }} />
      {hasCodeBlock(postHTML) && <Script id="markdown" src="/handle-copy.js" />}
    </>
  );
}

export default Post;

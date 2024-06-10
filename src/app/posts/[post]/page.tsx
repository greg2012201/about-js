import Header from "@/components/blog/header";
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
  const {
    content,
    data: { author, authorAvatar, createdAt, image, title },
  } = await getPost(post);
  const postHTML = await transformPost(content);
  return (
    <>
      <Header
        author={author}
        authorAvatar={authorAvatar}
        createdAt={createdAt}
        image={image}
      />
      <div
        className="markdown prose prose-invert prose-slate prose-headings:text-slate-300 prose-img:mx-auto prose-img:w-full mx-auto max-w-[680px] py-8"
        dangerouslySetInnerHTML={{ __html: postHTML }}
      />
      {hasCodeBlock(postHTML) && <Script id="markdown" src="/handle-copy.js" />}
    </>
  );
}

export default Post;

import Header from "@/components/blog/header";
import Share from "@/components/blog/share";
import getTableOfContentsData from "@/markdown/get-table-of-contents-data";
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

export async function generateMetadata({ params }: Props) {
  const { post: slug } = params;
  const post = await getPost(slug);

  return {
    title: post.data.title,
    description: post.data.description,
  };
}

export async function generateStaticParams() {
  const allPostSlugs = await getAllPostSlugs();

  return allPostSlugs.map((postSlug) => ({ post: postSlug }));
}

async function Post({ params: { post } }: Props) {
  const {
    content,
    data: { author, authorAvatar, createdAt },
  } = await getPost(post);
  const postHTML = await transformPost(content);
  const { list: tocList } = getTableOfContentsData(postHTML);

  return (
    <>
      <Header
        author={author}
        authorAvatar={authorAvatar}
        createdAt={createdAt}
      />
      <article
        className="markdown prose prose-slate prose-invert mx-auto max-w-[680px] py-8 prose-headings:text-slate-300 prose-img:mx-auto prose-img:w-full"
        dangerouslySetInnerHTML={{ __html: postHTML }}
      />
      {hasCodeBlock(postHTML) && <Script id="markdown" src="/handle-copy.js" />}
      <Share tocList={tocList} />
    </>
  );
}

export default Post;

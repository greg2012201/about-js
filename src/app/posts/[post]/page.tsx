import transformPost from "@/markdown/transform-post";
import { getAllPostSlugs, getPost } from "@/utils/getPosts";
import Script from "next/script";
import React from "react";

type Props = {
  params: {
    post: string;
  };
};
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
      <Script
        id="markdown"
        dangerouslySetInnerHTML={{
          __html: `
          function handleCopy(textToCopy) {
            navigator.clipboard
            .writeText(textToCopy)
            .then(() => {
            setTimeout(() => console.log('success'), 2000);
            })
            .catch((err) => console.error("Failed to copy:", err));

          }
        
        `,
        }}
      />
    </>
  );
}

export default Post;

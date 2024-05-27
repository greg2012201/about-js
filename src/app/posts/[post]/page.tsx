import transformPost from "@/markdown/transform-post";
import { getAllPostSlugs, getPost } from "@/utils/getPosts";
import React from "react";

type Props = {
  params: {
    post: string;
  };
};
const higlhliterClassName = `p-2 text-sm [&>pre]:overflow-x-auto [&>pre]:p-4 [&>pre]:leading-snug  [&_code]:block [&_code]:max-w-[100px] [&_code>span::before]:content-[counter(step)]`;
export async function generateStaticParams() {
  const allPostSlugs = await getAllPostSlugs();

  return allPostSlugs.map((postSlug) => ({ post: postSlug }));
}

async function Post({ params: { post } }: Props) {
  const postData = await getPost(post);
  const postHTML = await transformPost(postData.content);
  return (
    <div
      className={higlhliterClassName}
      dangerouslySetInnerHTML={{ __html: postHTML }}
    />
  );
}

export default Post;

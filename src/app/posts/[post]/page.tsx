import { getAllPostSlugs } from "@/utils/getPosts";
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

function Post({ params: { post } }: Props) {
  return <div>{post}</div>;
}

export default Post;

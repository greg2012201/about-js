import getPosts, { Post } from "@/utils/getPosts";
import React from "react";
import Title from "../title";
import SectionWrapper from "../section-wrapper";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

type PostListCardItemProps = Pick<Post, "data" | "excerpt"> & { index: number };

function PostListCardItem({ data, excerpt, index }: PostListCardItemProps) {
  const { title, slug, image } = data;
  const isEven = index % 2 === 0;
  const imageDynamicClassName = isEven
    ? "sm:rounded-none sm:rounded-bl-md sm:rounded-tl-md"
    : "sm:rounded-none sm:rounded-br-md sm:rounded-tr-md sm:order-last";
  return (
    <li className="mx-auto flex min-h-[225px] max-w-[400px] flex-col rounded-md bg-slate-800 shadow sm:max-w-none sm:flex-row">
      <Image
        className={twMerge(
          `w-full rounded-tl-md rounded-tr-md sm:max-w-[360px]`,
          imageDynamicClassName,
        )}
        width={300}
        height={200}
        alt="post image"
        src={image}
      />
      <div className="flex flex-grow flex-col space-y-2 p-3">
        <header className="flex flex-col">
          <h5 className="text-3xl font-bold">{title}</h5>
          <span className="mt-1 h-[7px] max-w-[80px] bg-purple-500 -skew-x-12" />
        </header>
        <p>{excerpt ?? ""}</p>
      </div>
    </li>
  );
}

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

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
    ? "md:rounded-none md:rounded-bl-md md:rounded-tl-md"
    : "md:rounded-none md:rounded-br-md md:rounded-tr-md md:order-last";
  return (
    <li className="flex min-h-[225px] rounded-md bg-slate-800 shadow">
      <Image
        className={twMerge(
          `rounded-tl-md rounded-tr-md`,
          imageDynamicClassName,
        )}
        width={300}
        height={200}
        alt="post image"
        src={image}
      />
      <div className="flex-grow p-3">
        <h5 className="text-3xl font-bold">{title}</h5>
        {excerpt ?? ""}
      </div>
    </li>
  );
}

async function PostList() {
  const posts = await getPosts();
  return (
    <SectionWrapper>
      <Title className="pb-5">Posts</Title>
      <div className="flex flex-col">
        <ul className="max-h-[500px] space-y-3 overflow-auto">
          {posts.map((post, index) => (
            <PostListCardItem key={post.data.slug} index={index} {...post} />
          ))}
        </ul>
      </div>
    </SectionWrapper>
  );
}

export default PostList;

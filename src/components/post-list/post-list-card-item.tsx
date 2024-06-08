import { Post } from "@/utils/getPosts";
import Image from "next/image";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import Title from "@/components/blog/title";
import Profile from "../blog/profile";

type PostListCardItemProps = Pick<Post, "data" | "excerpt"> & { index: number };

function PostListCardItem({ data, excerpt, index }: PostListCardItemProps) {
  const { title, slug, image, author, authorAvatar, createdAt } = data;
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
      <div className="flex flex-grow flex-col space-y-2 p-3 pr-4">
        <Title slug={slug}>{title}</Title>
        <Profile
          author={author}
          authorAvatar={authorAvatar}
          createdAt={createdAt}
        />
        <p className="font-light italic text-pink-100">{excerpt ?? ""}</p>
        <Link
          className=" self-end text-pink-300 hover:underline"
          href={`posts/${slug}`}
        >
          Read more...
        </Link>
      </div>
    </li>
  );
}

export default PostListCardItem;

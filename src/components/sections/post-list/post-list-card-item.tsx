import { Post } from "@/utils/getPosts";
import Image from "next/image";
import Link from "next/link";
import { ClassNameValue, twMerge } from "tailwind-merge";

type AuthorProps = Pick<
  Post["data"],
  "author" | "createdAt" | "authorAvatar"
> & { className?: ClassNameValue };

function Author({ author, authorAvatar, createdAt, className }: AuthorProps) {
  return (
    <div className={twMerge(`flex items-start space-x-2 py-2`, className)}>
      <Image
        src={authorAvatar}
        width={50}
        height={50}
        alt="author avatar"
        className="rounded-full"
      />
      <div className="flex flex-col">
        <p className="text-xl font-bold text-pink-400">{author}</p>
        <p className="text-xs italic text-slate-300">{createdAt}</p>
      </div>
    </div>
  );
}

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
        <header className="flex flex-col">
          <Link href={`posts/${slug}`}>
            <h5 className="text-3xl font-bold text-slate-300 transition-opacity hover:cursor-pointer hover:opacity-80">
              {title}
            </h5>
          </Link>

          <span className="mt-1 h-[7px] max-w-[80px] -skew-x-12 bg-purple-500" />
        </header>
        <Author
          author={author}
          authorAvatar={authorAvatar}
          createdAt={createdAt}
        />
        <p className="font-light italic text-pink-100">{excerpt ?? ""}</p>
        <Link className=" self-end text-pink-300 hover:underline" href={slug}>
          Read more...
        </Link>
      </div>
    </li>
  );
}

export default PostListCardItem;

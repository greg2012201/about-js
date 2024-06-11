import { Post } from "@/utils/getPosts";
import Image from "next/image";
import { ClassNameValue, twMerge } from "tailwind-merge";

type ProfileProps = Pick<
  Post["data"],
  "author" | "createdAt" | "authorAvatar"
> & { className?: ClassNameValue; size?: "default" | "large" };

function Profile({
  author,
  authorAvatar,
  createdAt,
  className,
  size = "default",
}: ProfileProps) {
  const wrapperClassName =
    size === "default"
      ? "grid grid-cols-[50px_1fr] grid-rows-2"
      : "flex flex-col items-center";
  const authorTextSize = size === "default" ? "text-xl" : "text-2xl";
  return (
    <div className={twMerge(`space-x-2 py-2`, wrapperClassName, className)}>
      <Image
        src={authorAvatar}
        width={size === "default" ? 50 : 80}
        height={size === "default" ? 50 : 80}
        alt="author avatar"
        className="row-span-2 rounded-full"
      />
      <p
        className={twMerge(
          `row-span-1 text-center font-bold text-pink-400`,
          authorTextSize,
        )}
      >
        {author}
      </p>
      <p className="row-span-2 text-xs italic text-slate-300">{createdAt}</p>
    </div>
  );
}

export default Profile;

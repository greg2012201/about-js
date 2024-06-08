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

export default Profile;

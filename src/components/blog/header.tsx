import type { Post } from "@/utils/getPosts";
import Image from "next/image";
import Profile from "./profile";

type Data = Post["data"];

type Props = Omit<Data, "slug" | "title">;

function Header({ author, authorAvatar, createdAt, image }: Props) {
  return (
    <header className="flex w-full flex-col items-center space-y-2">
      <Profile
        author={author}
        authorAvatar={authorAvatar}
        createdAt={createdAt}
        size="large"
      />{" "}
    </header>
  );
}

export default Header;

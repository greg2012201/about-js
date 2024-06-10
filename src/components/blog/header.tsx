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
      {!!image && (
        <div className="flex w-full justify-center">
          <Image
            width={1000}
            height={360}
            src={image}
            alt="image for blog post"
          />
        </div>
      )}
    </header>
  );
}

export default Header;

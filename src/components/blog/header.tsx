import type { Post } from "@/utils/getPosts";
import Title from "./title";
import Image from "next/image";
import Profile from "./profile";

type Data = Post["data"];

type Props = Omit<Data, "slug">;

function Header({ author, authorAvatar, createdAt, title, image }: Props) {
  return (
    <header className="flex w-full flex-col space-y-4">
      <Title asChild size="large">
        <h1>{title}</h1>
      </Title>
      <Profile
        author={author}
        authorAvatar={authorAvatar}
        createdAt={createdAt}
      />
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

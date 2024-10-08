import type { Post } from "@/services/posts";
import Profile from "./profile";

type Data = Post["data"];

type Props = Omit<
  Data,
  "slug" | "title" | "image" | "description" | "keywords"
>;

function Header({ author, authorAvatar, createdAt }: Props) {
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

import { Link } from "@/navigation";
import Profile from "../blog/profile";
import Title from "../title";
import BaseText from "../base-text";
import { Post } from "@/lib/posts";
import { getTranslations } from "next-intl/server";

type PostListCardItemProps = Pick<Post, "data" | "excerpt">;

async function PostListCardItem({ data, excerpt }: PostListCardItemProps) {
  const { title, slug, author, authorAvatar, createdAt, description } = data;
  const t = await getTranslations("PostListCardItem");

  return (
    <li className="mx-auto flex min-h-[225px] max-w-[400px] flex-col rounded-md bg-slate-800 shadow sm:max-w-[650px] sm:flex-row">
      <div className="flex flex-grow flex-col space-y-2 px-8 py-4">
        <Title slug={slug}>{title}</Title>
        <Profile
          author={author}
          authorAvatar={authorAvatar}
          createdAt={createdAt}
        />
        <BaseText className="text-base md:text-base">
          {description ?? excerpt ?? ""}
        </BaseText>
        <Link
          className=" self-end text-pink-300 hover:underline"
          href={`posts/${slug}`}
        >
          {t("readMoreLink")}
        </Link>
      </div>
    </li>
  );
}

export default PostListCardItem;

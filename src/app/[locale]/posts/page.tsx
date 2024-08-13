import { Title } from "@/components/brand-title";
import PostList from "@/components/post-list";
import SectionWrapper from "@/components/section-wrapper";
import composeMetadata from "@/lib/compose-metadata";
import { getTranslations } from "next-intl/server";
import { unstable_setRequestLocale } from "next-intl/server";

export async function generateMetadata() {
  return composeMetadata({ canonical: "/posts", intlNamespace: "Posts" });
}

type Props = {
  params: { locale: string };
};

async function Posts({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations("PostList");
  return (
    <div className="flex flex-col items-center space-y-4 py-4">
      <Title className="mb-12">{t("title")}</Title>
      <SectionWrapper className="h-fit">
        <PostList />
      </SectionWrapper>
    </div>
  );
}

export default Posts;

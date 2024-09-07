import Header from "@/components/blog/header";
import { composeMetadata, getAllPostSlugs, getPost } from "@/services/posts";
import getTableOfContentsData from "@/lib/markdown/get-table-of-contents-data";
import transformPost from "@/lib/markdown/transform-post";
import { Locale } from "@/types";
import Script from "next/script";
import React from "react";
import dynamic from "next/dynamic";
import { twMerge } from "tailwind-merge";
import "@/app/markdown.css";

const Share = dynamic(() => import("@/components/blog/share"));
const Toaster = dynamic(() =>
  import("@/components/ui/sonner").then((module) => module.Toaster),
);

type Props = {
  params: {
    slug: string;
    locale: Locale;
  };
};

function hasCodeBlock(content: string) {
  return content.includes("pre");
}

export async function generateMetadata({ params }: Props) {
  return composeMetadata({ ...params, slug: params.slug });
}

export async function generateStaticParams({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  const allPostSlugs = await getAllPostSlugs(locale);

  return allPostSlugs.map((postSlug) => ({ slug: postSlug }));
}

async function PostPage({ params: { slug, locale } }: Props) {
  const {
    content,
    data: { author, authorAvatar, createdAt },
  } = await getPost(slug, locale);
  const postHTML = await transformPost(content);
  const { list: tocList } = getTableOfContentsData(postHTML);

  return (
    <div>
      <Header
        author={author}
        authorAvatar={authorAvatar}
        createdAt={createdAt}
      />
      <article
        className={twMerge(
          `markdown prose prose-slate prose-invert prose-headings:text-slate-300 prose-img:mx-auto prose-img:w-full mx-auto max-w-[680px] py-8`,
        )}
        dangerouslySetInnerHTML={{ __html: postHTML }}
      />
      {hasCodeBlock(postHTML) && <Script id="markdown" src="/handle-copy.js" />}
      <Share tocList={tocList} />
      <Toaster />
    </div>
  );
}

export default PostPage;

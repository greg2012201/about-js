import Intro from "@/components/sections/intro";
import PostList from "@/components/sections/post-list";
import React from "@/components/sections/react";
import getMetadataTranslation from "@/lib/getMetadataTranslation";

const url = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${process.env.PORT || 3000}`;

export async function generateMetadata() {
  const intlMeta = getMetadataTranslation("Home");

  return {
    ...intlMeta,
    metadataBase: new URL(url),
    alternates: {
      canonical: "/",
      languages: {
        en: "/en",
        pl: "/pl",
      },
    },
  };
}

export default function Home() {
  return (
    <div className="mx-auto flex w-full flex-col items-center overflow-hidden p-4 pb-0 text-white">
      <Intro />
      <PostList />
    </div>
  );
}

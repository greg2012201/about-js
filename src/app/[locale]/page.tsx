import Intro from "@/components/sections/intro";
import PostList from "@/components/sections/post-list";
import React from "@/components/sections/react";
import { PAGES_META } from "@/constants/website";

type Props = {
  params: { locale: string };
};

export async function generateMetadata() {
  return PAGES_META.get("home");
}

export default function Home({ params: { locale } }: Props) {
  return (
    <div className="mx-auto flex w-full flex-col items-center overflow-hidden p-4 pb-0 text-white">
      <Intro />
      <PostList />
    </div>
  );
}

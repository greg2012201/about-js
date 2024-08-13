import Intro from "@/components/sections/intro";
import PostList from "@/components/sections/post-list";
import React from "@/components/sections/react";
import composeMetadata from "@/lib/compose-metadata";

export async function generateMetadata() {
  return composeMetadata({ canonical: "/", intlNamespace: "Home" });
}

export default function Home() {
  return (
    <div className="mx-auto flex w-full flex-col items-center overflow-hidden p-4 pb-0 text-white">
      <Intro />
      <PostList />
    </div>
  );
}

import Intro from "@/components/sections/intro";
import PostList from "@/components/sections/post-list";
import React from "@/components/sections/react";

export default function Home() {
  return (
    <div className="mx-auto flex w-full flex-col items-center p-4 pb-0 text-white ">
      <Intro />
      <PostList />
    </div>
  );
}

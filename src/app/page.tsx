import AndMore from "./_components/sections/and-more";
import Intro from "./_components/sections/intro/intro";
import Next from "./_components/sections/next";
import NodeJS from "./_components/sections/node-js";
import React from "./_components/sections/react";

export default function Home() {
  return (
    <div className="mx-auto flex w-full flex-col items-center p-4 text-white sm:w-[fit-content]">
      <Intro />
      <Next />
      <React />
      <NodeJS />
      <AndMore />
    </div>
  );
}

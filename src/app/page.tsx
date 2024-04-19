import Code from "@/components/code";
import AndMore from "@/components/sections/and-more";
import Intro from "@/components/sections/intro";
import Next from "@/components/sections/next";
import NodeJS from "@/components/sections/node-js";
import React from "@/components/sections/react";
import WithBackgroundIcons from "@/components/with-backround-icons";
import dedent from "dedent";

export default function Home() {
  return (
    <div className="mx-auto flex w-full flex-col items-center p-4 pb-0 text-white ">
      <Intro />
    </div>
  );
}

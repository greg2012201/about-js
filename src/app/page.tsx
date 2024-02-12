import AndMore from "./_components/sections/and-more";
import Intro from "./_components/sections/intro/intro";
import Next from "./_components/sections/next";
import NodeJS from "./_components/sections/node-js";
import React from "./_components/sections/react";
import WithBackgroundIcons from "./_components/with-backround-icons";

export default function Home() {
  return (
    <div className="mx-auto flex w-full flex-col items-center p-4 text-white sm:w-[fit-content]">
      <Intro />
      <WithBackgroundIcons>
        <div className="mx-auto flex w-full flex-col items-center p-4 text-white sm:w-[fit-content]">
          <Next />
          <React />
          <NodeJS />
          <AndMore />
        </div>
      </WithBackgroundIcons>
    </div>
  );
}

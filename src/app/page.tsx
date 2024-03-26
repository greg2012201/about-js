import Code from "./_components/code";
import AndMore from "./_components/sections/and-more";
import Intro from "./_components/sections/intro";
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
          <Next
            renderContent={
              <Code
                theme="material-theme-ocean"
                lang="powershell"
                code={`npx create-next-app@latest
What is your project named? cool-project 🤔
Would you like to use TypeScript? No / Yes
Which blog about Next.js would you like to read? ***about-js*** 😎`}
              />
            }
          />
          <React />
          <NodeJS />
          <AndMore />
        </div>
      </WithBackgroundIcons>
    </div>
  );
}

import Code from "./_components/code";
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
          <Next
            renderContent={
              <Code
                theme="material-theme-ocean"
                lang="console"
                code={`What is your project named? my-app
Would you like to use TypeScript? No / Yes
Would you like to use ESLint? No / Yes
Would you like to use Tailwind CSS? No / Yes
Would you like to use "src/"" directory? No / Yes
Would you like to use App Router? (recommended) No / Yes
Would you like to customize the default import alias (@/*)? No / Yes
What import alias would you like configured? @/*`}
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

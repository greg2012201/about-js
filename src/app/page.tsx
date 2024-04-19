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
      <WithBackgroundIcons>
        <div className="mx-auto flex w-full flex-col items-center p-4 text-white ">
          <Next
            renderContent={
              <Code
                theme="material-theme-ocean"
                lang="powershell"
                code={dedent`
npx create-next-app@latest
What is your project named? cool-project 🤔
Would you like to use TypeScript? No / Yes
Which blog about Next.js would you like to read? ***about-js*** 😎`}
              />
            }
          />
          <React
            renderContent={
              <Code
                theme="material-theme-ocean"
                lang="jsx"
                code={dedent`
                'use what!?'
                
                 function AboutJS() {
                  return (
                    <div>
                      <h1>Greetings!</h1>
                      <p>let's see what we got here.</p>
                    </div>
                  );
                }
                
                export default AboutJS;
                `}
              />
            }
          />
          <NodeJS />
          <AndMore />
        </div>
      </WithBackgroundIcons>
    </div>
  );
}

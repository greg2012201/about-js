import AboutAuthor from "@/components/sections/about-author";
import ContentContainer from "@/components/sections/content-container";
import Profile from "@/components/sections/profile";
import React from "@/components/sections/react";
import Separator from "@/components/sections/separator";
import WithBackgroundIcons from "@/components/with-backround-icons";

function SimpleView() {
  return (
    <>
      <Profile />
      <AboutAuthor />
      <Separator />
      <WithBackgroundIcons>
        <div className="mx-auto flex w-full flex-col items-center space-y-28 p-4 text-white ">
          <ContentContainer
            title="Frontend"
            content="Fresh new about frameworks tooling. We all know that a new library pop
          out every day. If you're looking for news about React, Next.js, Tailwind etc. You can be sure that with this blog you will be up to
          date."
            orientation="left"
            imageConfig={{
              src: "./frontend.svg",
              alt: "logos of the frontend technologies",
            }}
          />
          <ContentContainer
            title="Backend"
            content="Fresh new about frameworks tooling. We all know that a new library pop
          out every day. You can be sure that with this blog you will be up to
          date."
            orientation="right"
            imageConfig={{
              src: "./backend.svg",
              alt: "logos of the frontend technologies",
            }}
          />
          <ContentContainer
            title="Web dev Fullstack"
            content="Fresh new about frameworks tooling. We all know that a new library pop
          out every day. You can be sure that with this blog you will be up to
          date."
            orientation="left"
            imageConfig={{
              src: "./nodejs-icon.svg",
              alt: "logos of the frontend technologies",
            }}
          />
        </div>
      </WithBackgroundIcons>
    </>
  );
}

export default SimpleView;

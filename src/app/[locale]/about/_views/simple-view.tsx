import AboutAuthor from "@/components/sections/about-author";
import ContentContainer from "@/components/sections/content-container";
import Profile from "@/components/sections/profile";
import React from "@/components/sections/react";
import Separator from "@/components/sections/separator";
import WithBackgroundIcons from "@/components/with-backround-icons";
import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";

async function SimpleView() {
  const t = await getTranslations("SimpleView");

  return (
    <>
      <Profile />
      <AboutAuthor />
      <Separator />
      <WithBackgroundIcons>
        <div className="mx-auto flex w-full flex-col items-center space-y-28 p-4 pb-28 text-white ">
          <ContentContainer
            title={t("frontend.title")}
            content={t("frontend.content")}
            orientation="left"
            imageConfig={{
              src: "/frontend.svg",
              alt: "logos of the frontend technologies",
            }}
          />
          <ContentContainer
            title={t("backend.title")}
            content={t("backend.content")}
            orientation="right"
            imageConfig={{
              src: "/backend.svg",
              alt: "logos of the frontend technologies",
            }}
          />
          <ContentContainer
            title={t("webDevFullstack.title")}
            content={t("webDevFullstack.content")}
            orientation="left"
            imageConfig={{
              src: "/backend_frontend.svg",
              alt: "logos of the frontend technologies",
            }}
          />

          <section className="z-20">
            <Link
              className="w-full text-center text-2xl text-pink-100 hover:text-pink-200 sm:text-3xl"
              href="/posts"
            >
              {t("linkSection.link")}
            </Link>
          </section>
        </div>
      </WithBackgroundIcons>
    </>
  );
}

export default SimpleView;

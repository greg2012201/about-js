"use client";

import AnimatedIcons from "./animated-icons";
import BaseText from "@/components/base-text";
import { Subtitle } from "@/components/brand-title";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

const Title = dynamic(() =>
  import("@/components/brand-title").then((module) => module.Title),
);

function Intro() {
  const t = useTranslations("Intro");

  return (
    <div className="mb-20 flex h-[calc(100vh-55px)] max-w-[930px] flex-col justify-around pb-4 [@media(min-width:660px)]:h-[calc(100vh-75px)]">
      <header className="space-y-2">
        <Title>{t("title")}</Title>
        <Subtitle>{t("subtitle")}</Subtitle>
      </header>
      <AnimatedIcons />
      <BaseText>{t("introduction")}</BaseText>
    </div>
  );
}

export default Intro;

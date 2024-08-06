"use client";

import { motion } from "framer-motion";

import AnimatedIcons from "./animated-icons";
import BaseText from "@/components/base-text";
import { Subtitle, Title } from "@/components/brand-title";
import { useTranslations } from "next-intl";

function Intro() {
  const t = useTranslations("Home");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="mb-20 flex h-[calc(100vh-55px)] max-w-[930px] flex-col justify-around pb-4 [@media(min-width:660px)]:h-[calc(100vh-75px)]"
    >
      <header className="space-y-2">
        <Title>{t("title")}</Title>
        <Subtitle>{t("subtitle")}</Subtitle>
      </header>
      <AnimatedIcons />
      <BaseText>{t("introduction")}</BaseText>
    </motion.div>
  );
}

export default Intro;

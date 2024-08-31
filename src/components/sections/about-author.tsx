"use client";

import { useTranslations } from "next-intl";
import Title from "../title";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const BaseText = dynamic(() => import("../base-text"));

function AboutAuthor() {
  const t = useTranslations("AboutAuthor");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="flex min-h-[400px] w-full max-w-[930px] flex-col space-y-6 px-4 py-4"
    >
      <Title size="large">{t("title")}</Title>
      <BaseText>{t("bio")}</BaseText>
    </motion.div>
  );
}

export default AboutAuthor;

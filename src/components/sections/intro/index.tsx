"use client";

import { motion } from "framer-motion";

import AnimatedIcons from "./animated-icons";
import BaseText from "@/components/base-text";
import { Subtitle, Title } from "@/components/brand-title";

function Intro() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="mb-20 flex h-[calc(100vh-55px)] max-w-[930px] flex-col justify-around pb-4 [@media(min-width:660px)]:h-[calc(100vh-75px)]"
    >
      <div className="space-y-2">
        <Title> What the hack is about.js?</Title>
        <Subtitle>{`JavaScript Blog's Code Hub`}</Subtitle>
      </div>
      <AnimatedIcons />
      <BaseText className="z-50">
        👋 My name is Greg and I am here to help you to keep up with the fresh
        news from JS land.
      </BaseText>
    </motion.div>
  );
}

export default Intro;

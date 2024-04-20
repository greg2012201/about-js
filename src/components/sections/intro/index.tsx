"use client";

import { motion } from "framer-motion";

import AnimatedIcons from "./animated-icons";
import BaseText from "@/components/base-text";

function Intro() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="mb-20 flex h-[calc(100vh-55px)] max-w-[930px] flex-col justify-around pb-4 [@media(min-width:660px)]:h-[calc(100vh-75px)]"
    >
      <div className="space-y-2">
        <BrandTitle> What the hack is about.js?</BrandTitle>
        <p className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-2xl text-transparent md:text-3xl">{`JavaScript Blog's Code Hub`}</p>
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

"use client";

import { useScroll, motion, useTransform } from "framer-motion";
import Image from "next/image";
import React from "react";
import BaseText from "../base-text";

function Intro() {
  const { scrollY } = useScroll();
  const jsY = useTransform(scrollY, [0, 300], [0, 0]);
  const jsX = useTransform(scrollY, [0, 200], [0, -100]);
  const jsRotate = useTransform(scrollY, [0, 200], [0, -20]);
  const tsY = useTransform(scrollY, [0, 300], [0, 0]);
  const tsX = useTransform(scrollY, [0, 200], [0, 100]);
  const trRotate = useTransform(scrollY, [0, 200], [0, 20]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative h-[650px] w-full"
    >
      <div className="space-y-[2px]">
        <h1 className=" text-slogan leading-tight ">
          What the hack is about.js?
        </h1>
        <p className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-2xl text-transparent">{`JavaScript Blog's Code Hub.`}</p>
      </div>
      <div className="fixed top-[200px] z-0 flex h-[350px] items-center p-8">
        <motion.div
          style={{
            y: jsY,
            x: jsX,
            rotate: jsRotate,
            opacity: useTransform(scrollY, [0, 100], [1, 0.2]),
          }}
        >
          <Image
            className="z-10 translate-y-[40px] rounded-md"
            alt="javascript logo"
            width={150}
            height={150}
            src="./logo-javascript.svg"
          />
        </motion.div>

        <motion.div
          style={{
            y: tsY,
            x: tsX,
            rotate: trRotate,
            opacity: useTransform(scrollY, [0, 100], [1, 0.2]),
          }}
        >
          <Image
            className="translate-x-[-40px] rounded-md"
            alt="typescript logo"
            width={150}
            height={150}
            src="./logo-typescript.svg"
          />{" "}
        </motion.div>
      </div>
      <BaseText className="absolute top-[550px] ">
        👋 My name is Greg and I am here to help you to keep up with the fresh
        news from JS land.
      </BaseText>
    </motion.div>
  );
}

export default Intro;

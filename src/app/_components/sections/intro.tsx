"use client";

import { useScroll, motion, useTransform, useMotionValue } from "framer-motion";
import Image from "next/image";
import React from "react";
import Italic from "../italic";

function Intro() {
  const { scrollY } = useScroll();
  const jsY = useTransform(scrollY, [0, 300], [0, -30]);
  const jsX = useTransform(scrollY, [0, 200], [0, -20]);
  const tsY = useTransform(scrollY, [0, 300], [0, 10]);
  const tsX = useTransform(scrollY, [0, 200], [0, 30]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="min-h-screen"
    >
      <div>
        <h1 className="text-slogan font-light leading-tight">
          What the hack is about.js?
        </h1>
        <p className="text-lg text-accent ">{`JavaScript Blog's Code Hub.`}</p>
      </div>
      <div className="flex h-[350px] items-center p-8">
        <motion.div style={{ y: jsY, x: jsX }}>
          <Image
            className="z-10 translate-y-[40px] rounded-md"
            alt="javascript logo"
            width={150}
            height={150}
            src="./logo-javascript.svg"
          />
        </motion.div>

        <motion.div style={{ y: tsY, x: tsX }}>
          <Image
            className="translate-x-[-40px] rounded-md"
            alt="typescript logo"
            width={150}
            height={150}
            src="./logo-typescript.svg"
          />{" "}
        </motion.div>
      </div>
      <Italic>
        My name is Greg and I am here to help you to keep up with the fresh news
        from JS land.
      </Italic>
    </motion.div>
  );
}

export default Intro;

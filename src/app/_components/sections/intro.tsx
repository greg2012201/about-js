"use client";

import { useScroll, motion, useTransform } from "framer-motion";
import Image from "next/image";
import React, { useState } from "react";
import BaseText from "../base-text";
import type { Prettify } from "@/types";

type AnimationTuple = Record<
  "jsY" | "jsX" | "tsY" | "tsX" | "jsRotate" | "tsRotate",
  [number[], number[]]
>;
type Variants = Prettify<Record<number, AnimationTuple>>;

const TRANSFORM_VARIANTS: Variants = {
  300: {
    jsY: [
      [0, 400],
      [0, 150],
    ],
    jsX: [
      [0, 400],
      [0, -100],
    ],
    tsY: [
      [0, 400],
      [0, 201],
    ],
    tsX: [
      [0, 400],
      [0, 90],
    ],
    jsRotate: [
      [0, 400],
      [0, -20],
    ],
    tsRotate: [
      [0, 400],
      [0, 20],
    ],
  },
};

type TransformVariantsKeyType = keyof typeof TRANSFORM_VARIANTS;

function Intro() {
  const [currVariant, setCurrVariant] = useState(300);
  const { scrollY } = useScroll();
  const jsY = useTransform(scrollY, ...TRANSFORM_VARIANTS[currVariant].jsY);
  const jsX = useTransform(scrollY, ...TRANSFORM_VARIANTS[currVariant].jsX);
  const jsRotate = useTransform(
    scrollY,
    ...TRANSFORM_VARIANTS[currVariant].jsRotate,
  );
  const tsY = useTransform(scrollY, ...TRANSFORM_VARIANTS[currVariant].tsY);
  const tsX = useTransform(scrollY, ...TRANSFORM_VARIANTS[currVariant].tsX);
  const tsRotate = useTransform(
    scrollY,
    ...TRANSFORM_VARIANTS[currVariant].tsRotate,
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="h-[650px] w-full"
    >
      <div className="space-y-2">
        <h1 className="text-5xl leading-tight md:text-7xl xl:text-8xl ">
          What the hack is about.js?
        </h1>
        <p className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-2xl text-transparent md:text-3xl">{`JavaScript Blog's Code Hub.`}</p>
      </div>
      <div className="z-0 flex h-[300px] w-full justify-center  p-8">
        <motion.div
          style={{
            y: jsY,
            x: jsX,
            rotate: jsRotate,
            opacity: useTransform(scrollY, [0, 400], [1, 0.2]),
          }}
        >
          <Image
            className="z-10 translate-y-[40px] rounded-md"
            alt="javascript logo"
            width={250}
            height={250}
            src="./logo-javascript.svg"
          />
        </motion.div>

        <motion.div
          style={{
            y: tsY,
            x: tsX,
            rotate: tsRotate,
            opacity: useTransform(scrollY, [0, 400], [1, 0.2]),
          }}
        >
          <Image
            className="translate-x-[-40px] rounded-md"
            alt="typescript logo"
            width={250}
            height={250}
            src="./logo-typescript.svg"
          />{" "}
        </motion.div>
      </div>
      <BaseText className="z-50">
        👋 My name is Greg and I am here to help you to keep up with the fresh
        news from JS land.
      </BaseText>
    </motion.div>
  );
}

export default Intro;

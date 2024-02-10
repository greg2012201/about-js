import React, { useCallback, useEffect, useState } from "react";
import useBreakpoints from "@/hooks/use-breakpoints";
import { useScroll, motion, useTransform } from "framer-motion";
import { Prettify } from "@/types";
import Image from "next/image";

type AnimationTuple = Record<
  "jsY" | "jsX" | "tsY" | "tsX" | "jsRotate" | "tsRotate",
  [number[], number[]]
>;
type TransformVariants = Prettify<Record<number, AnimationTuple>>;

type IconSizeVariants = Prettify<
  Record<number, { height: number; width: number }>
>;

const TRANSFORM_VARIANTS: TransformVariants = {
  0: {
    jsY: [
      [0, 400],
      [0, 110],
    ],
    jsX: [
      [0, 400],
      [0, -90],
    ],
    tsY: [
      [0, 400],
      [0, 161],
    ],
    tsX: [
      [0, 400],
      [0, 100],
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
  550: {
    jsY: [
      [0, 400],
      [0, 150],
    ],
    jsX: [
      [0, 400],
      [0, -200],
    ],
    tsY: [
      [0, 400],
      [0, 201],
    ],
    tsX: [
      [0, 400],
      [0, 220],
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
  900: {
    jsY: [
      [0, 400],
      [0, 150],
    ],
    jsX: [
      [0, 400],
      [0, -250],
    ],
    tsY: [
      [0, 400],
      [0, 201],
    ],
    tsX: [
      [0, 400],
      [0, 270],
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
  950: {
    jsY: [
      [0, 400],
      [0, 150],
    ],
    jsX: [
      [0, 400],
      [0, -250],
    ],
    tsY: [
      [0, 400],
      [0, 201],
    ],
    tsX: [
      [0, 400],
      [0, 270],
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
  1000: {
    jsY: [
      [0, 400],
      [0, 150],
    ],
    jsX: [
      [0, 400],
      [0, -370],
    ],
    tsY: [
      [0, 400],
      [0, 201],
    ],
    tsX: [
      [0, 400],
      [0, 380],
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
  1100: {
    jsY: [
      [0, 400],
      [0, 150],
    ],
    jsX: [
      [0, 400],
      [0, -350],
    ],
    tsY: [
      [0, 400],
      [0, 201],
    ],
    tsX: [
      [0, 400],
      [0, 340],
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
  1230: {
    jsY: [
      [0, 400],
      [0, 150],
    ],
    jsX: [
      [0, 400],
      [0, -500],
    ],
    tsY: [
      [0, 400],
      [0, 201],
    ],
    tsX: [
      [0, 400],
      [0, 520],
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

function AnimatedIcons() {
  const transformVariant = useBreakpoints(Object.keys(TRANSFORM_VARIANTS));
  const { scrollY } = useScroll();
  const jsY = useTransform(
    scrollY,
    ...TRANSFORM_VARIANTS[transformVariant].jsY,
  );
  const jsX = useTransform(
    scrollY,
    ...TRANSFORM_VARIANTS[transformVariant].jsX,
  );
  const jsRotate = useTransform(
    scrollY,
    ...TRANSFORM_VARIANTS[transformVariant].jsRotate,
  );
  const tsY = useTransform(
    scrollY,
    ...TRANSFORM_VARIANTS[transformVariant].tsY,
  );
  const tsX = useTransform(
    scrollY,
    ...TRANSFORM_VARIANTS[transformVariant].tsX,
  );
  const tsRotate = useTransform(
    scrollY,
    ...TRANSFORM_VARIANTS[transformVariant].tsRotate,
  );

  return (
    <div className="z-0 flex  h-[520px] w-full items-center justify-center pb-10 sm:px-8 [@media(min-width:1200px)]:h-[450px] ">
      <motion.div
        style={{
          y: jsY,
          x: jsX,
          rotate: jsRotate,
          opacity: useTransform(scrollY, [0, 400], [1, 0.2]),
        }}
      >
        <div className="w-[120px] [@media(min-width:350px)]:w-[160px] [@media(min-width:450px)]:w-[180px] [@media(min-width:890px)]:w-[210px]">
          <Image
            className="z-10 translate-y-[40px] rounded-md"
            alt="javascript logo"
            layout="responsive"
            width={120}
            height={120}
            src="./logo-javascript.svg"
          />
        </div>
      </motion.div>

      <motion.div
        style={{
          y: tsY,
          x: tsX,
          rotate: tsRotate,
          opacity: useTransform(scrollY, [0, 400], [1, 0.2]),
        }}
      >
        <div className="w-[120px] [@media(min-width:350px)]:w-[160px] [@media(min-width:450px)]:w-[180px] [@media(min-width:890px)]:w-[210px]">
          <Image
            className="translate-x-[-40px] rounded-md"
            alt="typescript logo"
            width={120}
            height={120}
            layout="responsive"
            src="./logo-typescript.svg"
          />
        </div>
      </motion.div>
    </div>
  );
}

export default AnimatedIcons;

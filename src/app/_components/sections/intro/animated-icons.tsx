import React, { useCallback, useEffect, useState } from "react";
import useBreakpoints from "@/hooks/use-breakpoints";
import { useScroll, motion, useTransform } from "framer-motion";
import { Prettify } from "@/types";
import Image from "next/image";

type AnimationTuple = Record<
  "jsY" | "jsX" | "tsY" | "tsX" | "jsRotate" | "tsRotate",
  [number[], number[]]
>;
type Variants = Prettify<Record<number, AnimationTuple>>;

const TRANSFORM_VARIANTS: Variants = {
  0: {
    jsY: [
      [0, 400],
      [0, 110],
    ],
    jsX: [
      [0, 400],
      [0, -50],
    ],
    tsY: [
      [0, 400],
      [0, 161],
    ],
    tsX: [
      [0, 400],
      [0, 50],
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
};

const IMAGE_VARIANTS = {};

function AnimatedIcons() {
  const currVariant = useBreakpoints(Object.keys(TRANSFORM_VARIANTS));
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
    <div className="z-0 mt-8 flex h-[220px] w-full justify-center sm:px-8 [@media(min-width:330px)]:h-[300px] ">
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
          width={180}
          height={180}
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
          width={180}
          height={180}
          src="./logo-typescript.svg"
        />{" "}
      </motion.div>
    </div>
  );
}

export default AnimatedIcons;

"use client";

import Image from "next/image";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

type Props = {
  iconSrc: string;
  title: string;
  lineAnimationDisabled?: boolean;
};

function IconLine({ iconSrc, title, lineAnimationDisabled }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const scaleY = useSpring(useTransform(scrollYProgress, [1, 0], [0, 1]), {
    stiffness: 500,
    damping: 100,
  });

  return (
    <div
      ref={containerRef}
      className="flex h-full  w-[40px] flex-col items-center justify-between space-y-2 pb-2 md:space-y-4 lg:space-y-6"
    >
      <motion.div
        className="z-20 h-[30px] w-[30px] md:w-[40px] lg:w-[45px]"
        initial={{ opacity: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <Image
          alt={`a logo of ${title}`}
          className="w-full"
          width={30}
          height={30}
          src={iconSrc}
        />
      </motion.div>
      {!lineAnimationDisabled && (
        <motion.div
          style={{ scaleY }}
          className={`z-20 h-full w-1 origin-top rounded-md bg-gradient-to-t from-pink-500 via-purple-500 to-indigo-500`}
        />
      )}
    </div>
  );
}

export default IconLine;

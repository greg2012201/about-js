"use client";
import { TbArrowBigDownFilled } from "react-icons/tb";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

function Separator() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      viewport={{ once: true }}
      ref={ref}
      className="flex h-[1000px] min-h-screen flex-col items-center justify-between pb-20"
    >
      <div className="sticky top-20 z-10">
        <p className="text-center text-5xl leading-tight  md:text-7xl xl:text-[80px]">
          Here is what you will find on this blog
        </p>
      </div>
      <motion.div
        style={{ opacity }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mb-auto mt-auto text-[300px] text-indigo-600"
      >
        <TbArrowBigDownFilled />
      </motion.div>
    </motion.div>
  );
}

export default Separator;

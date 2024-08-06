"use client";
import { TbArrowBigDownFilled } from "react-icons/tb";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "next-intl";

function Separator() {
  const t = useTranslations("Separator");
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
      className="flex h-[1000px] min-h-screen flex-col items-center justify-between py-4 pb-20"
    >
      <div className="sticky top-20 z-10">
        <p className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text pb-2 text-center text-5xl  text-transparent  md:text-7xl xl:text-[80px]">
          {t("content")}
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

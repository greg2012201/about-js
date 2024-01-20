"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type Props = {
  iconSrc: string;
};

function IconsLine({ iconSrc }: Props) {
  return (
    <div className="bg-red flex h-full  w-[40px] flex-col items-center justify-start space-y-2 pb-2">
      <motion.div
        className="z-20"
        initial={{ opacity: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        whileInView={{ opacity: 1 }}
      >
        <Image
          alt="next.js framework logo"
          width={30}
          height={30}
          src={iconSrc}
        />
      </motion.div>
      <motion.div
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className={`z-20 h-full w-1 origin-top rounded-md bg-gradient-to-t from-pink-500 via-purple-500 to-indigo-500`}
      />
    </div>
  );
}

export default IconsLine;

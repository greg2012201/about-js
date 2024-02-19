"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

function WithBackgroundIcons({ children }: Props) {
  return (
    <div className="relative w-screen">
      <div className="absolute left-0 top-0 flex w-screen flex-col space-y-40 pt-20 opacity-10 sm:space-y-60 sm:pt-48 lg:pl-40 lg:pr-60 ">
        <motion.div
          animate={{ x: 50, scale: 1.2 }}
          transition={{
            ease: "easeOut",
            duration: 28,
            repeatType: "reverse",
            repeat: Infinity,
          }}
        >
          <Image
            alt="big node.js icon"
            width={900}
            height={900}
            src="/nodejs-icon.svg"
          />
        </motion.div>
        <motion.div
          className="max-w-[1000px] self-end"
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
        >
          <Image
            alt="big react icon"
            width={1000}
            height={1000}
            src="/react-2.svg"
          />
        </motion.div>
      </div>
      {children}
    </div>
  );
}

export default WithBackgroundIcons;

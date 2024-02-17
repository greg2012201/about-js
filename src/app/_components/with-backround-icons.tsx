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
      <div className="absolute left-0 top-0 flex flex-col space-y-60 pt-48 opacity-10">
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
            width={800}
            height={800}
            src="/nodejs-icon.svg"
          />
        </motion.div>
        <Image
          alt="big react icon"
          width={800}
          height={800}
          src="/react-2.svg"
        />
      </div>
      {children}
    </div>
  );
}

export default WithBackgroundIcons;

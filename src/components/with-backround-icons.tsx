"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

function WithBackgroundIcons({ children }: Props) {
  return (
    <div className="mx-h-full mx-w-full relative w-full overflow-hidden">
      <div className=" absolute bottom-[0px] left-0 top-0 flex w-screen flex-col space-y-[260px] overflow-hidden pb-0 pt-20 opacity-10 sm:space-y-20 sm:pt-8 lg:pl-10 lg:pr-6 ">
        <motion.div
          className="mx-w-full self-start"
          animate={{ x: 10, scale: 1.1 }}
          transition={{
            ease: "easeOut",
            duration: 20,
            repeatType: "reverse",
            repeat: Infinity,
          }}
        >
          <Image
            className="max-w-full"
            alt="big css icon"
            width={650}
            height={650}
            src="/next-js-logo.svg"
          />
        </motion.div>

        <motion.div
          className="max-w-[1000px] self-end"
          animate={{ rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        >
          <Image
            alt="big react icon"
            width={650}
            height={650}
            src="/react-2.svg"
          />
        </motion.div>
        <motion.div
          className="mx-w-full self-start"
          initial={{ scale: 0.8 }}
          animate={{ x: 20, scale: 1.1 }}
          transition={{
            ease: "easeOut",
            duration: 10,
            repeatType: "reverse",
            repeat: Infinity,
          }}
        >
          <Image
            className="max-w-full"
            alt="big node.js icon"
            width={650}
            height={650}
            src="/nodejs-icon.svg"
          />
        </motion.div>
      </div>
      {children}
    </div>
  );
}

export default WithBackgroundIcons;

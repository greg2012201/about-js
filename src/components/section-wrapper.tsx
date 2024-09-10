"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ClassNameValue, twMerge } from "tailwind-merge";

type Props = {
  children: ReactNode;
  className?: ClassNameValue;
  iconsLineWrapperClassName?: ClassNameValue;
};

function SectionWrapper({ children, className }: Props) {
  return (
    <div
      className={twMerge(
        "z-20 flex h-[650px] w-full max-w-[930px] flex-col space-y-6",
        className,
      )}
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        viewport={{ once: true }}
        className="flex h-full flex-col space-y-6"
      >
        {children}
      </motion.div>
    </div>
  );
}

export default SectionWrapper;

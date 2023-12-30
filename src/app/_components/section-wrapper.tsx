import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ClassNameValue, twMerge } from "tailwind-merge";

type Props = { children: ReactNode; className?: ClassNameValue };

function SectionWrapper({ children, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      className={twMerge("h-[300px] pt-8", className)}
    >
      {children}
    </motion.div>
  );
}

export default SectionWrapper;

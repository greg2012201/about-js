import { ReactElement, ReactNode } from "react";
import { motion } from "framer-motion";
import { ClassNameValue, twMerge } from "tailwind-merge";

type Props = {
  children: ReactNode;
  className?: ClassNameValue;
  renderIconLine?: ReactElement | null;
};

function SectionWrapper({ children, className, renderIconLine = null }: Props) {
  return (
    <div className="flex ">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={twMerge(
          "align-center h-[300px] w-full space-y-6  pt-20",
          className,
        )}
      >
        {children}
      </motion.div>
      <div className="h-[300px] w-[40px]">{renderIconLine}</div>
    </div>
  );
}

export default SectionWrapper;

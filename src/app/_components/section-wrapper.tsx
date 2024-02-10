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
    <div className="flex w-full">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={twMerge(
          "z-20 flex h-[600px] w-full flex-col justify-center  space-y-6 ",
          className,
        )}
      >
        {children}
      </motion.div>
      <div className="h-[600px] w-[40px]">{renderIconLine}</div>
    </div>
  );
}

export default SectionWrapper;

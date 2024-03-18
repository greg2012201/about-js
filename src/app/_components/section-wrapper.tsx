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
      <div
        className={twMerge(
          "z-20 flex h-[600px] w-full flex-col  space-y-6  sm:h-[700px] ",
          className,
        )}
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          {children}
        </motion.div>
      </div>
      <div className="h-[600px] w-[40px] sm:h-[700px]">{renderIconLine}</div>
    </div>
  );
}

export default SectionWrapper;

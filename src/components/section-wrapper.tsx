import { ReactElement, ReactNode } from "react";
import { motion } from "framer-motion";
import { ClassNameValue, twMerge } from "tailwind-merge";

type Props = {
  children: ReactNode;
  className?: ClassNameValue;
  renderIconLine?: ReactElement | null;
  iconsLineWrapperClassName?: ClassNameValue;
};

function SectionWrapper({
  children,
  className,
  renderIconLine = null,
  iconsLineWrapperClassName,
}: Props) {
  return (
    <div className="flex w-full max-w-[930px]">
      <div
        className={twMerge(
          "z-20 flex h-[650px] w-full flex-col space-y-6",
          className,
        )}
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="flex h-full flex-col"
        >
          {children}
        </motion.div>
      </div>
      <div
        className={twMerge(`h-[650px] w-[40px] `, iconsLineWrapperClassName)}
      >
        {renderIconLine}
      </div>
    </div>
  );
}

export default SectionWrapper;

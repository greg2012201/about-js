import type { Prettify } from "@/types";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClassNameValue, twMerge } from "tailwind-merge";

type ListItemWrapperProps = {
  className?: string;
  isMotion?: boolean;
  children: string;
  order: number;
};

function ListItemWrapper({
  className,
  isMotion,
  children,
  order = 0,
}: ListItemWrapperProps) {
  return isMotion ? (
    <motion.li
      initial={{ x: 200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", duration: 0.5, delay: order / 24 }}
      className={className}
    >
      {children}
    </motion.li>
  ) : (
    <li className={className}> {children}</li>
  );
}

type Props = Prettify<{
  navConfig: Record<"label" | "href", string>[];
  handleItemClick: VoidFunction;
  horizontal?: boolean;
  className?: string;
  isAnimated?: boolean;
}>;

function NavList({
  navConfig,
  handleItemClick,
  horizontal = false,
  className,
  isAnimated,
}: Props) {
  const pathname = usePathname();
  const layoutClass = horizontal
    ? "flex flex-row gap-x-8 text-xl font-bold"
    : "flex flex-col text-2xl";

  return (
    <nav className={className}>
      <ul className={twMerge("space-y-2 sm:space-y-0", layoutClass)}>
        {navConfig.map(({ label, href }, index) => {
          const isActive = pathname.includes(href);

          const activeClass = isActive
            ? "text-purple-500 border-accent"
            : "text-white hover:text-purple-500 border-transparent";
          return (
            <Link key={label} onClick={handleItemClick} href={href}>
              <ListItemWrapper
                order={index}
                isMotion={isAnimated}
                className={twMerge("p-1", activeClass)}
              >
                {label}
              </ListItemWrapper>
            </Link>
          );
        })}
      </ul>
    </nav>
  );
}

export default NavList;

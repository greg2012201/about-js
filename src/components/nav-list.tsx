"use client";

import { Link, usePathname } from "@/navigation";
import type { Prettify } from "@/types";
import { twMerge } from "tailwind-merge";

type Props = Prettify<{
  navConfig: Record<"label" | "path", string>[];
  className?: string;
  isAnimated?: boolean;
}>;

function NavList({ navConfig, className }: Props) {
  const pathname = usePathname();

  return (
    <nav
      className={twMerge(
        "flex h-full list-none flex-row flex-wrap items-center gap-x-1 font-bold  sm:gap-x-8 sm:text-xl",
        className,
      )}
    >
      {navConfig.map(({ label, path }, index) => {
        const isActive = pathname === path;

        const activeClass = isActive
          ? "text-purple-500 border-accent"
          : "text-white hover:text-purple-500 border-transparent";
        return (
          <li key={index}>
            <Link
              className={twMerge(" p-1", activeClass)}
              key={label}
              href={path}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </nav>
  );
}

export default NavList;

"use client";

import type { Prettify } from "@/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

type Props = Prettify<{
  navConfig: Record<"label" | "path", string>[];
  horizontal?: boolean;
  className?: string;
  isAnimated?: boolean;
}>;

function NavList({ navConfig, horizontal = false, className }: Props) {
  const pathname = usePathname();

  return (
    <nav className={className}>
      <ul className="flex h-full flex-row flex-wrap items-center gap-x-1 font-bold  sm:gap-x-8 sm:text-xl">
        {navConfig.map(({ label, path }, index) => {
          const isActive = pathname === path;

          const activeClass = isActive
            ? "text-purple-500 border-accent"
            : "text-white hover:text-purple-500 border-transparent";
          return (
            <Link key={label} href={path}>
              <li key={index} className={twMerge("p-1", activeClass)}>
                {label}
              </li>
            </Link>
          );
        })}
      </ul>
    </nav>
  );
}

export default NavList;

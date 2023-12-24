import type { Prettify } from "@/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

type Props = Prettify<{
  navConfig: Record<"label" | "href", string>[];
  handleItemClick: VoidFunction;
  horizontal?: boolean;
}>;

function NavList({ navConfig, handleItemClick, horizontal = false }: Props) {
  const pathname = usePathname();
  const layoutClass = horizontal
    ? "flex flex-row gap-x-8 text-xl" /* change font size as well */
    : "flex flex-col text-lg";
  return (
    <ul className={twMerge(" text-white", layoutClass)}>
      {navConfig.map(({ label, href }) => {
        const isActive = pathname.includes(href);

        const activeClass = isActive
          ? "text-accent border-accent"
          : "text-white border-transparent";
        return (
          <Link key={label} onClick={handleItemClick} href={href}>
            <li className={twMerge("border-b-2 p-1", activeClass)}>{label}</li>
          </Link>
        );
      })}
    </ul>
  );
}

export default NavList;

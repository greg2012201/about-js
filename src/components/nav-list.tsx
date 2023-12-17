import type { Prettify } from "@/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

type Props = Prettify<{
  navConfig: Record<"label" | "href", string>[];
  handleItemClick: VoidFunction;
}>;

function NavList({ navConfig, handleItemClick }: Props) {
  const pathname = usePathname();
  return (
    <ul className="text-2xl text-white">
      {navConfig.map(({ label, href }) => {
        const isActive = pathname.includes(href);

        const activeClass = isActive
          ? "text-accent border-b-2 border-accent"
          : "text-white";
        return (
          <li className={twMerge("p-1", activeClass)} key={label}>
            <Link onClick={handleItemClick} href={href}>
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default NavList;

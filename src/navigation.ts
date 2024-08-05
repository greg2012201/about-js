import { createLocalizedPathnamesNavigation } from "next-intl/navigation";
import { LOCALES, pathnames, localePrefix } from "./next-intl-config";

export const { Link, getPathname, redirect, usePathname, useRouter } =
  createLocalizedPathnamesNavigation({
    locales: LOCALES,
    pathnames,
    localePrefix,
  });

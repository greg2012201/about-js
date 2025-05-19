import { Pathnames, LocalePrefix } from "next-intl/routing";
import { type Locale } from "./types";

export const DEFAULT_LOCALE = "en";
export const LOCALES = ["en", "pl"] as const;

export const pathnames: Pathnames<typeof LOCALES> = {
  "/": "/",
  "/about": "/about",
  "/posts": "/posts",
};

export const localePrefix: LocalePrefix<typeof LOCALES> = "always";

export const port = process.env.PORT || 3000;
export const host =
  process.env.NODE_ENV === "production"
    ? `https://${process.env.SITE_URL}`
    : `http://localhost:${port}`;

type LocaleMap = {
  [key in Locale]: `/${key}`;
};

export function getLocaleMap() {
  return LOCALES.reduce<LocaleMap>((prev, curr) => {
    return { ...prev, ...{ [curr]: `/${curr}` } };
  }, {} as LocaleMap);
}

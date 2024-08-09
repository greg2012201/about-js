import { Pathnames, LocalePrefix } from "next-intl/routing";

export const DEFAULT_LOCALE = "pl";
export const LOCALES = ["en", "pl"] as const;

export const pathnames: Pathnames<typeof LOCALES> = {
  "/": "/",
  "/about": "/about",
  "/posts": "/posts",
};

export const localePrefix: LocalePrefix<typeof LOCALES> = "always";

export const port = process.env.PORT || 3000;
export const host = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${port}`;

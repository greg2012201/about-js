import { MetadataRoute } from "next";
import { getPathname } from "@/navigation";
import { DEFAULT_LOCALE, host, LOCALES, pathnames } from "@/next-intl-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const keys = Object.keys(pathnames) as Array<keyof typeof pathnames>;

  function getUrl(
    key: keyof typeof pathnames,
    locale: (typeof LOCALES)[number],
  ) {
    const pathname = getPathname({ locale, href: key });
    return `${host}/${locale}${pathname === "/" ? "" : pathname}`;
  }
  return keys.map((key) => ({
    lastModified: new Date(),
    url: getUrl(key, DEFAULT_LOCALE),
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((locale) => [locale, getUrl(key, locale)]),
      ),
    },
  }));
}

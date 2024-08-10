import { MetadataRoute } from "next";
import { getPathname } from "@/navigation";
import { DEFAULT_LOCALE, host, LOCALES, pathnames } from "@/next-intl-config";
import { getAllPostSlugs } from "@/lib/posts";

function getUrl(key: keyof typeof pathnames, locale: (typeof LOCALES)[number]) {
  const pathname = getPathname({ locale, href: key });
  return `${host}/${locale}${pathname === "/" ? "" : pathname}`;
}
export default async function sitemap() {
  const keys = Object.keys(pathnames) as Array<keyof typeof pathnames>;
  const postsKeys = (await getAllPostSlugs(DEFAULT_LOCALE)).map(
    (slug) => `/posts/${slug}`,
  );
  return [...keys, ...postsKeys].map((key) => ({
    lastModified: new Date(),
    url: getUrl(key, DEFAULT_LOCALE),
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((locale) => [locale, getUrl(key, locale)]),
      ),
    },
  }));
}

import { MetadataRoute } from "next";
import { getPathname } from "@/navigation";
import { DEFAULT_LOCALE, host, LOCALES, pathnames } from "@/next-intl-config";
import getPosts, {
  getAllPostSlugs,
  PostStorageManager,
} from "@/services/posts";
import dayjs from "dayjs";

function getUrl(key: keyof typeof pathnames, locale: (typeof LOCALES)[number]) {
  const pathname = getPathname({ locale, href: key });
  return `${host}/${locale}${pathname === "/" ? "" : pathname}`;
}

function convertDateFormat(dateStr: string): string {
  const date = dayjs(dateStr, "DD-MM-YYYY");

  return date.format("YYYY-MM-DD");
}

export default async function sitemap() {
  const keys = Object.keys(pathnames) as Array<keyof typeof pathnames>;
  const postsKeys = (await getAllPostSlugs(DEFAULT_LOCALE)).map(
    (slug) => `/posts/${slug}`,
  );

  const posts = await getPosts();
  const postStorage = new PostStorageManager(posts);

  return [...keys, ...postsKeys].map((key) => ({
    lastModified: postsKeys.includes(key)
      ? postStorage.getPostDate(
          postStorage.extractPostSlugFromString(key),
          convertDateFormat,
        )
      : dayjs().format("YYYY-MM-DD"),
    url: getUrl(key, DEFAULT_LOCALE),
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((locale) => [locale, getUrl(key, locale)]),
      ),
    },
  }));
}

import { BASE_URL } from "@/config";
import { getLocaleMap } from "@/next-intl-config";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

export async function getRootMetadata() {
  const t = await getTranslations("Metadata.Root");

  return {
    title: {
      template: "%s | about.js",
      default: t("title"),
    },
    description: t("description"),
    applicationName: t("applicationName"),
    authors: [{ name: "Grzegorz Dubiel" }],
    generator: "Next.js",
    keywords: [
      "grzegorz dubiel",
      "code",
      "web development",
      "javascript",
      "typescript",
      "react",
      "node.js",
      "next.js",
      "web dev",
      "html",
      "css",
      "fullstack",
    ],
    referrer: "origin-when-cross-origin",
    creator: "Grzegorz Dubiel",
    publisher: "Grzegorz Dubiel",
    metadataBase: new URL(BASE_URL),
  } as Metadata;
}

async function getMetadataTranslation(pageNamespace: string) {
  const t = await getTranslations(`Metadata.${pageNamespace}`);
  return {
    title: t("title"),
    description: t("description"),
  };
}

type ComposeMetadataProps = {
  intlNamespace: string;
  canonical: string;
};

async function composeMetadata({
  canonical,
  intlNamespace,
}: ComposeMetadataProps) {
  const locale = await getLocale();
  const intlMeta = await getMetadataTranslation(intlNamespace);
  const canonicalWithLocale = `${locale}/${canonical}/`;
  const localeMap = getLocaleMap();
  const languages = Object.entries(localeMap)
    .map(([key, value]) => ({
      [key]: `${value}${canonical}/`,
    }))
    .reduce((prev, curr) => {
      return { ...prev, ...curr };
    }, {});

  return {
    ...intlMeta,
    alternates: {
      canonical: canonicalWithLocale,
      languages,
    },
    openGraph: {
      images: [
        {
          url: `${BASE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          type: "image/png",
        },
      ],
      type: "website",
      url: canonical,
      siteName: intlMeta.title,
    },
  } as Metadata;
}

export default composeMetadata;

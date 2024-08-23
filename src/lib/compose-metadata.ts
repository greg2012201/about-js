import { BASE_URL } from "@/config";
import { getLocaleMap } from "@/next-intl-config";
import { getTranslations } from "next-intl/server";

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
  };
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
  const intlMeta = await getMetadataTranslation(intlNamespace);
  return {
    ...intlMeta,
    alternates: {
      canonical,
      languages: getLocaleMap(),
    },
  };
}

export default composeMetadata;

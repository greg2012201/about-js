import { BASE_URL } from "@/config";
import { getLocaleMap } from "@/next-intl-config";
import { getTranslations } from "next-intl/server";

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
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical,
      languages: getLocaleMap(),
    },
  };
}

export default composeMetadata;

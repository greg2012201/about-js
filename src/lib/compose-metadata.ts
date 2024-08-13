import { BASE_URL } from "@/config";
import { LOCALES } from "@/next-intl-config";
import { Locale } from "@/types";
import { getTranslations } from "next-intl/server";

type LocaleMap = {
  [key in Locale]: `/${key}`;
};

function getFormattedLanguages() {
  return LOCALES.reduce<LocaleMap>((prev, curr) => {
    return { ...prev, ...{ [curr]: `/${curr}` } };
  }, {} as LocaleMap);
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
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical,
      languages: getFormattedLanguages(),
    },
  };
}

export default composeMetadata;

import { getLocale as getLocaleFromNextIntl } from "next-intl/server";
import { isLocale } from "@/types";
import { DEFAULT_LOCALE } from "@/next-intl-config";

async function getLocaleServer() {
  const maybeLocale = await getLocaleFromNextIntl();

  return isLocale(maybeLocale) ? maybeLocale : DEFAULT_LOCALE;
}

export default getLocaleServer;

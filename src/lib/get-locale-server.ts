import { getLocale as getLocaleFromNextIntl } from "next-intl/server";
import { isLocale, Locale } from "@/types";
import { DEFAULT_LOCALE } from "@/constants/translations";

async function getLocaleServer() {
  const maybeLocale = await getLocaleFromNextIntl();

  return isLocale(maybeLocale) ? maybeLocale : DEFAULT_LOCALE;
}

export default getLocaleServer;

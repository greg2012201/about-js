import type { cookies } from "next/headers";
import { getCookie } from "cookies-next";
import { getLocale as getLocaleFromNextIntl } from "next-intl/server";
import { isLocale } from "@/types";
import { DEFAULT_LOCALE } from "@/constants/translations";

async function getLocale(isServer = false) {
  const maybeLocale = isServer
    ? await getLocaleFromNextIntl()
    : getCookie("NEXT_LOCALE");
  return isLocale(maybeLocale) ? maybeLocale : DEFAULT_LOCALE;
}

export default getLocale;

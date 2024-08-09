import { LOCALES } from "./next-intl-config";

export type Prettify<T> = { [K in keyof T]: T[K] };

export type Locale = (typeof LOCALES)[number];

export const isLocale = (maybeLocale: any): maybeLocale is Locale =>
  LOCALES.includes(maybeLocale);

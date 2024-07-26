import createMiddleware from "next-intl/middleware";
import { LOCALES } from "./constants/translations";

export default createMiddleware({
  // A list of all locales that are supported
  locales: LOCALES,

  // Used when no locale matches
  defaultLocale: "en",
});
export const config = {
  matcher: ["/", "/(about|posts|home)/:path*", "/(pl|en)/:path*"],
};

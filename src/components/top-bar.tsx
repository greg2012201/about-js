import { NAV_CONFIG } from "@/constants/website";
import Logo from "./logo";
import NavList from "./nav-list";
import LanguagePicker from "./language-picker";
import { getLocale } from "next-intl/server";
import { Locale } from "@/types";

async function TopBar() {
  const locale = (await getLocale()) as Locale;
  const navConfig = NAV_CONFIG.get(locale);

  if (!navConfig) {
    throw new Error(`Invalid locale configuration!`);
  }

  return (
    <>
      <div className="flex min-h-[40px] w-full flex-wrap items-center justify-center bg-[rgba(0,0,0,0.47)] p-2 shadow-md sm:min-h-[60px] [@media(min-width:282px)]:justify-between">
        <Logo />
        <div className="flex space-x-1 sm:space-x-8">
          <NavList navConfig={navConfig} />
          <LanguagePicker />
        </div>
      </div>
    </>
  );
}

export default TopBar;

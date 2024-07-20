import { NAV_CONFIG } from "@/constants/website";
import Logo from "./logo";
import NavList from "./nav-list";

function TopBar() {
  return (
    <>
      <div className="flex min-h-[40px] w-full flex-wrap items-center justify-center bg-[rgba(0,0,0,0.47)] p-2 shadow-md sm:min-h-[60px] [@media(min-width:282px)]:justify-between">
        <Logo />
        <NavList navConfig={NAV_CONFIG} />
      </div>
    </>
  );
}

export default TopBar;

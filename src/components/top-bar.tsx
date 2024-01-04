"use client";

import { useCallback, useState } from "react";
import { CgMenu } from "react-icons/cg";
import Sidebar from "./sidebar";
import useClickOutside from "@/hooks/use-click-outside";
import Logo from "./logo";
import NavList from "./nav-list";
import useWindowSize from "@/hooks/use-window-size";

const NAV_CONFIG = [
  { label: "about author", href: "/about-author" },
  { label: "posts", href: "/posts" },
  { label: "guides", href: "/guides" },
  { label: "news", href: "/news" },
];

function TopBar() {
  const [navOpen, setNavOpen] = useState(false);
  const windowSize = useWindowSize();
  const ref = useClickOutside<HTMLDivElement>(() => setNavOpen(false));
  const BREAKPOINT_REACHED = windowSize.width > 640;
  const handleClose = useCallback(() => setNavOpen(false), []);

  return (
    <>
      <div className="flex h-[40px] w-screen items-center justify-between bg-[rgba(0,0,0,0.47)] p-2 shadow-md sm:h-[60px]">
        <Logo />
        <button
          onClick={() => {
            setNavOpen((prevState) => !prevState);
          }}
        >
          {!BREAKPOINT_REACHED && (
            <CgMenu className="text-[25px] text-accent" />
          )}
        </button>
        {BREAKPOINT_REACHED && (
          <NavList
            handleItemClick={handleClose}
            navConfig={NAV_CONFIG}
            horizontal
          />
        )}
      </div>
      {!BREAKPOINT_REACHED && (
        <Sidebar
          ref={ref}
          open={navOpen}
          handleClose={handleClose}
          navList={
            <NavList handleItemClick={handleClose} navConfig={NAV_CONFIG} />
          }
        />
      )}
    </>
  );
}

export default TopBar;

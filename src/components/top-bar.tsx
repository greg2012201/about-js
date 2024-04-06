"use client";

import { useCallback, useEffect, useState } from "react";
import { CgMenu } from "react-icons/cg";
import Sidebar from "./sidebar";
import useClickOutside from "@/hooks/use-click-outside";
import Logo from "./logo";
import NavList from "./nav-list";

const NAV_CONFIG = [
  { label: "about author", href: "/about-author" },
  { label: "posts", href: "/posts" },
  { label: "guides", href: "/guides" },
  { label: "news", href: "/news" },
];

function TopBar() {
  const [navOpen, setNavOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setNavOpen(false));
  const handleClose = useCallback(() => setNavOpen(false), []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNavOpen(false);
      }
    };
    if (navOpen) {
      document.addEventListener("keyup", handleEscape);
    }

    return () => {
      document.removeEventListener("keyup", handleEscape);
    };
  }, [navOpen]);

  return (
    <>
      <div className="flex h-[50px] w-full items-center justify-between bg-[rgba(0,0,0,0.47)] p-2 shadow-md sm:h-[60px]">
        <Logo />
        <button
          onClick={() => {
            setNavOpen((prevState) => !prevState);
          }}
        >
          <CgMenu
            className={`block text-[34px] text-purple-500 [@media(min-width:640px)]:hidden`}
          />
        </button>

        <NavList
          handleItemClick={handleClose}
          navConfig={NAV_CONFIG}
          className="hidden [@media(min-width:640px)]:flex"
          horizontal
        />
      </div>
      <Sidebar
        ref={ref}
        open={navOpen}
        handleClose={handleClose}
        className="block [@media(min-width:640px)]:hidden"
        navList={
          <NavList
            isAnimated={navOpen}
            handleItemClick={handleClose}
            navConfig={NAV_CONFIG}
          />
        }
      />
    </>
  );
}

export default TopBar;

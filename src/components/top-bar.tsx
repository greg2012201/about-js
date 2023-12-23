"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
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

  return (
    <>
      <div className="flex h-[40px] w-screen items-center justify-between bg-[rgba(0,0,0,0.47)] p-2 shadow-md">
        <Logo />
        <button
          onClick={() => {
            setNavOpen((prevState) => !prevState);
          }}
        >
          <CgMenu className="text-[25px] text-accent" />
        </button>
      </div>
      <Sidebar
        ref={ref}
        open={navOpen}
        handleClose={handleClose}
        navList={
          <NavList handleItemClick={handleClose} navConfig={NAV_CONFIG} />
        }
      />
    </>
  );
}

export default TopBar;

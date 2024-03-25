"use client";

import { BundledLanguage } from "shiki";
import { FiTerminal } from "react-icons/fi";
import { BiLogoTypescript } from "react-icons/bi";
import React, { ReactElement } from "react";
import { Prettify } from "@/types";

type HeaderProps = {
  lang: BundledLanguage;
};

const LANG_ICONS: Prettify<Partial<Record<BundledLanguage, ReactElement>>> = {
  console: <FiTerminal />,
  typescript: <BiLogoTypescript />,
};

const LANG_ICONS_MAP = new Map<string, ReactElement>(
  Object.entries(LANG_ICONS),
);

function Header({ lang }: HeaderProps) {
  const renderIcon = LANG_ICONS_MAP.get(lang);
  return (
    <div className={"border-b-[1px] border-slate-500 px-6 py-4"}>
      <div className="flex items-center space-x-1 text-neutral-400">
        {renderIcon}
        <p className="text-sm font-semibold capitalize ">
          {lang === "console" ? "terminal" : lang}
        </p>
      </div>
    </div>
  );
}

export default Header;

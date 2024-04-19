"use client";

import { BundledLanguage } from "shiki";
import { FiTerminal } from "react-icons/fi";
import { BiLogoTypescript } from "react-icons/bi";
import React, { ReactElement, useState } from "react";
import { Prettify } from "@/types";
import { FaCopy } from "react-icons/fa6";
import { MdOutlineDone } from "react-icons/md";

type HeaderProps = {
  lang: BundledLanguage;
  textToCopy: string;
};

const LANG_ICONS: Prettify<Partial<Record<BundledLanguage, ReactElement>>> = {
  console: <FiTerminal />,
  powershell: <FiTerminal />,
  typescript: <BiLogoTypescript />,
};

const LANG_ICONS_MAP = new Map<string, ReactElement>(
  Object.entries(LANG_ICONS),
);

function Header({ lang, textToCopy }: HeaderProps) {
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const renderIcon = LANG_ICONS_MAP.get(lang);
  const handleCopy = () => {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };
  return (
    <div
      className={
        "flex items-center border-b-[1px] border-slate-500 px-6 py-4 text-neutral-400"
      }
    >
      <div className="flex flex-grow items-center space-x-1">
        {renderIcon}
        <p className="text-sm font-semibold capitalize ">
          {["console", "powershell"].includes(lang) ? "terminal" : lang}
        </p>
      </div>
      <button className="h-[30px]" onClick={handleCopy} type="button">
        {copySuccess ? (
          <MdOutlineDone className="text-green-500" size={24} />
        ) : (
          <FaCopy size={24} />
        )}
      </button>
    </div>
  );
}

export default Header;

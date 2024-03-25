"use client";

import { BundledLanguage } from "shiki";

type HeaderProps = {
  lang: BundledLanguage;
};

function Header({ lang }: HeaderProps) {
  return (
    <div className={"border-b-[1px] border-slate-500 px-6 py-4"}>
      <p className="text-sm font-semibold capitalize text-neutral-400">
        {lang === "console" ? "terminal" : lang}
      </p>
    </div>
  );
}

export default Header;

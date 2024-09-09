import short from "short-uuid";
import dedent from "dedent";
import { BundledLanguage, BundledTheme } from "shiki";
import { twMerge } from "tailwind-merge";
import {
  biLogoTypescript,
  faCode,
  faCopy,
  fiTerminal,
  mdOutlineDone,
} from "./icons";
import { Prettify } from "@/types";
import transformLang from "./utils";

type HeaderProps = {
  lang: BundledLanguage;
  codeBlockId: string;
};

const LANG_ICONS: Prettify<Partial<Record<BundledLanguage, string>>> = {
  console: fiTerminal,
  powershell: fiTerminal,
  typescript: biLogoTypescript,
  jsx: faCode,
};

const LANG_ICONS_MAP = new Map<string, string>(Object.entries(LANG_ICONS));

export const headerTemplate = ({ lang, codeBlockId }: HeaderProps) => {
  const renderIcon = LANG_ICONS_MAP.get(lang);
  const buttonId = short.generate();
  return dedent`
  <div class="header flex items-center border-b-[1px] border-slate-500 px-6 py-1 text-neutral-400">
    <div class="flex flex-grow items-center space-x-1">
      ${renderIcon}
      <p class="text-sm font-semibold capitalize ">
          ${transformLang(lang)}
      </p>    
    </div>
    <button id="${buttonId}" class="copy-button h-[30px]" onclick="handleCopy('${codeBlockId}', '${buttonId}')" type="button">
      ${mdOutlineDone}${faCopy}
    </button>
  </div>
  `;
};

type Props = {
  code: string;
  lang?: BundledLanguage;
  theme?: BundledTheme;
  children: string;
};

export const wrapperTemplate = ({
  children,
  lang = "javascript",
}: Props): string => {
  const lineNumbersclass = ["powershell", "bash", "console"].includes(lang)
    ? "[&_code>span::before]:content-['$']"
    : "[&_code>span::before]:content-[counter(step)]";
  const codeBlockId = short.generate();

  return dedent`
  <div class="flex flex-col rounded-md border-[1px] border-slate-500 bg-[#0f111a] my-6">
    ${headerTemplate({ lang, codeBlockId })}
    <div id="${codeBlockId}" class="${twMerge(
      "p-2 text-sm [&>pre]:overflow-x-auto [&>pre]:p-4 [&>pre]:leading-snug  [&_code]:block [&_code]:max-w-[100px]",
      lineNumbersclass,
    )}">${children}</div>
  </div>
`;
};

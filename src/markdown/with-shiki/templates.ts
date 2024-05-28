import { fromHtml } from "hast-util-from-html";
import dedent from "dedent";
import { BundledLanguage, BundledTheme } from "shiki";
import transformLang from "@/utils/transfrom-lang";
import { twMerge } from "tailwind-merge";

type HeaderProps = {
  lang: BundledLanguage;
  textToCopy: string;
};

export const headerTemplate = ({ lang, textToCopy }: HeaderProps) => {
  console.log("text to copts", textToCopy);

  return dedent`
  <div className="flex items-center border-b-[1px] border-slate-500 px-6 py-4 text-neutral-400">
    <div className="flex flex-grow items-center space-x-1">
      {renderIcon}
      <p className="text-sm font-semibold capitalize ">
          ${transformLang(lang)}
      </p>    
    </div>
    <button className="h-[30px]" onclick="handleCopy(${textToCopy})" type="button">
      Copy
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
  code,
  lang = "javascript",
}: Props): string => {
  const lineNumbersClassName = ["powershell", "bash", "console"].includes(lang)
    ? "[&_code>span::before]:content-['$']"
    : "[&_code>span::before]:content-[counter(step)]";

  return dedent`
  <div className="flex flex-col rounded-md border-[1px] border-slate-500 bg-[#0f111a]">
    ${headerTemplate({ lang, textToCopy: code })}
    <div className="${twMerge(
      "p-2 text-sm [&>pre]:overflow-x-auto [&>pre]:p-4 [&>pre]:leading-snug  [&_code]:block [&_code]:max-w-[100px]",
      lineNumbersClassName,
    )}">${children}</div>
  </div>
`;
};

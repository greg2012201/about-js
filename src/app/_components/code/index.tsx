import { codeToHtml } from "shiki";
import type { BundledLanguage, BundledTheme } from "shiki";
import Header from "./header";
import { twMerge } from "tailwind-merge";

type Props = {
  code: string;
  lang?: BundledLanguage;
  theme?: BundledTheme;
};

async function Code({ code, lang = "javascript", theme = "nord" }: Props) {
  const html = await codeToHtml(code, {
    lang,
    theme,
  });
  const lineNumbersClassName = ["powershell", "bash", "console"].includes(lang)
    ? "[&_code>span::before]:content-['$']"
    : "[&_code>span::before]:content-[counter(step)]";
  return (
    <div className="flex flex-col rounded-md border-[1px] border-slate-500 bg-[#0f111a] ">
      <Header textToCopy={code} lang={lang} />
      <div
        className={twMerge(
          `p-2 text-sm [&>pre]:overflow-x-auto [&>pre]:p-4 [&>pre]:leading-snug  [&_code]:block [&_code]:max-w-[100px]`,
          lineNumbersClassName,
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
export default Code;

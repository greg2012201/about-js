import { codeToHtml } from "shiki";
import type { BundledLanguage, BundledTheme } from "shiki";

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

  return (
    <div className="flex flex-col rounded-md border-[1px] border-slate-500 bg-[#0f111a] ">
      <div className={"border-b-[1px] border-slate-500 px-6 py-4"}>
        <p className="text-sm font-semibold capitalize text-neutral-400">
          {lang === "console" ? "terminal" : lang}
        </p>
      </div>
      <div
        className={
          "p-2 text-sm [&>pre]:overflow-x-auto [&>pre]:p-4 [&>pre]:leading-snug [&_code]:block [&_code]:max-w-[100px]"
        }
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
export default Code;

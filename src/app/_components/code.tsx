import { codeToHtml } from "shiki";
import type { BundledLanguage, BundledTheme } from "shiki";

type Props = {
  code: string;
  lang?: BundledLanguage;
  theme?: BundledTheme;
};

export default async function Code({
  code,
  lang = "javascript",
  theme = "nord",
}: Props) {
  const html = await codeToHtml(code, {
    lang,
    theme,
  });

  return (
    <div
      className={
        "text-sm [&>pre]:overflow-x-auto [&>pre]:p-4 [&>pre]:leading-snug [&_code]:block [&_code]:max-w-[100px]"
      }
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

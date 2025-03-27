import { BundledLanguage } from "shiki";

export function safeString(maybeString: string | null | undefined) {
  return maybeString ?? "";
}

export function extractLanguage(
  classNames: string[],
  fallbackLanguage: string,
): string {
  const foundLanguageClassName = classNames.find((className) =>
    className.includes("language"),
  );

  if (!foundLanguageClassName) {
    return fallbackLanguage;
  }

  const parts = foundLanguageClassName.split("-");
  return parts.length > 1 ? parts[1] : "";
}

export function isAllowedLanguage(
  input: string,
  allowedLanguages: string[],
): input is BundledLanguage {
  return allowedLanguages.includes(input);
}

export function transformLang(lang: string) {
  if (["console", "powershell"].includes(lang)) {
    return "terminal";
  }
  if (lang.toLocaleLowerCase() === "md") {
    return "Markdown";
  }
  if (lang.toLocaleLowerCase() === "yml") {
    return "YML";
  }
  if (lang.toLocaleLowerCase() === "jsx") {
    return "JSX";
  }

  return lang;
}

export default transformLang;

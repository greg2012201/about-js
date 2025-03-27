import { BundledLanguage } from "shiki";

type Language = BundledLanguage | "env" | "md";

export const ALLOWED_LANGUAGES: Language[] = [
  "typescript",
  "html",
  "css",
  "javascript",
  "powershell",
  "bash",
  "console",
  "jsx",
  "json",
  "md",
  "yml",
];

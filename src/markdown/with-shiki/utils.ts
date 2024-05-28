import { BundledLanguage } from "shiki";

export function safeString(maybeString: string | null | undefined) {
  return maybeString ?? "";
}
export function sanitizeCodeBlock(input: string) {
  const lines = input.split("\n");
  if (lines.length <= 2) {
    return "";
  }
  const extractedLines = lines.slice(1, lines.length - 2);
  const result = extractedLines.join("\n");

  return result;
}
export function extractLanguage(input: string) {
  const regex = /```([^`\n]*)\n/;
  const match = input.match(regex);
  return match ? match[1] : "";
}

export function isAllowedLanguage(
  input: string,
  allowedLanguages: string[],
): input is BundledLanguage {
  return allowedLanguages.includes(input);
}

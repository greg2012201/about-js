import { BundledLanguage, getHighlighter } from "shiki";
import { visit } from "unist-util-visit";
import { fromHtml } from "hast-util-from-html";
import { Node } from "unist";
import {
  extractLanguage,
  isAllowedLanguage,
  safeString,
  sanitizeCodeBlock,
} from "./utils";
import { ALLOWED_LANGUAGES } from "./const";
import { headerTemplate, wrapperTemplate } from "./templates";

interface HastNode extends Node {
  type: string;
  tagName?: string;
  properties?: Record<string, any>;
  children?: HastNode[];
  value?: string;
  position?: {
    start: { line: number; column: number; offset?: number };
    end: { line: number; column: number; offset?: number };
  };
}

function withShiki() {
  return async (tree: HastNode) => {
    const highliter = await getHighlighter({
      langs: ALLOWED_LANGUAGES,
      themes: ["material-theme-ocean"],
    });

    visit(tree, (node: HastNode, index, parent: HastNode) => {
      if (node.tagName === "pre") {
        const codeNode = node?.children?.[0];
        if (!codeNode) {
          return;
        }
        const textNode = codeNode?.children?.[0];

        if (!textNode) {
          return;
        }
        const language = extractLanguage(safeString(textNode.value));
        const languageToSet = isAllowedLanguage(
          safeString(language),
          ALLOWED_LANGUAGES,
        )
          ? language
          : ALLOWED_LANGUAGES[0];
        const codeText = sanitizeCodeBlock(safeString(textNode.value));
        const codeHtml = highliter.codeToHtml(codeText, {
          lang: languageToSet,
          theme: "material-theme-ocean",
        });
        const wrapper = wrapperTemplate({
          children: codeHtml,
          lang: languageToSet as BundledLanguage,
          code: codeText,
        });

        const hastTree = fromHtml(wrapper, { fragment: true });
        (parent?.children || [])[index ?? 0] = hastTree?.children[0];
      }
    });
  };
}

export default withShiki;

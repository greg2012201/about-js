import { BundledLanguage, getHighlighter } from "shiki";
import { visit } from "unist-util-visit";
import { fromHtml } from "hast-util-from-html";
import { extractLanguage, isAllowedLanguage, safeString } from "./utils";
import { ALLOWED_LANGUAGES } from "./const";
import { wrapperTemplate } from "./templates";
import type { HastNode } from "../types";

const FALLBACK_LANGUAGE = ALLOWED_LANGUAGES[0];

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

        const language = extractLanguage(
          codeNode?.properties?.className || [],
          FALLBACK_LANGUAGE,
        );
        const languageToSet = isAllowedLanguage(
          safeString(language),
          ALLOWED_LANGUAGES,
        )
          ? language
          : FALLBACK_LANGUAGE;
        const codeText = safeString(textNode.value);
        const codeHtml = highliter.codeToHtml(codeText.trim(), {
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

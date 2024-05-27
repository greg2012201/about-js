import { getHighlighter } from "shiki";
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

    let highlitedNode: null | HastNode = null;

    visit(tree, (node: HastNode, _, parent: HastNode) => {
      if (node.tagName === "code" && parent.tagName === "pre") {
        const textNode = node?.children?.[0];

        if (!textNode) {
          return;
        }
        const language = extractLanguage(safeString(textNode.value));
        console.log("language", language);
        const codeHtml = highliter.codeToHtml(
          sanitizeCodeBlock(safeString(textNode.value)),
          {
            lang: isAllowedLanguage(safeString(language), ALLOWED_LANGUAGES)
              ? language
              : ALLOWED_LANGUAGES[0],
            theme: "material-theme-ocean",
          },
        );
        const hastTree = fromHtml(codeHtml, { fragment: true });
        highlitedNode = hastTree?.children[0];
      }
    });

    if (!highlitedNode) {
      return;
    }

    visit(tree, (node: HastNode, index, parent: HastNode) => {
      if (node.tagName === "pre" && parent?.children?.[index ?? 0]) {
        (parent?.children || [])[index ?? 0] = highlitedNode as HastNode;
      }
    });
  };
}

export default withShiki;

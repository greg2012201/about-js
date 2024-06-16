import { fromHtml } from "hast-util-from-html";
import type { HastNode, TableOfContentsItem } from "./types";
import { visit } from "unist-util-visit";

function pushToChildren(tree: TableOfContentsItem, node: TableOfContentsItem) {
  if (node.level - 1 === tree.level) {
    tree.children?.push(node);
    return;
  }
  const newTree = tree?.children?.[tree?.children.length - 1];
  if (newTree) {
    pushToChildren(newTree, node);
  }
}
function buildTableOfContentsTree(headings: TableOfContentsItem[]) {
  const tableOfContentsData: TableOfContentsItem[] = [];

  headings.forEach((heading) => {
    if (heading.level - 1 === 0) {
      tableOfContentsData.push({ ...heading, children: [] });
      return;
    }
    pushToChildren(tableOfContentsData[tableOfContentsData.length - 1], {
      ...heading,
      children: [],
    });
  });
  return tableOfContentsData;
}

const tagNames = ["h1", "h2", "h3", "h4", "h5"];

function getTableOfContentsData(postHtml: string) {
  const hastTree = fromHtml(postHtml, { fragment: true }) as HastNode;
  const headings: TableOfContentsItem[] = [];
  visit(hastTree, (node: HastNode) => {
    if (typeof node.tagName === "string" && tagNames.includes(node.tagName)) {
      const title = node.children?.find((child) => child.type === "text")
        ?.value;
      const level = parseInt(node.tagName[node.tagName.length - 1], 10);
      if (!title) {
        return;
      }
      headings.push({
        title,
        level,
        href: `#${node.properties?.id}`,
      });
    }
  });

  return buildTableOfContentsTree(headings);
}

export default getTableOfContentsData;

import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import withShiki from "./with-shiki";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

async function transformPost(content: string) {
  const file = await remark()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      content: [{ type: "text", value: "#" }],
      behavior: "append",
    })
    .use(withShiki)
    .use(rehypeStringify)
    .process(content);
  return file.toString();
}

export default transformPost;

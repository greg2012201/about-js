import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import withShiki from "./with-shiki";

async function transformPost(content: string) {
  const file = await remark()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(withShiki)
    .use(rehypeStringify)
    .process(content);
  return file.toString();
}

export default transformPost;

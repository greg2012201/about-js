import fs from "fs";
import path from "path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";

const POSTS_DIR = "public/posts";

export type Post = {
  data: { title: string; slug: string; image: string };
  content: string;
  excerpt?: string;
};

function sanitize(slug: string) {
  return slug.replace(/\.md$/, "");
}

function getExcerpt(content: string) {
  content = content.replace(/^#.*(\n.*\n)+?/gm, "");
  const excerpt = content.slice(0, 200).split(" ");
  excerpt.pop();
  return excerpt.join(" ") + "...";
}

async function getPost(slug: string) {
  const postPath = `${slug}.md`;
  const itemPath = path.join(POSTS_DIR, postPath);
  const postFile = await fs.promises.readFile(itemPath, "utf8");
  const { data, content } = matter(postFile);

  data.slug = slug;

  return { data, content, excerpt: getExcerpt(content) } as Post;
}

async function getPosts() {
  const slugger = new GithubSlugger();
  const postPaths = await fs.promises.readdir(POSTS_DIR);
  const postSlugs = postPaths.map((postPath) =>
    slugger.slug(sanitize(postPath)),
  );

  const posts = await Promise.all(postSlugs.map((slug) => getPost(slug)));

  return posts;
}

export default getPosts;

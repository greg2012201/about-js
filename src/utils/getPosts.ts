import fs from "fs";
import path from "path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import customParseFormat from "dayjs/plugin/customParseFormat";
import dayjs from "dayjs";

dayjs.extend(customParseFormat);

const POSTS_DIR = "public/posts";

export type Post = {
  data: {
    title: string;
    slug: string;
    image: string;
    author: string;
    createdAt: string;
    authorAvatar: string;
  };
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

  if (data?.author) {
    data.author = "Grzegorz Dubiel";
  }
  if (!data?.authorAvatar) {
    data.authorAvatar = "/profile.png";
  }
  if (!data?.createdAt) {
    throw new Error(`Missing createdAt for post ${data.slug}`);
  }
  const isCratedAtValid = dayjs(
    dayjs(data?.createdAt),
    "DD-MM-YYYY",
    true,
  ).isValid();
  if (isCratedAtValid) {
    throw new Error(`Invalid createdAt for post ${data.slug}`);
  }
  return { data, content, excerpt: getExcerpt(content) } as Post;
}

async function getPosts() {
  const slugger = new GithubSlugger();
  const postPaths = await fs.promises.readdir(POSTS_DIR);
  const postSlugs = postPaths.map((postPath) =>
    slugger.slug(sanitize(postPath)),
  );

  const postsResults = await Promise.allSettled(
    postSlugs.map((slug) => getPost(slug)),
  );

  const posts: Post[] = [];

  postsResults.forEach((result) => {
    if (result.status === "fulfilled") {
      posts.push(result.value);
      return;
    }
    console.error(result.reason);
  });

  return posts;
}

export default getPosts;

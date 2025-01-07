import fs from "fs";
import path from "path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import customParseFormat from "dayjs/plugin/customParseFormat";
import dayjs from "dayjs";
import { type Locale } from "@/types";
import { DEFAULT_LOCALE, getLocaleMap } from "@/next-intl-config";
import { Metadata } from "next";
import { BASE_URL } from "@/config";

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
    description: string;
    keywords: string[];
  };
  content: string;
  excerpt: string;
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

export async function getPost(slug: string, locale: Locale = DEFAULT_LOCALE) {
  const postPath = `${locale}/${slug}.md`;
  const itemPath = path.join(POSTS_DIR, postPath);
  const postFile = await fs.promises.readFile(itemPath, "utf8");
  const { data, content } = matter(postFile);
  data.slug = slug;
  if (!data?.author) {
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
  const formattedTags = data?.tags?.length ? data.tags.split(",") : [];
  data.keywords = formattedTags;
  return { data, content, excerpt: getExcerpt(content) } as Post;
}

export async function getAllPostSlugs(locale: Locale) {
  const slugger = new GithubSlugger();
  const postPaths = await fs.promises.readdir(`${POSTS_DIR}/${locale}`);
  const postSlugs = postPaths.map((postPath) =>
    slugger.slug(sanitize(postPath)),
  );

  return postSlugs;
}

async function getPosts(locale: Locale = DEFAULT_LOCALE) {
  const postSlugs = await getAllPostSlugs(locale);
  const postsResults = await Promise.allSettled(
    postSlugs.map((slug) => getPost(slug, locale)),
  );

  const posts: Post[] = [];

  postsResults.forEach((result) => {
    if (result.status === "fulfilled") {
      posts.push(result.value);
      return;
    }
    console.error(result.reason);
  });

  return posts.sort((a, b) =>
    dayjs(b.data.createdAt, "DD-MM-YYYY").diff(
      dayjs(a.data.createdAt, "DD-MM-YYYY"),
    ),
  );
}

export async function getPostsCreatedAt(slug: string) {
  const post = await getPost(slug);
  return post.data.createdAt;
}

type ComposeMetadataProps = {
  slug: string;
  locale: Locale;
};

export async function composeMetadata({ locale, slug }: ComposeMetadataProps) {
  const post = await getPost(slug, locale);
  const canonical = `${locale}/posts/${slug}`;
  const localeMap = getLocaleMap();
  const languages = Object.entries(localeMap)
    .map(([key, value]) => ({
      [key]: `${value}/posts/${slug}`,
    }))
    .reduce((prev, curr) => {
      return { ...prev, ...curr };
    }, {});
  return {
    title: post.data.title,
    description: post.data.description,
    ...(!!post.data.keywords.length ? { keywords: post.data.keywords } : {}),
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      images: [
        {
          url: `${BASE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          type: "image/png",
        },
      ],
      type: "article",
      url: canonical,
      siteName: post.data.title,
    },
  } as Metadata;
}

export class PostStorageManager {
  posts: Post[];
  constructor(posts: Post[]) {
    this.posts = posts;
  }

  getPostsSlugPathnames(pathname: string) {
    return this.posts.map((post) => `${pathname}/${post.data.slug}`);
  }
  getPostDate(slug: string, dateConverter?: (date: string) => string) {
    const post = this.posts.find((post) => post.data.slug === slug);
    if (!post) {
      throw new Error(`Post not found: ${slug}`);
    }

    return dateConverter
      ? dateConverter(post.data.createdAt)
      : post.data.createdAt;
  }

  extractPostSlugFromString(stringWithSlug: string) {
    const foundPost = this.posts.find((post) =>
      stringWithSlug.includes(post.data.slug),
    );

    if (!foundPost) {
      throw new Error(`Post not found in provided string: ${stringWithSlug}`);
    }

    return foundPost.data.slug;
  }
}

export default getPosts;

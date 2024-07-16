export const PAGES_META = new Map<
  string,
  { title: string; description: string }
>([
  ["about", { title: "About", description: "About page" }],
  [
    "posts",
    {
      title: "Post List",
      description: "A page where you can find a list of posts.",
    },
  ],
]);

export const PAGES_META = new Map<
  "home" | "about" | "posts",
  { title: string; description: string }
>([
  [
    "home",
    {
      title: "Home",
      description: "Welcome to the about-js blog.",
    },
  ],
  [
    "about",
    {
      title: "About",
      description:
        "A page about the author of the about-js and about-js itself.",
    },
  ],
  [
    "posts",
    {
      title: "Post List",
      description: "A page where you can find a list of posts.",
    },
  ],
]);

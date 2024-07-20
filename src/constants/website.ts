type NavLabels = "home" | "about" | "posts";

export const NAV_CONFIG: { label: NavLabels; path: string }[] = [
  { label: "home", path: "/" },
  { label: "about", path: "/about" },
  { label: "posts", path: "/posts" },
];

export const PAGES_META = new Map<
  NavLabels,
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

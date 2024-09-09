import { type Locale } from "@/types";

type NavLabels = "home" | "about" | "posts";

export const NAV_CONFIG = new Map<Locale, { label: string; path: string }[]>([
  [
    "en",
    [
      { label: "home", path: "/" },
      { label: "about", path: "/about" },
      { label: "posts", path: "/posts" },
    ],
  ],
  [
    "pl",
    [
      { label: "home", path: "/" },
      { label: "o blogu", path: "/about" },
      { label: "posty", path: "/posts" },
    ],
  ],
]);

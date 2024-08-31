// postcss.config.js
import tailwindcss from "tailwindcss";
import postcssNested from "postcss-nested";
import { default as purgecss } from "@fullhuman/postcss-purgecss";

const config = {
  plugins: [
    "postcss-flexbugs-fixes",
    [
      "postcss-preset-env",
      {
        autoprefixer: {
          flexbox: "no-2009",
        },
        stage: 3,
        features: {
          "custom-properties": false,
        },
      },
    ],
    tailwindcss,
    postcssNested,
    process.env.NODE_ENV === "production"
      ? purgecss({
          content: ["./src/app/**/*.{js,jsx,ts,tsx}"],
          defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
          safelist: {
            standard: ["html", "body"],
          },
        })
      : [],
  ],
};

export default config;

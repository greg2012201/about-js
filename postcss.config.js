module.exports = {
  plugins: {
    "tailwindcss/nesting": {},
    tailwindcss: {},
    autoprefixer: {},
    "postcss-flexbugs-fixes": {},
    "postcss-preset-env": {
      autoprefixer: {
        flexbox: "no-2009",
      },
      stage: 3,
      features: {
        "custom-properties": false,
      },
    },
    "@fullhuman/postcss-purgecss": {
      content: [
        "./pages/**/*.{ts,tsx}",
        "./src/components/**/*.{ts,tsx}",
        "./src/app/**/*.{ts,tsx}",
        "./src/app/posts/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
        "./public/posts/**/*.{md}",
        "./src/lib/markdown/**/*.{ts,tsx}",
        "./src/app/globals.css",
      ],
      defaultExtractor: (content) => {
        const defaultSelectors = content.match(/[\w-/:]+(?<!:)/g) || [];
        const extendedSelectors = content.match(/[^<>"=\s]+/g) || [];
        return defaultSelectors.concat(extendedSelectors);
      },
      safelist: [
        "html",
        "body",
        "prose",
        "prose-slate",
        "prose-invert",
        "prose-headings:text-slate-300",
        "prose-img:mx-auto",
        "prose-img:w-full",
        "markdown",
        "shiki",
        "line",
        "h1",
        "h2",
        "talkin-about-typescript",
        "copy-button",
        "header",
        "counter-reset",
        "counter-increment",
        "article",
        "--tw-prose-headings",
        /^prose/,
        /^shiki/,
      ],
    },
  },
};

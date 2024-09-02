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
        "./components/**/*.{ts,tsx}",
        "./src/app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
        "./src/app/globals.css",
      ],
      defaultExtractor: (content) => {
        const defaultSelectors = content.match(/[A-Za-z0-9_-]+/g) || [];
        const extendedSelectors = content.match(/[^<>"=\s]+/g) || [];
        return defaultSelectors.concat(extendedSelectors);
      },
      safelist: ["html", "body"],
    },
  },
};

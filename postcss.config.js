const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  plugins: {
    "tailwindcss/nesting": {},
    tailwindcss: {},
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
    ...(isProduction
      ? {
          "@fullhuman/postcss-purgecss": {
            content: [
              "pages/**/*.{ts,tsx}",
              "components/**/*.{ts,tsx}",
              "app/**/*.{ts,tsx}",
              "src/**/*.{ts,tsx}",
            ],
            defaultExtractor: (content) =>
              content.match(/[\w-/:]+(?<!:)/g) || [],
            safelist: ["html", "body"],
          },
        }
      : {}),
  },
};

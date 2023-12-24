import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        accent: "#6BFF8CE5",
        ["text-accent"]: "#6BFF8CCC",
      },
      fontFamily: {
        lato: ["Lato", "sans-serif"],
      },
      fontSize: {
        slogan: "44px",
      },
    },
  },
  plugins: [],
};
export default config;

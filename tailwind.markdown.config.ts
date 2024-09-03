import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./src/app/[locale]/posts/[slug].{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      typography: {
        DEFAULT: {
          css: {
            h1: {
              fontSize: "36px",
              width: "fit-content",
              margin: "0 auto",
              fontWeight: "bold",
              "&::after": {
                content: `""`,
                "margin-top": "5px",
                display: "block",
                width: "80px",
                height: "7px",
                background: "rgb(168, 85, 247)",
                transform: "skewX(-12deg)",
              },
              "@media(min-width:770px)": {
                fontSize: "48px",
                "&::after": {
                  content: `""`,
                  "margin-top": "4px",
                  display: "block",
                  width: "102px",
                  height: "10px",
                  background: "rgb(168, 85, 247)",
                  transform: "skewX(-12deg)",
                },
              },
            },
            ["h1, h2, h3, h4, h5"]: {
              cursor: "pointer",
              "&>a": {
                textDecoration: "none",
                fontSize: "0.8em",
                color: "rgb(148 163 184)",
                textAlign: "top",
                paddingLeft: "0.2em",
                visibility: "hidden",
              },
              "&:hover": {
                "&>a": {
                  visibility: "visible",
                },
              },
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;

export default config;

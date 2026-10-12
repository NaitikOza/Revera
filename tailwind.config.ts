import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#15231f",
        forest: "#173d35",
        moss: "#4d786b",
        mint: "#dcebe5",
        canvas: "#f5f7f3",
        line: "#dfe5df",
        coral: "#d86c52",
        amber: "#d89d43",
      },
      boxShadow: {
        card: "0 1px 2px rgba(21,35,31,.04), 0 10px 32px rgba(33,59,50,.06)",
        float: "0 16px 50px rgba(16,45,37,.14)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;

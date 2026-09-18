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
        // Anagu brand colours
        primary:   { DEFAULT: "#1B4F72", light: "#2E86C1", dark: "#154360" },
        secondary: { DEFAULT: "#117A65", light: "#1ABC9C", dark: "#0E6655" },
        accent:    { DEFAULT: "#D4AC0D", light: "#F1C40F", dark: "#B7950B" },
        danger:    { DEFAULT: "#C0392B", light: "#E74C3C", dark: "#A93226" },
        neutral:   { DEFAULT: "#717D7E", light: "#AEB6BF", dark: "#4D5656" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E6702",
          hover: "#144801",
          light: "#2d9a03",
        },
        secondary: { DEFAULT: "#200813", muted: "#475569" },
        background: "#f4fce8",
        surface: "#ffffff",
        vr: {
          blue: { dark: "#0b0c42", DEFAULT: "#094f9e", soft: "#8e90f5", light: "#b6e5fc" },
          violet: { DEFAULT: "#2d0957", light: "#dfc5fc" },
          teal: { DEFAULT: "#4ab7bd" },
          yellow: { DEFAULT: "#d1b113", light: "#fffc9e" },
          red: { dark: "#b01f09", DEFAULT: "#c4591b", light: "#ffd8c9" },
          pink: { DEFAULT: "#b51052", light: "#fcd9e7" },
        },
        accent: {
          lime: "#C8F89B",
          alice: "#E5EEFF",
          fact: "#059669",
          estimate: "#d97706",
          predict: "#4f46e5",
          gap: "#e11d48",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        heading: ["var(--font-heading)", "serif"],
      },
      borderRadius: { "2xl": "1rem", "3xl": "1.5rem", "4xl": "2rem" },
      boxShadow: { 
        soft: "0 10px 40px -10px rgba(32,8,19,0.08), 0 2px 10px -2px rgba(32,8,19,0.04)" 
      },
    },
  },
  plugins: [],
};

export default config;

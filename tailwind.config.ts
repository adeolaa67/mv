import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "rgb(var(--color-cream) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        hairline: "rgb(var(--color-hairline) / <alpha-value>)",
        bronze: "rgb(var(--color-bronze) / <alpha-value>)",
        taupe: "rgb(var(--color-taupe) / <alpha-value>)",
        sand: "rgb(var(--color-sand) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        script: ["var(--font-script)"],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#252a25",
        linen: "#f7f3ed",
        clay: "#b86f54",
        pine: "#35534a",
        sea: "#7ba3a3",
        oat: "#ded2c1"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 55px rgba(37, 42, 37, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;

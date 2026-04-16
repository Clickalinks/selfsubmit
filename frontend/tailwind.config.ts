import type { Config } from "tailwindcss";

/** Logo-aligned palette: vibrant green + black (SelfSubmit mark). */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          /** Primary logo green (“Submit” + icon) */
          green: "#00b050",
          "green-bright": "#00c85f",
          "green-dark": "#008f45",
          /** Light green wash for panels / badges */
          mint: "#e8f7ed",
          /** “Self” / typography */
          black: "#000000",
          grey: "#3a3a3a",
          muted: "#5c5c5c",
          /** Pricing pill on dark background */
          cream: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1120px",
        prose: "42rem",
      },
      boxShadow: {
        card: "0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 0 rgba(255,255,255,0.95) inset",
        "card-hover": "0 12px 32px rgba(0, 176, 80, 0.12), 0 2px 0 rgba(255,255,255,0.98) inset",
        "btn-green": "0 4px 16px rgba(0, 176, 80, 0.35)",
        panel: "0 8px 40px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
      },
    },
  },
  plugins: [],
};

export default config;

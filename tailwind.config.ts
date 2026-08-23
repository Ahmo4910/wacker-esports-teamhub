import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wacker: {
          red: "#D3242A",
          "red-dark": "#9C1A1F",
          "red-light": "#F0555A",
        },
        ink: {
          950: "#07090c",
          900: "#0b0e13",
          850: "#0f131a",
          800: "#131822",
          700: "#1a212d",
          600: "#242c3a",
          500: "#333d4f",
          400: "#4b5568",
          300: "#6b7688",
          200: "#94a0b3",
          100: "#c3cbd7",
          50: "#eef1f5",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        display: [
          "Rajdhani",
          "Inter",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)",
        glow: "0 0 0 1px rgba(211,36,42,0.4), 0 0 24px -4px rgba(211,36,42,0.5)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse at top, rgba(211,36,42,0.12), transparent 60%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out both",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;

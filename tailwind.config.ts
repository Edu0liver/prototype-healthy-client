import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // White-label theme tokens. Stored as RGB channel triplets in CSS vars
        // so Tailwind's `/opacity` modifier works (e.g. bg-brand/10). Overridden
        // at runtime from the tenant's branding (see ThemeProvider).
        brand: {
          DEFAULT: "rgb(var(--brand-primary) / <alpha-value>)",
          fg: "rgb(var(--brand-fg) / <alpha-value>)",
          secondary: "rgb(var(--brand-secondary) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;

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
      },
    },
  },
  plugins: [],
};

export default config;

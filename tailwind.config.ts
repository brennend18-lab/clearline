import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#17324D",
        blue: "#2D6CDF",
        teal: "#2B6B5F",
        cream: "#F8F7F3",
        softblue: "#DCE8FA",
        softgreen: "#DDF1E8",
        caution: "#B94A48",
        ink: {
          DEFAULT: "#17324D",
          soft: "#42597223",
        },
      },
      fontFamily: {
        serif: ['"Source Serif 4 Variable"', "Georgia", "serif"],
        sans: ['"Inter Variable"', "system-ui", "-apple-system", "sans-serif"],
      },
      borderColor: {
        line: "rgba(23, 50, 77, 0.14)",
        "line-strong": "rgba(23, 50, 77, 0.28)",
      },
      boxShadow: {
        calm: "0 1px 2px rgba(23,50,77,0.05), 0 8px 24px -12px rgba(23,50,77,0.12)",
        raise: "0 2px 4px rgba(23,50,77,0.06), 0 16px 40px -16px rgba(23,50,77,0.18)",
      },
      maxWidth: {
        page: "72rem",
      },
    },
  },
  plugins: [],
} satisfies Config;

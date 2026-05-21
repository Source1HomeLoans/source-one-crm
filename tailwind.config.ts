import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0B1F3A",
          dark: "#081526",
          blue: "#14365F",
          teal: "#C8A44D",
          gold: "#C8A44D",
          lightGold: "#E5C97A",
          cream: "#FBF8EF",
          ink: "#111827"
        }
      },
      boxShadow: {
        panel: "0 18px 50px rgba(8, 21, 38, 0.08)",
        luxury: "0 22px 70px rgba(8, 21, 38, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;

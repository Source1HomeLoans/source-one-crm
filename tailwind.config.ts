import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#113A5C",
          blue: "#1E6E9E",
          teal: "#2F9C95",
          gold: "#C89135",
          ink: "#172433"
        }
      },
      boxShadow: {
        panel: "0 14px 44px rgba(23, 36, 51, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;

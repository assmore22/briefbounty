import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F5F0E6",
        paper: "#FFFDF6",
        ink: "#14110F",
        muted: "#756B5E",
        primary: "#A23E2A",
        accent: "#1F6F78",
        gold: "#B08936",
        danger: "#B42318",
        line: "#D8CBB8",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        serif: ["Georgia", "Iowan Old Style", "Palatino Linotype", "Cambria", "Times New Roman", "ui-serif", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      borderRadius: { DEFAULT: "3px", md: "4px", lg: "6px" },
      boxShadow: {
        sheet: "0 1px 2px rgba(20,17,15,0.06), 0 2px 10px rgba(20,17,15,0.07)",
        pop: "0 22px 50px -20px rgba(20,17,15,0.4)",
      },
      keyframes: {
        inkline: { "0%": { backgroundPosition: "-150% 0" }, "100%": { backgroundPosition: "250% 0" } },
        tearUp: { from: { opacity: "0", transform: "translateY(8px) rotate(-0.3deg)" }, to: { opacity: "1", transform: "translateY(0) rotate(0)" } },
        tickerpulse: { "0%,100%": { opacity: "0.45" }, "50%": { opacity: "1" } },
      },
      animation: { inkline: "inkline 1.6s linear infinite", tearUp: "tearUp 0.3s ease-out", tickerpulse: "tickerpulse 1.6s ease-in-out infinite" },
    },
  },
  plugins: [],
};
export default config;

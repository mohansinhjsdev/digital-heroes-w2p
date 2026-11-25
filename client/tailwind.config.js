/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          950: "#0b0f17",
          900: "#111827",
          850: "#172033",
          800: "#1f293d",
          700: "#334155",
          600: "#475569",
          100: "#f1f5f9",
          50: "#f8fafc",
        },
        brand: {
          accent: "#f59e0b",   // Energetic Industrial Amber
          orange: "#ea580c",
          emerald: "#10b981",  // Production Ready Green
          cyan: "#06b6d4",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      }
    },
  },
  plugins: [],
}

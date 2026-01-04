// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4f46e5", // Indigo-600
          light: "#6366f1",   // Indigo-500
          dark: "#3730a3",    // Indigo-800
        },
        accent: {
          DEFAULT: "#facc15", // Yellow-400
          light: "#fde047",   // Yellow-300
          dark: "#ca8a04",    // Yellow-600
        },
        danger: {
          DEFAULT: "#dc2626", // Red-600
          light: "#ef4444",   // Red-500
          dark: "#b91c1c",    // Red-700
        },
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      boxShadow: {
        card: "0 4px 6px rgba(0,0,0,0.1)",
        modal: "0 8px 24px rgba(0,0,0,0.2)",
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  plugins: [],
};

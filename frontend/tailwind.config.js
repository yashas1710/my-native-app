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
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 6px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [],
};

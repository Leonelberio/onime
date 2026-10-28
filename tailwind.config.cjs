/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("./design-system/tailwind-preset.cjs")],
  content: ["./src/**/*.{ts,tsx}", "./design-system/**/*.{ts,tsx}"],
  // PAS de darkMode ici : le preset ONIME suit prefers-color-scheme (+ data-theme).
  theme: { extend: {} },
  plugins: [require("tailwindcss-animate")],
};

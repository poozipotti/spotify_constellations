const colors = require("tailwindcss/colors")

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    dropShadow: {
      md:"0px 0px 5px rgba(134,239,172,.8)",
      lg:"0px 0px 10px rgba(134,239,172,.8)",
    },
    extend: {
      colors: {
        background: colors.black,
        foreground: colors.white,
        primary: {
          light: colors.green[300],
          medium: colors.green[500],
          dark: colors.green[950]
        }
      }
    },
  },
  plugins: [],
};

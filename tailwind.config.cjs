const defaultTheme = require("tailwindcss/defaultTheme");

const pxToRem = (px) => `${px / 16}rem`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Red Hat Mono Variable", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
        },
        text: {
          DEFAULT: "var(--color-text)",
        },
        background: {
          DEFAULT: "var(--color-background)",
        },
      },
      fontSize: {
        h1: [
          pxToRem(36),
          {
            fontWeight: 400,
          },
        ],
        link: [
          pxToRem(16),
          {
            fontWeight: 600,
          },
        ],
        "regular-big": [
          pxToRem(28),
          {
            fontWeight: 400,
          },
        ],
      },
      maxWidth: {
        screen: pxToRem(800),
      },
      margin: {
        7.5: pxToRem(30),
        17.5: pxToRem(70),
      },
    },
  },
  plugins: [],
};

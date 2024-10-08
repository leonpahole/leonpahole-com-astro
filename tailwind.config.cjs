const defaultTheme = require("tailwindcss/defaultTheme");

const pxToRem = (px) => `${px / 16}rem`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      screens: {
        xs: "480px",
      },
      fontFamily: {
        mono: ["Red Hat Mono Variable", ...defaultTheme.fontFamily.mono],
      },
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
        },
        text: {
          DEFAULT: "var(--color-text)",
          inverted: "var(--color-text-inverted)",
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
        h2: [
          pxToRem(28),
          {
            fontWeight: 400,
          },
        ],
        h3: [
          pxToRem(28),
          {
            fontWeight: 500,
            lineHeight: 1.5,
            letterSpacing: pxToRem(1),
          },
        ],
        h4: [
          pxToRem(20),
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
        body: [
          pxToRem(16),
          {
            fontWeight: 400,
          },
        ],
        details: [
          pxToRem(14),
          {
            fontWeight: 300,
          },
        ],
        "link-big": [
          pxToRem(18),
          {
            fontWeight: 600,
          },
        ],
        "blog-tag": [
          pxToRem(16),
          {
            fontWeight: 300,
          },
        ],
        technologies: [
          pxToRem(20),
          {
            fontWeight: 500,
          },
        ],
      },
      maxWidth: {
        screen: pxToRem(800),
      },
      aspectRatio: {
        image: "2.4",
      },
      margin: {
        7.5: pxToRem(30),
        12.5: pxToRem(50),
        17.5: pxToRem(70),
      },
      padding: {
        0.75: pxToRem(3),
        1.25: pxToRem(5),
        7.5: pxToRem(30),
        12.5: pxToRem(50),
        15: pxToRem(60),
      },
      gap: {
        1.75: pxToRem(7),
        12.5: pxToRem(50),
      },
      animation: {
        wiggle: "wiggle 3s linear infinite",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": {
            transform: "scale(1.1) translateY(0)",
          },
          "10%": {
            transform: "scale(1.1,.9) translateY(0)",
          },
          "30%": {
            transform: "scale(.9,1.1) translateY(-15px)",
          },
          "50%": {
            transform: "scale(1.05,.95) translateY(0)",
          },
          "58%": {
            transform: "scale(1,1) translateY(-7px)",
          },
          "65%": {
            transform: "scale(1,1) translateY(0)",
          },
        },
      },
    },
  },
  plugins: [],
};

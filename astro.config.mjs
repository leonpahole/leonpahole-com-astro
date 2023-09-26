import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { astroImageTools } from "astro-imagetools";
import robotsTxt from "astro-robots-txt";
import { defineConfig } from "astro/config";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), astroImageTools, sitemap(), robotsTxt()],
  markdown: {
    remarkPlugins: [remarkReadingTime],
    syntaxHighlight: "prism",
  },
  site: process.env.SITE,
  vite: {
    optimizeDeps: {
      exclude: ["astro-imagetools"],
    },
  },
});

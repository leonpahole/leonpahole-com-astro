import tailwind from "@astrojs/tailwind";
import { astroImageTools } from "astro-imagetools";
import { defineConfig } from "astro/config";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), astroImageTools, sitemap()],
  markdown: {
    remarkPlugins: [remarkReadingTime],
    syntaxHighlight: "prism",
  },
  site: "https://www.leonpahole.com",
});

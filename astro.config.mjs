import { defineConfig } from "astro/config";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
});

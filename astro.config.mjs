import { defineConfig } from "astro/config";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";

import tailwind from "@astrojs/tailwind";
import { astroImageTools } from "astro-imagetools";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), astroImageTools],
  markdown: {
    remarkPlugins: [remarkReadingTime],
    syntaxHighlight: "prism",
  },
});

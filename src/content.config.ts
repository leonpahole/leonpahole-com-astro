import { defineCollection } from "astro:content";

import { glob } from "astro/loaders";

import { z } from "astro/zod";

const BlogPostFrontmatterBaseSchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  categories: z.array(z.string()),
  date: z.string(),
  minutesRead: z.number().optional(),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/posts" }),
  schema: ({ image }) =>
    z.union([
      BlogPostFrontmatterBaseSchema.extend({
        cover_image: z.object({
          src: image(),
          alt: z.string(),
          credit_text: z.string(),
          credit_link: z.string(),
        }),
        slug: z.string(),
      }),
      BlogPostFrontmatterBaseSchema.extend({
        substack: z.string(),
      }),
    ]),
});

export const collections = { blog };

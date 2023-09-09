import type { MarkdownInstance } from "astro";

export interface BlogPostFrontmatter {
  title: string;
  excerpt: string;
  categories: string[];
  date: string;
  slug: string;
  cover_image: {
    src: string;
    alt: string;
    credit_text: string;
    credit_link: string;
  };
  minutesRead: number;
}

export type BlogPost = MarkdownInstance<BlogPostFrontmatter>;

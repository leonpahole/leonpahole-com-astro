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

const kebabCase = (str: string) => {
  return str.split(" ").join("-").toLowerCase();
};

export const getCategorySlug = (category: string) => {
  return kebabCase(category);
};

export const getCategoryUrl = (category: string) => {
  return `/blog/categories/${getCategorySlug(category)}`;
};

export const getCategoryNameFromSlug = (slug: string) => {
  return slug.split("-").join(" ").toLowerCase();
};

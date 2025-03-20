import type { MarkdownInstance } from "astro";

interface BlogPostFrontmatterBase {
  title: string;
  excerpt: string;
  categories: string[];
  date: string;
  minutesRead: number;
}

interface BlogPostFrontmatterNative extends BlogPostFrontmatterBase {
  cover_image: {
    src: string;
    alt: string;
    credit_text: string;
    credit_link: string;
  };
  slug: string;
}

interface BlogPostFrontmatterSubstack extends BlogPostFrontmatterBase {
  substack: string;
}

export type BlogPostFrontmatter =
  | BlogPostFrontmatterNative
  | BlogPostFrontmatterSubstack;

export type BlogPost = MarkdownInstance<BlogPostFrontmatter>;

const kebabCase = (str: string) => {
  return str.split(" ").join("-").toLowerCase();
};

export const getCategorySlug = (category: string) => {
  return kebabCase(category);
};

export const getCategoryUrl = (category: string) => {
  return `/blog/category/${getCategorySlug(category)}`;
};

export const getCategoryNameFromSlug = (slug: string) => {
  return slug.split("-").join(" ").toLowerCase();
};

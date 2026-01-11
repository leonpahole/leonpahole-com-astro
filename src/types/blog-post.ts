const kebabCase = (str: string) => {
  return str.split(" ").join("-").toLowerCase();
};

export const getCategorySlug = (category: string) => {
  return kebabCase(category);
};

export const getCategoryUrl = (category: string) => {
  return `/blog/category/${getCategorySlug(category)}`;
};

export const getCategoryNameFromSlug = (slug: string | number) => {
  return slug.toString().split("-").join(" ").toLowerCase();
};

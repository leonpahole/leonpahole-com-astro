---
layout: "../../../layouts/BlogPostLayout.astro"
title: "Using TypeScript namespaces for better code organization in ES modules"
excerpt: "JavaScript's ES modules are a great way to organize code into separate files and keep the code clean. I have noticed however that as projects get larger, it gets harder and harder to keep mental track of the code and assign proper names to identifiers. In this blog post, I present TypeScript namespaces as one of the solutions to this problem."
categories:
  - "Programming"
  - "Clean code"
date: "2022-12-04"
slug: ts-namespaces
cover_image:
  src: "/src/assets/blog/covers/ts-namespaces-cover.jpg"
  alt: ""
  credit_text: "Patrick Perkins on Unsplash"
  credit_link: "https://unsplash.com/@patrickperkins?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
---

## Naming issues with ES modules

`export`ing a function or a constant directly from the [ES module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) allows it to be `import`ed into another ES module. However, unless we come up with a good naming scheme, we will have to bake the context of the function directly into its name. This can make names long. Let's look at two examples.

### Example 1: util functions

Let's have a file `date-utils.ts` with the following contents:

```ts
export type Unit = "days" | "months" | "years";

export const add = (date1: Date, amount: number, unit: Unit) => {
  // ...
};

export const diff = (date1: Date, date2: Date, unit: Unit) => {
  // ...
};
```

Looking at this file as a standalone unit, the namings make sense. The `add` function adds to date, `diff˙ diffs two dates and `Unit` is the unit of time.

However, once we start `import`ing these identifiers into other modules, the names get too general. For example, the identifier `add` is not so easy to understand in a file that contains a calendar component.

This can get even more confusing if we have a `math-utils.ts` module, which also contains the function `add`.

One way to solve this issue is to [rename imports using the as keyword](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#renaming_imports_and_exports):

```ts
import { add as addToDate } from "../utils/date-utils.ts";
```

However, I am not a fan of this solution because it would require us to repeat this `import` every time (or we risk naming inconsistencies).

### Example 2: explicit hierarchical naming

The solution that I've been using up until recently is to name the functions more explicitly, so they are unique in the global namespace.

```ts
export type DateUnit = "days" | "months" | "years";

export const addToDate = (date1: Date, amount: number, unit: Unit) => {
  // ...
};

export const diffTwoDates = (date1: Date, date2: Date, unit: Unit) => {
  // ...
};
```

This works and one could argue it is even desirable since it encourages good namings, but I still felt like I was "over-naming" my identifiers. Often my functions and interfaces would end up being named like this:

```ts
interface BlogPostComment {
  // ...
}

export const addBlogPostComment = (
  blogPost: BlogPost,
  comment: BlogPostComment,
): BlogPostComment => {
  // ...
};

export interface BlogPostCommentAuthor {
  // ...
}

export const getBlogPostCommentAuthor = (
  comment: BlogPostComment,
): BlogPostCommentAuthor => {
  // ...
};
```

The namings would get more and more nested. It would start with a blog post, then a blog post comment, then a blog post comment author and so on. It was difficult to keep true to the naming scheme because it was so long and tedious, and it was also hard to convince my team members to follow the same pattern.

## TypeScript namespaces to the rescue

[Namespaces](https://www.typescriptlang.org/docs/handbook/namespaces.html) address all of the issues I've been having with the names of identifiers in ES modules. They provide us with the ability to organize our code so it is accessible only by prefixing it with a namespace name. This way we simultaneously protect ourselves from name clashes in other modules and keep the names of identifiers short.

### Example 1: util functions (with namespaces)

Here's how I'd rewrite our `date-utils.ts` with namespaces:

```ts
export namespace DateUtils {
  export type Unit = "days" | "months" | "years";

  export const add = (date1: Date, amount: number, unit: Unit) => {
    // ...
  };

  export const diff = (date1: Date, date2: Date, unit: Unit) => {
    // ...
  };
}
```

Now we can use `DateUtils.add`, which provides us with the full context of the function's meaning, and has no naming conflicts with `MathUtils.add`.

### Example 2: explicit hierarchical naming (with namespaces)

Similar to the previous example, we wrap with the namespace and then simplify the names.

```ts
export namespace BlogPostCommentModels {
  interface Comment {
    // ...
  }

  export const add = (blogPost: BlogPost, comment: Comment): Comment => {
    // ...
  };
}

/// some other module

export namespace BlogPostCommentAuthorModels {
  export interface Author {
    // ...
  }

  export const get = (comment: BlogPostCommentModels.Comment): Author => {
    // ...
  };
}
```

Note: I often split models and functions into two separate namespaces.

## Conclusion

TypeScript `namespace`s are a great way to organize code in a way that's more manageable, easier to name and easier to use. I've been using them for the past 6 months with great success - even as the code got larger, it was still easy to work with existing modules.

If you'd like to learn more about TypeScript namespaces, visit the [TypeScript documentation](https://www.typescriptlang.org/docs/handbook/namespaces.html#splitting-across-files).

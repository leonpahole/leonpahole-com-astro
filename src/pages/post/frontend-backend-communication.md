---
layout: "../../../../layouts/BlogPostLayout.astro"
title: "How I structure my front-end projects for communication with the server"
excerpt: "In this blog post I present a simple layered structure that I use on the front-end to simplify and streamline the communication with the server and all the processes behind it."
categories:
  - "Programming"
  - "Clean code"
  - "Frontend"
date: "2023-02-26"
slug: frontend-server-communication-structure
cover_image:
  src: "/src/assets/blog/covers/frontend-server-communication-structure-cover.jpg"
  alt: ""
  credit_text: "Chinh Le Duc on Unsplash"
  credit_link: "https://unsplash.com/es/@mero_dnt?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
---

At the core of every front-end web app is integration with the server. This involves the following processes:

- Calling the server endpoint
- Handling potential errors (update: here's the error handling blog post: [How I handle frontend errors](/blog/how-i-handle-frontend-errors))
- Converting the data from the server to the structure used on the front-end and validating it (if needed)

When I write front-end code, I like to abstract things as much as possible so the logic for the communication with the server is not in the UI components. In addition, I like to group related endpoint calls and models by domain. This makes the code easier to read and maintain.

Let's look at how I structure my front-end projects for server communication.

## Folder structure

I store everything related to server communication in a folder, which I usually name `util`. Then, I create subfolders for different domains in the app. Each of the subfolders can have the file for the `service`, `models`, `api` and `errors`.

```
├── util                       // Communication with the server
|  ├── auth                    // Everything for authentication (login, registration, ...)
|  |  ├── auth.service.ts
|  |  ├── auth.models.ts
|  |  ├── auth.api.ts
|  |  └── auth.errors.ts
|  ├── blogPost                 // Everything for blog posts (listing, creating, deleting, ...)
|  |  ├── blogPost.service.ts
|  |  ├── blogPost.models.ts
|  |  ├── blogPost.api.ts
|  |  └── blogPost.errors.ts
|  └── ...
└── ...
```

Note: I could name the files inside each respective folder without the domain prefix (eg. `auth/service.ts` instead of `auth/auth.service.ts`), but I prefer explicit names, as it's easier to search for them.

### The models

The `<domain>.models.ts` file contains all models for a given domain and any logic that may be needed for these models. I store the models in a `namespace`, which is [my preferred way to group related functionality](/blog/ts-namespaces).

Here's how `blogPost.models.ts` might look like (comments added for explanation purposes):

```ts
export namespace BlogPostModels {
  // public model
  export interface Post {
    id: number;

    title: string;
    excerpt: string;

    author: UserModels.User; // reference external model

    type: Type; // reference internal, private model

    postedAt: Date;
  }

  // private model
  type Type = "announcement" | "regular";

  // utility function that operates on the model
  export const getReadingTimeInMinutes = (post: Post): number => {
    // ...
  };

  // optional: convert / validate from server-side DTO to the model
  export const fromPostDto = (post: PostDto): Post => {
    // ...
  };
}
```

This example demonstrates different entities that can be stored in the `models` namespace:

- Declaration of models used in the front-end code - both public (`Post`) and private (`Type`).
- Declaration of utility functions that operate on the models.
- Declaration of functions that convert and validate models from the backend - this is useful when we want to use a different data structure on the front-end than what's returned from the back-end.

<br />

### The api

The `<domain>.api.ts` file contains all API calls for a given domain. Its only job is to call the API and return the result (whether it is successful or not). Let's look at the blog example.

```typescript
export namespace BlogPostApi {
  export const list = async (): Promise<PostDto[]> => {
    return Rest.get(`...`);
  };

  export const get = async (id: number): Promise<PostDto> => {
    // ...
  };

  export const create = async (data: PostDto): Promise<PostDto> => {
    // ...
  };

  export const delete = async (id: number): Promise<void> => {
    // ...
  };
}
```

The `api` only calls the server and returns the result (in raw object response format). In this example, we are assuming that the `PostDto` is the server-side structure that needs to be converted to `Post` for use in the front-end. The `api` does not do the conversion though - it is only aware of server-side entities - the endpoints and the DTOs.

If an error occurs, the `api` should throw. This is why the return types of functions are always typed in a way that assumes a successful response. In this example, if `get()` fails, we assume that the backend threw a `404 Not found` error.

Another thing to note is that the names of all of the functions in the `api` are general - we can afford to do this because the functions are protected with the `namespace`. When we will call these functions, the call itself will thus be readable (for example `BlogPostApi.list()` tells us exactly what it does).

### The errors

The `<domain>.errors.ts` file contains the logic and entities that are used when communicating with the server goes wrong. Because error handling is a complex topic itself, I will write a separate blog post covering how I handle errors. However, if you use your own system of handling errors, the `errors` file would be the place to store the logic for this system (under a `namespace`).

Update: here's the error handling blog post: [How I handle frontend errors](/blog/how-i-handle-frontend-errors).

### The service

The `<domain>.service.ts` file is where everything comes together. This file contains functions that perform the business logic of the application. This involves the following processes:

- Calling (one or multiple) `api` functions
- Converting and validating the result from the `api` using `models`
- Handling `errors`

Here's a full example of a service method for creating a blog post:

```typescript
export namespace BlogPostService {
  export const create = async (
    data: BlogPostModels.Post,
  ): Promise<BlogPostModels.Post> => {
    try {
      const request = BlogPostModels.toPostDto(data); // convert to server data structure
      const response = await BlogPostApi.create(request); // call the server
      return BlogPostModels.fromPostDto(response); // convert to front-end data structure
    } catch (e) {
      // this is how I handle errors, stay tuned for my error handling blog post for more information
      throw BlogPostModels.Create.getError(e);
    }
  };

  export const list = async (): Promise<BlogPostModels.Post[]> => {
    // ...
  };
}
```

The `service` calls the `models` to convert between data structures (might not be needed, depending on the way you structure your data), the `api` to make the server call, and the `errors` to gracefully handle the error.

A `service` can do more complex things as well - for example, it can call the server multiple times. Let's say that a `Post` can have one or more `Tag`s, but the server is written in a way that requires us to make a separate API call to attach tags to blog posts. Here's what the `service` might look like:

```typescript
export namespace BlogPostService {
  export const create = async (
    data: BlogPostModels.Post,
    tags: BlogPostModels.Tag[],
  ): Promise<BlogPostModels.Post> => {
    const post = await createBasic(data);
    return await attachTags(post.id, tags);
  };

  const createBasic = async (
    data: BlogPostModels.Post,
  ): Promise<BlogPostModels.Post> => {
    // same as above
  };

  const attachTags = async (
    id: number,
    tags: Tag[],
  ): Promise<BlogPostModels.Post> => {
    // ...
  };
}
```

In this example, the `create` operation has been divided into two sub-functions. Notice how we have renamed `create` to `createBasic` and made it private - I prefer to keep the names of public functions clear and readable, hence I renamed the private function.

The `create` function doesn't handle any errors - this is because `createBasic` and `attachTags` should include that logic. What the `create` function could handle is that if `attachTags` fails, it may want to retry the operation or fail silently.

## Usage in UI

Finally, we can use our structure in the UI. The only entities that should be used are the `service` and `models`.

```ts
const onCreateClick = () => {
  try {
    const post = await BlogPostService.create(data);
    navigate(`post/${post.id}`);
  } catch (e) {
    // handle error, stay tuned for the error handling blog post for more information
  }
};
```

## Other utilites

I don't use the `util` folder exclusively for server communication. I like to store general utilities in it as well, such as `math/math.utils.ts` for various math functions or `string/string.utils.ts` for string processing utilities. All of these utilities are protected with a `namespace`. Here's an example of `string.utils.ts`:

```typescript
export namespace StringUtils {
  export const toInt = (num: string | null | undefined): number | null => {
    if (num == null) {
      return null;
    }

    const parsed = Number(num);
    if (parsed == null || Number.isNaN(parsed)) {
      return null;
    }

    return parsed;
  };

  export const isNotBlank = (str: string | null | undefined): boolean => {
    if (!str) {
      return false;
    }

    return str.trim().length > 0;
  };
}
```

## Benefits

I really love working with this folder structure. Here are the benefits I have observed so far:

- It makes naming things easier. I no longer need to worry if the name of the function or interface clashes with another name, because everything is protected with a `namespace`.
- It makes the UI code more readable because the code only calls the `service` and doesn't deal with the rest of the complexities behind the client-server communication.
- It is more robust against change - most of the modifications are done in the `util` folder.
- It establishes an easy-to-follow process for handling communication with the server, so it is useful when working in a large team.

<br />

## Bonus: React Query queries

Recently I've been using [React Query](https://tanstack.com/query/v3/) a lot. I've thus started adding another file inside my `util/<domain>` folders for query hooks. Here's an example of `blogPost.queries.ts`:

```typescript
export namespace BlogPostQueries {
  const blogPostsKey = () => "blogPosts";

  export const useList = () =>
    useQuery(blogPostsKey(), () => BlogPostService.list());

  const blogPostKey = (id: number) => ["blogPosts", id];

  export const useGet = (id: number) =>
    useQuery(boardKey(id), () => BlogPostService.get(id));

  export const useCreate = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (request: BlogPostModels.CreateRequest) => {
        return BlogPostService.create(request);
      },
      // handle query updates here as well
      onSuccess: (newBlogPost) => {
        queryClient.setQueryData(
          blogPostsKey(),
          (oldBlogPosts: BlogPostModels.Post[] | undefined) => {
            if (!oldBlogPosts) {
              return [newBlogPost];
            }

            return [newBlogPost, ...oldBlogPosts];
          },
        );

        queryClient.setQueryData(blogPostKey(newBlogPost.id), () => {
          return newBlogPost;
        });
      },
    });
  };
}
```

And the usage is as follows:

```typescript
const { data: blogPosts, isLoading, error } = BlogPostQueries.useList();
```

<br />

## Conclusion

In this blog post, I went over the service-models-api-errors(-queries) structure that I use in every front-end project that I start. I like working with this structure because it makes things simpler and more manageable. However, I think that every team should adapt their structure to whatever makes them the most productive - hopefully, this blog post has motivated you to do just that.

Stay tuned for my error handling blog post, which will delve into the details of error handling using this structure.

Update: here's the error handling blog post: [How I handle frontend errors](/blog/how-i-handle-frontend-errors).

Thanks for reading!

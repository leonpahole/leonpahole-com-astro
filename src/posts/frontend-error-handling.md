---
layout: "../layouts/BlogPostLayout.astro"
title: "How I handle frontend errors"
excerpt: "Programmers disagree on many things, but one thing we can all get behind is that error handling is important. This blog post showcases how I handle frontend errors, associated with API calls, in a way that is readable, maintainable, and easy to use."
categories:
  - "Programming"
  - "Clean code"
  - "Frontend"
date: "2023-07-30"
slug: how-i-handle-frontend-errors
cover_image:
  src: "/src/assets/blog/covers/how-i-handle-frontend-errors-cover.jpg"
  alt: ""
  credit_text: "David Pupăză on Unsplash"
  credit_link: "https://unsplash.com/@davfts?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
---

Programmers disagree on many things, but one thing we can all get behind is that **error handling is important**. Error handling is what makes our programs robust. It also improves UX - an app that can detect that an error has occurred and communicate that in a readable manner, whilst also giving the user an option to recover from the error, has a vastly better UX than the app that crashes without explanation or fails silently without telling the user that something went wrong.

In my opinion, error handling is often overlooked in place of trying to get the system to work flawlessly - but no matter how great our system is, errors will inevitably occur. I'd argue that getting our system to gracefully handle errors and recover from them is more important than trying to optimize the system to work perfectly (which is usually not even possible).

Thus, when an unexpected error occurs, I often first ask: _"How are we handling that error, and is it recoverable?"_ before asking _"How can we fix this error?"_.

## Error handling on the frontend

In this blog post, I'll be focusing on error handling of the critical part of any frontend: communication with the server.

I've often struggled with this kind of error handling. The `try-catch` blocks were scattered across the codebase and it was very difficult to tell if the frontend is properly handling all errors that might be returned from the backend.

One easy way to handle such errors is to simply use a single `try-catch` on every backend call, and then translate it to something like this: _An error has occurred. Please try again._ Depending on the size and complexity of your app, this may or may not be ideal.

In most apps, we want to handle the backend errors in a more granular fashion. When we detect that an error occurs, we want to inspect it and determine what exactly went wrong, so that we can give the user a more specific message.

Let's say for example that we have an endpoint `/auth/login`, which logs in a user. It can raise the following errors:

- "400 Bad request" if either the user doesn't exist or the account is not yet activated (determined by the error message).
- "401 Unauthorized" if the username / password combination is not correct.
- "501 Internal server error" if something went wrong on the server.

In addition to that, a network error can occur in any of these requests.

This particular backend communicates the errors using HTTP codes, which is a standard and semantic way to raise errors. It also returns an error message in JSON format. For example:

```json
{
  "message": "Account not yet activated!"
}
```

I typically stick to checking HTTP codes, as they are more stable, but if the same HTTP code is tied to two different errors (as is with the 400 in the example), I consult the `message`.

Of course, depending on the implementation of the backend, errors could be transmitted in another way.

The login endpoint is a great example of how sometimes a general, catch-all error-handling solution might not be adequate. If the user account is for example not yet activated, printing a generic error message with a prompt to try again later is not only too broad, but it's also misleading - trying again later will still yield the same error - the user must first activate their account.

## Challenges of the frontend error handling logic

Proper error handling on the frontend can get quite painful and tedious because it involves translating the backend error into a variety of different actions and messages. For example, in our login form:

- If the user account doesn't exist or is not activated, we show the error under the email input field.
- If invalid credentials are provided, we show the error under the form.
- If something went wrong on the server, we show an error under the form with a link to the service status page.
- If a network error occurred, we show the error under the form and ask the user if they are connected to the internet.
- In addition to this, we must anticipate an unknown error. We must make sure that no matter what error happens, the user gets some kind of feedback - in our case, that would be an alert message.

Because each error can potentially translate into its dedicated action, the code that expresses these conditions and actions can quickly become entangled in complex logic.

The code example below demonstrates this. The code sample is shortened for brevity, and the full file can be found [here](https://github.com/leonpahole/error-handling-react-demo/blob/main/src/components/loginForm/LoginFormStandardErrorHandling.tsx). You can clone the [repo](https://github.com/leonpahole/error-handling-react-demo) to play around with the code. Important notes:

- I am using the Formik setup described in [this blog post](/blog/post/making-reactjs-forms-simple-with-formik-custom-inputs)
- The folders are structured according to [this blog post](/blog/post/frontend-server-communication-structure)
- The API requests are mocked with axios-mock-adapter inside [rest-mock.ts](https://github.com/leonpahole/error-handling-react-demo/blob/main/src/util/rest/rest-mock.ts).

```tsx
/* imports, validation schema and login model */

type LoginError = "invalidCredentials" | "internal" | "network";

export const LoginForm: React.FC = () => {
  const useLogin = AuthQueries.useLogin();
  const [errorType, setErrorType] = React.useState<LoginError | null>(null);

  return (
    <div className="login-form-container">
      {/* form header */}

      <Formik<LoginFormValues>
        initialValues={{
          email: "",
          password: "",
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setErrors, setSubmitting, resetForm }) => {
          try {
            await useLogin.mutateAsync(values);
            setErrorType(null);
            resetForm();
            alert("Login successful!");
          } catch (e) {
            const error = e as AxiosError;
            if (error.response?.status === 401) {
              // 401 can mean multiple errors - check which error it is
              const isNotActivated = RestUtils.doesServerErrorMessageContain(
                error,
                "User is not activated!",
              );

              if (isNotActivated) {
                setErrors({ email: "User is not activated!" });
                return;
              }

              const isNonExisting = RestUtils.doesServerErrorMessageContain(
                error,
                "User does not exist!",
              );

              if (isNonExisting) {
                setErrors({ email: "User doesn't exist!" });
                return;
              }
            } else if (error.response?.status === 403) {
              setErrorType("invalidCredentials");
            } else if (error.response?.status === 500) {
              setErrorType("internal");
            } else if (error.code === "ERR_NETWORK") {
              setErrorType("network");
            } else {
              alert("An unknown error occurred!");
            }
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="login-form">
            {/* form fields and submit button */}

            {errorType === "invalidCredentials" && (
              <p className="login-form-error-message">
                Invalid credentials! Please try again!
              </p>
            )}

            {errorType === "network" && (
              <p className="login-form-error-message">
                A network error occurred! Are you connected to the internet?
              </p>
            )}

            {errorType === "internal" && (
              <p className="login-form-error-message">
                An internal error occurred! Please try again later or check the
                status of the service on the <a>status page</a>.
              </p>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};
```

The function `doesServerErrorMessageContain` checks the error message of the server in a case-insensitive way. The definition of the function can be found [here](https://github.com/leonpahole/error-handling-react-demo/blob/main/src/util/rest/rest.utils.ts).

The code above handles the errors properly, but it has several downsides:

- It makes UI components directly dependent on backend responses, which makes changes difficult.
- It is arguably less readable.
- It is not typesafe and is vulnerable to accidental typos.
- It is quite long and one could argue that such logic isn't suitable for an UI component.
- It makes it hard to have an overview of error handling in the app, as the logic is scattered across the UI components.

## My solution to handling errors on the frontend

To avoid the shortcomings of direct error handling inside UI components, I use a centralized error handling framework that is based on wrapping and transforming errors.

The idea of the framework is as follows:

- Error handling for a specific endpoint is defined declaratively in a central location, outside of the UI component.
- Each endpoint has a list of errors it can raise.
- When an error is raised, it gets transformed into a type-safe error format, which is propagated to the UI component.

We will look at how this works by working our way from the usage in the UI components to the low-level code that powers this mini-framework.

### Usage in UI components

Let's look at how we handle the error in the `LoginForm` component. Full code can be found [here](https://github.com/leonpahole/error-handling-react-demo/blob/main/src/components/loginForm/LoginForm.tsx).

```tsx
/* imports, validation schema and login model */

export const LoginForm: React.FC = () => {
  const useLogin = AuthQueries.useLogin();

  const errorType = AuthErrors.Login.getErrorCode(useLogin.error);

  return (
    <div className="login-form-container">
      {/* form header */}

      <Formik<LoginFormValues>
        initialValues={{
          email: "",
          password: "",
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setErrors, setSubmitting, resetForm }) => {
          try {
            await useLogin.mutateAsync(values);
            resetForm();
            alert("Login successful!");
          } catch (e) {
            const error = AuthErrors.Login.getErrorCode(e);

            if (error === "USER_NOT_ACTIVATED") {
              setErrors({ email: "User is not activated!" });
            } else if (error === "USER_DOESNT_EXIST") {
              setErrors({ email: "User doesn't exist!" });
            } else if (error === "UNKNOWN_ERROR") {
              alert("An unknown error occurred!");
            }
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="login-form">
            <FormikTextInput
              name="email"
              label="Email"
              type="email"
              placeholder="Enter your email..."
            />

            <FormikTextInput
              name="password"
              label="Password"
              type="password"
              placeholder="Enter your password..."
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className={clsx("login-form-submit-button", {
                "is-submitting": isSubmitting,
              })}
            >
              Submit
            </button>

            {errorType === "INVALID_CREDENTIALS" && (
              <p className="login-form-error-message">
                Invalid credentials! Please try again!
              </p>
            )}

            {errorType === "NETWORK_ERROR" && (
              <p className="login-form-error-message">
                A network error occurred! Are you connected to the internet?
              </p>
            )}

            {errorType === "INTERNAL_ERROR" && (
              <p className="login-form-error-message">
                An internal error occurred! Please try again later or check the
                status of the service on the <a>status page</a>.
              </p>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};
```

Using the improved error handling mechanism we can now handle errors in a type-safe way, and the logic of handling errors is separated from the UI component. The UI component only cares about the error codes, and if something on the backend changes, the UI component stays the same. Finally, the code is also much simpler to read than it was in the initial example.

We are using the `error` that is returned by React query, and we use the `getErrorCode` function to get the type-safe error code. Note that we handle errors in two places: once in the render method, and once in the submit function, depending on what the action tied to the error is.

But, how does this work?

### Usage in dedicated error files

Here's the file [auth.errors.ts](https://github.com/leonpahole/error-handling-react-demo/blob/main/src/util/auth/auth.errors.ts), which contains definitions of errors that can occur on login. Note that I am using the structure described in [this blog post](/blog/post/frontend-server-communication-structure).

```ts
import { ErrorHandler } from "../shared/error-handling";
import axios from "axios";
import { RestUtils } from "../rest/rest.utils";

export namespace AuthErrors {
  // define what all can go wrong during login; but without general errors, which are already handled in the error handler
  type LoginErrorCodes =
    | "INVALID_CREDENTIALS"
    | "USER_NOT_ACTIVATED"
    | "USER_DOESNT_EXIST";

  // implement checking for each of the errors
  export const Login = new ErrorHandler<LoginErrorCodes>([
    {
      code: "INVALID_CREDENTIALS",
      condition: (e) => {
        if (axios.isAxiosError(e)) {
          return e.response?.status === 403;
        }

        return false;
      },
    },
    {
      code: "USER_DOESNT_EXIST",
      condition: (e) => {
        if (axios.isAxiosError(e)) {
          return RestUtils.doesServerErrorMessageContain(
            e,
            "User does not exist!",
          );
        }

        return false;
      },
    },
    {
      code: "USER_NOT_ACTIVATED",
      condition: (e) => {
        if (axios.isAxiosError(e)) {
          return RestUtils.doesServerErrorMessageContain(
            e,
            "User is not activated!",
          );
        }

        return false;
      },
    },
  ]);
}
```

This is the syntax that I use with this mini-framework. A dedicated error handler for the login endpoint is created an exported.

All possible errors are defined in the `LoginErrorCodes` type. Then, when initializing the error handler, we implement the conditions for each error. The condition is a function that takes an error as an argument and returns a boolean value. If the condition returns `true`, the error handler will return the error code that was defined in the `code` property. Note that the errors that are declared earlier have higher priority and will be checked first. Also, the framework predefines some shared errors, which we will see in the next chapter.

The mini-framework will then take care of the rest. It will check the conditions in order, and if one of them returns `true`, it will return the error code. But how do we actually send the error to the error handler?

I do it in the [service](/blog/post/frontend-server-communication-structure) layer. Here's [auth.service.ts](https://github.com/leonpahole/error-handling-react-demo/blob/main/src/util/auth/auth.service.ts). The error from the api is wrapped and rethrown - this is the error that will be used in the UI component.

```ts
import { AuthModels } from "./auth.models";
import { AuthApi } from "./auth.api";
import { AuthErrors } from "./auth.errors";

export namespace AuthService {
  export const login = async (req: AuthModels.LoginRequest) => {
    try {
      return await AuthApi.login(req);
    } catch (e) {
      // wrap the error into application error and rethrow it
      AuthErrors.Login.rethrowError(e);
    }
  };
}
```

### The framework code

Here's the code for [error-handling.ts](https://github.com/leonpahole/error-handling-react-demo/blob/main/src/util/shared/error-handling.ts).

```ts
import axios from "axios";

// codes that we want to handle in every scenario
export type GeneralErrorCodes =
  | "NETWORK_ERROR"
  | "INTERNAL_ERROR"
  | "UNKNOWN_ERROR";

class ApplicationException<CodeT> extends Error {
  public code: CodeT;

  constructor(code: CodeT) {
    super(code as string);
    this.code = code;
  }
}

interface ErrorEntry<CodeT> {
  code: CodeT;
  condition: (error: unknown) => boolean;
}

export class ErrorHandler<CodeT extends string> {
  entries: ErrorEntry<CodeT | GeneralErrorCodes>[] = [];

  constructor(entries: ErrorEntry<CodeT>[]) {
    type ICodeT = CodeT | GeneralErrorCodes;

    // implement checking for each of the general errors

    const internalError: ErrorEntry<ICodeT> = {
      code: "INTERNAL_ERROR",
      condition: (e) => {
        if (axios.isAxiosError(e)) {
          return (
            e.response?.status != null &&
            e.response.status >= 500 &&
            e.response.status < 600
          );
        }

        return false;
      },
    };

    const networkError: ErrorEntry<ICodeT> = {
      code: "NETWORK_ERROR",
      condition: (e) => {
        if (axios.isAxiosError(e)) {
          return e.code === "ERR_NETWORK";
        }

        return false;
      },
    };

    const unknownError: ErrorEntry<ICodeT> = {
      code: "UNKNOWN_ERROR",
      condition: () => true,
    };

    // general errors have the lowest priority
    this.entries = [...entries, internalError, networkError, unknownError];
  }

  // convert the error into an application exception
  public rethrowError(
    error: unknown,
  ): ApplicationException<CodeT | GeneralErrorCodes> {
    console.error(error);
    const errorEntry = this.entries.find((entry) =>
      entry.condition(error ?? {}),
    );
    const { code } = errorEntry!;
    throw new ApplicationException(code);
  }

  public getErrorCode(error: unknown): CodeT | GeneralErrorCodes | null {
    if (error instanceof ApplicationException) {
      return error.code;
    }

    return null;
  }
}

// can be used for endpoints that only need general error handling
export const SharedErrorHandler = new ErrorHandler<never>([]);
```

This file should very rarely be changed, because it mostly contains just framework code. Here's what it does:

- Defines the shared `ApplicationException` class, which is a wrapper around the `Error` class. It contains the `code` property, which is the error code that we defined in the error handler. Errors of type `ApplicationException` will be passed to UI components through React query, and we can obtain the error code from them.
- Defines a couple of shared error codes, which will be used in all error handlers. These are `NETWORK_ERROR`, `INTERNAL_ERROR` and `UNKNOWN_ERROR`.
- The `ErrorHandler` class is the base class for all error handlers. In the constructor, it defines the array of all errors that are defined from the outside (like the 3 errors in our login error handler), and also adds shared errors (with lower priority). The unknown error is a catch-all error with an always-true condition.
- The `rethrowError` accepts an error of any type (typically it will be an `AxiosError`, since we handle API calls and we use axios), and obtains the error code by iterating through the array and checking conditions one by one, starting from the highest priority ones, and working down to the lower priority ones (the unknown error having the lowest priority). Then, it constructs an `ApplicationException` with obtained code. It also logs the error.
- The `getErrorCode` is a utility function for obtaining the code from the error object. Because React query types the error as `unknown`, this function simplifies the code that checks for `instanceof`.

In addition, the code defines the `SharedErrorHandler`, which can be used for endpoint calls that have no additional errors than the shared ones.

### Benefits

I've been using this approach to error handling for a while now, and I'm very satisfied with it. Here are some of the benefits that I've noticed:

- UI components are simplified and shorter.
- Error handling is centralized, and it's easy to add new errors.
- Whenever the backend changes, I know exactly where to look to make the change.
- The code is in general more readable, because the complex logic is abstracted away in the framework.

### Conclusion and sample repo

I hope you found this post useful for your own error handling on the frontend.
If you want to see the code in action, you can check out [this repo](https://github.com/leonpahole/error-handling-react-demo/).

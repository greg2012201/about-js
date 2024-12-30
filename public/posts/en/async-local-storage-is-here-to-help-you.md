---
title: Async Local Storage is Here to Help You
createdAt: 18-12-2024
tags: node.js, data flow, asyncLocalStorage, JavaScript, Fastify, Next.js, Hono
description: Let's talk about Async Local Storage in Node.js. We'll explore where it can be used and its use cases. We'll also attempt to reimplement one of the features from one of the many popular meta-frameworks out there.
---

# Async Local Storage is Here to Help You

When you hear the phrase "Async Local Storage," what comes to mind? You might initially think it refers to some magical implementation of browser-based local storage. However, this assumption is incorrect. Async Local Storage is neither browser-related nor a typical storage mechanism. Probably one or two libraries you have used use it under the hood. In many cases, this feature can save you from dealing with messy code.

## What is Async Local Storage?

Async Local Storage is a feature introduced in Node.js, initially added in versions `v13.10.0` and `v12.17.0`, and later stabilized in `v16.4.0`. It is part of the [async_hooks](https://nodejs.org/api/async_hooks.html) module, which provides a way to track asynchronous resources in Node.js applications. The feature enables the creation of a shared context that multiple asynchronous functions can access without explicitly passing it. The context is available in every (and only) operation executed within the callback passed to the `run()` method of the `AsyncLocalStorage` instance.

## A pattern for using AsyncLocalStorage

Before diving into the examples, let’s explain the pattern we will be using.

**Initialization**

```ts
import { AsyncLocalStorage } from "async_hooks";
import { Context } from "./types";

export const asyncLocalStorage = new AsyncLocalStorage<Context>();

// export const authAsyncLocalStorage = new AuthAsyncLocalStorage<AuthContext>()
```

In the module above, we initialize an instance of `AsyncLocalStorage` and export it as a variable.

**Usage**

```ts
asyncLocalStorage.run({ userId }, async () => {
  const usersData: UserData = await collectUsersData();
  console.log("usersData", usersData);
});

// (method) AsyncLocalStorage<unknown>.run<Promise<void>>(store: unknown, callback: () => Promise<void>): Promise<void> (+1 overload)
```

The `run()` method takes two arguments: `storage`, which contains the data we want to share, and `callback`, where we place our logic. As a result, the `storage` becomes accessible in every function call within the `callback`, allowing for seamless data sharing across asynchronous operations.

```ts
import { asyncLocalStorage } from "./context";

async function collectUsersData() {
  const context = asyncLocalStorage.getStore();
}
```

To access the context, we import our instance and call the `asyncLocalStorage.getStore()` method. The great thing is that the `storage` retrieved from `getStore()` is typed because we passed the `Context` type to `AsyncLocalStorage` during initialization: `new AsyncLocalStorage<Context>()`.

## Async Local Storage as an auth context

There is no web application without an authentication system. We must validate auth tokens and extract user information. Once we obtain the user identity, we want to make it available in the route handlers and avoid duplicating code in each one. Let’s see how we can utilize `AsyncLocalStorage` to implement an auth context while keeping our code clean.

I chose `fastify` for this example.

According to the [documentation](https://www.fastify.io/) `fastify` is:

> Fast and low overhead web framework, for Node.js

Ok, let's get started:

1. Install `fastify`:

```console
npm install fastify
```

2. Define type for our auth context:

```ts
type Context = Map<"userId", string>;
```

3. Initialize an instance of AsyncLocalStorage, assign it to a variable, and export the variable. Remember to pass the relevant type: `new AsyncLocalStorage<Context>()`.

```ts
import { AsyncLocalStorage } from "async_hooks";
import { Context } from "./types";

export const authAsyncLocalStorage = new AsyncLocalStorage<Context>();
```

4. Initialize a `Fastify` instance and add a utility for error handling:

```ts
import Fastify from "fastify";

/* other code... */

const app = Fastify();

function sendUnauthorized(reply: FastifyReply, message: string) {
  reply.code(401).send({ error: `Unauthorized: ${message}` });
}

/* other code... */
```

Now comes the very important part. We are going to add an `onRequest` hook to wrap handlers with the `authAsyncLocalStorage.run()` method.

```ts
import Fastify from "fastify";
import { authAsyncLocalStorage } from "./context";
import { getUserIdFromToken, validateToken } from "./utils";

/* other code... */

app.addHook(
  "onRequest",
  (request: FastifyRequest, reply: FastifyReply, done: () => void) => {
    const accessToken = request.headers.authorization?.split(" ")[1];
    const isTokenValid = validateToken(accessToken);
    if (!isTokenValid) {
      sendUnauthorized(reply, "Access token is invalid");
    }
    const userId = accessToken ? getUserIdFromToken(accessToken) : null;

    if (!userId) {
      sendUnauthorized(reply, "Invalid or expired token");
    }
    authAsyncLocalStorage.run(new Map([["userId", userId]]), async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      sendUnauthorized(reply, "Invalid or expired token");
      done();
    });
  },
);

/* other code... */
```

After successful validation, we call the `run()` method from our `authAsyncLocalStorage`. As the `storage` argument, we pass the auth context with the `userId` retrieved from the token. In the callback, we call the `done` function to continue with the Fastify lifecycle.

If we have authentication checks that require asynchronous operations, we should add them to the `callback`. This is because, [according to the documentation](https://fastify.dev/docs/latest/Reference/Hooks/):

> the done callback is not available when using async/await or returning a Promise. If you do invoke a done callback in this situation unexpected behavior may occur, e.g. duplicate invocation of handlers

Here's an example of how that might look:

```ts
/* other code... */

authAsyncLocalStorage.run(new Map([["userId", userId]]), async () => {
  const isUserValid = await checkIfUserIsValid(userId);

  if (!isUserValid) {
    sendUnauthorized(reply, "User identity not valid");
  }
  done();
});
```

Our example has only one protected route. In more complex scenarios, you might need to wrap only specific routes with the authentication context. In such cases, you could either:

1. Wrap the `onRequest` hook in a custom plugin that's applied only to specific routes.
2. Add route distinction logic within the `onRequest` hook itself.

All right, our context is set and we can now define a protected route:

```ts
import { UserRepository } from "./user-repository";
import { getContext } from "./with-async-local-storage";
import { Context } from "./types";

/* other code... */

app.get("/email-addresses", async () => {
  const context = authAsyncLocalStorage.getStore();
  const userId = context.get("userId");
  const userRepository = new UserRepository();
  const addresses = await userRepository.getEmailAddresses(userId);

  return { addresses };
});
```

The code is pretty straightforward. We import `authAsyncLocalStorage`, retrieve the `userId`, initialize `UserRepository`, and fetch data. This approach keeps the route handler clean and focused.

## Exploring How Next.js uses Async Local Storage

In this example, we'll reimplement the cookies helper from Next.js. But wait—this is a post about AsyncLocalStorage, right? So why are we talking about cookies? The answer is simple: Next.js uses AsyncLocalStorage to manage cookies on the server. That's why reading a cookie in a server component is as easy as:

```jsx
import { cookies } from "next/headers";

export default function ExamplePage() {
  const cookieStore = await cookies();
  const testCookie = cookieStore.get("test");

  return (
    <div>
      <h1>Server Component: Cookie Usage</h1>
      {testCookie?.value || ""}
    </div>
  );
}
```

We use the `cookies` function exported from `next/headers`, which provides several methods for managing cookies. But how is this technically possible?

### Now it's time to start our re-implementation

First, I want to mention that this example is based on the knowledge I gained from a great [video](https://youtu.be/JejwWxhsfZw?si=JRRZq75o84n4jCNw), by [Lee Robinson](https://x.com/leeerob?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor) and diving in the Next.js repository.

In this example, we'll use [Hono](https://hono.dev/) as our server framework. I chose it for two reasons:

1. I just wanted to give it a try.
2. It offers solid support for `JSX`.

First install `Hono`:

```console
npm install hono
```

Now, initialize `Hono` and add middleware:

```ts
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import withAsyncLocalStorage from "./with-async-local-storage";
import { setCookieContext } from "./cookies";

const app = new Hono();

app.use(logger());

app.use(async (c, next) => {
  return cookieAsyncLocalStorage.run(setCookieContext(c), async () => {
    await next();
  });
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
```

The code resembles the middleware from the Fastify example, does it? To set the context, we utilize `setCookieContext`, which is imported from the `cookies` module — our custom simple implementation of the `cookies` function. Let's follow the `setCookieContext` function and navigate to the module from which it was imported:

```ts
import type { Context, Env } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { cookieAsyncLocalStorage } from "./context";

const MOCK_ERROR = "Can not set or delete cookie in server component";

export function setCookieContext(c: Context<Env, never, {}>) {
  return {
    cookies: getCookie(c),
    setCookie: (key: string, value: string) => setCookie(c, key, value),
    deleteCookie: (key: string) => deleteCookie(c, key),
  };
}

function cookies() {
  const context = cookieAsyncLocalStorage.getStore();

  const methods = {
    getCookies: () => {
      if (!context?.cookies) return [];
      return Object.entries(context.cookies).map(([key, value]) => ({
        key,
        value,
      }));
    },
    setCookie: (key: string, value: string) => {
      throw new Error(MOCK_ERROR);
    },
    deleteCookie: (key: string) => {
      throw new Error(MOCK_ERROR);
    },
  };

  return new Promise<typeof methods>((resolve) => {
    resolve(methods);
  });
}

export default cookies;
```

The `setCookieContext` function (whose return value we passed to `cookieAsyncLocalStorage.run()` in the Hono middleware) extracts cookies from the `c` parameter, which represents the hono context, and bundles them with closures that provide utility functions for managing cookies.

Our `cookies` function replicates the functionality of the `cookies` from `next/headers`. It utilizes the `cookieAsyncLocalStorage.getStore()` method to access the same context that is passed to `cookieAsyncLocalStorage.run()` when it is called.

We wrapped the return of our `cookies` function in a promise to mimic the behavior of the Next.js implementation. Prior to version 15, this function was synchronous. Now, in the current Next.js code, the methods returned by the `cookies` are attached to a promise object, as shown in the following simplified example:

```ts
/*  .......... */
// https://github.com/vercel/next.js/blob/canary/packages/next/src/server/request/cookies.ts

Object.defineProperties(promise, {
  [Symbol.iterator]: {
    get: {
      value: function () {
        /* .... */
      },
    },
    getAll: {
      value: function () {
        /* .... */
      },
    },
    has: {
      value: function () {
        /* .... */
      },
    },
    set: {
      value: function () {
        /* .... */
      },
    },
    delete: {
      value: function () {
        /* .... */
      },
    },
    /* .... */
  },
});

/* .... */
```

Another point worth mentioning is that in our case, using `cookies.setCookie` and `cookies.deleteCookie` always throws an error, similar to the behavior observed in Next.js when setting cookies in a server component. We hardcoded this logic because, in the original implementation, whether we can use `setCookie` or `deleteCookie` depends on the phase(`WorkUnitPhase`) property stored in the storage called `RequestStore`(this is the implementation of `AsyncLocalStorage` and also stores cookies). However, that topic is better suited for another post. To keep this example simple, let's omit the simulation of `WorkUnitPhase`.

**Now we need to add our React code.**

1. Add the App component:

```jsx
import type { FC } from "hono/jsx";

const App: FC = ({ children }) => {
    return (
        <html>
            <body>{children}</body>
        </html>
    );
};

export default App;

```

2. Add a component for managing cookies:

```jsx
import { FC } from "hono/jsx";
import cookies from "../cookies";

const DisplayCookies: FC = async () => {
    const cookieStore = await cookies();

    return (
        <div>
            <h1>Hello!</h1>
            <p>Here are your cookies:</p>
            <ul>
                {cookieStore.getCookies().map((cookie) => (
                    <li key={cookie.key}>
                        {cookie.key}: {cookie.value}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DisplayCookies;
```

The usage of cookies is similar to how it is used in Next.js React server components.

3. Add a route handler to render the template:

```jsx
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import App from "./components/app";
import DisplayCookies from "./components/display-cookies";
import { setCookieContext } from "./cookies";
import { cookieAsyncLocalStorage } from "./context";

const app = new Hono();

app.use(logger());

app.use(async (c, next) => {
  return cookieAsyncLocalStorage.run(setCookieContext(c), async () => {
    await next();
  });
});

app.get("/", async (c) => {
  const renderDisplayCookiesComponent = await (<DisplayCookies />);
  return c.html(<App>{renderDisplayCookiesComponent}</App>);
});

serve(
  {
    fetch: app.fetch,
    port: 8000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
```

Our template is rendered by the `html` method from the `hono` context. The key point here is that the route handler runs within the `asyncLocalStorage.run()` method, which takes `cookieContext`. As a result, we can access this context in the `DisplayCookies` component through the `cookies` function.

It is not possible to set cookies inside React server components, so we need to do it manually:

![setting a cookie manually in the browser](/posts/assets/async-local-storage-is-here-to-help-you/set-cookie-manually.png)

Let's refresh a page:

![rendered template with cookies displayed](/posts/assets/async-local-storage-is-here-to-help-you/page-rendered.png)

And here we are, our cookies are successfully retrieved and displayed.

## Conclusions

There are many more use cases for `asyncLocalStorage`. This feature allows you to build custom contexts in nearly any server framework. The asyncLocalStorage context is encapsulated within the execution of the `run()` method, making it easy to manage. It’s perfect for handling request-based scenarios. The API is simple and flexible, enabling scalability by creating instances for each state. It is possible to seamlessly maintain separate contexts for things like authentication, logging, and feature flags.

Despite its benefits, there are a few considerations to keep in mind. I've heard opinions that `asyncLocalStorage` introduces too much 'magic' into the code. I'll admit that when I first used this feature, it took me some time to fully grasp the concept. Another thing to consider is that importing the context into a module creates a new dependency that you’ll need to manage. However, in the end, passing values through deeply nested function calls is much worse.

**Thanks for reading, and see you in the next post!👋**

PS: You can find the examples(plus one bonus) [here on GitHub](https://github.com/greg2012201/async-local-storage-examples)

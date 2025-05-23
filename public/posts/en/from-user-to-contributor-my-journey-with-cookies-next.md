---
title: "From User to Contributor: My Journey with cookies-next"
createdAt: 22-01-2025
tags: next.js, cookies, browser, npm, package, oss
description: In the past, I had many opportunities to work on authentication systems. Everyone knows that when it comes to auth, cookies often need to be handled, and it's good to have tools that streamline working with them. One such tool is cookies-next, a tiny npm package designed (as its name suggests) to work with cookies in Next.js.
---

# From User to Contributor: My Journey with cookies-next

In the past, I had many opportunities to work on authentication systems. Everyone knows that when it comes to authentication, cookies often need to be handled, and it's helpful to have tools that streamline working with them. One such tool is `cookies-next`, a tiny npm package designed (as its name suggests) to work with cookies in Next.js. As far as I know, this package is the only tool available for cookie management in Next.js that supports v15+. In my opinion, as well as in the opinion of others, cookie management in Next.js can be challenging due to the architecture of the framework, which combines both server-side and client-side. I will show you how `cookies-next` simplifies cookie management in Next.js and provide some insights from being a contributor to this library.

## The API of cookies-next

The API is quite simple. On the server, it’s required to pass the context or the `cookies` function imported from `next/headers` along with optional cookie options to one of the asynchronous functions whose names correspond to the operations: `set`, `get`, and `delete`. On the client, dedicated hooks are available, or you can use the same functions as on the server, but in their synchronous versions (without passing any context or the `cookies` function imported from `next/headers` — just the optional cookie options).

Below are a few examples:

**Client**

```jsx
// USING HOOKS

"use client";
import { useGetCookies } from "cookies-next";

export function ShowAllCookies() {
  const getCookies = useGetCookies();
  return <div>{JSON.stringify(getCookies())}</div>;
}
```

```jsx
// USING COOKIE FUNCTIONS

"use client";
import { getCookies } from "cookies-next";

export function LogAllCookies() {
  return (
    <button type="button" onClick={() => console.log(getCookies())}>
      Log all cookies
    </button>
  );
}
```

**Server**

```jsx
// SERVER COMPONENT

import { getCookies } from "cookies-next";
import {cookies} from "next/headers"

export function ShowAllCookies() {
 const allCookies = await getCookies({cookies})
  return <div>{JSON.stringify(getCookies())}</div>;
}

```

```ts
// ROUTE HANDLER

import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { setCookie } from "cookies-next";

export async function GET(req: NextRequest) {
  const res = new NextResponse();
  await setCookie("test", "value", { res, req });
  const testCookie = await getCookie("test1", { cookies });
  console.log("testCookie", testCookie);

  return res;
}
```

## The use case

I used `cookies-next` for the first time while working on a new project. The decision was made to use Next.js v13+ with the app router, which was a very new feature at the time. My task was to build an authentication system. In this system, one of the tokens was stored in cookies. There were also other features that used cookies and needed to access them on the client side. As a result, we needed consistent APIs to manage cookie storage. However, Next.js didn’t have a consistent API that could handle cookies both on the server and the client. This made `cookies-next` the perfect solution for this project.

In the examples below, we will compare cookie management in Next.js with and without `cookies-next` to see how `cookies-next` solves the cookie management issues I encountered.

Start by setting a cookie on the server using only the Next.js API:

```ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const res = new NextResponse();
  const cookieStore = await cookies();

  cookieStore.setCookie("tasty", "cookie");

  return res;
}
```

The code looks great, and everything works as expected.
Now, we want to consume this "tasty cookie" in a client component. Since Next.js does not provide any utility to access cookies on the client, we need to either create our own solution or use one of the npm packages available for client-side cookie management. Let’s choose the option that seems to be the fastest: the `js-cookie` library.

```jsx
"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";

function CookieConsumerClient() {
  const [isMounted, setIsMounted] = useState("");

  const tastyCookie = isMounted ? Cookies.get("tasty") : null; // "cookie"

  return (
    <div>
      <p>{tastyCookie}</p>
    </div>
  );
}
```

And here’s the first problem: to avoid hydration errors, we must ensure that the code does not cause a mismatch between the HTML rendered on the server and the HTML rendered on the client. In a growing codebase, this requirement forces us to create a custom hook to efficiently use this feature.

We also encountered other disadvantages, such as:

- The need to use an external dependency to handle cookies only on the client side.
- The import has only a few small differences compared to `cookies` from `next/headers`:
  - Default import vs. Named import.
  - Name casing inconsistency: `Cookies` vs. `cookies`.

These small differences can cause significant confusion and hinder the development process.

Let’s move forward and see how to read the same cookie in a React Server Component as well.

```jsx

import { cookies } from "next/headers";

function CookieConsumerServer() {
  const cookieStore = await cookies();
  const tastyCookie = cookieStore.get("tasty"); // "cookie"
  return (
    <div>
      <p>{tastyCookie}</p>
    </div>
  );
}
```

Again, we have to go back to the Next.js API, which is not consistent with the `js-cookie` API we use on the client.

Let’s see how it looks with `cookies-next`:

```ts
import { cookies } from "next/headers";
import { setCookie } from "cookies-next";
import { NextResponse } from "next/server";

export async function GET() {
  const res = new NextResponse();
  await setCookie("tasty", "cookie", { cookies });

  /* rest of the code */

  return res;
}
```

We pass only the arguments required for setting a cookie.

On the client, all we need to do is import a hook that returns an appropriate getter function:

```jsx
"use client";

import { useGetCookie } from "cookies-next";

function CookieConsumerClient() {
  const getCookie = useGetCookie(); // "cookie"
  return (
    <div>
      <p>{getCookie("tasty")}</p>
    </div>
  );
}
```

And now let's read our cookie in the server component using `cookies-next`. The library takes advantage of TypeScript features and guides us on what we should pass to `setCookie`. We don't need to do anything more than call the function and pass the required arguments.

```jsx
import { cookies } from "next/headers";
import { getCookie } from "cookies-next";

async function CookieConsumerServer() {
  const tastyCookie = await getCookie("tasty", { cookies }); // "cookie"
  return (
    <div>
      <p>{tastyCookie}</p>
    </div>
  );
}
```

The examples I presented above reflect the current state of the library. Back when I decided to use `cookies-next`, there was no support for the app router and server components. Recognizing the need for this feature in the project I was working on, I decided to add it myself.

## Challenges as a Contributor

The story began when I installed `cookies-next`, hoping it would provide all the features I needed. But, of course, it wasn’t that simple. I tried using this tool in the Next.js middleware, and it broke. I quickly realized that `cookies-next` didn’t support middleware and other Next.js app router features. It could only be used in client components and pages router. I decided to check for other packages, but I encountered at least three issues:

1. Lack of maintenance
2. To heavy
3. Lack of support for the app router

I returned to `cookies-next` and delved into its repository. I discovered that the code was short and straightforward, so I added support for Next.js middleware, enabling `cookies-next` to fully support methods attached to `NextResponse` and `NextRequest`. This allowed me to use the package in my project without any issues. Some time later, I came up with the idea of adding support for other new features of Next.js v13+ by enabling the library to use the `cookies` function imported from `next/headers`.

If you're keen to dive into those updates, here are the PR's:

- [Middleware support](https://github.com/andreizanik/cookies-next/pull/51)

- [Extended support for Next.js v13+](https://github.com/andreizanik/cookies-next/pull/55)

## Next.js Breaking Changes

After the release of Next.js version 15, warnings began to appear. The `cookies` function from the `next/headers` module, which is sometimes needed in `cookies-next` for handling cookies on the server, became asynchronous. There was a need to integrate `cookies-next` to handle asynchronous functions on the server and synchronous functions on the client. One of the library's users raised this issue and submitted a PR, in which this user, the maintainer of the package, and I worked together to resolve it.

**Server-side cookie function from cookies-next before and after the Next.js v15 update:**

```ts
// Before
getCookie("key", { cookies, req, res });
// After
await getCookie("key", { cookies, req, res });
```

### How we fixed this

When trying to make `cookies-next` compatible with the new version of Next.js, we encountered typical edge cases related to the dual nature of Next.js. The idea was to provide users with an API that allows them to explicitly choose whether to import the client or server-specific cookie function - `import { getCookie } from 'cookies-next/server'/or /client`, or to leave this decision to the library (which we call a 'smart import') - `import { getCookie } from 'cookies-next'`. In both cases, we needed logic to determine in which phase of rendering the cookie function is called, without causing rendering-specific errors in React components.

Initially, it might be obvious that we can determine which environment is currently in use by using a check like this:

```ts
const isClientSide = () => typeof window !== "undefined";
```

But it's not enough, and it usually causes hydration errors in the client components.

Everyone who has worked with the Next.js app router knows that the client component pre-renders on the server, and during this phase, `window` is `undefined`. In our case, relying only on `window` when deciding which function to use (for the server or client) could lead to unexpected errors, such as serving asynchronous functions to a client component. We came up with an idea to address this problem:

**Relying on the context passed to the cookie function**

In typical JavaScript server code, to set a cookie, we need a context (such as `request` and `response`), which usually includes methods for cookie management like set, get, etc. Next.js also follows this paradigm, so, in general, on the server side, we have at least two options for setting cookies:

1. Using the `Response` or `Request` object

```ts
export async function GET(request: NextRequest) {
  const cookieValue = request.cookies.get("key1");
  console.log("cookieValue", cookieValue);
  const response = NextResponse.json(cookieValue);
  response.cookies.set("key2", "value2");

  return response;
}
```

2. Using `cookies` function from `next/headers`, which, behind the scenes, is simply an implementation of `asyncLocalStorage`. You can read more about it in my [article about AsyncLocalStorage](https://www.aboutjs.dev/en/posts/async-local-storage-is-here-to-help-you#exploring-how-nextjs-uses-async-local-storage).

```ts
import { cookies } from "next/headers";

export async function POST(request: Request) {
  await cookies().set("key", "value");
  return new Response("Cookie set");
}
```

There is no need to pass any context in the client-side case, as `cookies-next` simply utilizes the `document.cookie` API.

Has something clicked in your mind? That's right! Based on all the information above, we can determine the current environment by checking if a context has been passed. So, let's rewrite the examples to use `cookies-next`:

```ts
import { getCookie, setCookie } from "cookies-next"; // <-- smart import
// import { getCookie, setCookie } from "cookies-next/server"; <-- explicit import
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieValue = await getCookie("key1", { req: request });
  console.log("cookieValue", cookieValue);
  const response = NextResponse.json(cookieValue);
  await setCookies("key2", "value2");

  return response;
}

export async function POST(request: Request) {
  await setCookie("key", "value", { cookies });
  return new Response("Cookie set");
}
```

The object passed to the cookie function includes the context (`request`, `response`, or `asyncLocalStorage` for cookies). Inside the cookie function in the library code, we can perform checks like:

```ts
export const isClientSide = (options?: OptionsType) => {
  return (
    !options?.req &&
    !options?.res &&
    !(options && "cookies" in options && (options?.cookies as CookiesFn))
  );
};
```

## Being React-Friendly(Hooks)

The last major task we needed to address with `cookies-next` was making it React-friendly. Obviously, most libraries used in React come with hooks ready to consume their API. However, `cookies-next` didn’t include them, so I decided to add them. Implementing hooks in this case provides two major benefits:

1. It helps overcome issues related to hydration errors in client components that arise from using the cookie function directly in the client component:

In the example below, the `getCookie` function causes a hydration error because, even though `cookies-next` determines that the client environment is in use by checking for the absence of context, it still has to wait for `document.cookie` to become available by performing a check like `const getRenderPhase = () => (typeof window === 'undefined' ? 'server' : 'client');`.

```jsx
"use client";

import { getCookie } from "cookies-next";

export function Example() {
  const theme = getCookie("theme");
  const className =
    theme === "dark" ? "bg-black text-white" : "bg-white text-black";
  return (
    <div>
      <p>Hello! - Click below to test</p>
      <button className={className}>Click me</button>
    </div>
  );
}
```

![hydration error in Next.js](/posts/assets/from-user-to-contributor-my-journey-with-cookies-next/hydration-error.png)

The solution to this is hooks. If we make the cookie function rely on the React state, the error is gone:

```jsx
"use client";

import { getCookie } from "cookies-next";
import { Button } from "./components/button";

export function Example() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const theme = isMounted ? getCookie("theme") : undefined;
  const className =
    theme === "dark" ? "bg-black text-white" : "bg-white text-black";

  return (
    <div>
      <p>Hello! - Click below to test</p>
      <button className={className}>Click me</button>
    </div>
  );
}
```

It’s a bit too much code to get the helper function from the library to work, isn’t it? Therefore, I added similar logic to `cookies-next`, and you can use it as shown in the updated example below:

```jsx
"use client";

import { useGetCookie } from "cookies-next";
import { Button } from "./components/button";

export function Example() {
  const getCookie = useGetCookie();
  // OR!!!
  const { getCookie } = useCookiesNext();

  // ========

  const theme = getCookie("theme");
  const className =
    theme === "dark" ? "bg-black text-white" : "bg-white text-black";

  return (
    <div>
      <p>Hello! - Click below to test</p>
      <button className={className}>Click me</button>
    </div>
  );
}
```

2. Sticking with the hooks convention that creates separation of concern:

- client -> hooks
- server -> async cookie functions

## Conclusions

I’m not in favor of using an npm package for everything; sometimes, I prefer to write my own utils to have full control over my code. However, in cases like cookie management in Next.js — where there are many potential pitfalls — I’d rather choose a library that works out of the box, like `cookies-next`. What I love about this library is its simple API, which handles all the obstacles related to the cookie API and the server-client nature of Next.js. Without it, my team and I would have to handle all those edge cases ourselves.

Community support is also a key factor. When I create my own utils, I must take care of every dependency related to them. If one of the dependencies releases a new version with breaking changes, I’ll have to handle it myself. But when I use a library with an active community and good support from maintainers, I can get involved and work with them to deliver updates more quickly and safely. A great example of this is, again, `cookies-next`, where we delivered updates that followed breaking changes in Next.js.

So, don’t hesitate — pick `cookies-next` for cookie management in your Next.js app.

**Thanks for reading, and see you in the next post!👋**

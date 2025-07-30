---
title: "Zod: The Quiet Hero of Modern Web Development"
createdAt: 30-07-2025
tags: zod, node.js, react, frontend, backend, fullstack, validation, typescript, modern web development
description: These days, TypeScript is often the default choice when building web applications in the JavaScript ecosystem. Developers choose it for scalability, safety, and stability. But as we know, TypeScript doesn’t guarantee these benefits at runtime — Zod bridges that gap.
---

# Zod: The Quiet Hero of Modern Web Development

When talking about the most popular tools in JavaScript web development, we often hear names like React or Express. But there’s one tool that’s usually mentioned in passing — a standard addition to those. That tool is Zod. Its simplicity and the obvious need for runtime type checking make it a natural fit.

According to [Zod's page on npmjs](https://www.npmjs.com/package/zod/v/1.0.0), the first version was released in 2020. Zod now gets over 35 million weekly downloads on npm, which is pretty impressive when you compare it to heavyweights like [Express](https://www.npmjs.com/package/express) with around 45 million, or [React](https://www.npmjs.com/package/react) with about 41 million.

## What Actually is Zod?

When we look at [Zod's documentation](https://zod.dev/?id=introduction), we learn that:

> Zod is a TypeScript-first validation library.

In plain English: Zod does the job that TypeScript can’t. TypeScript doesn’t validate types at runtime — type safety is only available during transpilation. Zod fills that gap.

Often we deal with data that isn’t typed — like the data returned from a fetch call to the server. To ensure data flow integrity within our application and prevent bugs, we need to verify that the received data matches the expected schema on the client. With Zod, we have at least two ways to do that:

```typescript
import * as z from "zod";

const PlayerSchema = z.object({
  username: z.string(),
  xp: z.number(),
});

try {
  PlayerSchema.parse({ username: 42, xp: "100" });
} catch (error) {
  if (error instanceof z.ZodError) {
    error.issues;
    /* [
      {
        expected: 'string',
        code: 'invalid_type',
        path: [ 'username' ],
        message: 'Invalid input: expected string'
      },
      {
        expected: 'number',
        code: 'invalid_type',
        path: [ 'xp' ],
        message: 'Invalid input: expected number'
      }
    ] */
  }
}
```

or

```typescript
const result = PlayerSchema.safeParse({ username: 42, xp: "100" });
if (!result.success) {
  result.error; // ZodError instance
} else {
  result.data; // { username: string; xp: number }
}
```

To infer static types from the schema:

```typescript
const PlayerSchema = z.object({
  username: z.string(),
  xp: z.number(),
});

// extract the inferred type
type Player = z.infer<typeof Player>;

// use it in your code
const player: Player = { username: "billie", xp: 100 };
```

Moreover, Zod allows us to compose schemas in many ways — supporting various data types, nesting, and even self-referential types all of which is accessible through an intuitive, clean API that lets us define schemas in a declarative way.

## Why is Zod So Popular?

In my view, the most crucial reason why Zod is so popular is its excellent integration with TypeScript. It offers robust performance and a clean, well-designed API. TypeScript’s growing adoption helped Zod rise in popularity — being an extension for one of the _fastest-growing programming languages_ naturally brings a lot of attention.

Other important factors:

- enhances code execution safety — Zod acts as your guard when it comes to data compatibility, providing a robust tool for controlling your data during code execution. It also works perfectly with observability tools. When part of your logic encounters bugs caused by the wrong data type, Zod will catch and report them. This is especially useful when integrating with external services, when you don’t have control over their API code.

- can be extended — You can handle even the most complex use cases. If there isn’t a type that fits your needs, you can take advantage of Zod’s features like `.refine`, `.superRefine`, and others.

- intuitive – Zod is highly intuitive for any TypeScript developer. Its methods reflect TypeScript’s features and type names. You can even use familiar utilities like `pick` or `omit`. The fact that Zod follows well-known patterns from other validation libraries (such as chaining methods from a single imported object) allows developers to start using it seamlessly. It is a crucial incentive to switch to Zod for a developer who expects great TypeScript integration from a validation library but has no prior experience with Zod.

– Easy to integrate – Zod can be seamlessly integrated with many frameworks and libraries. It can be used on the frontend, backend, for validating AI-generated output, requests, interactions with databases, and more. This versatility across different parts of the stack has had a strong impact on Zod's popularity.

## Use Cases

Zod is useful in many different use cases — on both the client and the server. Let’s explore three common scenarios, excluding the obvious one: validating fetched data.

### Form Data Validation

Every frontend developer knows that form data validation is extremely important. This use case can be complex, especially when the application relies heavily on user input. Poor form validation can ruin the user experience.

Zod fits perfectly in this use case. If you’re building your form in React, there’s a good chance you’re using `react-hook-form` to manage it. Zod can be integrated with it through the `resolvers` feature:

```ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "./input";
import { Button } from "./button";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must be less than 50 characters"),
  email: z.email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"),
});

type FormData = z.infer<typeof formSchema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  /* REST OF THE CODE */
}
```

How easy is it? All we need to do is define the schema — the rest is handled for us. User input will be automatically validated by Zod, and if the data is invalid, Zod will generate errors.

### Request Validation

Every developer knows that validating data coming from the client is crucial for the security, consistency, and stability of a backend application. When our application receives a payload from the client, we don’t actually know what kind of data it is.

Consider an example of a validation middleware in one of the most popular unopinionated backend frameworks: Express.

```ts
import express, { Request, Response, NextFunction } from "express";
import { z } from "zod";

const app = express();

app.use(express.json());

const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"),
});

type ContactData = z.infer<typeof contactSchema>;

const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (result.success) {
      req.body = result.data;
      return next();
    }

    return res.status(400).json({
      error: "Validation failed",
      details: z.treeifyError(result.error),
    });
  };
};

app.post(
  "/contact",
  validateRequest(contactSchema),
  (req: Request, res: Response) => {
    const contactData: ContactData = req.body;
    console.log("Received contact data:", contactData);
    res.status(201).json({
      message: "Contact information received successfully",
      data: contactData,
    });
  },
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

Zod does a few things in this case: it validates the transferred data, strips unrecognized properties, handles validation errors, and infers types.

### LLM's Output validation

Matt Pocock, [in one of his videos](https://youtu.be/xcm53k0ePmY?si=2okstz-8l1jOAIFf&t=10), said that:

> ...but is[Zod] now also getting a second life in the AI space where people are using it to do structured output.

Structured output is useful when AI needs to be integrated with an application that expects output to be structured and deterministic — meaning the data should always have the same shape. This is the case, for example, when we prompt an LLM and expect the output to always be a JSON with defined properties.

Structured output is now a standard option in the APIs of the most popular LLMs. We can use a combination of Zod and LangChain to force the LLM API to respond with structured data:

```ts
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";

dotenv.config();

const personSchema = z.object({
  name: z.string().describe("The person's full name"),
  age: z.number().describe("The person's age"),
  favoriteFood: z.string().describe("The person's favorite food"),
  interestingFact: z.string().describe("An interesting fact about the person"),
});

type Person = z.infer<typeof personSchema>;

const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0,
}).withStructuredOutput(personSchema);

async function extractPersonInfo(text: string) {
  return model.invoke(
    `Extract information about a person from the following text:
        ${text}`,
  );
}

async function main() {
  const text =
    "John is a 25-year-old chef who loves pizza. He once cooked for a celebrity!";

  try {
    const result = await extractPersonInfo(text);
    console.log("Extracted person information:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
```

We create a schema using Zod, then use it to tell the LLM how the output should look. Once the LLM API responds, LangChain validates and strips the output to fit the expected schema. In the end, the result becomes typed.

## Conclusions

Having integrations like Zod with TypeScript shows the direction of the JavaScript ecosystem. JavaScript has come a long way—from a trivial scripting language for simple web interactions to a language equipped with great tooling that allows us to build full-stack isomorphic applications. Zod itself keeps improving; its recent v4 update introduced new features, enhancements to existing ones, and a performance boost. You can check out a quick [Matt Pocock’s summary video on Zod v4](https://youtu.be/xcm53k0ePmY?si=PbqryVdNvc5GwChn) mentioned earlier.

**Thanks for reading! Follow along for my upcoming articles — you’ll definitely see more examples with Zod hidden in my future code snippets. 👋**

PS: Checkout my [GitHub repo](https://github.com/greg2012201/zod-examples) with the examples I presented in this article.

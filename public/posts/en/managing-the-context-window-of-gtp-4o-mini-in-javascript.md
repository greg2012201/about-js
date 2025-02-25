---
title: Managing the Context Window of GPT-4o-mini in JavaScript
createdAt: 26-02-2025
tags: gpt-4o-mini, openai, javascript, nlp, node.js
description: Let's dive into the topic of GPT-4o-mini's context window and explore strategies and tools for managing it in JavaScript by building a keyword extractor capable of handling large amounts of text data.
---

# Managing the Context Window of GPT-4o-mini in JavaScript

GPT-4o-mini is a powerful, fast, and affordable language model that can be used for a wide range of tasks in different languages. The context window of this model is 128k tokens.

You might think that this sounds like a lot, but when we compare it with things like an excessive prompt consisting of a complicated schema, a few-shot example, and the content of the document you want to analyze, along with the LLM’s response, we will quickly realize that it is not that much. In this post, we will dive into this topic by building a simple keyword extractor using GPT-4o-mini and Node.js.

## Why context window management is important?

Stability and predictability are among the most important aspects here. Even if the model's context is large, the API may have limitations on tokens per minute. Model response accuracy and performance are also crucial. Sending all of your text for analysis at once is not the best idea, as the result will likely be poorer because the model will have to focus on a broader context. Sending more requests in parallel leads to faster analysis and higher-quality responses. With these aspects in mind, we can adjust the size and number of requests sent to the model to meet your application’s requirements and stay within the limits.

## What are tokens?

A token is the smallest unit of text data. A word is split into fragments. The process of splitting text is handled by the tokenizer. The way in which the text is tokenized varies depending on the LLM model and its tokenizer. For more explanations about tokens, you can refer to [this OpenAI article](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them).

## What is the context window?

The context window refers to the number of tokens that the LLM can handle at the same time. It's like memory. Imagine you're writing a summary of a book. You can only process a window of 50 pages in your mind; the previous pages are forgotten. This is how the context window works, especially in the case of the keyword extractor we're going to build. In our case, we will focus on a single text input composed of: prompt, output schema, and text for analysis. This approach requires different strategies than maintaining a conversation(chat), such as prompt-response.

## Building a keyword extractor

The goal of our application is to extract keywords from the text, it may be an article, book, web page etc.. We have to be prepared for very long texts, so the context window management is crucial.

### Strategies for managing the context window

To effectively fulfill the requirements of our application and ensure its stability, we must pursue the following strategies for managing the context window:

- **Prompt strategies:** We can control the output by including guidelines in the prompt. In our case, we can instruct the LLM to output only keywords with a maximum of 2-3 words and return only the 5 most relevant ones. This is important because the OpenAI API does not allow setting a maximum number of items in the schema for structured output.

- **Counting tokens:** To count tokens, we will have to choose a tokenizer and implement counting logic before sending the text to the LLM. Additionally, we must estimate how many tokens the output will contain.

- **Chunking the text:** Chunking text ensures that we don't exceed the context window. In our case, the need for contextual awareness is less important, so we can use more aggressive chunking strategies—sending more but smaller chunks to the LLM while ensuring that words and sentences are not cut off.

- **Structured output:** Forcing the LLM to output structured data and setting the `temperature` to `0` for a more concise output also gives us control over the context window, as we can easier estimate how many tokens the output will have.

### Let's get to work

The first thing we need to have in place is prompts:

```typescript
export const systemPrompt = `You are a specialized AI assistant focused on keyword extraction from blog posts.
Your primary role is to identify and extract the most relevant keywords and key phrases that best represent the content.
Always provide keywords in a consistent format and focus on technical accuracy.`;

export const mainPrompt = `Analyze the following blog post and extract the most relevant keywords and key phrases.
Guidelines:
- Extract 5 most important keywords/phrases
- Focus on technical terms, concepts, and specific terminology
- Include both single words and short phrases when relevant (2-3 words)
- Exclude common stop words unless part of a specific term
- Add confident scores to each keyword/phrase
Input text:`;
```

As I mentioned earlier when talking about **prompt strategies**, we can explicitly tell the LLM how long the keyword list should be and how long each keyword can be.

We end our main prompt with the text `Input text:` because we will concatenate the input text with the main prompt later in the code.

Once we have the prompts prepared, it's time to define our schema for the **structured output**. We will use `zod`.

```typescript
import { z } from "zod";

export const keywordsResponseSchema = z.object({
  results: z.array(z.object({ keyword: z.string(), confidence: z.number() })),
});
```

`zod` works perfectly with the `withStructuredOutput` method from the `langchain` library, which we will use to manage the LLM's API requests. `langchain` converts the `zod` schema into the JSON schema accepted by the OpenAI API. Additionally, we can take advantage of the types for our outputs, which are automatically inferred from the schema.

### Chunking the text and counting tokens

Now it's time for the first part of the logic: we're going to split the text into smaller parts

In our example, the chunk size is set to 2000 tokens. While the entire context window of GPT-4o-mini is 128k tokens, we could technically set the chunk size close to this value, but a smaller chunk performs better in terms of both performance and output quality.

Here is how we declare our function for this:

```typescript
async function getChunkedText(content: string, maxChunkSize: number = 2000) {
  /* --- */
}
```

The first thing we need to do to determine how to split the text is perform calculations. For this, we need to use a tokenizer to encode the text into tokens. In our case, `js-tiktoken` is the best choice because it is compatible with the model we're currently using.

```typescript
import { encodingForModel } from "js-tiktoken";

async function getChunkedText(content: string, maxChunkSize: number = 2000) {
  const encoder = encodingForModel("gpt-4o-mini-2024-07-18");

  /* --- */
}
```

To ensure the best estimations, we need to subtract the tokens used by the prompts, schema, and text from the `maxChunkSize` parameter. Our schema is in the `zodType` format, so we need to convert it to a string. For this, we use the `zod-to-json-schema` package.

```typescript
import { encodingForModel } from "js-tiktoken";
import { mainPrompt, systemPrompt } from "./prompts";
import zodToJsonSchema from "zod-to-json-schema";
import { keywordsResponseSchema } from "./schema";
import { type ZodType } from "zod";

function getSchemaAsString(schema: ZodType<any>) {
  const jsonSchema = zodToJsonSchema(schema);

  const schemaString = JSON.stringify(jsonSchema);

  return schemaString;
}

async function getChunkedText(content: string, maxChunkSize: number = 2000) {
  const encoder = encodingForModel("gpt-4o-mini-2024-07-18");
  const schemaString = getSchemaAsString(keywordsResponseSchema);

  const calculatedChunkSize =
    maxChunkSize -
    encoder.encode(systemPrompt).length -
    encoder.encode(mainPrompt).length -
    encoder.encode(schemaString).length;

  /* --- */
}
```

As a result of the calculation, we obtain the final chunk size. We provide two values to the splitter's constructor:

- `chunkSize:` The calculated size of the chunk.
- `lengthFunction:` This function **counts the tokens** and returns the size of the chunk candidate, enabling the splitter to determine if the chunk fits within the allowed threshold.

For our application, we use `RecursiveCharacterTextSplitter`, which chunks text from sentences down to words. This means that the algorithm first checks if one or more phrases fit within the chunk size threshold. If they don't, it recursively breaks the text down into smaller parts.

```typescript
import { encodingForModel, Tiktoken } from "js-tiktoken";
import { mainPrompt, systemPrompt } from "./prompts";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import zodToJsonSchema from "zod-to-json-schema";
import { keywordsResponseSchema } from "./schema";
import { type ZodType } from "zod";

function getSchemaAsString(schema: ZodType<any>) {
  const jsonSchema = zodToJsonSchema(schema);

  const schemaString = JSON.stringify(jsonSchema);

  return schemaString;
}

async function getChunkedText(content: string, maxChunkSize: number = 2000) {
  const encoder = encodingForModel("gpt-4o-mini-2024-07-18");
  const schemaString = getSchemaAsString(keywordsResponseSchema);

  const calculatedChunkSize =
    maxChunkSize -
    encoder.encode(systemPrompt).length -
    encoder.encode(mainPrompt).length -
    encoder.encode(schemaString).length;

  handleLimitError({ calculatedChunkSize, schemaString }, encoder);

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: calculatedChunkSize,

    lengthFunction: (text: string) => encoder.encode(text).length,
  });
  const texts = await textSplitter.splitText(content);

  return texts;
}

export default getChunkedText;
```

### Sending a request and handling the response

We have a function for splitting the text in place, so we can start sending requests to the model.

The first thing is the configuration. We use `langchain's` integration for OpenAI.

It is worth mentioning that by setting the `temperature` to `0`, we can indirectly influence the LLM's response, making the output concise and preventing the model from being too creative.

```typescript
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  model: "gpt-4o-mini-2024-07-18",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
});

/* --- */
```

Next, we declare a function for calling the LLM. We need to preprocess our data and prompts, so we load a document with the text and chunk it using the function we prepared earlier.

For the purpose of our example, we simply load a file with the text, but the text could also be passed to the function via arguments.

```typescript
export async function callLlm() {
  const text = loadTextFromFile();
  const textChunks = await getChunkedText(text);
  /*  ---  */
}
```

Now we can register our `zod` schema to ensure structured output from the LLM and send the requests. We can take advantage of chunking by running them in parallel and awaiting the responses using `Promise.all`. This allows us to process the data faster and in smaller parts, helping the LLM focus more on details, which leads to better results. However, remember that when sending requests this way, you need to account for API rate limits.

```typescript
export async function callLlm() {
  const text = loadTextFromFile();
  const textChunks = await getChunkedText(text);
  const structured = model.withStructuredOutput(keywordsResponseSchema);
  const completions = await Promise.all(
    textChunks.map(async (chunk) => {
      return structured.invoke([
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: mainPrompt + chunk,
        },
      ]);
    }),
  );

  /* --- */
}
```

The last step is output formatting and data filtering. We merge responses from each chunk and filter them based on the confidence level to ensure that only relevant keywords are returned. Finally, we remove duplicates using `new Set()`.

```typescript
export async function callLlm() {
  const text = loadTextFromFile();
  const textChunks = await getChunkedText(text);
  const structured = model.withStructuredOutput(keywordsResponseSchema);
  const completions = await Promise.all(
    textChunks.map(async (chunk, index) => {
      return structured.invoke([
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: mainPrompt + chunk,
        },
      ]);
    }),
  );

  const results = completions
    .flatMap((completion) => completion.results)
    .filter((result) => result.confidence >= 0.85)
    .map((result) => result.keyword);
  return [...new Set(results)];
}
```

Final response:
![result log](/posts/assets/managing-the-context-window-of-gtp-4o-mini-in-javascript/result-log.png)

## Wrapping up

Managing the context window is crucial, especially when focusing on large text analysis. Rate limits can be tricky, and despite the model having a 128k token window, these limits can prevent full utilization. For example, currently, for GPT-4o-mini hosted on Azure Open AI, the max initial quota is 30k tokens per minute! To get more, you have to request a larger quota from Microsoft. Even if your limits are higher, maintaining control over the context window is essential, whether for a production-grade application or a fun project. No one wants to run their AI integrations while constantly encountering errors.

**Thanks for reading 🙌**

PS: Look at the repo of the keywords extractor app [here on GitHub](https://github.com/greg2012201/keywords-extractor)

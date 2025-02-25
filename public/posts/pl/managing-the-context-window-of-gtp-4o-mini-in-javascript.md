---
title: Zarządzanie context window modelu GPT-4o-mini w JavaScript
createdAt: 26-02-2025
tags: gpt-4o-mini, openai, javascript, nlp, node.js
description: Zanurzmy się w temat context window modelu GPT-4o-mini i odkryjmy strategie oraz narzędzia do zarządzania nim w JavaScript, budując keyword extractor zdolny do obsługi dużych ilości danych tekstowych.
---

# Zarządzanie context window modelu GPT-4o-mini w JavaScript

GPT-4o-mini to potężny, szybki i przystępny cenowo model językowy, który może być używany do szerokiego zakresu zadań w różnych językach. Context window tego modelu wynosi 128k tokenów.

Można by pomyśleć, że to dużo, ale gdy weźmiemy pod uwagę takie rzeczy jak: długi prompt składający się z komplikowanej struktury, few-shot examples, treści dokumentu, który chcemy analizować i dodamy do tego odpowiedź LLM, szybko zdamy sobie sprawę, że to wcale nie jest tak dużo. W tym poście zagłębimy się w ten temat, budując prosty keyword extractor z użyciem GPT-4o-mini i Node.js.

## Dlaczego zarządzanie context window jest ważne?

Stabilność i przewidywalność to tym wypadku jedne z najważniejszych aspektów. Nawet jeśli kontekst modelu jest duży, API może mieć ograniczenia w liczbie tokenów na minutę. Dokładność odpowiedzi modelu i jego wydajność również są kluczowe. Wysyłanie całego tekstu na raz do analizy nie jest najlepszym pomysłem, wynik prawdopodobnie będzie gorszy, ponieważ model będzie musiał skupić się na szerszym kontekście. Wysyłanie większej liczby zapytań równolegle pozwoli na szybszą analizę i wyższą jakość odpowiedzi. Mając te aspekty na uwadze, możemy dostosować rozmiar i liczbę zapytań wysyłanych do modelu, aby spełniały wymagania aplikacji i mieściły się w limitach.

## Co to są tokeny?

Token to najmniejsza jednostka danych tekstowych. Słowo jest dzielone na fragmenty. Proces dzielenia tekstu obsługiwany jest przez tokenizer. Sposób tokenizacji tekstu różni się w zależności od LLM i jego tokenizera. Więcej na temat tokenów znajdziesz [w tym artykule OpenAI](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them).

## Co to jest context window?

Context window odnosi się do liczby tokenów, które LLM może obsługiwać jednocześnie. Jest to coś w rodzaju pamięci. Wyobraź sobie, że piszesz streszczenie książki. Jesteś w stanie przetworzyć tylko 50 stron na raz, reszta zostaje zapomniana. Tak właśnie działa context window, szczególnie w przypadku keyword extractor'a, który zamierzamy stworzyć. W naszym przypadku skupimy się na jednej wiadomości, która składa się z: promptu, schem'y i tekstu do analizy. Takie podejście wymaga innych strategii niż implementacja konwersacji(chat), jak np. prompt-odpowiedź.

## Budowanie keyword extractor'a

Celem naszej aplikacji jest ekstrakcja słów kluczowych z tekstu, może to być artykuł, książka, strona internetowa itp.. Musimy być więc przygotowani na bardzo długie teksty, dlatego zarządzanie context window jest kluczowe.

### Strategie zarządzania context window

Aby skutecznie spełnić wymagania naszej aplikacji i zapewnić jej stabilność, musimy zastosować następujące strategie zarządzania context widnow:

- **Strategie promptowania** Możemy kontrolować wynik, dodając wytyczne w promptcie. W naszym przypadku możemy poinstruować LLM, aby zwracał tylko 5 najbardziej istotnych fraz kluczowych składających się z maksymalnie 2-3 słów. Jest to ważne, ponieważ API OpenAI nie pozwala na zamieszczanie dopuszczalnej ilości w schema.

- **Liczenie tokenów** Aby policzyć tokeny, będziemy musieli wybrać tokenizer i zaimplementować logikę liczenia przed wysłaniem tekstu do LLM. Ponadto będziemy musieli wyestymować, ile tokenów wyniesie odpowiedź.

- **Porcjowanie tekstu(chunking)** Dzielenie tekstu na fragmenty upewni nas, że nie przekroczymy context window. W naszym przypadku potrzeba analizy szerokiego kontesktu jest mniej istotna, więc możemy zastosować bardziej agresywne strategie porcjowania—wysyłając więcej, ale mniejszych fragmentów do LLM. Pamiętając o tym żeby słowa/zdania nie były pocięte.

- **Structured output:** Wymuszenie na LLM generowania danych w ustrukturyzowanym formacie oraz ustawienie `temperature` na `0` w celu uzyskania bardziej skupionego wyniku daje nam również kontrolę nad context window ponieważ możemy łatwiej oszacować, ile tokenów będzie miał wynik

### Bierzemy się do pracy

Pierwszą i najważniejszą rzeczą, którą musimy mieć przygotowaną, są prompt'y:

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

Jak wspomniałem wcześniej, mówiąc o **strategiach promptowania**, możemy wyraźnie powiedzieć LLM, jak długa powinna być lista słów kluczowych i jak długie mogą być poszczególne słowa kluczowe.

Kończymy nasz główny prompt tekstem `Input text:`, ponieważ później w kodzie połączymy tekst do analizy z głównym promptem.

Gdy mamy już przygotowane prompty, czas zdefiniować nasz schemat dla **structured output**. Do obsługi schem'y użyjemy `zod'a`.

```typescript
import { z } from "zod";

export const keywordsResponseSchema = z.object({
  results: z.array(z.object({ keyword: z.string(), confidence: z.number() })),
});
```

`zod` doskonale współpracuje z metodą: `withStructuredOutput` z biblioteki `langchain`, której będziemy używać do zarządzania zapytaniami API LLM. `langchain` konwertuje `zod` schema na `JSON` schema akceptowany przez OpenAI API. Dodatkowo możemy skorzystać z typów dla naszych wyników, które są automatycznie wnioskowane ze schem'y.

### Porcjowanie tesktu i liczenie tokenów

W naszym przykładzie rozmiar fragmentu to 2000 tokenów. Context window modelu GPT-4o-mini wynosi 128k tokenów, teoretycznie moglibyśmy ustawić rozmiar fragmentu bliski tej wartości, ale mniejszy sprawdzi się lepiej pod względem wydajności i jakości wyników.

Zadeklarujmy naszą funkcję w ten sposób:

```typescript
async function getChunkedText(content: string, maxChunkSize: number = 2000) {
  /* --- */
}
```

Pierwszą rzeczą, którą musimy zrobić, aby określić, jak podzielić tekst, są obliczenia. Do tego potrzebujemy tokenizera, który zamieni tekst na tokeny. W naszym przypadku `js-tiktoken` jest najlepszym wyborem, ponieważ jest kompatybilny z modelem, którego aktualnie używamy.

```typescript
import { encodingForModel } from "js-tiktoken";

async function getChunkedText(content: string, maxChunkSize: number = 2000) {
  const encoder = encodingForModel("gpt-4o-mini-2024-07-18");

  /* --- */
}
```

Aby nasze estymacje były dokładne, musimy odjąć tokeny używane przez prompty, schema i tekst od parametru `maxChunkSize`. Nasza schema jest w formacie `zodType`, więc musimy go przekonwertować na string. Do tego używamy paczki `zod-to-json-schema`.

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

W wyniku obliczeń otrzymujemy ostateczny rozmiar fragmentu. Do konstruktora splittera przekazujemy dwie wartości:

- `chunkSize:` Obliczony rozmiar fragmentu tekstu.
- `lengthFunction:` Funkcja, która **liczy tokeny** i jest mechanizmem decyzyjnym w procesie podziału tekstu przez splitter.

W naszej aplikacji używamy `RecursiveCharacterTextSplitter`, który dzieli tekst od zdań do słów. Oznacza to, że algorytm najpierw sprawdza, czy jedna lub więcej fraz mieści się w obliczonym fragmencie tekstu. Jeśli nie, rekurencyjnie dzieli tekst na mniejsze części.

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

### Wysyłanie zapytań i odpowiedzi zwróconych z api LLM

Mamy już funkcję do dzielenia tekstu, dzięki czemu możemy zacząć wysyłać zapytania do modelu.

Pierwszą rzeczą jest konfiguracja. Korzystamy z integracji `langchain` z OpenAI.

Warto wspomnieć, że ustawienie `temperature` na `0` pozwala nam pośrednio wpłynąć na odpowiedź LLM, czyniąc wynik bardziej zwięzłym zapobiegając nadmiernej kreatywności modelu.

```typescript
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  model: "gpt-4o-mini-2024-07-18",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
});

/* --- */
```

Następnie deklarujemy funkcję do wywoływania LLM. Musimy przetworzyć nasze dane i prompty, więc ładujemy dokument z tekstem i dzielimy go na fragmenty za pomocą wcześniej przygotowanej funkcji.

Na potrzeby naszego przykładu ładujemy plik z tekstem, mógłby on być również przekazany do funkcji jako argument.

```typescript
export async function callLlm() {
  const text = loadTextFromFile();
  const textChunks = await getChunkedText(text);
  /*  ---  */
}
```

Teraz możemy zarejestrować `zod` schem'e, aby ustawić structured output, i wysłać zapytania. Możemy wykorzystać fakt, że tekst jest podzielony i wysyłać zapytania równolegle łapiąc odpowiedzi z API pomocy `Promise.all`. Pozwala to na przetwarzanie danych szybciej w mniejszych częściach, co pomaga LLM skupić się na szczegółach i daje lepsze wyniki. Pamiętaj jednak, że wysyłając żądania w ten sposób, musisz uwzględnić rate limity API.

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

Ostatnim krokiem jest formatowanie wyników i filtrowanie danych. Scalemy odpowiedzi z poszczególnych fragmentów i filtrujemy je na podstawie wartoścu confidence, aby upewnić się, że zwracane są tylko odpowiednie słowa kluczowe. Na końcu usuwamy duplikaty za pomocą `new Set()`.

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

Finalna odpowiedź:
![log wyniku](/posts/assets/managing-the-context-window-of-gtp-4o-mini-in-javascript/result-log.png)

## Podsumowanie

Zarządzanie context window jest kluczowe, szczególnie gdy skupiamy się na analizie dużych tekstów. Rate limity api mogą być problematyczne, mimo że context window wynosi 128k tokenów, rate limity mogą utrudnić jego wykorzystanie w pełni. Na przykład, obecnie dla GPT-4o-mini hostowanego na Azure Open AI maksymalny początkowy limit to 30k tokenów na minutę! Aby uzyskać więcej, trzeba poprosić Microsoft o większy limit. Nawet jeśli Twoje limity są wyższe, utrzymanie kontroli nad context window jest niezbędne, zarówno w przypadku aplikacji produkcyjnej, jak i przy projektach hobbystycznych. Nikt nie chce uruchamiać swoich integracji AI, ciągle napotykając błędy.

**Dzieki za przeczytanie 🙌**

PS: Zerknij na repo keword extractora [tutaj na GitHub'ie](https://github.com/greg2012201/keyword-extractor)

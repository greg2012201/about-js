---
title: "Zod: Cichy Bohater Współczesnego Web Developmentu"
createdAt: 30-07-2025
tags: zod, node.js, react, frontend, backend, fullstack, validation, typescript, modern web development
description: Obecnie, TypeScript jest często domyślnym wyborem przy tworzeniu aplikacji webowych w ekosystemie JavaScript. Developerzy wybierają go ze względu na skalowalność, bezpieczeństwo i stabilność. Jak wiemy, TypeScript nie gwarantuje tych benefitów w trakcie uruchamiania kodu na produkcji — Zod wypełnia tę lukę.
---

# Zod: Cichy Bohater Współczesnego Web Developmentu

Kiedy mówimy o najpopularniejszych narzędziach w tworzeniu aplikacji webowych w JavaScripcie, często słyszymy takie nazwy jak React czy Express. Jest jednak jedno narzędzie, które zwykle wspominane jest mimochodem — jako standardowy dodatek do tych dwóch. Tym narzędziem jest Zod. Jego prostota oraz oczywista potrzeba walidacji typów w czasie wykonywania kodu sprawia, że idealnie wpasowuje się w ekosystem.

Według strony [Zod'a na npmjs](https://www.npmjs.com/package/zod/v/1.0.0), jego pierwsza wersja została wydana w 2020 roku. Obecnie Zod notuje ponad 35 milionów pobrań tygodniowo na npm, co jest całkiem imponującym wynikiem jeżeli porównamy z zawodnikami wagi ciężkiej takimi jak: [Express](https://www.npmjs.com/package/express) z ponad 45 milionami i [React](https://www.npmjs.com/package/react), który ma około 41 milionów pobrań.

## Czym Właściwie jest Zod?

Jeśli zajrzymy do [dokumentacji Zod'a](https://zod.dev/?id=introduction), dowiemy się że:

> Zod is a TypeScript-first validation library. -> Zod jest biblioteką do walidacji stworzoną z myślą o TypeScript

W prostych słowach: Zod wykonuje zadanie, którego TypeScript nie potrafi. TypeScript nie waliduje typów podczas wykonywania kodu aplikacji - bezpieczeństwo typów jest zapewnione tylko podczas transpilacji. Zod skutecznie wypełnia tę lukę.

Często mamy do czynienia z danymi, które nie są typowane — na przykład z danymi zwracanymi przez fetch po wysłaniu request'a. Aby zachować integralność przepływu danych w aplikacji i zapobiec błędom, musimy upewnić się, że otrzymane dane pasują do oczekiwanego schematu po stronie klienta. Za pomocą Zod'a możemy to zrobić na co najmniej dwa sposoby:

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

albo

```typescript
const result = PlayerSchema.safeParse({ username: 42, xp: "100" });
if (!result.success) {
  result.error; // ZodError instance
} else {
  result.data; // { username: string; xp: number }
}
```

Żeby wywnioskować type z schema'y:

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

Co więcej, Zod pozwala tworzyć schematy na wiele sposobów — obsługuje różne typy danych, zagnieżdżenia, a nawet self-referential types, a wszystko to jest dostępne przez intuicyjne, przejrzyste API, które pozwala definiować schematy w deklaratywny sposób.

## Dlaczego Zod jest tak popularny?

Moim zdaniem kluczowym powodem, dla którego Zod jest tak popularny, jest jego doskonała integracja z TypeScriptem. Oferuje solidną wydajność i przejrzyste, dobrze zaprojektowane API. Rosnąca adpocja TypeScript'a pomogła Zod'owi zdobyć popularność — bycie rozszerzeniem dla jednego z _najszybciej rozwijających się języków programowania_ z pewnością przyciąga uwagę.

Inne istotne czynniki:

- zwiększa bezpieczeństwo wykonywania kodu — Zod działa jak strażnik poprawności danych, dostarczając solidne narzędzie do kontroli danych podczas wykonywania kodu. Doskonale współpracuje również z narzędziami do observability. Gdy aplikacja napotka błędy spowodowane niewłaściwym typem danych, Zod je wychwyci i wyloguje. Jest to szczególnie przydatne podczas integracji z zewnętrznymi usługami, gdy nie masz kontroli nad ich kodem API.

- możliwość rozszerzania — Zod pozwala obsłużyć nawet najbardziej złożone przypadki użycia. Jeśli nie ma typu, który spełnia twoje potrzeby, możesz skorzystać z funkcji takich jak `.refine`, `.superRefine` i innych.

- intuicyjność – Zod jest bardzo intuicyjny dla każdego programisty korzystającego z TypeScriptu. Jego metody odzwierciedlają cechy TypeScriptu i nazwy typów. Można nawet korzystać z dobrze znanych utility types, takich jak `pick` czy `omit`. Fakt, że Zod korzysta ze znanych wzorców z innych bibliotek walidacyjnych (np. chainowanie metod z jednego importowanego obiektu), pozwala deweloperom zacząć go używać bez większego wysiłku. Dlatego gdy programista oczekuje świetnej integracji z TypeScriptem od biblioteki walidacyjnej, ale nie miał wcześniej styczności z Zodem, często decyduje się na jego użycie.

- Łatwość integracji – Zod można bezproblemowo zintegrować z wieloma frameworkami i bibliotekami. Można go używać na froncie, na backendzie, do walidacji danych generowanych przez AI, zapytań, interakcji z bazami danych i wiele wiele innych. Ta wszechstronność w różnych częściach stacku ma duży wpływ na popularność Zod'a.

## Use Cases

Zod jest przydatny w wielu różnych przypadkach — zarówno po stronie klienta, jak i serwera. Przyjrzyjmy się trzem typowym scenariuszom, pomijając ten oczywisty, czyli walidację pobranych danych.

### Walidacja Formularza

Każdy frontend developer wie, że walidacja danych formularza jest niezwykle ważna. Ten przypadek może być złożony, zwłaszcza gdy aplikacja w dużym stopniu opiera się na danych wejściowych użytkownika. Słaba walidacja formularzy może zrujnować user experience.

Zod dobrze pasuje do tego use case. Jeśli tworzysz formularz w React, istnieje duża szansa, że używasz do tego `react-hook-form`. Zod można zintegrować z tą biblioteką za pomocą funkcjonalności `resolvers`:

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

Proste, prawda? Wystarczy, że zdefiniujemy schema — reszta zostanie wykonana za nas. Dane wprowadzone przez użytkownika zostaną automatycznie zweryfikowane przez Zod'a, jeśli będą nieprawidłowe, Zod wygeneruje błędy.

### Walidacja Zapytań

Każdy programista wie, że walidacja danych pochodzących od klienta jest kluczowa dla bezpieczeństwa, spójności i stabilności aplikacji backendowej. Gdy nasza aplikacja otrzymuje dane od klienta, tak naprawdę nie wiemy, jakiego są rodzaju.

Rozważmy przykład middleware’u do walidacji w jednym z najpopularniejszych, "unopinionated" frameworków backendowych — Express.

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

Zod robi tutaj kilka rzeczy: waliduje przesyłane dane, usuwa nieznane właściwości, obsługuje błędy walidacji i wnioskuje typy.

### Walidacja Danych Zwróconych Przez LLM'y

Matt Pocock [w jednym ze swoich filmów](https://youtu.be/xcm53k0ePmY?si=2okstz-8l1jOAIFf&t=10) powiedział, że:

> ...but is[Zod] now also getting a second life in the AI space where people are using it to do structured output.

Co w języku polskim oznacza:

> ...lecz [Zod] dostaje drugie życie w świecie AI gdzie ludzie używają go do obsługi "structured output".

Structured output jest przydatny, gdy AI musi być zintegrowane z aplikacją bazującą na zwróconych danych które powinne być ustrukturyzowane i determistyczne — czyli powinny mieć zawsze ten sam kształt. Przykładem jest sytuacja, w której wysyłamy prompt do LLM i oczekujemy, że odpowiedź zawsze będzie w formacie JSON zawierającym konkretne właściwości.

Structured output jest obecnie standardową opcją w API najpopularniejszych LLM-ów. Możemy wykorzystać połączenie Zod i LangChain, by nakłonić API LLM'a do zwrócenia ustrukturyzowanych danych:

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

Tworzymy schema za pomocą Zod'a, a następnie używamy go, aby określić, jak powinien wyglądać output LLM. Gdy API LLM'a odpowie, LangChain zwaliduje i oczyści wynik, dopasowując go do oczekiwanego schematu. W efekcie wynik staje się otypowany.

## Wnioski

Integracje takie jak Zod z TypeScript'em pokazują kierunek rozwoju ekosystemu JavaScript. JavaScript przeszedł długą drogę — od prostego języka skryptowego do tworzenia prostych interakcji na stronach internetowych, do języka wyposażonego w doskonałe narzędzia, które pozwalają nam tworzyć fullstackowe, izomorficzne aplikacje. Sam Zod ciągle się rozwija; niedawno otrzymał dużą aktualizację do wersji 4, która przyniosła nowe przydatne funkcje, ulepszenia istniejących oraz zwiększenie wydajności. Możesz obejrzeć krótkie [podsumowanie Zod'a v4 Matta Pococka](https://youtu.be/xcm53k0ePmY?si=PbqryVdNvc5GwChn), o którym wspomniałem wcześniej.

**Dziękuję za przeczytanie! Śledź moje kolejne artykuły — na pewno w przyszłości zobaczysz więcej przykładów z Zod'em ukrytych w moich snippetach. 👋**

PS: Sprawdź moje [repozytorium na GitHubie](https://github.com/greg2012201/zod-examples) z przykładami przedstawionymi w tym artykule.

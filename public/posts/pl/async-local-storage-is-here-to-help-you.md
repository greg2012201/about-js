---
title: Async Local Storage jest tutaj aby Ci pomóc
createdAt: 18-12-2024
tags: node.js, data flow, asyncLocalStorage, JavaScript, Fastify, Next.js, Hono
description: Porozmawiajmy o Async Local Storage w Node.js. Zbadamy, gdzie można go użyć i jakie są jego zastosowania. Spróbujemy również ponownie zaimplementować jedną z funkcji jednego z wielu popularnych metaframeworków.
---

# Async Local Storage jest tutaj aby Ci pomóc

Kiedy słyszysz frazę "Async Local Storage", co przychodzi ci na myśl? Możesz pomyśleć, że odnosi się to do jakiejś magicznej implementacji `localStorage` w przeglądarce. Nic bardziej mylnego. Async Local Storage nie ma związku z przeglądarką ani nie jest typowym mechanizmem storage. Prawdopodobnie jedna lub dwie biblioteki, z których korzystałeś lub korzystasz, używają go pod maską. W wielu przypadkach ta funkcja może uchronić cię przed tworzeniem chaotycznego kodu.

## Co to jest Async Local Storage?

Async Local Storage to funkcja wprowadzona w Node.js, początkowo dodana w wersjach `v13.10.0` i `v12.17.0`, a następnie ustabilizowana w wersji `v16.4.0`. Jest częścią modułu `async_hooks`, który umożliwia śledzenie zasobów asynchronicznych w aplikacjach Node.js. Funkcja ta pozwala na utworzenie współdzielonego kontekstu, do którego wiele funkcji asynchronicznych ma dostęp bez konieczności jego jawnego przekazywania. Kontekst jest dostępny w każdej operacji wykonywanej w ramach callbacku przekazanego do metody `run()` instancji `AsyncLocalStorage`.

## Wykorzystanie AsyncLocalStorage

Zanim przejdziemy do przykładów, wyjaśnijmy wzorzec, którym posłużymy się w przykładach.

**Inicjowanie**

```ts
import { AsyncLocalStorage } from "async_hooks";
import { Context } from "./types";

export const asyncLocalStorage = new AsyncLocalStorage<Context>();

// export const authAsyncLocalStorage = new AuthAsyncLocalStorage<AuthContext>()
```

W powyższym module inicjalizujemy instancję AsyncLocalStorage i eksportujemy ją jako zmienną.

**Użycie**

```ts
asyncLocalStorage.run({ userId }, async () => {
  const usersData: UserData = await collectUsersData();
  console.log("usersData", usersData);
});

// (method) AsyncLocalStorage<unknown>.run<Promise<void>>(store: unknown, callback: () => Promise<void>): Promise<void> (+1 overload)
```

Metoda `run()` przyjmuje dwa argumenty: `storage`, zawiera dane, które chcemy udostępnić, oraz `callback`, w którym umieszczamy naszą logikę. W rezultacie `storage` staje się dostępny w każdym wywołaniu funkcji wewnątrz `callback`, co umożliwia płynne udostępnianie danych w operacjach asynchronicznych.

```ts
async function collectUsersData() {
  const context = asyncLocalStorage.getStore();
}
```

Aby uzyskać dostęp do kontekstu, importujemy naszą instancję i wywołujemy metodę `asyncLocalStorage.getStore()`. Pomocną rzeczą jest to, że `storage` zwrócony przez `getStore()` jest już otypowany, ponieważ przekazaliśmy typ `Context` do klasy `AsyncLocalStorage` podczas inicializacji: `new AsyncLocalStorage<Context>()`.

## Async Local Storage jako "auth context"

Nie ma typowej aplikacji webowej bez systemu uwierzytelnienia. Musimy zweryfikować tokeny i wyodrębnić informacje o użytkowniku. Gdy już uzyskamy dane użytkownika, chcemy udostępnić je w "route handlers". Zobaczmy, jak możemy wykorzystać `AsyncLocalStorage`, aby zaimplementować "auth context", zachowując czystość naszego kodu.

Wybrałem `fastify` dla tego przykładu.

Cytując [dokumentację](https://www.fastify.io/) `fastify` to:

_tłumaczenie_

> Szybki i lekki framework webowy dla Node.js

_oryginał_

> Fast and low overhead web framework, for Node.js

Ok, do dzieła!

1. Zainstalujmy `fastify`

```console
npm install fastify
```

2. Zdefinujmy typ dla naszego auth context'u:

```ts
type Context = Map<"userId", string>;
```

3. Zainicjalizujmy instancję `AsyncLocalStorage`, przypiszmy ją do zmiennej i wyeksportujmy. Pamiętaj, aby przekazać odpowiedni typ: `new AsyncLocalStorage<Context>()`.

```ts
import { AsyncLocalStorage } from "async_hooks";
import { Context } from "./types";

export const authAsyncLocalStorage = new AsyncLocalStorage<Context>();
```

4. Zainicjalizujmy instancję `Fasitfy` oraz dodajmy funkcję do obsługi błędów:

```ts
import Fastify from "fastify";

/* other code... */

const app = Fastify();

function sendUnauthorized(reply: FastifyReply, message: string) {
  reply.code(401).send({ error: `Unauthorized: ${message}` });
}

/* other code... */
```

Teraz nadchodzi bardzo ważna część. Dodajmy hook `onRequest`, aby owinąć handler'y wywołaniem metody `authAsyncLocalStorage.run()`.

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

Po pomyślnym sprawdzeniu danych użytkownika wywołujemy metodę `run()` z naszego `authAsyncLocalStorage`. Jako argument `storage` przekazujemy "auth context" z `userId` pobranym z tokena. W `callback'u` wywołujemy funkcję `done`, aby `Fastify` mógł wykonać dalsze operacje.

Jeśli mamy funkcje walidujące, które wymagają asynchronicznych operacji, powinniśmy je dodać do callback'a. Wynika to z tego, że, [zgodnie z dokumentacją](https://fastify.dev/docs/latest/Reference/Hooks/):

_tłumaczenie_

> Callback done nie jest dostępny, gdy używasz async/await lub zwracasz Promise. Jeśli w tej sytuacji wywołasz callback done, może wystąpić nieoczekiwane zachowanie, np. duplikacja wywołań handlerów.

_oryginał_

> the done callback is not available when using async/await or returning a Promise. If you do invoke a done callback in this situation unexpected behavior may occur, e.g. duplicate invocation of handlers

Tutaj przykład jak mogło by to wyglądać:

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

Nasz przykład ma tylko jeden chroniony route. W bardziej złożonych scenariuszach może być konieczne zabezpieczenie tylko niektórych route's "auth contextem". W takich przypadkach moglibyśmy:

1. Stworzyć plugin, który zostanie zastosowany tylko do wybranych routes i zawrzeć w nim hook `onRequest`.
2. Dodać logikę rozróżniającą routes bezpośrednio w hooku `onRequest`.

W porządku, nasz kontekst jest ustawiony więc teraz możemy zadeklarować chroniony route.

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

Kod jest dość prosty. Importujemy `authAsyncLocalStorage`, wyciągamy `userId`, inicjalizujemy `UserRepository` i pobieramy dane. Takie podejście sprawia, że kod handlera jest czysty.

## Przyjżyjmy się w jaki sposób Next.js używa Async Local Storage

W tym przykładzie zaimplementujemy naszą wersję funkcji `cookies` z Next.js. Ale chwila... Przecież to jest post o `AsyncLocalStorage`, prawda? Więc dlaczego mówimy o cookies? Odpowiedź jest prosta: Next.js używa `AsyncLocalStorage`, aby zarządzać cookies po stronie serwera. Dlatego odczytanie cookie w komponencie serwerowym jest tak proste jak:

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

Używamy funkcji `cookies` wyeksportowanej z `next/headers`, która udostępnia kilka metod do zarządzania ciasteczkami. Ale jak to jest technicznie możliwe?

### Czas zacząć naszą re-implementację

Na wstępie chciałbym wspomnieć, że ten przykład opiera się na wiedzy, którą zdobyłem oglądając świetne [video](https://youtu.be/JejwWxhsfZw?si=JRRZq75o84n4jCNw) autorstwa [Lee Robinsona](https://x.com/leeerob?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor) oraz z analizy repozytorium Next.js.

W tym przykładzie użyjemy [Hono](https://hono.dev/) jako framework serwerowy. Wybrałem go z dwóch powodów:

1. Chiałem go wypróbować.
2. Oferuje dobre wsparcie dla `JSX`.

Zainstalujmy `Hono`:

```console
npm install hono
```

Zainicjalizujmy `Hono` i dodajmy middleware:

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

Kod przypomina middleware z przykładu z Fastify, prawda? Aby ustawić kontekst, wykorzystujemy `setCookieContext`, który jest importowany z modułu `cookies` — naszej prostej, niestandardowej implementacji `cookies` z Next.js. Podążając za funkcją `setCookieContext` przejdźmy do modułu, z którego została zaimportowana:

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

Funkcja `setCookieContext`(której zwracaną wartość przekazaliśmy do `cookieAsyncLocalStorage.run()` w Hono middleware) bierze kontekst `c` i przekazuje go to utility functions których wywołanie jest zwracane z poszczególnych clousers. W ten sposób uzyskujemy obiekt który jest naszym cookie kontekstem.

Nasza funkcja `cookies` replikuje funkcjonalność `cookies` z `next/headers`. Wykorzystuje metodę `cookieAsyncLocalStorage.getStore()`, aby uzyskać dostęp do tego samego kontekstu, który jest przekazywany do `cookieAsyncLocalStorage.run()`.

Opakowaliśmy zwracany wynik naszej funkcji `cookies` w promise, aby zasymulować działanie implementacji w Next.js. Przed wersją 15 funkcja ta była synchroniczna. Obecnie w kodzie Next.js metody zwracane przez `cookies` są dołączane do obiektu promise, jak w poniższym uproszczonym przykładzie:

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

W naszym przypadku użycie `cookies.setCookie` i `cookies.deleteCookie` zawsze wyrzuca błąd, podobnie jak w Next.js w komponentach serwerowych. Tę logikę zakodowaliśmy na sztywno, ponieważ w oryginalnej implementacji możliwość użycia `setCookie` lub `deleteCookie` zależy od fazy (`WorkUnitPhase`) przechowywanej w storage zwanym `RequestStore` (ten storage jest implementacją `AsyncLocalStorage`, są w nim również przechowywane cookies), jednak to już jest temat na inny post. Aby uprościć ten przykład, pomińmy symulację `WorkUnitPhase`

**Teraz dodamy nasz kod react'owy**

1. Dodajemy komponent App:

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

2. dodajemy komponent do zarządzania cookies:

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

Sposób używania `cookies` jest podobny do tego z komponentów serwerowych w Next.js.

3. Dodajemy route handler żeby wyrenderować template:

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

Nasz template jest renderowany za pomocą metody `html` która jest częscią kontekstu `hono`. Kluczowe jest to, że route handler działa wewnątrz metody `asyncLocalStorage.run()`, która przyjmuje `cookieContext`. Dzięki temu możemy uzyskać dostęp do niego w komponencie `DisplayCookies` za pośrednictwem funkcji `cookies`.

Pamiętamy że nie jest możliwe ustawienie cookies w komponencie serwerowym, dlatego musimy zrobić to manualnie:

![setting a cookie manually in the browser](/posts/assets/async-local-storage-is-here-to-help-you/set-cookie-manually.png)

Odswieżmy stronę:

![rendered template with cookies displayed](/posts/assets/async-local-storage-is-here-to-help-you/page-rendered.png)

Udało się! Nasze cookies zostały poprawnie odczytane i wyświetlone.

## Podsumowanie

Jest wiele innych przypadków w których możemy użyć asyncLocalStorage. Ta funkcja pozwala na tworzenie niestandardowych kontekstów w prawie każdym frameworku serwerowym. Kontekst `asyncLocalStorage` jest zamknięty w ramach wykonania metody `run()`, co ułatwia zarządzanie nim. Idealnie nadaje się do obsługi scenariuszy opartych na zapytaniach do serwera. API jest proste i elastyczne, umożliwiając skalowanie poprzez tworzenie instancji dla każdego stanu jakiego potrzebujemy. Można bez problemu zarządzać osobnymi kontekstami dla takich rzeczy jak uwierzytelnianie, logowanie i feature flags.

Pomimo wielu zalet, warto wziąć pod uwagę pewne niedogodności. Słyszałem opinie, że asyncLocalStorage wprowadza zbyt wiele 'magii' do kodu. Przyznam, że kiedy po raz pierwszy korzystałem z tej funkcji, zajęło mi trochę czasu, aby w pełni zrozumieć jej działanie. Kolejną rzeczą, o której warto pamiętać, jest to, że importowanie kontekstu do modułu tworzy nową zależność, którą trzeba zarządzać. Jednak przekazywanie wartości przez głęboko zagnieżdżone wywołania funkcji jest o wiele gorsze.

**Dzięki za przeczytanie i do zobaczenia w następnym poście!👋**

PS: Możesz znaleźć omówione przykłady(oraz jeden bonusowy) [tutaj na GitHub'ie](https://github.com/greg2012201/async-local-storage-examples)

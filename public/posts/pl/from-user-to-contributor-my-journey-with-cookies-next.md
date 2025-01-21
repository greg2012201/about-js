---
title: "Od Użykownika do Kontrybutora: Moja Przygoda z cookies-next"
createdAt: 22-01-2025
tags: next.js, cookies, browser, npm, package, oss
description: W przeszłości miałem wiele okazji do pracy nad systemami uwierzytelniania. Wszyscy wiedzą, że w przypadku uwierzytelniania często trzeba obsługiwać ciasteczka, dobrze jest więc mieć narzędzia, które upraszczają pracę z nimi. Jednym z takich narzędzi jest cookies-next, niewielka paczka npm stworzona (jak sugeruje jej nazwa) do pracy z ciasteczkami w Next.js.
---

# Od Użykownika do Kontrybutora: Moja Przygoda z cookies-next

W przeszłości miałem wiele okazji do pracy nad systemami uwierzytelniania. Wszyscy wiemy, że w przypadku uwierzytelniania często trzeba obsługiwać cookies, dobrze jest więc mieć narzędzia, które upraszczają pracę z nimi. Jednym z takich narzędzi jest `cookies-next`, niewielka paczka npm stworzona (jak sama nazwa wskazuje) do pracy z cookies w Next.js. Z tego, co wiem, ta paczka jest jedynym narzędziem dostępnym do zarządzania cookies w Next.js, które obsługuje wersję v15+. Moim oraz innych zdaniem, zarządzanie cookies w Next.js może być wyzwaniem z powodu architektury tego frameworka, która łączy części serwera i klienta. Pokażę, jak `cookies-next` upraszcza zarządzanie ciasteczkami w Next.js oraz podzielę się spostrzeżeniami wynikającymi z mojej roli jako kontrybutora tej biblioteki.

## API cookies-next

API jest dość proste. Po stronie serwera wymagane jest przekazanie kontekstu lub funkcji `cookies` importowanej z `next/headers` wraz z opcjonalnymi parametrami ciasteczek do jednej z asynchronicznych funkcji, których nazwy odpowiadają operacjom: `set`, `get` i `delete`. Po stronie klienta dostępne są dedykowane hooki oraz te same funkcje co na serwerze, ale w wersjach synchronicznych (bez przekazywania kontekstu lub funkcji `cookies` importowanej z `next/headers` — tylko opcjonalne parametry cookies).

Poniżej kilka przykładów:

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

## Użycie w projekcie

Po raz pierwszy użyłem `cookies-next`, pracując nad nowym projektem. Podjęto decyzję o użyciu Next.js w wersji 13+ z app router, który w tamtym czasie był bardzo nową funkcjonalnością. Moim zadaniem było zbudowanie systemu uwierzytelniania. W tym systemie jeden z tokenów był przechowywany w cookies. Były również inne funkcje, które korzystały z cookies i musiały mieć do nich dostęp po stronie klienta. W rezultacie potrzebowaliśmy spójnego API do zarządzania cookies. Jednak Next.js nie udostępniał spójnego API, które mogłoby obsługiwać ciasteczka zarówno po stronie serwera, jak i klienta. To sprawiło, że `cookies-next` stało się idealnym rozwiązaniem w dla tego projektu.

W poniższych przykładach porównamy jak wygląda zarządzanie ciasteczkami w Next.js z użyciem `cookies-next` a jak bez `cookies-next`.

Zacznijmy od ustawienia cookie na serwerze korzystając tylko z API Next.js:

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

Kod wygląda świetnie i wszystko działa zgodnie z oczekiwaniami.
Teraz chcemy odczytać to "smakowite ciastko" w komponencie po stronie klienta. Ponieważ Next.js nie udostępnia żadnego narzędzia do dostępu do cookies na kliencie, musimy albo stworzyć własne rozwiązanie, albo skorzystać z jednej z dostępnych bibliotek npm do zarządzania cookies po stronie klienta. Wybierzmy opcję, która wydaje się najszybsza: bibliotekę `js-cookie`.

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

I oto pierwszy problem: aby uniknąć błędów hydracji, musimy upewnić się, że kod nie powoduje niespójności między HTML renderowanym po stronie serwera a HTML renderowanym po stronie klienta. W dużym projekcie taki wymóg zmusza nas do stworzenia własnego customowego hooka, aby efektywnie korzystać z tej funkcji.

Napotkaliśmy również inne utrudnienia, takie jak:

- Konieczność użycia zewnętrznej zależności do obsługi ciasteczek tylko po stronie klienta.
- Import ma tylko kilka małych różnic w porównaniu do `cookies` z `next/headers`:
  - Default import vs. Named import.
  - Niespójność w wielkości liter w nazwach: `Cookies` vs. `cookies`.

Te małe różnice mogą powodować niejesności i utrudniać proces rozwoju projektu.

Przejdźmy dalej i zobaczmy, jak odczytać to samo cookie również w komponencie serwerowym React.

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

Znowu musimy wrócić do API Next.js, które nie jest zgodne z API `js-cookie`, używanego przez nas po stronie klienta.

Zobaczmy jak to wygląda w przypadku użycia `cookies-next`:

```ts
import { cookies } from "next/headers";
import { setCookie } from "cookies-next";
import { NextResponse } from "next/server";

export async function GET() {
  const res = new NextResponse();
  setCookie("tasty", "cookie", { cookies });

  /* rest of the code */

  return res;
}
```

Przekazujemy tylko argumenty wymagane do ustawienia cookie.

Po stronie klienta wystarczy zaimportować hook, który zwraca odpowiednią funkcję do pobierania wartości cookie:

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

A teraz odczytajmy nasze ciastko w komponencie serwerowym za pomocą `cookies-next`. Biblioteka korzysta z dobrodziejstw TypeScriptu i wskazuje, co powinniśmy przekazać do `setCookie`. Nie musimy robić nic więcej, jak tylko wywołać funkcję i przekazać wymagane argumenty:

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

Przykłady, które przedstawiłem powyżej, odzwierciedlają obecny stan biblioteki. Gdy podjąłem decyzję o użyciu `cookies-next`, nie było wsparcia dla app router'a i komponentów serwerowych. Dostrzegając potrzebę tych funkcjii w projekcie, nad którym pracowałem, postanowiłem dodać je samodzielnie.

## Wyzwania jako kontrybutor

Historia zaczęła się, gdy zainstalowałem `cookies-next`, mając nadzieję, że zapewni wszystkie funkcje, których potrzebowałem. Ale, oczywiście, nie było to takie proste. Spróbowałem użyć tego narzędzia w middleware Next.js i okazało się, że nie działa. Szybko odkryłem, że `cookies-next` nie obsługuje middleware ani innych funkcji app routera Next.js. Paczki tej można było używać tylko w komponentach klienckich. Postanowiłem sprawdzić inne biblioteki, ale napotkałem co najmniej trzy problemy:

1. Brak utrzymanie przez kontrybutorów
2. Zbyt ciężkie
3. Brak wsparcia dla app router'a

Wróciłem do `cookies-next` i zagłębiłem się w jego repozytorium. okazało się, że kod jest krótki i prosty, więc dodałem obsługę middleware Next.js, umożliwiając `cookies-next` pełną obsługę metod przypisanych do `NextResponse` i `NextRequest`. Dzięki temu mogłem bez problemu używać biblioteki w moim projekcie. Jakiś czas później wpadłem na pomysł dodania obsługi innych nowych funkcji Next.js v13+ poprzez dodanie wsparcia dla funkcji `cookies` importowanej z `next/headers`.

Jeśli masz ochotę przyjrzeć się tym zmianom, tutaj są PR'y:

- [Wsparcie dla middleware](https://github.com/andreizanik/cookies-next/pull/51)

- [Rozszerzone wpsaprcie dla Next.js v13+](https://github.com/andreizanik/cookies-next/pull/55)

## Next.js Krytyczne zmiany

Po wydaniu wersji 15 Next.js zaczęły pojawiać się ostrzeżenia. Funkcja `cookies` z modułu `next/headers`, która czasami jest potrzebna w `cookies-next` do obsługi ciasteczek na serwerze, stała się asynchroniczna. Zaistniała potrzeba zintegrowania `cookies-next` w taki sposób, aby obsługiwała asynchroniczne funkcje na serwerze i synchroniczne funkcje po stronie klienta. Jeden z użytkowników biblioteki zgłosił ten problem i przesłał PR, w którym ten użytkownika, maintainer biblioteki i ja współpracowaliśmy nad rozwiązaniem tego problemu.

**Server-side cookie function z cookies-next przed i po aktualizacji Next.js do v15**

```ts
// Before
getCookie("key", { cookies, req, res });
// After
await getCookie("key", { cookies, req, res });
```

### Jak to naprawiliśmy

Próbując dostosować `cookies-next` do nowej wersji Next.js, napotkaliśmy typowe problemy związane z "podwójną" naturą Next.js. Pomysł polegał na udostępnieniu użytkownikom API, które pozwala na jawne wybranie, czy zaimportować funkcję cookie specyficzną dla klienta czy dla serwera - `import { getCookie } from 'cookies-next/server'/or /client`, czy pozostawić tą decyzji bibliotece (nazwaliśmy to 'inteligentnym importem') - `import { getCookie } from 'cookies-next'`. W obu przypadkach potrzebowaliśmy logiki, która określi, w której fazie renderowania wywoływana jest funkcja cookie, nie powodując przy tym błędów związanych z renderowaniem komponentów Reactowych.

Początkowo może to być oczywiste, że żeby rozpoznać które środowisko jest w użyciu, można przeprowadzić następujące sprawdzenie:

```ts
const isClientSide = () => typeof window !== "undefined";
```

Ale to nie wystarczy, i zazwyczaj powoduje błędy hydratacji w komponentach klienta.

Każdy, kto pracował z app routerem w Next.js, wie, że komponent klienta jest wstępnie renderowany na serwerze i na tym etapie `window` jest `undefined`. W naszym przypadku poleganie na tym przy podejmowaniu decyzji, którą funkcję użuć (dla serwera czy dla klienta), mogłoby prowadzić do nieoczekiwanych błędów, takich jak serwowanie funkcji asynchronicznych dla komponentu klienta. Wpadliśmy na pomysł, jak rozwiązać ten problem:

**Poleganie na kontekście przekazanym do cookie function**

W typowym serwerowym kodzie w JavaScript, aby ustawić cookie, potrzebujemy kontekstu (takiego jak `request` i `response`), który zazwyczaj zawiera metody do zarządzania ciasteczkami, takie jak `set`, `get` itp. Next.js również podąża za tym paradygmatem, więc generalnie po stronie serwera mamy co najmniej dwie opcje do ustawiania cookies:

1. Używając obiektów `Response` lub `Request`

```ts
export async function GET(request: NextRequest) {
  const cookieValue = request.cookies.get("key1");
  console.log("cookieValue", cookieValue);
  const response = NextResponse.json(cookieValue);
  response.cookies.set("key2", "value2");

  return response;
}
```

2. Używając funkcji `cookies` z `next/headers`, która jest po prostu implementacją `asyncLocalStorage`. Możesz poczytać więcej na ten temat w moim [artykule o AsyncLocalStorage](https://www.aboutjs.dev/en/posts/async-local-storage-is-here-to-help-you#exploring-how-nextjs-uses-async-local-storage).

```ts
import { cookies } from "next/headers";

export async function POST(request: Request) {
  await cookies().set("key", "value");
  return new Response("Cookie set");
}
```

Po stronie klienta nie ma żadnej potrzeby przekazywania kontekstu, ponieważ `cookies-next` po prostu korzysta z API `document.cookie`.

Czy coś kliknęło w twojej głowie? Tak jest! Na podstawie wszystkich powyższych informacji, możemy określić aktualne środowisko, sprawdzając, czy kontekst został przekazany. Teraz przepiszmy przykłady, do wersji z użyciem `cookies-next`:

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

Obiekt przekazany do cookie function zawiera kontekst (`request`, `response` lub `asyncLocalStorage` dla ciasteczek). Wewnątrz cookie function w kodzie biblioteki możemy przeprowadzić sprawdzenie takie jak:

```ts
export const isClientSide = (options?: OptionsType) => {
  return (
    !options?.req &&
    !options?.res &&
    !(options && "cookies" in options && (options?.cookies as CookiesFn))
  );
};
```

## Bycie React-Friendly(Hooki)

Ostatnim ważnym zadaniem, które musieliśmy wykonać w przypadku `cookies-next`, było uczynienie go przyjaznym dla Reacta. Oczywiście, większość bibliotek używanych w React ma gotowe hooki służące do korzystania z ich API. Jednak `cookies-next` ich nie zawierał, więc postanowiłem je dodać. Implementacja hooków w tym przypadku przynosi dwie główne korzyści:

1. Pomaga przezwyciężyć problemy związane z błędami hydratacji w komponentach klienckich, które pojawiają się przy bezpośrednim używaniu cookie function w komponencie klienckim:

W poniższym przykładzie funkcja `getCookie` powoduje bład hydracji, ponieważ, mimo że `cookies-next` ustala, że środowisko klienckie jest używane poprzez sprawdzenie braku kontekstu, nadal musi poczekać, aż `document.cookie` stanie się dostępne, wykonując sprawdzenie, takie jak `const getRenderPhase = () => (typeof window === 'undefined' ? 'server' : 'client');`.

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

![błąd hydracji w Next.js](/posts/assets/from-user-to-contributor-my-journey-with-cookies-next/hydration-error.png)

Rozwiązaniem tego są hooki. Jeśli sprawimy, że funkcja cookie będzie polegać na stanie React'a, błąd zniknie.

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

Trochę za dużo kodu, żeby helper z biblioteki działał, prawda? Dlatego dodałem podobną logikę do `cookies-next`, i teraz można jej użyć, jak w zaktualizowanym przykładzie poniżej:

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

Trzymając się konwencji hooków, tworzymy podział odpowiedzialności:

- client -> hooks
- server -> async cookie functions

## Wnioski

Nie jestem zwolennikiem używania paczek npm do wszystkiego; czasami wolę napisać własne utilsy, aby mieć pełną kontrolę nad swoim kodem. Jednak w przypadkach takich jak zarządzanie cookies w Next.js, gdzie można natrafić na wiele pułapek, wolę wybrać bibliotekę, która posiada wszystkie potrzebne funkcje, jak `cookies-next`. To co uwielbiam w tej bibliotece, to jej proste API, które pomaga radzić sobie ze wszystkimi przeszkodami związanymi z cookies API oraz naturą "server-client" w Next.js. Bez niej ja i mój zespół musielibyśmy sami radzić sobie z tymi edge case'ami.

Wsparcie społeczności jest także istotnym czynnikiem. Kiedy tworzę własne utilsy, muszę zadbać o każdą zależność z nimi związaną. Jeśli jedna z zależności wyda nową wersję z breaking changes, będę musiał poradzić sobie z tym samodzielnie. Natomiast, gdy korzystam z biblioteki z aktywną społecznością i dobrą obsługą ze strony maintainerów, mogę zaangażować się i współpracować z nimi, aby dostarczać aktualizacje szybciej i bezpieczniej. Dobrym przykładem jest `cookies-next`, gdzie dostarczyliśmy aktualizacje, które podążyły za breaking changes w Next.js.

Dlatego nie wahaj się — wybierz `cookies-next` do zarządzania cookies w swojej aplikacji opartej o Next.js.

**Dzięki za przeczytanie, i do zobaczenia w następnum artykule!👋**

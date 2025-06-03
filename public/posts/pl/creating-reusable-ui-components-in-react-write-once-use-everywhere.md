---
title: "Tworzenie Reużywalnych komponentów UI w React: Piszesz raz, używasz wszędzie"
createdAt: 28-05-2025
tags: react, js, frontend, design system, javascript, typescript, tailwind, radix, radix-ui
description: Nowoczesne frontendowe aplikacje są rozbudowane i często zawierają wiele podobnych elementów interfejsu, takich jak przyciski, linki czy listy. W tym miejscu do akcji wchodzą komponennty React'a. W tym artykule przyjrzymy się wzorcom tworzenia reużywalnych komponentów w React.
---

# Tworzenie Reużywalnych komponentów UI w React: Piszesz raz, używasz wszędzie

Interfejsy użytkownika ewoluują każdego dnia, stając się coraz większe i bardziej złożone. Możemy stworzyć naprawdę wiele — ale żeby robić to szybko i bez błędów, potrzebujemy solidnych bloków konstrukcyjnych.

Jako deweloperzy często pracujemy z panelami administracyjnymi, listami produktów, tabelami i innymi podobnymi elementami. Takie funkcje wymagają mniejszych komponentów, które pojawiają się wielokrotnie i muszą być spójne z designem aplikacji. Jednym z głównych celów Reacta jest dostarczanie prymitywów, które pozwalają budować interfejsy użytkownika w przejrzysty i uporządkowany sposób — poprzez kompozycję komponentów.

React nie rozwiązuje każdego problemu związanego z reużywalnością, ale daje Ci odpowiednie narzędzia. Ostatecznie to Ty jesteś odpowiedzialny za kompozycję i za to, by Twoje komponenty naprawdę nadawały się do ponownego użycia.

W tym artykule chciałbym podzielić się praktycznymi patternami, którymi kieruję się podczas tworzenia reużywalnych komponentów w React.

## Trzymaj się standardów webowych

Wśród wszystkich abstrakcji nawet doświadczeni deweloperzy czasem zapominają, na jaką platformę tworzymy nasz frontend. Dokładnie tak — tworzymy na potrzeby przeglądarki, więc powinniśmy trzymać się standardów webowych.

Większość naszych komponentów opiera się na natywnych elementach, takich jak przyciski, pola tekstowe i inne. Te elementy mają swoje własne właściwości, a ich udostępnianie przez propsy to dobra praktyka. Daje to deweloperom większą kontrolę nad zachowaniem komponentu i czyni go bardziej przewidywalnym.

Zacznijmy od tego prostego przycisku:

```jsx
import type { MouseEvent, ReactNode } from 'react'

interface ButtonProps {
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    children: React.ReactNode;
    type?: "button" | "submit" | "reset";
}

export function Button({ children, onClick, type = "button" }: ButtonProps) {
    return (
        <button type={type} onClick={onClick}>
            {children}
        </button>
    );
}
```

Ten komponent ma kilka problemów, które sprawiają, że jest on trudny do kontrolowania a jego użycie jest nieintuicyjne:

- brak obsługi `className`
- na sztywno przypisane wartości dla `type`, `onClick` i `className`
- brak przekazywania referencji (ref forwarding)

Jestem pewien, że prędzej czy później w tego typu komponencie będziemy musieli zastosować właściwości dla standardów webowych, takie jak ARIA labels, klasy CSS, data attributes i inne.
Naprawmy to.

```jsx
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ onClick, children, type = "button", ...props }, ref) => {
        return (
            <button ref={ref} type={type} onClick={onClick} {...props}>
                {children}
            </button>
        );
    }
);
```

Rozszerzając interfejs o typy specyficzne dla web standardów, zapewniamy bezpieczeństwo, ponieważ wszelkie zmiany w typach dotyczących web standardów dla danego elementu będą odzwierciedlone w używanym przez nas interfejsie. Deweloperzy nie muszą martwić się o aktualizacje, a komponent pozostanie bezpieczny pod kątem typów na przestrzeni czasu.

Dodanie `ref` również wiąże się z przestrzeganiem standardów webowych. Bez niego komponent byłby nieużyteczny, jeśli chcielibyśmy na przykład odczytać właściwości elemntu, takie jak atrybuty data czy klasy CSS.

Nasza mała modyfikacja to duży krok w kierunku reużywalności, ale to nie wystarczy dla tego komponentu.

## Zadbaj o możliwość personalizacji

Kolejnym istotnym aspektem jest umożliwienie personalizacji. Każdy reużywalny komponent powinien być łatwy w personalizacji, szczególnie jeśli chodzi o style.

### Class Names (Tailwind & CSS Styles)

Mamy już narzędzia, które to umożliwiają. Klasy CSS — nasi starzy, dobrzy znajomi z czasów statycznych stron JS + CSS + HTML — oraz dobrze znana biblioteka Tailwind CSS. Zajęło mi trochę czasu, zanim zrozumiałem, jak skuteczne jest to narzędzie. Pomaga unikać nadmiernego "overengineering'u" styli, a jednocześnie pozwala polegać na CSS, co minimalizuje rozmiar kodu JavaScript użytego do stylowania.

Jednak podczas tworzenia komponentów z wykorzystaniem Tailwinda musimy uważać na konflikty nazw klas i stosować odpowiednie scalanie klas jako rozwiązanie. Na szczęście nie musimy tworzyć logiki mergowania samodzielnie — istnieje paczka `tailwind-merge`, stworzona specjalnie dla Tailwinda, która robi to za nas.

```jsx
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ onClick, children, type = "button", className, ...props }, ref) => {
        return (
            <button
                ref={ref}
                type={type}
                onClick={onClick}
                className={twMerge(
                    "inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2",
                    "text-sm font-medium text-white shadow-sm",
                    "hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-gray-500 focus-visible:ring-offset-2 cursor-pointer",
                    "transition-colors duration-200",
                    className
                )}
                {...props}
            >
                {children}
            </button>
        );
    }
);
```

Na początku stylujemy nasze komponenty, a następnie łączymy przekazane wartości `className`, dając deweloperom kontrolę nad wyglądem komponentu.

```jsx
import "./app.css";
import { Button } from "./components/button";

function App() {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
      <h1>Reusable components playground</h1>
      <Button
        className="rounded-sm text-xl text-red-200"
        onClick={() => alert("Correct Button clicked!")}
      >
        Click me
      </Button>
    </div>
  );
}

export default App;
```

### Warianty

Nie ma wątpliwości, że nasz przycisk będzie musiał obsługiwać różne warianty. Ponieważ operujemy na nazwach klas, musimy zdefiniować style dla każdego wariantu i udostępnić API, które pozwoli deweloperom wybrać odpowiedni wariant.

Organizowanie nazw klas w warianty przy zachowaniu czytelności i bezpieczeństwa typów może być trudne. Możemy szybko rozwiązać ten problem za pomocą biblioteki `class-variance-authority`.

```jsx
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer",
    {
        variants: {
            variant: {
                default: "bg-gray-900 text-white shadow-sm hover:bg-gray-800 focus-visible:ring-gray-500",
                outline:
                    "border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus-visible:ring-gray-500",
                link: "text-gray-900 underline-offset-4 hover:underline focus-visible:ring-gray-500",
            },
            size: {
                sm: "px-3 py-1.5 text-sm",
                md: "px-4 py-2 text-sm",
                lg: "px-6 py-3 text-base",
            },
            disabled: {
                true: "opacity-50 cursor-not-allowed",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ onClick, children, type = "button", className, variant, size, ...props }, ref) => {
        return (
            <button
                ref={ref}
                type={type}
                onClick={onClick}
                className={twMerge(buttonVariants({ variant, size, className }))}
                {...props}
            >
                {children}
            </button>
        );
    }
);
```

Wykorzystanie:

```jsx
import "./app.css";
import { Button } from "./components/button";

function App() {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
      <h1>Reusable components playground</h1>
      <Button
        variant="outline"
        size="lg"
        onClick={() => alert("Button clicked!")}
      >
        Click me
      </Button>
    </div>
  );
}

export default App;
```

Wszystkie style są tutaj jawnie zdefiniowane, warianty są udostępnione, a całość jest dobrze otypowana. Gdy mowa o reużywalnych komponentach, często wracają koszmary związane z tworzeniem elastycznych, ale jednocześnie bezpiecznych typów. W tym przypadku wszystko jest już obsłużone, a my mamy wyraźny wgląd w strukturę schematu stylów przycisku.

Warto wspomnieć, że używanie Tailwinda jest opcjonalne w przypadku `class-variance-authority`.

## Skup się na komponowalności

Kolejnym kluczowym aspektem tworzenia reużywalnych komponentów jest komponowalność. To podobna kwestia jak w przypadku personalizacji styli — musimy dać deweloperom kontrolę nad tym, jak komponenty się zachowują i współdziałają. Komponent Reacta powinien być jak klocek LEGO. Każdy, kto lubi budować z LEGO, wie, że niektóre klocki można wykorzystywać na wiele różnych sposobów, w zależności od tego, z czym je połączymy.

### asChild pattern

Czasami checmy przenieść zachowanie konkretnego elementu i połączyć je z własnym reużywalnym komponentem. Jednym z częstych przypadków jest sytuacja, w której przycisk ma zachowywać się jak link, tworząc hybrydę przycisku i linku.

Wiele bibliotek i meta-frameworków dostarcza własny komponent `Link`, często zdarza się że chcemy, aby wyglądał jak przycisk.

Aby to osiągnąć, możemy użyć patternu `asChild`. Po raz pierwszy spotkałem się z nim podczas używania biblioteki `radix`. Na pierwszy rzut oka może wydawać się skomplikowany, ale w rzeczywistości jest dość prosty. Reużywalny komponent użytku przyjmuje opcjonalny prop boolean o nazwie `asChild` oraz element, który ma zastąpić jego domyślny element. Gdy `asChild` jest ustawiony na `true`, przekazany element zostaje sklonowany i wstawiony w miejsce bazowego elementu. Jego właściwości są następnie łączone z właściwościami rodzica.

Zaimplementujmy ten pattern w naszym komponencie `Button`.

Naszym celem jest umożliwienie użycia komponentu `Button` w następujący sposób:

```jsx
/* Rest of the code */
<Button asChild variant="link">
  <Link
    href="https://www.aboutjs.dev"
    className="text-blue-500"
    target="_blank"
    rel="noopener noreferrer"
  >
    Take me to the awesome blog
  </Link>
</Button>
/* Rest of the code */
```

Nasz przycisk powinien obsługiwać wszystkie funkcje, które oferuje `Link`, zachowując jednocześnie własne właściwości i style.

#### Komponent Slot

Aby wyrenderować element przekazany jako `asChild` (w naszym przypadku `Link`), musimy utworzyć komponent `Slot`:

```jsx

const Slot = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(({ children, ...props }, ref) => {
  if (Children.count(children) > 1) {
        throw new Error("Slot can only have one child");
    }
    const child = children as ReactElement<HTMLAttributes<HTMLElement>>;

    if (!isValidElement(child)) {
        throw new Error("Slot must have a valid child");
    }
    const childProps = child.props;
    const parentProps = props

    return cloneElement(child, {
        ...parentProps,
        ...childProps,
        className: twMerge(parentProps.className, childProps.className),
        ...(ref ? { ref } : {}),
    });
});
```

Jak wspomniałem wcześniej, aby zrealizować zamianę elemntów, musimy sklonować elemnt potomny.

Najpierw musimy upewnić się, że nasz `Slot` otrzymuje tylko jeden prawidłowy element dziecko. Następnie zwracamy klon tego elementu, przekazując referencję oraz łącząc właściwości rodzica i dziecka. Ponieważ nasz projekt korzysta z Tailwind, warto scalić klasy CSS za pomocą paczki `tailwind-merge`. Należy zauważyć, że właściwości są łączone poprzez shallow merge; jeśli komponent ma zagnieżdżone właściwości, lepiej zastosować deep merge. Tutaj zachowujemy prostą wersję w celu wyjaśnienia.

Gdy stworzymy nasz komponent Slot, możemy zmodyfikować kod przycisku:

```jsx

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ onClick, children, type = "button", className, variant, size, asChild, ...props }, ref) => {
        const Component = asChild ? Slot : "button";
        return (
            <Component
                ref={ref}
                type={type}
                onClick={onClick}
                className={twMerge(buttonVariants({ variant, size, className }))}
                {...props}
            >
                {children}
            </Component>
        );
    }
);
```

Teraz nasz komponent przyjmuje prop `asChild`, który decyduje, czy użyć komponentu `Slot` do renderowania elementu potomnego, czy wyrenderować natywny element `button`, który jest domyślny dla tego komponentu.

Zaktualizowany kod komponentu wygląda następująco:

```jsx
import {
    type ButtonHTMLAttributes,
    type HTMLAttributes,
    type ReactElement,
    Children,
    cloneElement,
    forwardRef,
    isValidElement,
} from "react";
import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";

const Slot = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(({ children, ...props }, ref) => {
    if (Children.count(children) > 1) {
        throw new Error("Slot can only have one child");
    }
    const child = children as ReactElement<HTMLAttributes<HTMLElement>>;
    if (!isValidElement(child)) {
        throw new Error("Slot must have a valid child");
    }
    const childProps = child.props;

    return cloneElement(child, {
        ...props,
        ...childProps,
        className: twMerge(props.className, childProps.className),
        ...(ref ? { ref } : {}),
    });
});

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer",
    {
        variants: {
            variant: {
                default: "bg-gray-900 text-white shadow-sm hover:bg-gray-800 focus-visible:ring-gray-500",
                outline:
                    "border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus-visible:ring-gray-500",
                link: "text-gray-900 underline-offset-4 hover:underline focus-visible:ring-gray-500",
            },
            size: {
                sm: "px-3 py-1.5 text-sm",
                md: "px-4 py-2 text-sm",
                lg: "px-6 py-3 text-base",
            },
            disabled: {
                true: "opacity-50 cursor-not-allowed",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ onClick, children, type = "button", className, variant, size, asChild, ...props }, ref) => {
        const Component = asChild ? Slot : "button";
        return (
            <Component
                ref={ref}
                type={type}
                onClick={onClick}
                className={twMerge(buttonVariants({ variant, size, className }))}
                {...props}
            >
                {children}
            </Component>
        );
    }
);
```

### Wykoszystaj Compound Component Pattern

Reużywalny komponent przycisku jest dość łatwy do zaimplementowania i zazwyczaj nieskomplikowany. Jednak w rzeczywistości sprawy często są bardziej złożone i musimy tworzyć bardziej skomplikowane komponenty.

Weźmy pod uwagę nieco bardziej złożony przykład, taki jak alert. Załóżmy, że ten komponent składa się z przycisku, który służy jako wyzwalacz do otwarcia modala. W modalu użytkownik ma do wyboru opcje, takie jak „potwierdź” i „odrzuć” — jest to typowy przypadek.

Musimy zagnieździć przyciski w modalu, użyć portalu, zaimplementować zarządzanie stanem otwarcia/zamknięcia oraz sprawić by komponent miał możliwość personalizacji i był łatwy w komponowaniu — i to wszystko bez nadmiernej "ifologii".

Idealny scenariusz użycia wyglądałby tak:

```jsx
/* Rest of the code */
<AlertDialog onOpenChange={setIsOpen} isOpen={isOpen}>
  {/* <AlertDialog onOpenChange={setIsOpen} isOpen={isOpen}> */}
  <AlertDialogTrigger>Open Dialog</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogDescription>Hello! I am a little alert</AlertDialogDescription>
    <AlertOptions>
      <AlertClose>Close</AlertClose>
      <AlertConfirm>Confirm</AlertConfirm>
    </AlertOptions>
  </AlertDialogContent>
</AlertDialog>
/* Rest of the code */
```

Wszystko tutaj jest komponowalne, a stan komponentu może być kontrolowany z zewnątrz lub zarządzany wewnętrznie.

Kluczową częścią naszego alertu jest `Context`; powinniśmy zacząć od jego implementacji.

```jsx
import { createContext, useContext } from "react";


interface AlertDialogContextProps {
    handleOpen: () => void;
    handleClose: () => void;
    isOpen: boolean;
}

const AlertDialogContext = createContext<AlertDialogContextProps | null>(null);

const useDialogContext = () => {
    const context = useContext(AlertDialogContext);
    if (!context) {
        throw new Error("useDialogContext must be used within an AlertDialogProvider");
    }
    return context;
};

type AlertDialogProps = {
    children: ReactNode;
    onOpenChange?: (isOpen: boolean) => void;
    isOpen?: boolean;
};

function AlertDialog({ children, onOpenChange, isOpen: _isOpen }: AlertDialogProps) {
    const [isOpen, setIsOpen] = useState(false);

    const contextValue = {
        handleOpen: () => onOpenChange?.(true) || setIsOpen(true),
        handleClose: () => onOpenChange?.(false) || setIsOpen(false),
        isOpen: _isOpen || isOpen,
    };

    return <AlertDialogContext.Provider value={contextValue}>{children}</AlertDialogContext.Provider>;
}

export {
    AlertDialog,
};
```

Główny wrapper komponentu będzie zarządzał stanem otwarcia/zamknięcia. Komponent umożliwia także opcjonalne sterowanie zewnętrzne poprzez przekazanie wartości stanu oraz callbacku odpowiedzialnego za jego aktualizację. Dzięki temu każdy komponent podrzędny — niezależnie od poziomu zagnieżdżenia — będzie mógł kontrolować stan.

Dodajmy drugi komponent:

```jsx
import type { ReactNode } from "react";
import { Portal } from "@radix-ui/react-portal";


interface AlertDialogContentProps {
    children: ReactNode;
}
function AlertDialogContent({ children }: AlertDialogContentProps) {
    const { isOpen } = useDialogContext();

    if (!isOpen) {
        return null;
    }

    return (
        <Portal>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">{children}</div>
            </div>
        </Portal>
    );
}

export {
    AlertDialogContent,
};

```

Ten komponent jest odpowiedzialny za renderowanie zawartości alertu: przyciski sterujące, opis itd. Zawartość będzie umieszczona wewnątrz komponentu `Portal`. Na razie nie będziemy implementować własnego, skorzystamy z tego udostępionengo w `radix-ui`.

Nasz komponent może być kontrolowany lub nie. Dla przypadku w którym komponent nie jest kontrolowany zewnętrznie musimy stworzyć komponent wyzwalający (trigger).

Stworzyliśmy już wcześniej `Button` - pora go wykorzystać tutaj:

```jsx
import { type ForwardedRef, forwardRef } from "react";
import { Button, ButtonProps } from "./button";


interface AlertDialogTriggerProps extends ButtonProps {}

const AlertDialogTrigger = forwardRef(
    ({ children, ...props }: AlertDialogTriggerProps, ref: ForwardedRef<HTMLButtonElement>) => {
        const { handleOpen } = useDialogContext();
        return (
            <Button onClick={handleOpen} ref={ref} {...props}>
                {children}
            </Button>
        );
    }
);
AlertDialogTrigger.displayName = "AlertDialogTrigger";

export {
    AlertDialogTrigger
}
```

...oraz tutaj:

```jsx
import { type ForwardedRef, forwardRef } from "react";
import { Button, ButtonProps } from "./button";


interface AlertConfirmProps extends ButtonProps {
    onConfirm?: () => void;
}

const AlertConfirm = forwardRef(
    ({ children, onConfirm, ...props }: AlertConfirmProps, ref: ForwardedRef<HTMLButtonElement>) => {
        const { handleClose } = useDialogContext();
        return (
            <Button
                size="sm"
                onClick={() => {
                    onConfirm?.();
                    handleClose();
                }}
                ref={ref}
                {...props}
            >
                {children}
            </Button>
        );
    }
);
AlertConfirm.displayName = "AlertConfirm";

interface AlertCloseContent extends ButtonProps {}

const AlertClose = forwardRef(
    ({ children, variant, ...props }: AlertCloseContent, ref: ForwardedRef<HTMLButtonElement>) => {
        const { handleClose } = useDialogContext();
        return (
            <Button variant={variant ?? "outline"} size="sm" onClick={handleClose} ref={ref} {...props}>
                {children}
            </Button>
        );
    }
);
AlertClose.displayName = "AlertClose";

export {
    AlertConfirm,
    AlertClose
}
```

Nasz komponent `Button` może być użyty na różne sposoby i nadal będzie w pełni konfigurowalny jako przycisk należący do `AlertDialog` — możemy różnież skorzystać z patternu `asChild`.

Ostatnimi elementami alertu są wrappery dla treści oraz przycisków sterujących:

```jsx
import { type HTMLAttributes, type ForwardedRef, useState } from "react";
import { twMerge } from "tailwind-merge";

interface AlertOptionsProps extends HTMLAttributes<HTMLDivElement> {}

const AlertOptions = forwardRef(
    ({ children, className, ...props }: AlertOptionsProps, ref: ForwardedRef<HTMLDivElement>) => {
        return (
            <div ref={ref} className={twMerge("mt-4 flex justify-end space-x-2", className)} {...props}>
                {children}
            </div>
        );
    }
);
AlertOptions.displayName = "AlertOptions";

interface AlertDialogDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}
const AlertDialogDescription = forwardRef(
    ({ children, className, ...props }: AlertDialogDescriptionProps, ref: ForwardedRef<HTMLParagraphElement>) => {
        return (
            <p ref={ref} className={twMerge("mt-2", className)} {...props}>
                {children}
            </p>
        );
    }
);
AlertDialogDescription.displayName = "AlertDialogDescription";

export {
    AlertOptions,
    AlertDialogDescription
}
```

Komponent `AlertOptions` pełni rolę layoutu dla przycisków sterujących, a `AlertDialogDescription` to po prostu kontener dla tekstu.

Każdy komponent będący częścią `AlertDialog` ma miejsca, w które możemy wstawić inne elementy składowe alertu.
Nasz komponent jest całkowicie oddzielony od treści i logiki aplikacji, dzięki czemu możemy używać go w dowolnym miejscu i podłączać logikę biznesową za pomocą handlerów przekazywanych do przycisków sterujących.

## Podsumowanie

Wzorce, które przedstawiłem, są głównie stosowane w `radix-ui` i `shadcn/ui`. Moim zdaniem te wzorce są świetne ze względu na swoją prostotę, a dla React developerów wydają się naturalne, ponieważ podążają za dobrymi praktykami Reacta. Niektórzy mogą powiedzieć, że wystarczy zainstalować te komponenty z jednej z wielu bibliotek i używać ich bez większego zwracania uwagi na szczegóły. To prawda — dopóki nie trzeba zaimplementować czegoś naprawdę niestandardowego. Ważne jest, aby zrozumieć, dlaczego i jak te rzeczy zostały wymyślone. W erze kodu generowanego przez AI i paczek npm na każdą okazję, znajomość wzorców projektowych i architektury jest prawdziwym skarbem.

Nie wspomniałem jeszcze o jednym bardzo ważnym temacie: testowaniu reużywalnych komponentów UI.

**Zrobię to w następnym artykule, więc "stay tuned"! 💪**

PS: Kod jest dostępny w [tym repozytorium na githubie](https://github.com/greg2012201/reusable-components-playground).

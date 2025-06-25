---
title: "(Nie tylko) Testowanie React'owych komponentów UI przy użyciu Vitest i Storybook"
createdAt: 25-06-2025
tags: react, js, frontend, design system, javascript, typescript, tailwind, storybook, vitest, testing
description: Testowanie to jeden z filarów tworzenia oprogramowania. Warstwa prezentacji odgrywa kluczową rolę w konwersji użytkowników i sukcesie biznesowym. Jednak testowanie interfejsu użytkownika bywa trudne i frustrujące. Dlatego tak ważne jest, aby korzystać z odpowiednich narzędzi — takich, które pozwalają testować nie tylko dane wejściowe i wyjściowe, ale również interakcje użytkownika oraz umożliwiają śledzenie i debugowanie zachowania komponentów.
---

# (Nie tylko) Testowanie React'owych komponentów UI przy użyciu Vitest i Storybook

W moim [poprzednim artykule](https://www.aboutjs.dev/pl/posts/creating-reusable-ui-components-in-react-write-once-use-everywhere) skupiłem się na tworzeniu reużywalnych komponentów UI w React. Ten wpis jest kontynuacją tematu — tym razem z naciskiem na testowanie.

Mam przyjemność pracować przy rozwijaniu aplikacji webowych zarówno po stronie serwera, jak i klienta. Często powtarzam, że frontend bywa znacznie bardziej nieprzewidywalny niż backend, a kod bardzo łatwo może wymknąć się spod kontroli. Aby ograniczyć liczbę problemów, warto odpowiednio testować nasz kod odpowiedzialny za UI. W tym artykule pokażę, jak robić to dobrze.

## Testy jednostkowe

Mówiąc o testowaniu, dobrze jest zacząć od testów jednostkowych jako krótkiej rozgrzewki. Idea jest prosta — test jednostkowy powinien być wykonywany na najmniejszym możliwym fragmencie logiki, takim jak pojedyńcza funkcja.

Użyjemy `vitest` jako test runnera testy oraz `@testing-library/react`, aby mieć dostęp do API Reacta w testach.

Zanim zaczniemy, stwórzmy dwa małe moduły z utilisami, które będziemy używać w naszych testach.

```typescript
// setup.ts

import "@testing-library/jest-dom/vitest";
import { afterEach, expect } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

// test-utils.ts

import { render } from "@testing-library/react";
import { type ReactElement } from "react";

function readFileContent(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) =>
      resolve(e.target?.result as string);
    reader.onerror = (e: ProgressEvent<FileReader>) => reject(e);
    reader.readAsText(file);
  });
}

function customRender(ui: ReactElement, options = {}) {
  return render(ui, {
    wrapper: ({ children }) => children,
    ...options,
  });
}

export * from "@testing-library/react";
export { customRender as render };
export { readFileContent };
```

Teraz możemy przejść dalej i do tworzenia testów.

Pamiętasz komponent Button z [poprzedniego artykułu](https://www.aboutjs.dev/en/posts/creating-reusable-ui-components-in-react-write-once-use-everywhere), gdzie rozpoczęła się nasza podróż?

```jsx
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
} from "react";
import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";

const Slot = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  ({ children, ...props }, ref) => {
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
  },
);

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-gray-900 text-white shadow-sm hover:bg-gray-800 focus-visible:ring-gray-500",
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
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      onClick,
      children,
      type = "button",
      className,
      variant,
      size,
      asChild,
      ...props
    },
    ref,
  ) => {
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
  },
);
```

W komponencie `Button` używamy wzorca `asChild`. Warto przetestować to zachowanie, ponieważ określa, jak użytkownik używa naszego przycisku. Weźmy pod uwagę sytuację, gdy chcemy, aby pole do przesyłania plików wyglądało jak nasz `Button`.

Podstawowy test jednostkowy dla tego przypadku może wygladać tak:

```jsx
import { describe, expect, it, vi } from "vitest";
import { fireEvent, readFileContent, render, screen } from "../../test/test-utils";
import { Button } from "../button";

describe("Button", () => {
    it("functions as a file input", async () => {
        const mockFile = new File(["Hello, World!\nThis is test content."], "test.txt", {
            type: "text/plain",
            lastModified: Date.now(),
        });

        const handleChange = vi.fn();

        render(
            <Button asChild>
                <input type="file" onChange={handleChange} accept="image/*" data-testid="file-input" />
            </Button>
        );

        const fileInput = screen.getByTestId("file-input");
        expect(fileInput.tagName).toBe("INPUT");
        expect(fileInput).toHaveAttribute("type", "file");
        expect(fileInput).toHaveAttribute("accept", "image/*");

        fireEvent.change(fileInput, {
            target: { files: [mockFile] },
        });

        expect(handleChange).toHaveBeenCalled();
        expect(handleChange).toHaveBeenCalledTimes(1);

        const uploadedFile = (fileInput as HTMLInputElement).files?.[0];

        const content = await readFileContent(uploadedFile!);
        expect(content).toBe("Hello, World!\nThis is test content.");
    });
});
```

## Testy integracyjne

Proste komponenty, takie jak nasz `Button`, zwykle nie mają wielu przypadków użycia, które warto testować poprzez testami jednostkowymi. Oczywiste jest, że większość interakcji użytkownika zachodzi na wielu współpracujących ze sobą komponentach, i właśnie tutaj przydają się testy integracyjne. Takie podejście, zamiast skupiać się na najmniejszych częściach aplikacji, koncentruje się na integracji wielu komponentów.

### Przegląd testowanego komponetu

Weźmy jako przykład komponent listy. Każdy element listy ma dwa przyciski: jeden do dodawania, drugi do usuwania. Jeśli na liście nie ma żadnych elementów, wyświetlana jest informacja o pustym stanie.

```jsx

import { Plus, Trash2 } from "lucide-react";
import { Button } from "./button";
import {
    AlertDialogClose,
    AlertDialogConfirm,
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTrigger,
    AlertDialogOptions,
} from "./alert-dialog";
import { type ReactNode } from "react";

interface ListItemProps {
    id: number;
    title: string;
    description: string;
    onDelete?: () => void;
}

function Header({ children }: { children: ReactNode }) {
    return <h3 className="font-semibold text-lg text-gray-900 leading-tight mb-2 truncate">{children}</h3>;
}

function Description({ children }: { children: ReactNode }) {
    return <p className="text-gray-600 text-sm leading-relaxed">{children}</p>;
}

export function ListItem({ id, title, description, onDelete }: ListItemProps) {
    return (
        <div
            role="listitem"
            className="w-full bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
        >
            <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <Header>{title}</Header>
                        <Description>{description}</Description>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button disabled>
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    data-testid={`delete-button-${id}`}
                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-md hover:bg-red-700 hover:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogDescription>
                                    Are you sure you want to delete this item?
                                </AlertDialogDescription>
                                <AlertDialogOptions>
                                    <AlertDialogConfirm onClick={onDelete}>Confirm</AlertDialogConfirm>
                                    <AlertDialogClose>No thanks!</AlertDialogClose>
                                </AlertDialogOptions>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>
        </div>
    );
}
```

Komponent `ListItem` korzysta z reużywalnych komponentów, takich jak `Button` i `AlertDialog`. W naszym przykładzie omówimy tylko akcję usuwania, aby skupić się na testowaniu interakcji użytkownika komponentami.

Zachowanie jest dobrze znane: użytkownik klika przycisk usuwania, pojawia się okno dialogowe z dodatkowym komunikatem i dwoma opcjami w formie przycisków.

```jsx
import { Inbox } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-12">
      <div className="flex flex-col items-center justify-center p-4 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Inbox className="h-6 w-6 text-gray-500" />
        </div>
        <h3 className="mb-1 text-lg font-medium text-gray-900">
          No items found
        </h3>
        <p className="max-w-sm text-sm text-gray-500">Your list is empty</p>
      </div>
    </div>
  );
}
```

Logika usuwania i zarządzania stanem jest obsługiwana przez komponent `ListExample`.

```jsx
import { useState } from "react";
import { ListItem } from "./list-item";
import { EmptyState } from "./empty-state";

type Item = {
    id: number;
    title: string;
    description: string;
};

interface ListExampleProps {
    items?: Item[];
}

export function ListExample({ items }: ListExampleProps) {
    const [itemsData, setItems] = useState<Item[]>(items ?? []);

    const handleDelete = (id: number) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    };
    if (itemsData.length === 0) {
        return <EmptyState />;
    }
    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Project List</h2>
            <div className="space-y-4">
                {itemsData.map((item) => (
                    <ListItem
                        id={item.id}
                        key={item.id}
                        title={item.title}
                        description={item.description}
                        onDelete={() => handleDelete(item.id)}
                    />
                ))}
            </div>
        </div>
    );
}
```

Gdy użytkownik kliknie przycisk usuwania przy danym elemencie, pojawia się okno dialogowe z ostrzeżeniem. Użytkownik może anulować akcję usunięcia lub ją potwierdzić. Jeśli potwierdzi, element zostanie usunięty z listy. Jeśli lista stanie się pusta, zostanie wyrenderowany komponent `EmptyState`.

### Pisanie testów

Mając zdefiniowane komponenty, możemy napisać testy. Przetestujemy kilka scenariuszy użytkownika:

- potwierdzenie usunięcia elementu
- anulowanie akcji usunięcia elementu
- wyświetlenie informacji o pustym stanie po usunięciu ostatniego elementu

```jsx
import { describe, expect, it } from "vitest";
import { render } from "../../test/test-utils";
import { ListExample } from "../list-example";
import { fireEvent } from "@testing-library/react";
import { ITEMS } from "../../const/listData";

describe("ListExample", () => {
  it("keeps the item when clicking 'No thanks' in alert dialog", async () => {
    const { getByRole, getByText } = render(
      <ListExample
        items={[
          {
            id: 1,
            title: "Test Project",
            description: "This is a test project.",
          },
        ]}
      />,
    );

    const deleteButton = getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    const cancelButton = getByRole("button", { name: /no thanks/i });
    fireEvent.click(cancelButton);

    expect(getByText("Test Project")).toBeInTheDocument();
  });

  it("deletes the item when confirming in alert dialog", async () => {
    const { getByRole, queryByText, getByTestId } = render(
      <ListExample
        items={[
          {
            id: 1,
            title: "Test Project",
            description: "This is a test project.",
          },
          {
            id: 2,
            title: "Another Project",
            description: "This is another project.",
          },
        ]}
      />,
    );

    expect(queryByText("Test Project")).toBeInTheDocument();
    expect(queryByText("Another Project")).toBeInTheDocument();

    const deleteButton = getByTestId(`delete-button-1`);
    if (!deleteButton) throw new Error("Delete button not found");
    fireEvent.click(deleteButton);

    const confirmButton = getByRole("button", { name: /confirm/i });
    fireEvent.click(confirmButton);

    expect(queryByText("Test Project")).not.toBeInTheDocument();
    expect(queryByText("Another Project")).toBeInTheDocument();
  });

  it("renders empty state after deleting all items", async () => {
    const { getByRole, getByText } = render(<ListExample items={[ITEMS[0]]} />);

    const deleteButton = getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    const confirmButton = getByRole("button", { name: /confirm/i });
    fireEvent.click(confirmButton);

    expect(getByText("No items found")).toBeInTheDocument();
    expect(getByText("Your list is empty")).toBeInTheDocument();
  });
});
```

Jak widzimy, każdy komponent pełni swoją rolę i przyczynia się do całościowego doświadczenia w `ListExample`. Testowanie w jaki sposób te komponenty współpracują ze sobą jest cenne, ponieważ pozwala nam testować rzeczywiste scenariusze działań użytkownika.

A co jeśli chcemy zobaczyć interakcje na ekranie bez uruchamiania całej aplikacji lub jeśli tworzymy design system całkowicie niezależny od jakiejkolwiek aplikacji? Tutaj z pomocą przychodzi Storybook.

## Storybook

Podczas tworzenia front-endu testy, których wyniki wyświetlane są tylko w terminalu, często nie wystarczają. Interfejsy użytkownika to to, co użytkownicy widzą i z czym wchodzą w interakcję. Komponenty często nie tylko zachowują się inaczej, ale też wyglądają inaczej, gdy otrzymują różne propsy lub znajdują się w obrębie różnych layout'ów. Dobrze jest mieć je odizolowane i móc łatwo zmieniać ich input.

Storybook to narzędzie, które pozwala deweloperom tworzyć komponenty UI w izolacji. Jego funkcje ułatwiają proces tworzenia, od projektowania i debugowania po testy manualne i automatyczne.

Skupmy się na kilku funkcjach Storybooka, które mogą usprawnić proces testowania i tworzenia interfejsów użytkownika.

### Stories & Docs

Stories to doskonała rzecz do dokumentowania komponentów i testowania ich manualnie w izolacji. Pozwalają nam sprawdzić doświadczenie użytkownika poprzez interakcję z komponentami tak, jak robią to użytkownicy. Stories służą również do definiowania, w jakich warunkach komponent jest renderowany, co ułatwia stworzenie galerii tego samego komponentu w różnych scenariuszach.

Napiszmy Docsy dla naszego komponentu `Button`:

```jsx
// components/stories/button.stories.ts

import type { Meta } from "@storybook/react";
import { Button } from "../button";

const meta = {
    title: "Components/Button",
    component: Button,
    parameters: {
        layout: "centered",
        docs: {
            description: {
                component:
                    "A versatile button component that supports multiple variants, sizes, and can be rendered as other elements.",
            },
        },
    },
    tags: ["autodocs"],
    argTypes: {
        variant: {
            control: "select",
            options: ["default", "outline", "link"],
            description: "The visual style of the button",
        },
        size: {
            control: "select",
            options: ["sm", "md", "lg"],
            description: "The size of the button",
        },
        disabled: {
            control: "boolean",
            description: "Whether the button is disabled",
        },
        asChild: {
            control: "boolean",
        },
        children: {
            control: "text",
        },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof Button>;
```

Jedną z rzeczy, którą powinniśmy zrobić, to udokumentowanie naszego komponentu. W erze asystentów programowania opartych na edytorach AI, takich jak GitHub Copilot, Cursor i inne, dodanie dokumentacji jest obligatoryjne. Można wygenerować dokumentację i szybko ją przejrzeć. Będzie to szczególnie pomocne dla zespołu, na wypadek gdy komponent jest skomplikowany.

API Docs'ów Storybooka jest intuicyjne i łatwe do zrozumienia.

Rezultat powyższego kodu wygląda całkiem nieźle:

![Wizualna reprezentacja docs](/posts/assets/not-just-testing-react-ui-components-with-vitest-and-storybook/stories-and-docs-1.png)

Możemy wizualnie przejrzeć nasz komponent, wchodzić z nim w interakcję oraz dynamicznie zmieniać jego właściwości (propsy) za pomocą kontrolek. Wszelkie zmiany komponentu są natychmiast widoczne w preview.

Ok, mamy już Docs — teraz zdefiniujmy Stories dla naszego komponentu:

```jsx

/* ----- */

export const Default: Story = {
    args: {
        children: "Default Button",
        variant: "default",
        size: "md",
    },
};

export const Link: Story = {
    args: {
        asChild: true,
        children: <a href="/">Link as Button</a>,
        variant: "link",
        size: "md",
    },
};

export const Upload: Story = {
    args: {
        asChild: true,
        variant: "outline",
        children: <input type="file" id="fileUpload" name="fileUpload" />,
    },
};

export const WithIcon: Story = {
    args: {
        children: (
            <>
                <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
                Menu
            </>
        ),
    },
};
```

Stories to obiekty, które opisują wygląd i zachowanie naszego komponentu. Zdefiniowanie Story jest jak wywołanie komponentu z określonymi właściwościami (propsami). Jest to bardzo przydatne, szczególnie w przypadku naszego komponentu `Button`, do sprawdzenia, wyglądu i działania przy użyciu wzorca `asChild`.

Każde wyeksportowane Story będzie dostępne w zakładce Docs w sekcji „Stories” pod główną sekcją komponentu:

![Sekcja stories](/posts/assets/not-just-testing-react-ui-components-with-vitest-and-storybook/stories-and-docs-2.png)

Aby wchodzić w interakcję z każdym z osobna, musimy przejść do dedykowanego widoku dostępnego w nawigacji.

Wybierzmy "Upload" story naszego komponentu `Button`:

![Upload story dla komponentu button](/posts/assets/not-just-testing-react-ui-components-with-vitest-and-storybook/stories-and-docs-3.png)

Praca ze Stories pomaga developerom wychwycić wiele błędów na wczesnym etapie. Podobnie jak z TypeScript — pomaga on wykryć problemy jeszcze zanim uruchomimy kod aplikacji.

### Let's play! Pobawmy się w automatczyne testy w Storybooku

Nie ma wątpliwości, że Stories to potężne narzędzie, ale aby uzupełnić proces testowania, potrzebujemy automatyzacji. Storybook daje nam możliwość pisania testów automatycznych. Jest to możliwe dzięki funkcji `play`, którą możemy zdefiniować w naszych Stories.

Przejdźmy do naszego komponentu `ListExample` i napiszmy dla niego testy.

```jsx
import { ITEMS } from "../../const/listData";
import { screen } from "storybook/test";

/* ----- rest of stories ------  */


const ClickOnDelete: Story = {
    play: async ({ canvas, userEvent }) => {
        const deleteButton = canvas.getAllByRole("button", { name: /delete/i })[0];
        await userEvent.click(deleteButton);
    },
};
const ClickOnConfirm: Story = {
    play: async ({ userEvent }) => {
        const confirmButton = screen.getByText("Confirm");
        await userEvent.click(confirmButton);
    },
};

const ClickOnReject: Story = {
    play: async ({ userEvent }) => {
        const rejectButton = screen.getByText(/no thanks/i);
        await userEvent.click(rejectButton);
    },
};
```

Jak widać, niektóre patterny i składnia testów są podobne do tych, które już znamy. Testy są również zawarte częścia Stories.

Powyżej zdefiniowane Stories to wielokrotnego użytku kroki, które odzwierciedlają proces testowania. Te pierwsze trzy Stories nie są celowo eksportowane, ponieważ nie chcemy, aby pojawiały się w nawigacji — służą one wyłącznie jako wielokrotnego użytku, kompozycyjne elementy do poniższych testów integracyjnych:

```jsx
import { ITEMS } from "../../const/listData";
import { expect, waitFor } from "storybook/test";

/* ----- rest of stories ------  */


export const WithDeleteInteraction: Story = {
    args: {
        items: ITEMS,
    },
    play: async ({ context, canvas, step }) => {
        await step("Render List", async () => {
            await expect(canvas.getByText("Project Alpha")).toBeInTheDocument();
        });

        await step("Delete first item", async () => {
            await ClickOnDelete.play(context);
        });

        await step("Confirm deletion", async () => {
            await ClickOnConfirm.play(context);
        });

        await step("Verify deletion", async () => {
            await waitFor(() => {
                expect(canvas.queryByText("Project Alpha")).not.toBeInTheDocument();
            });
        });
    },
};
export const WithRejectedDeletionOperation: Story = {
    args: {
        items: ITEMS,
    },
    play: async ({ context, canvas, step }) => {
        await step("Render List", async () => {
            await expect(canvas.getByText("Project Alpha")).toBeInTheDocument();
        });

        await step("Delete first item", async () => {
            await ClickOnDelete.play(context);
        });

        await step("Reject", async () => {
            await ClickOnReject.play(context);
        });

        await step("Verify deletion", async () => {
            await waitFor(() => {
                expect(canvas.queryByText("Project Alpha")).toBeInTheDocument();
            });
        });
    },
};

export const WithDeleteLastItem: Story = {
    args: {
        items: [ITEMS[0]],
    },
    play: async ({ context, canvas, step }) => {
        await step("Render List", async () => {
            await expect(canvas.getByText("Project Alpha")).toBeInTheDocument();
        });
        await step("Delete first item", async () => {
            await ClickOnDelete?.play(context);
        });

        await step("Confirm deletion", async () => {
            await ClickOnConfirm.play(context);
        });

        await step("Verify empty state", async () => {
            await waitFor(() => {
                expect(canvas.getByText("No items found")).toBeInTheDocument();
                expect(canvas.getByText("Your list is empty")).toBeInTheDocument();
            });
        });
    },
};
```

Tutaj definiujemy nasze testy interakcji, które zapewniają, że komponent działa zgodnie z oczekiwaniami.
Użyta składnia i wzorce są dobrze znane, więc każdy programista może szybko zacząć pisać testy w Stories Storybooka. Dodatkowo labels przekazywane do funkcji `step` sprawiają, że kod jest zrozumiały i samoopisujący się. Łatwo możemy wywnioskować, które kroki będą testowane, a także zobaczyć, jak komponenty zachowują się na żywo.

Na dole podglądu znajduje się zakładka "Interactions", która pozwala nam przechodzić ręcznie przez każdy zdefiniowany test lub odtworzyć wzystkie od początku.

![Interfejs interakcji](/posts/assets/not-just-testing-react-ui-components-with-vitest-and-storybook/lets-play-with-storybooks-automation-tests-1.png)

Możemy wchodzić w interakcję z tą listą, przechodząc do konkretnego kroku. Stan komponentu będzie również wizualnie odzwierciedlony w podglądzie.

![Klikanie w konkretną interakcję](/posts/assets/not-just-testing-react-ui-components-with-vitest-and-storybook/lets-play-with-storybooks-automation-tests-2.png)

### Testowanie accessibility

Dostępność jest bardzo ważna podczas tworzenia interfejsów użytkownika, dlatego testowanie jej jest równie istotne.
Storybook udostępnia narzędzie, które automatycznie skanuje nasze komponenty i wyświetla wyniki tych testów poniżej podglądu komponentu:

![Testy accessibility - pozytywne rezultaty](/posts/assets/not-just-testing-react-ui-components-with-vitest-and-storybook/accessibility-testing-1.png)

![Testy accessibility - wykryte problemy](/posts/assets/not-just-testing-react-ui-components-with-vitest-and-storybook/accessibility-testing-2.png)

Jak widać, dla naszego przycisku `Button` użytego jako kontrolka do przesyłania plików, niektóre testy zakończyły się pomyślnie, ale wykryto także pewne błędy.

Taka funkcjonalnośc może być świetnym punktem wyjścia do bardziej szczegółowych testów accessibility.

### Sharing

Dzięki Storybookowi możemy udostępniać nasz design system. Dzielenie się postępami prac jest bardzo ważne dla osób decyzyjnych oraz biznesu. W rozmowach o wymaganiach biznesowych kluczowe są jasne przykłady i widoczne rezultaty — pozwala to uniknąć nieporozumień, co przyspiesza i usprawnia iteracje.

Storybook oferuje solidne możliwości udostępniania, takie jak budowanie i publikowanie jako statyczna aplikacja webowa lub integracja z Figmą.

## Podsumowanie

Jak widać, testowanie i budowanie z użyciem odpowiednich narzędzi może zaoszczędzić nam wiele czasu. Co więcej, wyobraźmy sobie tworzenie desing systemu z pomocą agentów AI a następnie testowanie ich w Storybooku - prawda że to potężne combo? Przy właściwie skonfigurowanym środowisku testowym możemy skupić się na rozwiązywaniu rzeczywistych problemów biznesowych bez spędzania przesadnie długiego czasu na naprawianiu bledów. Jednak pamiętajmy, że Storybook nie zawsze jest najlepszym wyborem. Czasami korzystanie z niego w mniejszych projektach może być wytoczeniem armaty na muchę — podobnie jak w przypadku testów jednostkowych czy integracyjnych. Gdy aplikacja jest mała lub jest to statyczna strona, często szybsze i równie bezpieczne jest testowanie ręczne lub same testy end-to-end.

Planując ten artykuł, miałem szczęście znaleźć [świetny odcinek](https://syntax.fm/show/908/storybook-has-evolved-w-jeppe-reinhold) podcastu [Syntax](https://syntax.fm/) z jednym z członków zespołu Storybook. Jeśli chcesz poznać Storybook z perspektywy jego zespołu, zdecydowanie warto posłuchać.

PS: Syntax jest moim ulubionym podcastem ze świata web developmentu.

**Dzięki za prześledzene tematu ze mną! Stay tuned!**

PS: Jeżeli chcesz pobawić się kodem z tego artykułu, odwiedź [to repozytorium na GitHub'ie](https://github.com/greg2012201/reusable-components-playground).

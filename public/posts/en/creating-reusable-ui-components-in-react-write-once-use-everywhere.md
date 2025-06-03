---
title: "Creating Reusable React Components: Write Once, Use Anywhere"
createdAt: 28-05-2025
tags: react, js, frontend, design system, javascript, typescript, tailwind, radix, radix-ui
description: Modern client-side applications are large and often contain many similar UI elements, such as buttons, links, and lists. This is where React components truly shine. In this article, we'll explore patterns for creating reusable React components.
---

# Creating Reusable UI Components in React: Write Once, Use Anywhere

User interfaces are evolving every day, becoming larger and more complex. We can build a lot of things — but to move quickly and avoid introducing bugs, we need reliable building blocks.

As developers, we often work with dashboards, product lists, tables, and so on. These features require smaller UI elements that appear repeatedly and must stay consistent with the application's design. One of React’s core purposes is to provide primitives for building user interfaces in a clear, structured way through component composition.

React gives you the tools, but it doesn't solve every challenge related to reusability. In the end, it’s up to you to design and compose your components in a way that makes them truly reusable.

In this article, I’d like to share the best practices I follow when building reusable React components.

## Stick to Web Standards

Amid all the abstractions and syntactic sugar, even experienced developers sometimes forget what platform we're building our frontend for. That’s right — we’re building for the web, so we should stick to web standards.

Most of our components are built around native elements like buttons, inputs, and others. These elements come with their own properties, and exposing them through props is a good practice. It gives developers more control over your component’s behavior and makes it more predictable.

Let’s start with this simple button:

```jsx
import type { MouseEvent, ReactNode } from 'react'

interface ButtonProps {
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
    children: ReactNode;
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

This button component has some issues that make it unintuitive to use and difficult to control:

- missing support for `className`
- hardcoded values for `type`, `onClick`, and `className`
- missing ref forwarding

I’m sure that sooner or later, for this kind of component, we’ll need to apply web-specific properties like ARIA labels, class names, data attributes, and more.
Let’s fix that.

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

By extending the interface with web-specific types, we ensure safety because any changes to web specific props will be reflected in the interface we extend. Developers won’t have to worry about updates, and the component will remain type-safe over time.

Adding a `ref` is also related to adhering to web standards. Without it, the component would be unusable if we want to, for example, read its element's properties like data attributes or class names.

Our small modification is a big step toward reusability, but it’s not enough for this component.

## Ensure Easy Customization

Another crucial aspect is to allow customization. Every reusable component should be customizable, especially when it comes to styles.

### Class Names (Tailwind & CSS Styles)

We already have the tools to do this. Class names — our good old friends from the era of static JS + CSS + HTML websites — and the well-known utility library Tailwind CSS. It took me some time to realize how effective this tool is. It helps us avoid overengineering styles and allows us to rely on CSS, keeping the JavaScript bundle size minimal when it comes to styling.

However, when composing components styled with Tailwind, we need to be aware of potential class name conflicts and apply proper class name merging as a solution. Fortunately, we don’t have to write the merging logic ourselves. — there’s a package called `tailwind-merge` specifically designed for Tailwind that handles it for us.

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

We start by styling our components and then merge incoming `className` values, giving developers control over the component's appearance.

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

### Variants

There’s no doubt that our button will need to support different variants. Since we’re working with class names, we need to define styles for each variant and expose an API that lets developers choose the appropriate one.

Organizing class names into variants and keep our code readable and type safe would be painful. We can quickly solve this problem using the library called: `class-variance-authority`.

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

Usage:

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

All styles are explicitly defined here, and the variants are exposed — everything is also type-safe. When talking about reusable components, it’s common to recall the nightmare of creating flexible yet safe types. But here, everything is handled for us, and we can clearly see the shape of our button’s style schema.

It's worth mentioning that using Tailwind is optional when working with the `class-variance-authority` package.

## Focus on Composability

Another crucial aspect of creating reusable components is composability. It’s similar to customization — we need to give developers control over how components behave and interact. A React component should be like a LEGO block. Anyone who enjoys building with LEGO knows that some blocks can be used in many different ways, depending on how they’re combined with others.

We can achieve the same kind of flexibility with our components.

### asChild pattern

Sometimes, we want to bring the behavior of a specific element and combine it with our reusable component. A common situation is when you want your button to behave like a link, creating a button-link hybrid.

Many libraries and meta-frameworks provide their own `Link` component and often we want to make it look like a button.

To achieve this, we can use the `asChild` pattern. I first encountered this pattern when trying out `radix`. At first glance, it might seem complex, but it’s actually quite straightforward. The reusable component accepts an optional boolean prop called `asChild`, along with the element that should replace its default element. When `asChild` is set to true, the child element passed to the reusable component is cloned and replaces the component’s default element. Their props are then merged with the parent’s props.

Let’s implement this pattern in our `Button` component.

Our goal is to make our `Button` usable in the following way:

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

Our `Button` should support all the functionality that `Link` provides while also retaining its own properties and styles.

#### The Slot component

To render an element passed as child (in our case, a `Link`), we need to create a `Slot` component:

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

As I mentioned earlier, to achieve element swapping, we need to clone the child element.

First, we must ensure that our `Slot` receives only one valid child. Then, we return a clone of that element, passing the `ref` and merging the parent’s and child’s props. Since our project uses Tailwind, it’s a good idea to merge class names using the `tailwind-merge` package. Note that the props are only shallowly merged; if your component has nested props, it’s better to use a deep merge pattern. Here, we keep it simple for explanatory purposes.

Once we have created our `Slot` component, we can modify the code in `Button`:

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

Now our component accepts an `asChild` prop, which determines whether to use the `Slot` component to render the child element or to render the native `button` element, which is the default for this component.

The updated component’s code looks like this:

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

### Leverage the Compound Component Pattern

A reusable button component is fairly easy to implement and generally not complex. However, real life is not always that simple, and we often need to build more complex components.

Let’s consider a slightly more complex example, like an alert. Suppose this component consists of a button that serves as a trigger to open a modal. Inside the modal, the user has options like “confirm” and “reject” — a common use case.

We need to nest buttons inside the modal, need to use a portal, manage the open/close state, and make the component both customizable and composable — all without relying on many if statements.

An ideal usage scenario would look like this:

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

Everything here is composable, and the component's state can be either controlled externally or managed internally.

The crucial part of our alert is the Context; we should start by implementing it.

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

The main wrapper of the component will manage the open/close state. The component also allows optional external control by accepting a state value and a callback responsible for updating the state. This way, any child component — no matter how deeply nested — will be able to control the state.

Let’s add the second component:

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

This component is responsible for rendering the content of the alert: control buttons, description, etc. The content will be placed inside a Portal. We won’t implement a reusable portal for now, so we’ll use the one from `radix-ui`.

Our component can be controlled or uncontrolled. For the uncontrolled case, we need to create a trigger component.

Remember our `Button`? That’s right — we can use it here:

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

...and here:

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

Our `Button` component can be used in various ways, and it will still be fully customizable as a button that belongs to the `AlertDialog` — we can also take advantage of the `asChild` pattern.

The last parts of the alert are wrappers for the description and the options (control buttons):

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

The `AlertOptions` component serves as a layout for control buttons, and the `AlertDialogDescription` is just a container for text.

Every component that is a building block of the `AlertDialog` has "holes" where we can place other building blocks for the alert.
Our component is completely decoupled from the application logic, so we can use it anywhere and connect our business logic through the control buttons' handlers.

## Summary

The patterns I presented are mostly used in `radix-ui` or `shadcn/ui`. In my opinion, those patterns are great because of their simplicity, and for React devs, they feel natural as they leverage React’s good practices. Someone can say that can just npm install the components from one of the plenty of libraries and consume them without paying much attention to details. It's true as long as you have to implement something really custom. It is good to know why and how those things were build, in the era of code generated by AI and npm packages for everything knowledge about patterns, designs are a pure gold.

I didn't cover a very important topic: testing reusable UI components.

**I’ll do that in the next article, so stay tuned! 💪**

PS: The code is available here in [this github repo](https://github.com/greg2012201/reusable-components-playground).

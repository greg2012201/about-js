import React from "react";
import { ClassNameValue, twMerge } from "tailwind-merge";
type Props = {
  children: string;
  className?: ClassNameValue;
};

export function Subtitle({ children, className }: Props) {
  return (
    <p
      className={twMerge(
        className,
        `bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-2xl text-transparent md:text-3xl`,
      )}
    >
      {children}
    </p>
  );
}

export function Title({ children, className }: Props) {
  return (
    <h1
      className={twMerge(
        className,
        `text-5xl leading-tight md:text-7xl xl:text-[80px]`,
      )}
    >
      {children}
    </h1>
  );
}

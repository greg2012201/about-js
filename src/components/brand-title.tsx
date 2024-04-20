import React from "react";
type Props = {
  children: string;
};

export function Subtitle({ children }: Props) {
  return (
    <p className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-2xl text-transparent md:text-3xl">
      {children}
    </p>
  );
}

export function Title({ children }: Props) {
  return (
    <h1 className="text-5xl leading-tight md:text-7xl xl:text-[80px] ">
      {children}
    </h1>
  );
}

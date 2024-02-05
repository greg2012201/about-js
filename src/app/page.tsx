import Intro from "./_components/sections/intro/intro";
import Next from "./_components/sections/next";
import React from "./_components/sections/react";

export default function Home() {
  return (
    <div className="mx-auto flex w-full flex-col items-center p-4 text-white sm:w-9/12">
      <Intro />
      <Next />
      <React />
    </div>
  );
}

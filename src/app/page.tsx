import Intro from "./_components/sections/intro";
import Next from "./_components/sections/next";
import React from "./_components/sections/react";

export default function Home() {
  return (
    <div className="mx-auto flex w-full flex-col items-center overflow-hidden p-4 text-white sm:w-9/12">
      <Intro />
      <Next />
      <React />
    </div>
  );
}

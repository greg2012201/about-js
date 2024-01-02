import Intro from "./_components/sections/intro";
import Next from "./_components/sections/next";
import React from "./_components/sections/react";

export default function Home() {
  return (
    <div className="w-full p-4 text-white">
      <Intro />
      <Next />
      <React />
    </div>
  );
}

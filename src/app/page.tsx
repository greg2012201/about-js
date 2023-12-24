import Image from "next/image";
import Intro from "./_components/sections/intro";
import Next from "./_components/sections/next";

export default function Home() {
  return (
    <div className="space-y-8 p-4 text-white">
      <Intro />
      <Next />
    </div>
  );
}

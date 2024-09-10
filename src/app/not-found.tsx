import BaseText from "@/components/base-text";
import { Subtitle, Title } from "@/components/brand-title";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not Found",
  description: "Content should not be found...",
};

function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-[#141e30] via-[#243b55] to-[#243b55] text-white">
      <div className="flex flex-col items-center justify-center space-y-20 p-4">
        <Title className="text-[80px] font-bold">404</Title>
        <Subtitle className="pb-1">
          Ups! Something went wrong! Content could not be found...
        </Subtitle>
        <Link href="/">
          <BaseText>Go to the home page 👉</BaseText>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;

import React from "@/components/sections/react";
import SimpleView from "./_views/simple-view";
import { PAGES_META } from "@/constants/website";

type Props = {
  params: { locale: string };
};

export async function generateMetadata() {
  return PAGES_META.get("about");
}

function About({ params: { locale } }: Props) {
  return <SimpleView />;
}

export default About;

import React from "@/components/sections/react";
import SimpleView from "./_views/simple-view";
import composeMetadata from "@/lib/compose-metadata";
import { unstable_setRequestLocale } from "next-intl/server";

export async function generateMetadata() {
  return composeMetadata({ canonical: "/about", intlNamespace: "About" });
}

type Props = {
  params: { locale: string };
};

function About({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);
  return <SimpleView />;
}

export default About;

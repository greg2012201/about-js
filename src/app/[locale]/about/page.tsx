import React from "@/components/sections/react";
import SimpleView from "./_views/simple-view";
import getMetadataTranslation from "@/lib/getMetadataTranslation";
import { unstable_setRequestLocale } from "next-intl/server";


export async function generateMetadata() {
  return getMetadataTranslation("About");
}

type Props = {
  params: { locale: string };
};


function About({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);
  return <SimpleView />;
}

export default About;

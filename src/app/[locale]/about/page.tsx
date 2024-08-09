import React from "@/components/sections/react";
import SimpleView from "./_views/simple-view";
import { PAGES_META } from "@/constants/website";
import getMetadataTranslation from "@/lib/getMetadataTranslation";

type Props = {
  params: { locale: string };
};

export async function generateMetadata() {
  return getMetadataTranslation("About");
}

function About({ params: { locale } }: Props) {
  return <SimpleView />;
}

export default About;

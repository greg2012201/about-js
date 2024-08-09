import React from "@/components/sections/react";
import SimpleView from "./_views/simple-view";
import { PAGES_META } from "@/constants/website";
import getMetadataTranslation from "@/lib/getMetadataTranslation";


export async function generateMetadata() {
  return getMetadataTranslation("About");
}

function About() {
  return <SimpleView />;
}

export default About;

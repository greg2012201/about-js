"use client";

import React from "react";
import Title from "../title";
import Italic from "../italic";
import SectionWrapper from "../section-wrapper";
import IconsLine from "../icons-line";

function Next() {
  return (
    <SectionWrapper renderIconLine={<IconsLine iconSrc="./next-js-logo.svg" />}>
      <Title>Fresh news about Next.js</Title>
      <Italic>News and outstanding toturials, guides and insights.</Italic>
    </SectionWrapper>
  );
}

export default Next;

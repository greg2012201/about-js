"use client";

import React from "react";
import Title from "../title";
import BaseText from "../base-text";
import SectionWrapper from "../section-wrapper";
import IconLine from "../icon-line";

function Next() {
  return (
    <SectionWrapper renderIconLine={<IconLine iconSrc="./next-js-logo.svg" />}>
      <Title>Fresh news about Next.js</Title>
      <BaseText>News and outstanding toturials, guides and insights.</BaseText>
    </SectionWrapper>
  );
}

export default Next;

"use client";

import IconsLine from "../icons-line";
import Italic from "../italic";
import SectionWrapper from "../section-wrapper";
import Title from "../title";

function React() {
  return (
    <SectionWrapper renderIconLine={<IconsLine iconSrc="./react-2.svg" />}>
      <Title>Stay up to date with React</Title>
      <Italic>I usually say that now we have third generation of react.</Italic>
    </SectionWrapper>
  );
}

export default React;

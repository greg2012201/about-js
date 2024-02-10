"use client";

import IconsLine from "../icon-line";
import BaseText from "../base-text";
import SectionWrapper from "../section-wrapper";
import Title from "../title";

function React() {
  return (
    <SectionWrapper renderIconLine={<IconsLine iconSrc="./react-2.svg" />}>
      <Title>Stay up to date with React</Title>
      <BaseText>
        I usually say that now we have third generation of react.
      </BaseText>
    </SectionWrapper>
  );
}

export default React;

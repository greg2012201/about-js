"use client";

import React from "react";
import SectionWrapper from "../section-wrapper";
import IconLine from "../icon-line";
import Title from "../title";
import BaseText from "../base-text";

function NodeJS() {
  return (
    <SectionWrapper
      renderIconLine={<IconLine title="Node.js" iconSrc="./nodejs-icon.svg" />}
    >
      <Title>Keep up with node.js</Title>
      <BaseText>
        In the world of new glowing technologies we remember about good old
        node.
      </BaseText>
    </SectionWrapper>
  );
}

export default NodeJS;

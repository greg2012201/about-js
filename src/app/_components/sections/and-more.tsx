"use client";

import React from "react";
import SectionWrapper from "../section-wrapper";
import Title from "../title";
import IconLine from "../icon-line";
import BaseText from "../base-text";

function AndMore() {
  return (
    <SectionWrapper
      renderIconLine={
        <IconLine
          title="question"
          iconSrc="./question-circle.svg"
          lineAnimationDisabled
        />
      }
    >
      <Title>Something missing?</Title>
      <BaseText className="max-w-3xl">
        No worries! JS world moves really fast and there are more interesting
        stuff to talk about. Like: test projects, css, other frontend
        frameworks, backend frameworks, news, packages and open source.
      </BaseText>
    </SectionWrapper>
  );
}

export default AndMore;

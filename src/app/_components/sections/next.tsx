"use client";

import React from "react";
import Title from "../title";
import BaseText from "../base-text";
import SectionWrapper from "../section-wrapper";
import IconLine from "../icon-line";
import Card from "../card";

function Next() {
  return (
    <SectionWrapper
      renderIconLine={<IconLine title="Next.js" iconSrc="./next-js-logo.svg" />}
    >
      <Title>Fresh news about Next.js</Title>
      <Card className="max-w-[1000px]">
        <BaseText className="text-2xl  md:text-[28px]">
          There are many new things out there. It is good to know what&apos;s
          going on in the new API&apos;s 😉
        </BaseText>
      </Card>
    </SectionWrapper>
  );
}

export default Next;

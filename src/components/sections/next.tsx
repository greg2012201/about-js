"use client";

import React, { ReactElement } from "react";
import BaseText from "../base-text";
import IconLine from "../icon-line";
import Card from "../card";
import SectionWrapper from "../section-wrapper";
import Title from "../title";

type Props = { renderContent: ReactElement };

function Next({ renderContent }: Props) {
  return (
    <SectionWrapper
      renderIconLine={<IconLine title="Next.js" iconSrc="./next-js-logo.svg" />}
    >
      <Title size="large">Fresh news about Next.js</Title>
      <Card
        wrapperClassName="mt-auto mb-auto"
        contentClassName="flex max-w-[1000px] flex-col space-y-8"
      >
        <BaseText className="text-xl  md:text-[26px]">
          There are many new things out there. It is good to know what&apos;s
          going on in the new API&apos;s 😉
        </BaseText>
        {renderContent}
      </Card>
    </SectionWrapper>
  );
}

export default Next;

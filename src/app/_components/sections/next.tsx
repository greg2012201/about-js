"use client";

import React, { ReactElement } from "react";
import Title from "../title";
import BaseText from "../base-text";
import SectionWrapper from "../section-wrapper";
import IconLine from "../icon-line";
import Card from "../card";

type Props = { renderContent: ReactElement };

function Next({ renderContent }: Props) {
  return (
    <SectionWrapper
      className="h-[750px]! sm:h-[550px]"
      renderIconLine={<IconLine title="Next.js" iconSrc="./next-js-logo.svg" />}
      iconsLineWrapperClassName="h-[750px] sm:h-[550px]"
    >
      <Title>Fresh news about Next.js</Title>
      <Card className="flex max-w-[1000px] flex-col space-y-8">
        <BaseText className="text-2xl  md:text-[28px]">
          There are many new things out there. It is good to know what&apos;s
          going on in the new API&apos;s 😉
        </BaseText>
        {renderContent}
      </Card>
    </SectionWrapper>
  );
}

export default Next;

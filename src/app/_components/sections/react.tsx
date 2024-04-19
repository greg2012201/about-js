"use client";

import IconsLine from "../icon-line";
import BaseText from "../base-text";
import SectionWrapper from "../section-wrapper";
import Title from "../title";
import { ReactElement } from "react";
import Card from "../card";

type Props = { renderContent: ReactElement };

function React({ renderContent }: Props) {
  return (
    <SectionWrapper
      renderIconLine={<IconsLine title="React" iconSrc="./react-2.svg" />}
    >
      <Title>Stay up to date with React</Title>
      <Card
        wrapperClassName="mt-auto mb-auto"
        contentClassName="flex max-w-[1000px] flex-col space-y-8"
      >
        <BaseText>
          I usually say that now we have third generation of react.
        </BaseText>
        {renderContent}
      </Card>
    </SectionWrapper>
  );
}

export default React;

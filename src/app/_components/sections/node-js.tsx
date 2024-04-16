"use client";

import React from "react";
import SectionWrapper from "../section-wrapper";
import IconLine from "../icon-line";
import Title from "../title";
import BaseText from "../base-text";
import Image from "next/image";
import Card from "../card";

function NodeJS() {
  return (
    <SectionWrapper
      renderIconLine={<IconLine title="Node.js" iconSrc="./nodejs-icon.svg" />}
    >
      <Title>Keep up with node.js</Title>
      <Card
        wrapperClassName="mt-auto mb-auto"
        contentClassName="flex max-w-[1000px] flex-col space-y-8"
        >      
        <BaseText>
          In the world of new glowing technologies we remember about good old
          node.
        </BaseText>
      <Image className="mt-auto mb-auto self-center" alt="node js terminal gif" width={720} height={400} src='/node-js-demo.gif'  />
      </Card>
    </SectionWrapper>
  );
}

export default NodeJS;

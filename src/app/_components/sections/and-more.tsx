"use client";

import React, { ReactElement } from "react";
import SectionWrapper from "../section-wrapper";
import Title from "../title";
import IconLine from "../icon-line";
import BaseText from "../base-text";
import { GrTest } from "react-icons/gr";
import { FaCss3 } from "react-icons/fa";
import { FaCode } from "react-icons/fa";
import { IoServerSharp } from "react-icons/io5";
import { GrSend } from "react-icons/gr";
import { FaGithub } from "react-icons/fa";
import Card from "../card";

type FeatureListitemProps = {
  children: string;
  icon: ReactElement;
};

function FeatureListsItem({ children, icon }: FeatureListitemProps) {
  return (
    <li className="flex items-center space-x-2">
      {icon}
      <p className="text-xl  italic">{children}</p>
    </li>
  );
}

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
      <Card
        wrapperClassName="mt-auto mb-auto"
        contentClassName="flex max-w-[1000px] flex-col space-y-8"
      >
        <BaseText className="max-w-3xl pt-4">
          No worries! JS world moves really fast and there are more interesting
          stuff to talk about, like:
        </BaseText>

        <ul className="space-y-1 pl-8 ">
          <FeatureListsItem icon={<GrTest />}>test projects</FeatureListsItem>
          <FeatureListsItem icon={<FaCss3 />}>CSS</FeatureListsItem>
          <FeatureListsItem icon={<FaCode />}>
            other frontend frameworks
          </FeatureListsItem>
          <FeatureListsItem icon={<IoServerSharp />}>
            backend frameworks
          </FeatureListsItem>
          <FeatureListsItem icon={<GrSend />}>news</FeatureListsItem>
          <FeatureListsItem icon={<FaGithub />}>open source</FeatureListsItem>
        </ul>
      </Card>
    </SectionWrapper>
  );
}

export default AndMore;

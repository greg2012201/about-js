import React from "react";
import Title from "../title";
import SectionWrapper from "../section-wrapper";
import Image from "next/image";
import BaseText from "../base-text";
import { twMerge } from "tailwind-merge";
import Card from "../card";
import IconLine from "../icon-line";

type Props = {
  title: string;
  content: string;
  orientation?: "left" | "right";
  imageConfig: {
    src: string;
    alt: string;
  };
};

function ContentContainer({
  content,
  imageConfig: { alt, src },
  title,
  orientation = "left",
}: Props) {
  return (
    <SectionWrapper className="w max-w-1000px h-fit">
      <Card contentClassName="flex max-w-[1000px] space-y-8">
        <div
          className={twMerge(
            `flex flex-col space-y-2 md:grid  md:grid-rows-2 md:space-x-4 md:space-y-0`,
            orientation === "left"
              ? "md:grid-cols-[250px_1fr]"
              : "md:grid-cols-[1fr_250px]",
          )}
        >
          <Image
            src={src}
            className={twMerge(
              `row-span-2 self-center md:w-full`,
              orientation === "left" ? "col-start-1" : "col-start-2",
            )}
            alt={alt}
            width={175}
            height={100}
          />
          <Title
            className={twMerge(
              "row-start-1",
              orientation === "left" ? "col-start-2" : "col-start-1",
            )}
            size="large"
          >
            {title}
          </Title>
          <BaseText
            className={twMerge(
              "row-start-2 md:pr-6",
              orientation === "left" ? "col-start-2" : "col-start-1 md:pr-20",
            )}
          >
            {content}
          </BaseText>
        </div>
      </Card>
    </SectionWrapper>
  );
}

export default ContentContainer;

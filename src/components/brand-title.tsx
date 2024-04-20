import React from "react";

type Props = {
  children: string;
};

function BrandTitle({ children }: Props) {
  return (
    <h1 className="text-5xl leading-tight md:text-7xl xl:text-[80px] ">
      {children}
    </h1>
  );
}

export default BrandTitle;

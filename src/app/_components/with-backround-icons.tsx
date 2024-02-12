"use client";

import Image from "next/image";
import React, { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

function WithBackgroundIcons({ children }: Props) {
  return (
    <div className="relative w-screen">
      <div className="absolute left-0 top-0 flex flex-col opacity-10">
        <Image
          alt="big react icon"
          width={600}
          height={600}
          src="/react-2.svg"
        />
        <Image
          alt="big node.js icon"
          width={600}
          height={600}
          src="/nodejs-icon.svg"
        />
      </div>
      {children}
    </div>
  );
}

export default WithBackgroundIcons;

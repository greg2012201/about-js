import Image from "next/image";
import React from "react";
import Italic from "../italic";

function Intro() {
  return (
    <div className="p-4 text-white">
      <div>
        <h1 className="text-slogan font-light leading-tight">
          What the hack is about.js?
        </h1>
        <p className="text-lg text-accent ">{`JavaScript Blog's Code Hub.`}</p>
      </div>
      <div className="flex h-[350px] items-center p-8">
        <Image
          className="z-10 translate-y-[40px] rounded-md"
          alt="javascript logo"
          width={150}
          height={150}
          src="./logo-javascript.svg"
        />
        <Image
          className="translate-x-[-40px] rounded-md"
          alt="typescript logo"
          width={150}
          height={150}
          src="./logo-typescript.svg"
        />
      </div>
      <Italic>
        My name is Greg and I am here to help you to keep up with the fresh news
        from JS land.
      </Italic>
    </div>
  );
}

export default Intro;

import Image from "next/image";
import React from "react";
import { Subtitle, Title } from "../brand-title";
import { ClassNameValue, twMerge } from "tailwind-merge";
import BaseText from "../base-text";
import dedent from "dedent";

type AvatarProps = { className?: ClassNameValue };

function Avatar({ className }: AvatarProps) {
  return (
    <div>
      <Image
        className={twMerge(className, `rounded-full`)}
        width={300}
        height={300}
        alt="profile picture"
        src="/profile.png"
      />{" "}
    </div>
  );
}

function Profile() {
  return (
    <div className="flex w-full max-w-[930px] items-center space-x-6 py-8">
      <div className="">
        <Avatar className="hidden min-w-[300px] sm:block" />
      </div>
      <div className="flex flex-col space-y-1">
        <Title>Hello👋</Title>
        <Avatar className="sm:hidden" />
        <Subtitle>I am Grzegorz Dubiel</Subtitle>
      </div>
    </div>
  );
}

export default Profile;

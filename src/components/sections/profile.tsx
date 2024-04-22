import Image from "next/image";
import React from "react";
import { Subtitle, Title } from "../brand-title";
import { ClassNameValue, twMerge } from "tailwind-merge";

type AvatarProps = { className?: ClassNameValue };

function Avatar({ className }: AvatarProps) {
  return (
    <div>
      <Image
        className={twMerge(className, `rounded-full`)}
        width={250}
        height={250}
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
        <Avatar className="hidden sm:block" />
      </div>
      <div className="flex flex-col sm:space-y-1">
        <Title>Greetings👋</Title>
        <Subtitle>I am Grzegorz Dubiel</Subtitle>
        <Avatar className="mt-6 sm:hidden" />
      </div>
    </div>
  );
}

export default Profile;

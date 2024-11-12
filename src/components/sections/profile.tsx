import Image from "next/image";
import React from "react";
import { Subtitle, Title } from "../brand-title";
import { ClassNameValue, twMerge } from "tailwind-merge";
import { useTranslations } from "next-intl";
import SocialIcons from "../social-icons";

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
  const t = useTranslations("Profile");

  return (
    <div className="mx-auto flex w-full max-w-[930px] items-center justify-center space-x-6 py-8 sm:justify-start">
      <Avatar className="hidden self-start sm:block" />
      <div className="flex flex-col sm:space-y-1">
        <Title>{t("title")}</Title>
        <Subtitle>{t("subtitle")}</Subtitle>
        <Avatar className="mx-auto mt-6 sm:hidden" />
        <SocialIcons className="self-center pt-4 sm:self-start sm:pt-0" />
      </div>
    </div>
  );
}

export default Profile;

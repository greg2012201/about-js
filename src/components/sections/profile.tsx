"use client";

import Image from "next/image";
import React from "react";
import { Subtitle, Title } from "../brand-title";
import { ClassNameValue, twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="flex w-full max-w-[930px] items-center space-x-6 py-8"
    >
      <div className="">
        <Avatar className="hidden sm:block" />
      </div>
      <div className="flex flex-col sm:space-y-1">
        <Title>Wlcome👋</Title>
        <Subtitle>I am Grzegorz Dubiel</Subtitle>
        <Avatar className="mt-6 sm:hidden" />
      </div>
    </motion.div>
  );
}

export default Profile;

"use client";

import BaseText from "../base-text";
import Title from "../title";
import { motion } from "framer-motion";

function AboutAuthor() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="flex min-h-[400px] w-full max-w-[930px] flex-col space-y-6 px-4 py-4"
    >
      <Title size="large">Who am I?</Title>
      <BaseText>
        {`
        I love creating new things by coding. I have always liked "front side"
        of the cyber world. I have been coding since march of 2020. Before, I've
        always been curious about how user interfaces work behind the scenes and
        how I can create them from a blank page in the code editor. I'm
        fascinated in React, before I met this library I have been coding in
        vanilla JS. When I started learning React I felt tons of possibilities.
        I'm a big fan of Next.js with React Server Components. I like taking on
        difficult programming challenges.`}
      </BaseText>
    </motion.div>
  );
}

export default AboutAuthor;

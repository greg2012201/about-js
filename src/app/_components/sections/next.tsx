"use client";

import { motion } from "framer-motion";
import React from "react";
import Title from "../title";
import Italic from "../italic";

function Next() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      className="min-h-screen"
    >
      <Title>Fresh news about Next.js</Title>
      <Italic>News and outstanding toturials, guides and insights.</Italic>
    </motion.div>
  );
}

export default Next;

"use client";

import { MotionValue, motion } from "framer-motion";

type Props = Record<
  "moveY" | "moveX" | "rotateX" | "rotateY",
  MotionValue<number>
>;
function EyesIcon({ moveY, moveX, rotateX, rotateY }: Props) {
  return (
    <div>
      <motion.svg
        id="emoji"
        viewBox="0 0 72 72"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <motion.ellipse
          cx="19.5477"
          cy="35.9583"
          rx="14.4692"
          ry="24.6554"
          fill="white"
          stroke="#000000"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-miterlimit="10"
          stroke-width="2"
          style={{ rotateX, rotateY }}
        />
        <motion.g style={{ translateX: moveX, translateY: moveY }}>
          <circle cx="13.1058" cy="37.8173" r="3.6229" />
          <circle
            cx="13.1058"
            cy="37.8173"
            r="3.6229"
            fill="none"
            stroke="#000000"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-miterlimit="10"
            stroke-width="2"
          />
          <circle
            cx="13.1058"
            cy="37.8173"
            r="8.0273"
            fill="none"
            stroke="#000000"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-miterlimit="10"
            stroke-width="2"
          />
        </motion.g>
        <motion.ellipse
          cx="52.4523"
          cy="35.9583"
          rx="14.4692"
          ry="24.6554"
          fill="white"
          stroke="#000000"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-miterlimit="10"
          stroke-width="2"
          style={{ rotateX, rotateY }}
        />
        <motion.g style={{ translateX: moveX, translateY: moveY }}>
          <circle cx="46.0104" cy="37.8173" r="3.6229" />
          <circle
            cx="46.0104"
            cy="37.8173"
            r="3.6229"
            fill="none"
            stroke="#000000"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-miterlimit="10"
            stroke-width="2"
          />
          <circle
            cx="46.0104"
            cy="37.8173"
            r="8.0273"
            fill="none"
            stroke="#000000"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-miterlimit="10"
            stroke-width="2"
          />
        </motion.g>
      </motion.svg>
    </div>
  );
}

export default EyesIcon;

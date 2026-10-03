"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "motion/react";

interface ChartLineProps {
  path: string;
  strokeVar?: string;
  duration?: number;
  delay?: number;
  drawn?: boolean;
  preserveAspectRatio?: string;
  viewBox?: string;
  width?: string | number;
  height?: string | number;
  strokeWidth?: string | number;
  className?: string;
}

export default function ChartLine({
  path,
  strokeVar = "var(--color-gold)",
  duration = 1.4,
  delay = 0,
  drawn = false,
  preserveAspectRatio = "none",
  viewBox,
  width = "100%",
  height = "100%",
  strokeWidth = 2,
  className = "",
}: ChartLineProps) {
  const reducedMotion = useReducedMotion();
  
  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      preserveAspectRatio={preserveAspectRatio}
      className={`overflow-visible ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    >
      <motion.path
        d={path}
        fill="none"
        stroke={strokeVar}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: reducedMotion ? 1 : 0 }}
        animate={{ pathLength: drawn || reducedMotion ? 1 : 0 }}
        transition={{
          duration: duration,
          delay: delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
    </svg>
  );
}

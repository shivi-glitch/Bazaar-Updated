import { motion } from "motion/react";

interface ChartLineProps {
  path: string;
  delay?: number;
  color?: string;
  strokeWidth?: number;
}

export function ChartLine({
  path,
  delay = 0,
  color = "var(--color-accent)",
  strokeWidth = 2,
}: ChartLineProps) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1000 400"
      preserveAspectRatio="none"
    >
      <motion.path
        d={path}
        fill="transparent"
        stroke={color}
        strokeWidth={strokeWidth}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.8, delay, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d={path}
        fill="transparent"
        stroke={color}
        strokeWidth={strokeWidth * 3}
        className="blur-md opacity-25"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.8, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

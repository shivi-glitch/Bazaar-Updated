import { motion } from "framer-motion";

export function ChartLine({ path, delay = 0, color = "#3B82F6", strokeWidth = 2 }: { path: string, delay?: number, color?: string, strokeWidth?: number }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 400" preserveAspectRatio="none">
      <motion.path
        d={path}
        fill="transparent"
        stroke={color}
        strokeWidth={strokeWidth}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, delay, ease: "easeInOut" }}
      />
      <motion.path
        d={path}
        fill="transparent"
        stroke={color}
        strokeWidth={strokeWidth * 4}
        className="blur-md opacity-30"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, delay, ease: "easeInOut" }}
      />
    </svg>
  );
}

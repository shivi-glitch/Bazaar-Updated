"use client";

import { motion, useTransform, MotionValue } from "motion/react";
import { ChartLine } from "./ChartLine";
import { PATHS } from "./chart-paths";

export function StoryChart({ progress }: { progress: MotionValue<number> }) {
  // progress: 0 to 2 (0 to 1: Round 1 Retail, 1 to 2: Round 2 Institutional)
  const r1Opacity = useTransform(progress, [0, 0.8, 1.2], [1, 1, 0]);
  const r2Opacity = useTransform(progress, [0.8, 1.2, 2], [0, 1, 1]);

  return (
    <div className="w-full h-full relative bg-bg-raised">
      {/* Grid Lines */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-full h-[1px] bg-bd-subtle" />
        ))}
      </div>

      {/* R1 Retail Chart */}
      <motion.div style={{ opacity: r1Opacity }} className="absolute inset-0">
        <ChartLine
          path={PATHS.storyRetail}
          color="var(--color-tx-secondary)"
          strokeWidth={2.5}
        />
        {/* Subtle technical baseline */}
        <ChartLine
          path="M 0,330 C 150,325 300,300 450,285 C 600,240 750,210 1000,160"
          color="var(--color-bd-strong)"
          strokeWidth={1}
          delay={0.4}
        />
      </motion.div>

      {/* R2 Institutional Chart — Electric Teal & smooth dynamic order flow */}
      <motion.div style={{ opacity: r2Opacity }} className="absolute inset-0">
        {/* Smooth gradient area fill */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1000 400"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="r2AreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`${PATHS.storyInst} L 1000,400 L 0,400 Z`}
            fill="url(#r2AreaGrad)"
          />
        </svg>

        <ChartLine
          path={PATHS.storyInst}
          color="var(--color-accent)"
          strokeWidth={3}
        />

        {/* Volume order wall simulation */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 flex items-end gap-1 px-4 opacity-25 pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className={i % 3 === 0 ? "flex-1 bg-accent" : "flex-1 bg-bd-strong"}
              style={{
                height: `${Math.sin(i * 456.78) * 35 + 45}%`,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

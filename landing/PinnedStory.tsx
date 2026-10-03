"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, useMotionValue, MotionValue } from "motion/react";
import { StoryChart } from "./StoryChart";
import { LANDING_COPY } from "@/lib/landing-content";

function ProgressTicks({ p }: { p: MotionValue<number> }) {
  const t1 = useTransform(p, [0, 0.3, 0.4], [1, 1, 0.3]);
  const t2 = useTransform(p, [0.2, 0.4, 0.6, 0.8], [0.3, 1, 1, 0.3]);
  const t3 = useTransform(p, [0.6, 0.8, 1], [0.3, 1, 1]);

  return (
    <div className="absolute left-6 lg:left-12 top-1/2 -translate-y-1/2 flex flex-col gap-5 z-20">
      <motion.div style={{ opacity: t1 }} className="w-1.5 h-8 rounded-full bg-tx-primary" />
      <motion.div style={{ opacity: t2 }} className="w-1.5 h-8 rounded-full bg-tx-primary" />
      <motion.div style={{ opacity: t3 }} className="w-1.5 h-8 rounded-full bg-tx-primary" />
    </div>
  );
}

function PinnedDesktop() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Sequential staggering avoids overlap. Step 1 goes up and fades away before step 2 enters.
  const step1Opacity = useTransform(scrollYProgress, [0, 0.20, 0.28, 1], [1, 1, 0, 0]);
  const step1Y = useTransform(scrollYProgress, [0, 0.20, 0.28, 1], ["0%", "0%", "-30%", "-30%"]);

  const step2Opacity = useTransform(scrollYProgress, [0, 0.30, 0.38, 0.55, 0.63, 1], [0, 0, 1, 1, 0, 0]);
  const step2Y = useTransform(scrollYProgress, [0, 0.30, 0.38, 0.55, 0.63, 1], ["30%", "30%", "0%", "0%", "-30%", "-30%"]);

  const step3Opacity = useTransform(scrollYProgress, [0, 0.65, 0.73, 1], [0, 0, 1, 1]);
  const step3Y = useTransform(scrollYProgress, [0, 0.65, 0.73, 1], ["30%", "30%", "0%", "0%"]);

  // Derive chapter accent dynamically based on progress
  const bgAccent = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [
    "var(--color-gold-val)",
    "var(--color-gold-val)",
    "var(--color-green-val)",
    "var(--color-green-val)"
  ]);

  return (
    <motion.div ref={containerRef} className="h-[300svh] relative w-full hidden lg:block" style={{ "--chapter-accent": bgAccent } as any}>
      <div className="sticky top-0 h-[100svh] w-full flex items-center overflow-hidden">
        <ProgressTicks p={scrollYProgress} />
        <div className="max-w-7xl mx-auto w-full px-8 lg:px-24 grid grid-cols-[1fr_1.2fr] gap-16 items-center">

          {/* Text Steps */}
          <div className="relative h-[240px]">
            <motion.div style={{ opacity: step1Opacity, y: step1Y }} className="absolute inset-0 flex flex-col justify-center">
              <h2 className="text-chapter text-tx-primary">{LANDING_COPY.story[0].h2}</h2>
              <p className="text-body text-tx-dim mt-6">{LANDING_COPY.story[0].body}</p>
            </motion.div>
            <motion.div style={{ opacity: step2Opacity, y: step2Y }} className="absolute inset-0 flex flex-col justify-center pointer-events-none">
              <h2 className="text-chapter text-tx-primary">{LANDING_COPY.story[1].h2}</h2>
              <p className="text-body text-tx-dim mt-6">{LANDING_COPY.story[1].body}</p>
            </motion.div>
            <motion.div style={{ opacity: step3Opacity, y: step3Y }} className="absolute inset-0 flex flex-col justify-center pointer-events-none">
              <h2 className="text-chapter text-tx-primary">{LANDING_COPY.story[2].h2}</h2>
              <p className="text-body text-tx-dim mt-6">{LANDING_COPY.story[2].body}</p>
            </motion.div>
          </div>

          {/* Dynamic Chart */}
          <StoryChart p={scrollYProgress} />
        </div>
      </div>
    </motion.div>
  );
}

function StackedStep({ index, pValue }: { index: number, pValue: number }) {
  const p = useMotionValue(pValue);
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="text-chapter text-tx-primary mb-5">{LANDING_COPY.story[index].h2}</h2>
        <p className="text-body text-tx-dim">{LANDING_COPY.story[index].body}</p>
      </div>
      <StoryChart p={p} isMobile />
    </div>
  );
}

function StackedStory() {
  return (
    <div className="flex flex-col gap-32 py-32 px-5 sm:px-8 max-w-2xl mx-auto w-full">
      <StackedStep index={0} pValue={0} />
      <StackedStep index={1} pValue={0.5} />
      <StackedStep index={2} pValue={1} />
    </div>
  );
}

export default function PinnedStory() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div className="w-full">
        <StackedStory />
      </div>
    );
  }

  return (
    <>
      <PinnedDesktop />
      <div className="block lg:hidden w-full">
        <StackedStory />
      </div>
    </>
  );
}

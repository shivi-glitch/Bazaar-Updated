"use client";

import { useScroll, useTransform, motion } from "motion/react";
import { useRef } from "react";
import { StoryChart } from "./StoryChart";

const rounds = [
  {
    label: "Round 1 · Retail",
    labelColor: "text-tx-secondary",
    labelBg: "bg-bg-raised border-bd-subtle",
    title: "Baseline Markets",
    body: "Start with ₹10,00,000. Navigate standard technical overlays — SMA 9, SMA 20, RSI. Build wealth in a steady, predictable retail environment before the real game begins.",
  },
  {
    label: "Round 2 · Institutional",
    labelColor: "text-accent",
    labelBg: "bg-accent-dim border-accent-border",
    title: "The AI Order Flow",
    body: "Scale to ₹1,00,00,000. The market now reacts to you. Institutional order-flow, bid/ask volume walls, and aggressive AI bots enter the arena.",
  },
];

export function PinnedStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const sectionProgress = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 2]);
  const opacity1 = useTransform(scrollYProgress, [0, 0.2, 0.45, 0.55], [1, 1, 0, 0]);
  const opacity2 = useTransform(scrollYProgress, [0.45, 0.6, 0.8, 1], [0, 1, 1, 1]);
  const opacities = [opacity1, opacity2];

  return (
    <div ref={containerRef} id="explore" className="relative h-[280svh] bg-bg-void">
      <div className="sticky top-0 h-[100dvh] w-full flex items-center justify-center overflow-hidden">

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #222222 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.6,
          }}
          aria-hidden="true"
        />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-void to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 z-10 items-center">

          {/* Text panel */}
          <div className="relative min-h-[260px] lg:min-h-[340px]">
            {rounds.map((round, idx) => (
              <motion.div
                key={idx}
                style={{ opacity: opacities[idx] }}
                className="absolute inset-0 flex flex-col justify-center"
              >
                {/* Round label */}
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-sm border text-[11px] font-mono uppercase tracking-[0.1em] font-bold mb-5 w-fit ${round.labelBg} ${round.labelColor}`}
                >
                  {round.label}
                </div>

                {/* Heading */}
                <h2
                  className="font-sans font-bold tracking-[-0.03em] leading-[1.0] text-tx-primary text-balance mb-5"
                  style={{ fontSize: "var(--text-display-md)" }}
                >
                  {round.title}
                </h2>

                {/* Body */}
                <p
                  className="text-tx-secondary leading-[1.65] max-w-lg"
                  style={{ fontSize: "var(--text-body-lg)" }}
                >
                  {round.body}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Chart */}
          <div className="w-full h-[42vh] lg:h-[56vh] bg-bg-raised border border-bd-subtle rounded-lg overflow-hidden shadow-card">
            <StoryChart progress={sectionProgress} />
          </div>

        </div>

        {/* Round progress dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2" aria-hidden="true">
          <motion.div
            style={{ opacity: useTransform(scrollYProgress, [0, 0.5], [1, 0.3]) }}
            className="w-2 h-2 rounded-full bg-accent"
          />
          <motion.div
            style={{ opacity: useTransform(scrollYProgress, [0.4, 0.8], [0.3, 1]) }}
            className="w-2 h-2 rounded-full bg-accent"
          />
        </div>
      </div>
    </div>
  );
}

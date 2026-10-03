"use client";

import Link from "next/link";
import { m, LazyMotion, domAnimation } from "motion/react";
import { LANDING_COPY } from "@/lib/landing-content";
import ChartLine from "./ChartLine";
import { PATHS } from "./chart-paths";

export default function Hero() {
  // Stagger config: headlines (0, 0.08s), subtext (0.16s), buttons (0.24s).
  // Line chart draws after 0.4s delay.
  
  const textVariant = {
    hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } 
    }
  };

  const h1Lines = ["Trade the market.", "Beat the room."];

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 lg:px-8 text-center pt-16 sm:pt-20 lg:pt-24 min-h-[70vh] sm:min-h-[75vh] w-full">
        
        {/* Main Content */}
        <m.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } }
          }}
          className="relative z-20 flex flex-col items-center w-full max-w-4xl mx-auto"
        >
          <h1 className="text-display flex flex-col items-center gap-1 sm:gap-2 text-tx-primary">
            {h1Lines.map((line, i) => (
              <m.span key={i} variants={textVariant} className="block">
                {line}
              </m.span>
            ))}
          </h1>
          
          <m.p variants={textVariant} className="text-body text-tx-dim mt-6 sm:mt-8 max-w-2xl mx-auto">
            {LANDING_COPY.hero.sub}
          </m.p>

          <m.div variants={textVariant} className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-8 sm:mt-10">
            <Link 
              href="/login"
              className="px-6 py-3 rounded-[10px] bg-tx-primary text-base font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo shadow-lg"
              style={{ color: "var(--bg-base)" }}
            >
              {LANDING_COPY.hero.primaryBtn}
            </Link>
            <Link 
              href="#rounds"
              className="text-sm font-semibold text-tx-dim hover:text-tx-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo px-4 py-3"
            >
              {LANDING_COPY.hero.secondaryBtn}
            </Link>
          </m.div>
        </m.div>

        {/* Full-bleed Line Chart Environment */}
        <div className="absolute bottom-0 left-0 right-0 w-full h-[280px] sm:h-[340px] pointer-events-none overflow-visible">
          {/* Faint Grid */}
          <div className="absolute inset-0 opacity-[0.08]">
            <svg width="100%" height="100%" preserveAspectRatio="none">
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <ChartLine 
            path={PATHS.heroLine}
            strokeVar="var(--color-indigo-val)"
            drawn={true}
            delay={0.4}
            duration={1.4}
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full opacity-40"
          />

          {/* Pulse Dot at end of line (absolute positioned at 100% x, 30% y matching path endpoint) */}
          <div 
            className="absolute z-10 w-3 h-3 rounded-full bg-indigo animate-pulse-dot"
            style={{ left: "100%", top: "30%", transform: "translate(-50%, -50%)" }}
          />
        </div>
      </div>
    </LazyMotion>
  );
}

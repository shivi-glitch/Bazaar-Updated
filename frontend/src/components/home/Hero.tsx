"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "../ui/Button";
import { HeroMarketVisual } from "./HeroMarketVisual";
import "./hero.css";

export function Hero() {
  const reduce = useReducedMotion();

  const d = (val: number) => (reduce ? 0 : val);

  const scrollTo = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="main-content"
      className="relative w-full min-h-[100dvh] flex flex-col justify-center items-center overflow-hidden bg-bg-void pt-20 sm:pt-24 pb-12 sm:pb-16 text-center"
      aria-label="Hero"
    >
      {/* Background ambient radial gradients */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] pointer-events-none rounded-full"
        style={{
          background: "radial-gradient(circle at center, rgba(0, 212, 170, 0.10) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
        aria-hidden="true"
      />

      {/* Main Single-Column Centered Flow */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center relative z-10 my-auto">

        {/* 1. Badge (Above SVG) - Fades in first */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: d(0.15), ease: [0.22, 1, 0.36, 1] }}
          className="mb-2 sm:mb-3"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-accent-dim border border-accent-border font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-accent font-semibold">
            <span className="hero-cursor-blink w-[5px] h-[10px] bg-accent inline-block" />
            Meridian Exchange
          </span>
        </motion.div>

        {/* 2. Heading (Above SVG) - Reduced, refined size - Fades in second */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: d(0.35), ease: [0.22, 1, 0.36, 1] }}
          className="font-sans font-bold tracking-[-0.03em] leading-[1.06] text-tx-primary text-balance mb-2"
          style={{ fontSize: "clamp(30px, 4.8vw, 54px)" }}
        >
          Read the news. <span className="text-accent">Move first.</span>
        </motion.h1>

        {/* 3. Pure SVG in the Center of screen (NO container/frame) - Fades in third */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, delay: d(0.55), ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[460px] sm:max-w-[580px] md:max-w-[660px] aspect-[1618/972] my-4 sm:my-6 md:my-7 flex items-center justify-center"
        >
          {/* Subtle ambient glow behind the SVG */}
          <div
            className="absolute inset-0 bg-accent/15 blur-[65px] rounded-full scale-75 pointer-events-none"
            aria-hidden="true"
          />

          {/* Live SVG illustration with cycling ticker screens */}
          <HeroMarketVisual />
        </motion.div>

        {/* 4. Main Content / Subtext (Below SVG) - Fades in fourth */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: d(0.75), ease: [0.22, 1, 0.36, 1] }}
          className="text-tx-secondary leading-[1.6] max-w-xl mx-auto mb-6 sm:mb-8 text-balance"
          style={{ fontSize: "clamp(14px, 1.3vw, 16px)" }}
        >
          A live stock market where every headline moves prices.
          <br />
          Trade against teams, the bots, and the clock
          <br />
          in high-frequency simulated market environments.
        </motion.p>

        {/* 5. CTA Action Buttons (Below SVG and Subtext) - Fades in fifth */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: d(0.95), ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
        >
          <Link href="/login" tabIndex={-1}>
            <Button
              size="lg"
              className="group gap-2 font-mono uppercase tracking-[0.08em] shadow-[0_0_24px_rgba(0,212,170,0.25)] text-[12px] sm:text-[13px] px-6 py-3 h-auto"
            >
              Join the session
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" />
            </Button>
          </Link>

          <a
            href="#explore"
            onClick={scrollTo("explore")}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md border border-bd-subtle text-tx-secondary hover:text-tx-primary hover:border-bd-strong text-[12px] sm:text-[13px] font-mono transition-colors duration-150"
          >
            How it works
            <ChevronDown className="w-4 h-4 opacity-70" />
          </a>
        </motion.div>

        {/* 6. Telemetry Indicator - Fades in sixth */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: d(1.15) }}
          className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-mono text-tx-muted"
        >
          <span className="flex items-center gap-1.5 text-gain font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
            LIVE MATCHING
          </span>
          <span className="text-bd-strong">/</span>
          <span>TWO-PHASE ENGINE</span>
          <span className="text-bd-strong">/</span>
          <span>STOCHASTIC ROUND 2</span>
        </motion.div>

      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: d(1.35), duration: 0.6 }}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        aria-hidden="true"
      >
        <div className="w-[1px] h-5 hero-scroll-line bg-bd-strong" />
        <div className="hero-scroll-dot w-[3px] h-[3px] rounded-full bg-accent" />
      </motion.div>
    </section>
  );
}

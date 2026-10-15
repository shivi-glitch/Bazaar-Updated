"use client";

import { motion } from "motion/react";
import { BookOpen, Wallet, Zap, Layers, Radio, Activity, Cpu } from "lucide-react";

export function NewsRace() {
  return (
    <section id="upgrades" className="bg-bg-void py-24 sm:py-28 border-t border-bd-subtle relative overflow-hidden">
      {/* Ambient background accent glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[400px] pointer-events-none rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0, 212, 170, 0.07) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-accent-dim border border-accent-border text-[11px] font-mono uppercase tracking-[0.1em] font-bold mb-4 text-accent">
            <Radio className="w-3.5 h-3.5 text-accent animate-pulse" />
            The Stat Shop
          </div>
          <h2
            className="font-sans font-bold tracking-[-0.03em] leading-[1.05] text-tx-primary text-balance mb-4"
            style={{ fontSize: "var(--text-display-md)" }}
          >
            The Stat Shop
          </h2>
          <p
            className="text-tx-secondary leading-[1.6] max-w-2xl"
            style={{ fontSize: "var(--text-body-lg)" }}
          >
            A strategic marketplace where teams reinvest trading profits to upgrade terminal capabilities, expand capital efficiency, and sharpen execution as the market evolves.
          </p>
        </div>

        {/* ─── Premium Asymmetric Bento Box Layout ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">

          {/* ── BENTO ITEM 1 (lg:col-span-7) — Market Intelligence ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 bg-bg-raised/75 border border-bd-subtle hover:border-accent-border/60 rounded-xl p-6 sm:p-7 shadow-card relative overflow-hidden group flex flex-col justify-between transition-all"
          >
            {/* Corner accent glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none group-hover:bg-accent/20 transition-all duration-300" />

            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-lg bg-accent-dim border border-accent-border flex items-center justify-center text-accent">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-sm bg-bg-void border border-bd-subtle text-accent font-bold">
                  Intelligence Feed
                </span>
              </div>

              <h3 className="font-sans font-bold text-[20px] sm:text-[22px] text-tx-primary tracking-tight mb-2">
                Market Intelligence
              </h3>
              <p className="text-tx-secondary text-[14px] sm:text-[15px] leading-relaxed max-w-xl mb-6">
                Enhance terminal news feeds and information velocity to react quickly to breaking market events.
              </p>
            </div>

            {/* Abstract Visual Telemetry Widget */}
            <div className="bg-bg-void/80 border border-bd-subtle rounded-lg p-3.5 space-y-2 mt-auto">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-tx-muted flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  FEED VELOCITY
                </span>
                <span className="text-accent font-bold">PRIORITY CHANNEL</span>
              </div>
              <div className="h-1.5 w-full bg-bg-raised rounded-full overflow-hidden flex">
                <div className="h-full bg-gradient-to-r from-accent/40 via-accent to-accent/80 w-[78%] rounded-full" />
              </div>
            </div>
          </motion.div>

          {/* ── BENTO ITEM 2 (lg:col-span-5) — Capital Flexibility ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 bg-bg-raised/75 border border-bd-subtle hover:border-warn-border/60 rounded-xl p-6 sm:p-7 shadow-card relative overflow-hidden group flex flex-col justify-between transition-all"
          >
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-warn/10 rounded-full blur-3xl pointer-events-none group-hover:bg-warn/15 transition-all duration-300" />

            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-lg bg-warn/15 border border-warn-border flex items-center justify-center text-warn">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-sm bg-bg-void border border-bd-subtle text-warn font-bold">
                  Ledger Scaling
                </span>
              </div>

              <h3 className="font-sans font-bold text-[20px] sm:text-[22px] text-tx-primary tracking-tight mb-2">
                Capital Flexibility
              </h3>
              <p className="text-tx-secondary text-[14px] sm:text-[15px] leading-relaxed mb-6">
                Expand position limits, trading capacity, and capital efficiency as your portfolio grows.
              </p>
            </div>

            {/* Tier Allocation Visual Widget */}
            <div className="grid grid-cols-3 gap-2 mt-auto">
              {["TIER I", "TIER II", "TIER III"].map((tier, i) => (
                <div
                  key={tier}
                  className={`bg-bg-void/80 border rounded-lg py-2 text-center font-mono ${i === 0
                      ? "border-warn-border/40 text-warn"
                      : i === 1
                        ? "border-bd-subtle text-tx-secondary"
                        : "border-bd-hairline text-tx-muted opacity-60"
                    }`}
                >
                  <div className="text-[10px] uppercase font-bold">{tier}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── BENTO ITEM 3 (lg:col-span-5) — Execution Routing ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 bg-bg-raised/75 border border-bd-subtle hover:border-accent-border/60 rounded-xl p-6 sm:p-7 shadow-card relative overflow-hidden group flex flex-col justify-between transition-all"
          >
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none group-hover:bg-accent/20 transition-all duration-300" />

            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-lg bg-accent-dim border border-accent-border flex items-center justify-center text-accent">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-sm bg-bg-void border border-bd-subtle text-accent font-bold">
                  Ultra-Fast
                </span>
              </div>

              <h3 className="font-sans font-bold text-[20px] sm:text-[22px] text-tx-primary tracking-tight mb-2">
                Execution Routing
              </h3>
              <p className="text-tx-secondary text-[14px] sm:text-[15px] leading-relaxed mb-6">
                Improve order latency and queue priority to optimize fills during high-volatility sessions.
              </p>
            </div>

            {/* Pipeline Stage Indicators */}
            <div className="bg-bg-void/80 border border-bd-subtle rounded-lg p-3 flex items-center justify-between mt-auto font-mono text-[11px]">
              <div className="flex items-center gap-1.5 text-accent">
                <Cpu className="w-3.5 h-3.5" />
                <span className="font-bold">QUEUE PRIORITY</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-accent-dim text-accent border border-accent-border font-bold">
                ACCELERATED
              </span>
            </div>
          </motion.div>

          {/* ── BENTO ITEM 4 (lg:col-span-7) — Depth Analytics ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 bg-bg-raised/75 border border-bd-subtle hover:border-cyan-500/50 rounded-xl p-6 sm:p-7 shadow-card relative overflow-hidden group flex flex-col justify-between transition-all"
          >
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-300" />

            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-sm bg-bg-void border border-bd-subtle text-cyan-400 font-bold">
                  Microstructure
                </span>
              </div>

              <h3 className="font-sans font-bold text-[20px] sm:text-[22px] text-tx-primary tracking-tight mb-2">
                Depth Analytics
              </h3>
              <p className="text-tx-secondary text-[14px] sm:text-[15px] leading-relaxed max-w-xl mb-6">
                Unlock advanced order flow visibility and market microstructure telemetry in further rounds.
              </p>
            </div>

            {/* Depth Telemetry Visualization (Abstract, No Spoilers) */}
            <div className="bg-bg-void/80 border border-bd-subtle rounded-lg p-3.5 space-y-2 mt-auto">
              <div className="flex items-center justify-between text-[11px] font-mono text-tx-muted">
                <span className="text-cyan-400 flex items-center gap-1.5 font-bold">
                  <Activity className="w-3.5 h-3.5" />
                  ORDER FLOW TELEMETRY
                </span>
                <span className="text-tx-secondary">LEVEL 2 VISIBILITY</span>
              </div>
              <div className="h-2 w-full bg-bg-raised rounded-full overflow-hidden flex gap-1">
                <div className="h-full bg-gradient-to-r from-cyan-500/20 to-cyan-400 w-[60%] rounded-l-full" />
                <div className="h-full bg-gradient-to-r from-loss/60 to-loss/30 w-[40%] rounded-r-full" />
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}

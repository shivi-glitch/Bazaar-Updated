"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, Zap, ArrowUpRight } from "lucide-react";
import { Button } from "../ui/Button";

export function FinalCta() {
  const scrollTo = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative bg-bg-void border-t border-bd-subtle overflow-hidden">
      {/* Top divider accent */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-40" />

      {/* ─── Streamlined "Login to Trade" CTA Section ─── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center relative z-10">
        {/* Glow behind the CTA card */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] pointer-events-none rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0, 212, 170, 0.12) 0%, transparent 70%)",
            filter: "blur(70px)",
          }}
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl bg-bg-raised/70 border border-bd-subtle p-8 sm:p-12 md:p-16 shadow-2xl backdrop-blur-sm"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-accent-dim border border-accent-border text-[11px] font-mono uppercase tracking-[0.1em] font-bold mb-6 text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse inline-block" />
            Live Trading Floor
          </div>

          {/* Heading */}
          <h2
            className="font-sans font-bold tracking-[-0.04em] leading-[1.0] text-tx-primary mb-4 text-balance"
            style={{ fontSize: "var(--text-display-md)" }}
          >
            Ready to Take Your Position?
          </h2>

          {/* Subtext */}
          <p
            className="text-tx-secondary leading-relaxed max-w-lg mx-auto mb-9"
            style={{ fontSize: "var(--text-body-lg)" }}
          >
            Log in with your credentials to access the live trading interface.
          </p>

          {/* Login to Trade CTA Button */}
          <div className="flex justify-center">
            <Link href="/login" tabIndex={-1}>
              <Button
                size="lg"
                className="group gap-2.5 font-mono uppercase tracking-[0.08em] px-8 py-3.5 text-[14px] shadow-[0_0_30px_rgba(0,212,170,0.3)] hover:shadow-[0_0_40px_rgba(0,212,170,0.45)] transition-all"
              >
                Login to Trade
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ─── Footer ─── */}
      <footer className="border-t border-bd-subtle bg-bg-raised/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          {/* Top Row: Brand & Live Engine Status */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-bd-hairline">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <span className="text-[20px] font-bold tracking-[-0.03em] text-tx-primary flex items-center gap-1.5">
                <span>EIC</span>
                <span className="text-accent font-mono font-bold text-[15px]">X</span>
                <span>Bazaar</span>
              </span>
              <span className="hidden sm:inline text-bd-strong">|</span>
            </div>
          </div>

          {/* Middle Row: Clean Navigation Links */}
          <div className="py-6 flex flex-wrap items-center justify-between gap-6 text-[13px]">
            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              <a
                href="#main-content"
                onClick={scrollTo("main-content")}
                className="text-tx-secondary hover:text-tx-primary transition-colors"
              >
                Home Overview
              </a>
              <a
                href="#explore"
                onClick={scrollTo("explore")}
                className="text-tx-secondary hover:text-tx-primary transition-colors"
              >
                How It Works
              </a>
              <a
                href="#upgrades"
                onClick={scrollTo("upgrades")}
                className="text-tx-secondary hover:text-tx-primary transition-colors"
              >
                Stat Shop
              </a>
              <a
                href="#competition"
                onClick={scrollTo("competition")}
                className="text-tx-secondary hover:text-accent transition-colors flex items-center gap-1.5"
              >
                <span>Leaderboard</span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              </a>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-[13px] font-mono font-medium text-accent hover:text-tx-primary transition-colors"
            >
              <span>Participant Login</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Bottom Row: Copyright & Legal */}
          <div className="pt-6 border-t border-bd-hairline flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] font-mono text-tx-muted">
            <div>
              © {new Date().getFullYear()} E-Summit 2026. All rights reserved.
            </div>
            <a
              href="https://shivamsharma-208.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center sm:items-end text-center sm:text-right transition-all duration-200 hover:opacity-95"
            >
              <span className="text-[13px] sm:text-[14px] text-tx-primary group-hover:text-accent transition-colors flex items-center gap-1.5 font-medium">
                Designed and Developed by <span className="text-accent underline underline-offset-4 decoration-accent/40 group-hover:decoration-accent font-semibold">Shivam</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-accent/80 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </span>
              <span className="text-[12px] sm:text-[13px] text-tx-secondary group-hover:text-tx-primary transition-colors mt-0.5">
                For the Love of markets :)
              </span>
            </a>
          </div>
        </div>
      </footer>
    </section>
  );
}

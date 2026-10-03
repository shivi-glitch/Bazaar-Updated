"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { LANDING_COPY, EVENT_DETAILS } from "@/lib/landing-content";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LandingNav() {
  const { scrollY, scrollYProgress } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (v) => {
      if (v > 8 && !isScrolled) setIsScrolled(true);
      if (v <= 8 && isScrolled) setIsScrolled(false);
    });
  }, [scrollY, isScrolled]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-colors duration-300 ${
        isScrolled
          ? "bg-base/70 backdrop-blur-xl border-b border-bd-subtle"
          : "bg-transparent border-transparent"
      }`}
    >
      <motion.div
        className="absolute bottom-[-1px] left-0 h-[2px] bg-indigo origin-left z-10 w-full"
        style={{ scaleX: scrollYProgress }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-bold text-xl tracking-tight text-tx-primary">
            {LANDING_COPY.nav.wordmark}
          </span>
          <span className="hidden md:inline-flex items-center gap-2 rounded-full border border-bd-subtle bg-tx-primary/5 px-3 py-1 text-xs font-medium text-tx-dim">
            {LANDING_COPY.nav.badge}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {LANDING_COPY.nav.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-tx-dim hover:text-tx-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-[10px] border border-bd-subtle bg-tx-primary/5 px-4 py-2 text-sm font-semibold text-tx-primary hover:border-indigo/50 hover:bg-indigo/10 transition-all"
          >
            {LANDING_COPY.nav.button}
          </Link>
        </div>
      </div>
    </nav>
  );
}

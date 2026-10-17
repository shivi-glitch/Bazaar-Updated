"use client";

import Link from "next/link";
import { Button } from "../ui/Button";

export function LandingNav() {

  const scrollTo = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-bd-subtle bg-bg-void/85 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left — wordmark + badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/"
            className="text-[18px] sm:text-[21px] font-bold tracking-[-0.03em] text-tx-primary leading-none flex items-center gap-1.5"
          >
            <span>EIC</span>
            <span className="text-accent font-mono font-bold text-[14px] sm:text-[16px]">X</span>
            <span>Bazaar</span>
          </Link>
          <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-sm bg-accent-dim border border-accent-border text-[9px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.08em] text-accent">
            University Edition
          </span>
        </div>

        {/* Right — all navigation items visible at all times */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 shrink-0">
          <a
            href="#explore"
            onClick={scrollTo("explore")}
            className="hidden sm:inline-block text-[12px] sm:text-[13px] font-medium text-tx-secondary hover:text-tx-primary transition-colors duration-150"
          >
            How it works
          </a>
          <a
            href="#upgrades"
            onClick={scrollTo("upgrades")}
            className="hidden sm:inline-block text-[12px] sm:text-[13px] font-medium text-tx-secondary hover:text-tx-primary transition-colors duration-150"
          >
            Stat Shop
          </a>
          <a
            href="#competition"
            onClick={scrollTo("competition")}
            className="hidden sm:inline-block text-[12px] sm:text-[13px] font-medium text-tx-secondary hover:text-tx-primary transition-colors duration-150"
          >
            Leaderboard
          </a>

          <Link href="/login" tabIndex={-1}>
            <Button
              variant="secondary"
              size="md"
              className="text-[12px] sm:text-[13px] px-3 sm:px-4 py-1.5 h-auto font-medium"
            >
              Login
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface TickerInfo {
  ticker: string;
  name: string;
  sector: string;
  price: string;
  change: string;
  isPositive: boolean;
  archetype: string;
  orderVolume: string;
}

export const HERO_TICKERS: TickerInfo[] = [
  {
    ticker: "RLNT",
    name: "Reliant Energy Corp",
    sector: "Energy",
    price: "₹2,914.50",
    change: "+2.4%",
    isPositive: true,
    archetype: "Mean-Reverting",
    orderVolume: "14,500 sh",
  },
  {
    ticker: "INFN",
    name: "Infinity Systems",
    sector: "Technology",
    price: "₹1,842.20",
    change: "+1.8%",
    isPositive: true,
    archetype: "Trending",
    orderVolume: "22,800 sh",
  },
  {
    ticker: "BZR-V",
    name: "Bazaar Volatility",
    sector: "High-Beta",
    price: "₹348.60",
    change: "+8.9%",
    isPositive: true,
    archetype: "Volatile",
    orderVolume: "48,200 sh",
  },
  {
    ticker: "GOLDCORE",
    name: "Gold Safe Haven",
    sector: "Safe Haven",
    price: "₹7,420.00",
    change: "+0.4%",
    isPositive: true,
    archetype: "Safe Haven",
    orderVolume: "8,900 sh",
  },
  {
    ticker: "PULSE",
    name: "Pulsechain Token",
    sector: "Speculative",
    price: "₹194.20",
    change: "-4.2%",
    isPositive: false,
    archetype: "Volatile",
    orderVolume: "31,400 sh",
  },
  {
    ticker: "HRZN",
    name: "Horizon Commercial Bank",
    sector: "Banking",
    price: "₹1,684.00",
    change: "+0.9%",
    isPositive: true,
    archetype: "Mean-Reverting",
    orderVolume: "19,200 sh",
  },
  {
    ticker: "TYRL",
    name: "Tyrell Autoworks",
    sector: "Industrials",
    price: "₹1,124.00",
    change: "+3.1%",
    isPositive: true,
    archetype: "Mean-Reverting",
    orderVolume: "16,700 sh",
  },
  {
    ticker: "NIMBUS",
    name: "Nimbus Cloud AI",
    sector: "Cloud AI",
    price: "₹865.50",
    change: "+5.7%",
    isPositive: true,
    archetype: "Trending",
    orderVolume: "26,100 sh",
  },
  {
    ticker: "VOLTAGE",
    name: "Voltage Power",
    sector: "Utilities",
    price: "₹542.00",
    change: "+1.9%",
    isPositive: true,
    archetype: "Trending",
    orderVolume: "11,300 sh",
  },
  {
    ticker: "CRANE",
    name: "Crane Heavy Eng",
    sector: "Heavy Eng",
    price: "₹412.30",
    change: "-1.1%",
    isPositive: false,
    archetype: "Mean-Reverting",
    orderVolume: "9,400 sh",
  },
  {
    ticker: "STAPLE",
    name: "Staple Consumer",
    sector: "Defensive",
    price: "₹928.00",
    change: "+0.3%",
    isPositive: true,
    archetype: "Safe Haven",
    orderVolume: "7,500 sh",
  },
];

export function HeroMarketVisual() {
  const [tickerIndex, setTickerIndex] = useState(0);

  // Cycle tickers every 2.4 seconds like Groww / live market display
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % HERO_TICKERS.length);
    }, 2400);

    return () => clearInterval(timer);
  }, []);

  const current = HERO_TICKERS[tickerIndex];

  return (
    <div className="relative w-full h-full select-none">
      {/* ── Base Naked SVG illustration ── */}
      <img
        src="/svg.svg"
        alt="EIC X Bazaar Market Simulation"
        className="w-full h-full object-contain select-none pointer-events-none transition-transform duration-500 hover:scale-[1.01]"
        loading="eager"
      />

      {/* ── 1. BILLBOARD SCREEN OVERLAY (Right-hand isometric screen) ── */}
      <div
        className="absolute pointer-events-none overflow-hidden flex flex-col justify-center items-center text-center rounded-[3px] shadow-[0_0_12px_rgba(0,212,170,0.35)]"
        style={{
          left: "69.0%",
          top: "24.5%",
          width: "8.6%",
          height: "9.6%",
          transform: "rotate(-11deg) skewX(-12deg)",
          background: "linear-gradient(145deg, rgba(5, 25, 28, 0.95) 0%, rgba(2, 12, 16, 0.98) 100%)",
          border: "1px solid rgba(0, 212, 170, 0.65)",
        }}
      >
        {/* Subtle scanline CRT effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, rgba(0,212,170,0.3) 0px, transparent 1px, transparent 2px)",
          }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={current.ticker}
            initial={{ opacity: 0, y: 7, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -7, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full px-0.5 flex flex-col items-center justify-center leading-none"
          >
            <span
              className="font-mono font-bold uppercase tracking-tight text-accent truncate max-w-full drop-shadow-[0_0_6px_rgba(0,212,170,0.8)]"
              style={{ fontSize: "clamp(6px, 0.85vw, 11px)" }}
            >
              {current.ticker}
            </span>

            <span
              className="font-mono font-semibold tabular-nums text-tx-primary mt-[2px] tracking-tight"
              style={{ fontSize: "clamp(5px, 0.72vw, 9.5px)" }}
            >
              {current.price}
            </span>

            <span
              className={`font-mono font-bold tabular-nums mt-[1.5px] flex items-center justify-center gap-0.5 ${
                current.isPositive ? "text-gain" : "text-loss"
              }`}
              style={{ fontSize: "clamp(5px, 0.65vw, 8.5px)" }}
            >
              <span>{current.isPositive ? "▲" : "▼"}</span>
              {current.change}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── 2. CENTRAL BUILDING TICKER DISPLAY (Tilted along isometric roof plane beside MERX, not cutting it) ── */}
      <div
        className="absolute pointer-events-none overflow-hidden flex items-center justify-center px-1 rounded-[2px]"
        style={{
          left: "48.0%",
          top: "43.0%",
          width: "12.2%",
          height: "3.6%",
          transform: "skewY(26.5deg)",
          background: "linear-gradient(90deg, rgba(3, 22, 24, 0.92) 0%, rgba(6, 38, 40, 0.92) 100%)",
          border: "1px solid rgba(0, 212, 170, 0.6)",
          boxShadow: "0 0 10px rgba(0, 212, 170, 0.22), inset 0 0 5px rgba(0, 212, 170, 0.15)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.ticker}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="flex items-center justify-between w-full font-mono text-center leading-none"
          >
            <div className="flex items-center gap-0.5 min-w-0">
              <span className="w-1 h-1 rounded-full bg-accent animate-pulse shrink-0" />
              <span
                className="font-bold text-accent uppercase tracking-wider whitespace-nowrap"
                style={{ fontSize: "clamp(5px, 0.66vw, 8.5px)" }}
              >
                {current.ticker}
              </span>
            </div>

            <span
              className={`font-bold tabular-nums ml-1 whitespace-nowrap ${current.isPositive ? "text-gain" : "text-loss"}`}
              style={{ fontSize: "clamp(4.8px, 0.64vw, 8px)" }}
            >
              {current.change}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

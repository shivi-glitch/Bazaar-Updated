"use client";

import { useState } from "react";
import { Lock, Layers, HelpCircle, Shield, TrendingUp, TrendingDown } from "lucide-react";

interface OrderDepthProps {
  isActive: boolean;
  orderBook?: { bids: [number, number][]; asks: [number, number][] };
}

export function OrderDepth({ isActive, orderBook }: OrderDepthProps) {
  const [showGuide, setShowGuide] = useState(false);

  // ROUND 1: LOCKED STATE
  if (!isActive) {
    return (
      <div className="bg-bg-raised/70 border border-bd-subtle rounded-xl p-6 sm:p-8 h-[200px] flex flex-col items-center justify-center relative overflow-hidden group shadow-card">
        <div className="w-10 h-10 bg-bg-base border border-bd-subtle rounded-full flex items-center justify-center mb-3 relative z-10 text-tx-muted">
          <Lock className="w-4 h-4" />
        </div>
        <h3 className="text-[12px] font-mono font-bold text-tx-secondary uppercase tracking-widest relative z-10">
          Level 2 Depth of Market (DOM)
        </h3>
        <p className="text-[11px] text-tx-muted mt-1 uppercase tracking-widest font-mono relative z-10">
          Unlocks in Institutional Round (Session 7+)
        </p>
      </div>
    );
  }

  // ROUND 2: LIVE DOM
  const bids = orderBook?.bids || [];
  const asks = orderBook?.asks || [];
  const totalBidSize = bids.reduce((acc, curr) => acc + curr[1], 0);
  const totalAskSize = asks.reduce((acc, curr) => acc + curr[1], 0);
  
  let imbalance = 50;
  if (totalBidSize + totalAskSize > 0) {
    imbalance = (totalBidSize / (totalBidSize + totalAskSize)) * 100;
  }

  const bestBid = bids[0]?.[0] || 0;
  const bestAsk = asks[0]?.[0] || 0;
  const spreadPaise = Math.max(0, bestAsk - bestBid);
  const spreadPct = bestBid > 0 ? (spreadPaise / bestBid) * 100 : 0;

  // Max row size for horizontal depth bar rendering
  const maxRowSize = Math.max(
    ...bids.map(b => b[1]),
    ...asks.map(a => a[1]),
    15000
  );

  // Determine market order flow bias
  let sentimentBadge = {
    label: "Balanced Order Flow",
    color: "text-tx-secondary border-bd-subtle bg-bg-base",
    icon: Layers
  };

  if (imbalance >= 66) {
    sentimentBadge = {
      label: "Institutional Support (Bid Absorption)",
      color: "text-gain border-gain/40 bg-gain-dim/50",
      icon: TrendingUp
    };
  } else if (imbalance <= 34) {
    sentimentBadge = {
      label: "Heavy Supply Overhead (Ask Resistance)",
      color: "text-loss border-loss/40 bg-loss-dim/50",
      icon: TrendingDown
    };
  }

  return (
    <div className="bg-bg-raised/75 border border-bd-subtle rounded-xl p-5 sm:p-6 shadow-card space-y-4">
      {/* Top Header & Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-bd-hairline">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent" />
          <h3 className="text-[12px] font-mono font-bold text-tx-primary uppercase tracking-wider">
            Level 2 Depth of Market
          </h3>
          <span className="text-[9px] font-mono font-bold text-accent bg-accent-dim border border-accent-border px-2 py-0.5 rounded uppercase">
            Live DOM
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Spread Display */}
          <div className="text-[11px] font-mono text-tx-muted">
            Spread: <span className="font-bold text-tx-primary">₹{spreadPaise.toFixed(2)}</span>
            <span className="text-[10px] text-tx-muted ml-1">({spreadPct.toFixed(2)}%)</span>
          </div>

          {/* Strategy Help Toggle */}
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-1 text-[10px] font-mono text-accent hover:underline cursor-pointer bg-accent/5 px-2 py-0.5 rounded border border-accent/20"
          >
            <HelpCircle className="w-3 h-3" />
            <span>{showGuide ? "Hide Guide" : "Trading Guide"}</span>
          </button>
        </div>
      </div>

      {/* Actionable DOM Strategy Micro-Guide */}
      {showGuide && (
        <div className="p-3.5 rounded-lg bg-bg-base border border-accent-border/50 text-[11px] font-mono space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 text-accent font-bold uppercase tracking-wider text-[10px]">
            <Shield className="w-3.5 h-3.5" />
            <span>How Institutional Teams Profit from Market Depth:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-tx-secondary text-[11px] leading-relaxed">
            <div className="p-2 rounded bg-bg-raised border border-bd-subtle">
              <span className="text-gain font-bold block mb-0.5">1. Bid Absorption (Buy Signal)</span>
              When a 20,000+ share wall appears on the Bid and absorption reaches 70%+, institutional algorithms are supporting the price floor. Buy before the upward price bounce!
            </div>
            <div className="p-2 rounded bg-bg-raised border border-bd-subtle">
              <span className="text-loss font-bold block mb-0.5">2. Ask Resistance (Sell/Short)</span>
              When an Ask Wall of 20,000+ shares caps the top, supply exceeds buying power. Exit long positions or open Short trades to profit from the price drop.
            </div>
            <div className="p-2 rounded bg-bg-raised border border-bd-subtle">
              <span className="text-cyan-400 font-bold block mb-0.5">3. News Shock Pre-Run</span>
              During major events, institutional directional bots stack order book walls 2–5s before retail news is broadcast. Read the DOM to front-run the news cycle!
            </div>
          </div>
        </div>
      )}

      {/* Order Book Grid (Bids vs Asks) */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 relative">
        {/* Center Divider */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-bd-subtle -translate-x-1/2" />
        
        {/* Bids Column */}
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-tx-muted uppercase tracking-wider mb-2 px-1">
            <span>Size (Shares)</span><span>Bid Price</span>
          </div>
          <div className="space-y-1">
            {bids.map((bid, i) => {
              const isWall = bid[1] >= 15000;
              return (
                <div 
                  key={i} 
                  className={`flex justify-between items-center text-[12px] font-mono relative overflow-hidden rounded px-2.5 py-1.5 transition-all ${
                    isWall ? "bg-gain-dim/70 border border-gain/40 shadow-xs" : "bg-bg-base/40 border border-bd-hairline"
                  }`}
                >
                  <div 
                    className="absolute right-0 top-0 bottom-0 bg-gain-dim/60 transition-all duration-300" 
                    style={{ width: `${(bid[1] / maxRowSize) * 100}%` }} 
                  />
                  <div className="flex items-center gap-1.5 relative z-10">
                    <span className={`font-semibold ${isWall ? "text-gain font-bold" : "text-tx-secondary"}`}>
                      {bid[1].toLocaleString()}
                    </span>
                    {isWall && (
                      <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-gain text-tx-inverse tracking-tighter uppercase">
                        WALL
                      </span>
                    )}
                  </div>
                  <span className="text-gain font-bold relative z-10">₹{bid[0].toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Asks Column */}
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-tx-muted uppercase tracking-wider mb-2 px-1">
            <span>Ask Price</span><span>Size (Shares)</span>
          </div>
          <div className="space-y-1">
            {asks.map((ask, i) => {
              const isWall = ask[1] >= 15000;
              return (
                <div 
                  key={i} 
                  className={`flex justify-between items-center text-[12px] font-mono relative overflow-hidden rounded px-2.5 py-1.5 transition-all ${
                    isWall ? "bg-loss-dim/70 border border-loss/40 shadow-xs" : "bg-bg-base/40 border border-bd-hairline"
                  }`}
                >
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-loss-dim/60 transition-all duration-300" 
                    style={{ width: `${(ask[1] / maxRowSize) * 100}%` }} 
                  />
                  <span className="text-loss font-bold relative z-10">₹{ask[0].toFixed(2)}</span>
                  <div className="flex items-center gap-1.5 relative z-10">
                    {isWall && (
                      <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-loss text-tx-inverse tracking-tighter uppercase">
                        WALL
                      </span>
                    )}
                    <span className={`font-semibold ${isWall ? "text-loss font-bold" : "text-tx-secondary"}`}>
                      {ask[1].toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Imbalance Tug-of-War & Institutional Bias */}
      <div className="pt-3 border-t border-bd-hairline space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] font-mono">
          <div className="flex items-center gap-2">
            <span className="text-gain font-bold">
              Total Bids: {totalBidSize.toLocaleString()} shs ({imbalance.toFixed(0)}%)
            </span>
            <span className="text-tx-muted">|</span>
            <span className="text-loss font-bold">
              Total Asks: {totalAskSize.toLocaleString()} shs ({(100 - imbalance).toFixed(0)}%)
            </span>
          </div>

          <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${sentimentBadge.color}`}>
            <sentimentBadge.icon className="w-3 h-3" />
            <span>{sentimentBadge.label}</span>
          </div>
        </div>

        {/* Visual Liquidity Depth Bar */}
        <div className="h-2 w-full bg-bg-base rounded-full overflow-hidden flex border border-bd-hairline">
          <div 
            className="h-full bg-gain transition-all duration-500 ease-out" 
            style={{ width: `${imbalance}%` }} 
          />
          <div 
            className="h-full bg-loss transition-all duration-500 ease-out" 
            style={{ width: `${100 - imbalance}%` }} 
          />
        </div>
      </div>
    </div>
  );
}

export default OrderDepth;

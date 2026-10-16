"use client";

import { Lock, Layers, TrendingUp, TrendingDown } from "lucide-react";

interface OrderDepthProps {
  isActive: boolean;
  orderBook?: { bids: [number, number][]; asks: [number, number][] };
}

export function OrderDepth({ isActive, orderBook }: OrderDepthProps) {
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

  // Direct, readable indication of impending price direction based on order book depth
  let sentimentBadge = {
    label: "Balanced Market Depth",
    color: "text-tx-secondary border-bd-subtle bg-bg-base",
    icon: Layers
  };

  if (imbalance >= 65) {
    sentimentBadge = {
      label: "▲ Upward Pressure (Bids Absorbing Supply)",
      color: "text-gain border-gain/40 bg-gain-dim/50",
      icon: TrendingUp
    };
  } else if (imbalance <= 35) {
    sentimentBadge = {
      label: "▼ Downward Pressure (Asks Capping Price)",
      color: "text-loss border-loss/40 bg-loss-dim/50",
      icon: TrendingDown
    };
  }

  return (
    <div className="bg-bg-raised/75 border border-bd-subtle rounded-xl p-5 sm:p-6 shadow-card space-y-4">
      {/* Top Header & Spread */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-bd-hairline">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent" />
          <h3 className="text-[12px] font-mono font-bold text-tx-primary uppercase tracking-wider">
            Level 2 Depth of Market
          </h3>
          <span className="text-[9px] font-mono font-bold text-accent bg-accent-dim border border-accent-border px-2 py-0.5 rounded uppercase">
            Live DOM
          </span>
        </div>

        <div className="text-[11px] font-mono text-tx-muted tabular-nums">
          Spread: <span className="font-bold text-tx-primary">₹{spreadPaise.toFixed(2)}</span>
          <span className="text-[10px] text-tx-muted ml-1">({spreadPct.toFixed(2)}%)</span>
        </div>
      </div>

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
                  className={`flex justify-between items-center text-[12px] font-mono tabular-nums relative overflow-hidden rounded px-2.5 py-1.5 transition-all duration-300 ${
                    isWall ? "bg-gain-dim/70 border border-gain/40 shadow-xs" : "bg-bg-base/40 border border-bd-hairline"
                  }`}
                >
                  <div 
                    className="absolute right-0 top-0 bottom-0 bg-gain-dim/60 transition-all duration-500" 
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
                  className={`flex justify-between items-center text-[12px] font-mono tabular-nums relative overflow-hidden rounded px-2.5 py-1.5 transition-all duration-300 ${
                    isWall ? "bg-loss-dim/70 border border-loss/40 shadow-xs" : "bg-bg-base/40 border border-bd-hairline"
                  }`}
                >
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-loss-dim/60 transition-all duration-500" 
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
          <div className="flex items-center gap-2 tabular-nums">
            <span className="text-gain font-bold">
              Bids: {totalBidSize.toLocaleString()} ({imbalance.toFixed(0)}%)
            </span>
            <span className="text-tx-muted">|</span>
            <span className="text-loss font-bold">
              Asks: {totalAskSize.toLocaleString()} ({(100 - imbalance).toFixed(0)}%)
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

        {/* Simple Hint on how to use DOM to predict price */}
        <div className="text-[10px] font-mono text-tx-muted text-center pt-0.5">
          Order Book Imbalance signals price direction: Heavy Bids absorb supply for upside moves, Heavy Asks signal downward pressure.
        </div>
      </div>
    </div>
  );
}

export default OrderDepth;

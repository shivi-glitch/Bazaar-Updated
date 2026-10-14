"use client";

import { Lock, Layers } from "lucide-react";

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
          Level 2 Depth of Market
        </h3>
        <p className="text-[11px] text-tx-muted mt-1 uppercase tracking-widest font-mono relative z-10">
          Unlocks in Institutional Round (S7)
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

  // Find max size to calculate background bar widths
  const maxRowSize = Math.max(
    ...bids.map(b => b[1]),
    ...asks.map(a => a[1]),
    1000 // Fallback floor
  );

  return (
    <div className="bg-bg-raised/75 border border-bd-subtle rounded-xl p-5 sm:p-6 shadow-card">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-[11px] font-mono font-bold text-tx-secondary uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-accent" />
          Institutional Order Depth (Level 2)
        </h3>
        <span className="text-[10px] font-mono font-bold text-accent bg-accent-dim border border-accent-border px-2.5 py-0.5 rounded uppercase tracking-wider">
          Live Flow
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-5 relative">
        {/* Center Divider */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-bd-subtle -translate-x-1/2" />
        
        {/* Bids */}
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-tx-muted uppercase tracking-wider mb-2 px-1">
            <span>Size</span><span>Bid</span>
          </div>
          <div className="space-y-1">
            {bids.map((bid, i) => (
              <div key={i} className="flex justify-between items-center text-[12px] font-mono relative overflow-hidden rounded px-2 py-1 bg-bg-base/40">
                <div className="absolute right-0 top-0 bottom-0 bg-gain-dim transition-all duration-300" style={{ width: `${(bid[1] / maxRowSize) * 100}%` }} />
                <span className="text-tx-secondary relative z-10">{bid[1].toLocaleString()}</span>
                <span className="text-gain font-bold relative z-10">₹{bid[0].toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Asks */}
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-tx-muted uppercase tracking-wider mb-2 px-1">
            <span>Ask</span><span>Size</span>
          </div>
          <div className="space-y-1">
            {asks.map((ask, i) => (
              <div key={i} className="flex justify-between items-center text-[12px] font-mono relative overflow-hidden rounded px-2 py-1 bg-bg-base/40">
                <div className="absolute left-0 top-0 bottom-0 bg-loss-dim transition-all duration-300" style={{ width: `${(ask[1] / maxRowSize) * 100}%` }} />
                <span className="text-loss font-bold relative z-10">₹{ask[0].toFixed(2)}</span>
                <span className="text-tx-secondary relative z-10">{ask[1].toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Imbalance Tug-of-War */}
      <div className="pt-2 border-t border-bd-hairline">
        <div className="flex justify-between text-[10px] font-mono font-bold text-tx-muted uppercase tracking-wider mb-1.5">
          <span className="text-gain">Bid Absorption ({imbalance.toFixed(0)}%)</span>
          <span className="text-loss">Ask Wall ({(100 - imbalance).toFixed(0)}%)</span>
        </div>
        <div className="h-2 w-full bg-bg-base rounded-full overflow-hidden flex border border-bd-hairline">
          <div className="h-full bg-gain transition-all duration-300" style={{ width: `${imbalance}%` }} />
          <div className="h-full bg-loss transition-all duration-300" style={{ width: `${100 - imbalance}%` }} />
        </div>
      </div>
    </div>
  );
}

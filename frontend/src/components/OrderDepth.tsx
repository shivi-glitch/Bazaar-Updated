"use client";

import { Activity, Lock } from "lucide-react";

interface OrderDepthProps {
  isActive: boolean;
  orderBook?: { bids: [number, number][]; asks: [number, number][] };
}

export function OrderDepth({ isActive, orderBook }: OrderDepthProps) {
  // ROUND 1: LOCKED STATE
  if (!isActive) {
    return (
      <div className="bg-[#0B1120] border border-white/5 rounded-2xl p-6 h-[220px] flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="w-10 h-10 bg-[#111827] border border-white/10 rounded-full flex items-center justify-center mb-3 relative z-10 shadow-lg">
          <Lock className="w-4 h-4 text-slate-500" />
        </div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest relative z-10">
          Level 2 Depth of Market
        </h3>
        <p className="text-[10px] text-slate-600 mt-2 uppercase tracking-widest font-mono relative z-10">
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
    <div className="bg-[#111827] border border-white/5 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Institutional Order Flow
        </h3>
        <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
          L2 Active
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-5 relative">
        {/* Center Divider */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5 -translate-x-1/2" />
        
        {/* Bids */}
        <div>
          <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
            <span>Size</span><span>Bid</span>
          </div>
          <div className="space-y-0.5">
            {bids.map((bid, i) => (
              <div key={i} className="flex justify-between items-center text-xs font-mono relative overflow-hidden rounded px-1.5 py-1">
                <div className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 transition-all duration-300" style={{ width: `${(bid[1] / maxRowSize) * 100}%` }} />
                <span className="text-slate-400 relative z-10">{bid[1].toLocaleString()}</span>
                <span className="text-emerald-400 font-bold relative z-10">{bid[0].toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Asks */}
        <div>
          <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
            <span>Ask</span><span>Size</span>
          </div>
          <div className="space-y-0.5">
            {asks.map((ask, i) => (
              <div key={i} className="flex justify-between items-center text-xs font-mono relative overflow-hidden rounded px-1.5 py-1">
                <div className="absolute left-0 top-0 bottom-0 bg-red-500/10 transition-all duration-300" style={{ width: `${(ask[1] / maxRowSize) * 100}%` }} />
                <span className="text-red-400 font-bold relative z-10">{ask[0].toFixed(2)}</span>
                <span className="text-slate-400 relative z-10">{ask[1].toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Imbalance Tug-of-War */}
      <div>
        <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
          <span>Buy Wall</span><span>Sell Wall</span>
        </div>
        <div className="h-1.5 w-full bg-[#0B1120] rounded-full overflow-hidden flex">
          <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${imbalance}%` }} />
          <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${100 - imbalance}%` }} />
        </div>
      </div>
    </div>
  );
}

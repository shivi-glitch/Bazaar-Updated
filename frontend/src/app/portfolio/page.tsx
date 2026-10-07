"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useMarketStore } from "@/store/marketStore";

export function PortfolioTab() {
  const portfolio = useMarketStore((s) => s.portfolioData);
  const error = ""; // Removed local error state

  const formatMoney = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (error) return <div className="p-6 text-center text-red-500 font-bold">{error}</div>;
  if (!portfolio) return <div className="p-6 text-center text-slate-500 font-bold mt-10">Loading portfolio...</div>;

  return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        
        {/* Header Panel */}
        <div className="glass-panel text-white p-8 relative overflow-hidden bg-white/[0.01]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <h1 className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-widest">Net Worth (MTM)</h1>
          <div className="space-y-6 relative z-10">
            <div>
              <div className="text-5xl md:text-6xl font-mono font-black tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{formatMoney(portfolio.equity_paise)}</div>
            </div>
            <div className="pt-6 border-t border-white/5 flex justify-between items-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Cash</div>
              <div className="text-xl font-mono font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">{formatMoney(portfolio.cash_paise)}</div>
            </div>
          </div>
        </div>

        {/* Positions List */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Active Trading Desk</h3>
          {portfolio.positions.length === 0 ? (
            <div className="text-center py-16 text-slate-500 bg-[#070B14] rounded-md border border-dashed border-white/10 uppercase tracking-widest text-[10px] font-bold">
              No open positions. Head to Explore to start trading.
            </div>
          ) : (
            <div className="space-y-3">
              {portfolio.positions.map((pos: any) => {
                const isShort = pos.qty < 0;
                const displayQty = Math.abs(pos.qty);
                const posType = isShort ? "SHORT" : "LONG";
                const pl = (pos.current_price_paise - pos.average_cost_paise) * pos.qty;
                const isProfit = pl >= 0;

                return (
                  <div key={pos.ticker} className="glass-panel p-5 flex justify-between items-center bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/20 transition-all cursor-default">
                    <div>
                      <div className="font-black text-xl text-white tracking-tighter">{pos.ticker}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1.5 flex items-center gap-2 uppercase tracking-widest">
                        <span className={`px-2 py-0.5 rounded-sm border ${isShort ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                          {posType}
                        </span>
                        <span><strong className="text-white">{displayQty}</strong> @ {formatMoney(pos.average_cost_paise)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-xl text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]">{formatMoney(pos.current_price_paise)}</div>
                      <div className={`text-xs font-mono font-bold mt-1 ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isProfit ? '+' : ''}{formatMoney(pl)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
  );
}

export default PortfolioTab;

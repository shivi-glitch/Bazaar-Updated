"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useMarketStore } from "@/store/marketStore";
import { Lock, Zap } from "lucide-react";

export function StatsTab() {
  const data = useMarketStore((s) => s.portfolioData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sessionState = useMarketStore((s) => s.sessionState);

  const buyStat = async (statName: string, level: number) => {
    setLoading(true); setError("");
    try {
      const token = localStorage.getItem("merx_token");
      await api.post("/stats/purchase", { stat: statName, level }, token || "");
    } catch (err: any) {
      setError(err.message || "Purchase failed");
    } finally {
      setLoading(false);
    }
  };

  if (!data) return <div className="p-6 text-center text-slate-500 font-bold mt-10">Loading Stats...</div>;

  // Round 1 Lock
  if (!data.r2_unlocked) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center mt-20">
          <div className="w-20 h-20 bg-[#111827] rounded-sm flex items-center justify-center mb-6 border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]">
            <Lock className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Shop Locked</h2>
          <p className="text-slate-400 mt-3 text-sm max-w-sm font-medium">
            The Stat Shop is restricted during Retail Trading (Round 1). Accumulate capital now and prepare for Institutional Trading (Round 2).
          </p>
        </div>
    );
  }

  const isSessionActive = ["STARTING", "RUNNING", "PAUSED"].includes(sessionState);

  const StatCard = ({ title, currentLvl, costs, max, desc }: any) => {
    const nextLvl = currentLvl + 1;
    const canBuy = nextLvl <= max;
    const cost = canBuy ? costs[nextLvl] : null;

    return (
      <div className="glass-panel p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-white/20 transition-all">
        {/* Subtle background glow for purchased stats */}
        {currentLvl > 0 && (
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
        )}
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h3 className="text-xl font-black text-white tracking-tighter uppercase">{title}</h3>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 max-w-[200px] leading-relaxed">{desc}</div>
          </div>
          <div className="bg-[#111827] text-blue-400 font-bold px-3 py-1.5 rounded-sm text-[10px] uppercase tracking-widest border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
            Lvl {currentLvl}
          </div>
        </div>
        
        <div className="relative z-10 mt-auto pt-4 border-t border-white/5">
          {canBuy ? (
            <button
              disabled={loading || isSessionActive}
              onClick={() => buyStat(title, nextLvl)}
              className="w-full py-4 bg-[#111827] hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs rounded-sm border border-white/10 transition-all disabled:opacity-50 flex items-center justify-between px-4"
            >
              <span>Buy Level {nextLvl}</span>
              <span className="font-mono text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">₹{(cost / 100).toLocaleString('en-IN')}</span>
            </button>
          ) : (
            <button disabled className="w-full py-4 bg-[#070B14] text-slate-600 font-black uppercase tracking-widest text-xs rounded-sm border border-white/5 flex justify-center">
              Max Level Reached
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 glass-panel p-6 border-blue-500/20 bg-blue-500/5 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10">
            <h2 className="font-bold text-blue-400 uppercase tracking-widest text-[10px]">Available Cash</h2>
            <div className="font-mono font-black text-4xl text-white tracking-tighter mt-1 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">₹{(data.cash_paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
          </div>
          <Zap className="w-12 h-12 text-blue-500/20 relative z-10" />
        </div>

        {error && <div className="mb-6 text-center text-xs uppercase tracking-widest font-bold text-red-400 bg-red-500/10 border border-red-500/20 py-3 rounded-sm">{error}</div>}
        {isSessionActive && (
          <div className="mb-6 text-center text-xs uppercase tracking-widest font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 py-3 rounded-sm">
            Purchasing is locked while the market is active.
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <StatCard 
            title="Research" 
            desc="Reduces news delay. L2 unlocks Insider rumors."
            currentLvl={data.stats.research} max={3} 
            costs={{1: 20000000, 2: 50000000, 3: 100000000}} 
          />
          <StatCard 
            title="Capital" 
            desc="L1 unlocks shorting. L2 unlocks 2x leverage."
            currentLvl={data.stats.capital} max={2} 
            costs={{1: 30000000, 2: 80000000}} 
          />
          <StatCard 
            title="Speed" 
            desc="Reduces order execution latency and slippage."
            currentLvl={data.stats.speed} max={3} 
            costs={{1: 20000000, 2: 40000000, 3: 80000000}} 
          />
        </div>
      </div>
  );
}

export default StatsTab;

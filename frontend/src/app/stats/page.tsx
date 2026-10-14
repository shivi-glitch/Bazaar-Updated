"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useMarketStore } from "@/store/marketStore";
import { Lock, Zap, BookOpen, Wallet, Gauge, Check } from "lucide-react";

export function StatsTab() {
  const data = useMarketStore((s) => s.portfolioData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sessionState = useMarketStore((s) => s.sessionState);

  const buyStat = async (statName: string, level: number) => {
    setLoading(true); 
    setError("");
    try {
      const token = localStorage.getItem("merx_token");
      await api.post("/stats/purchase", { stat: statName, level }, token || "");
    } catch (err: any) {
      setError(err.message || "Purchase failed");
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="p-8 sm:p-12 text-center text-tx-muted font-mono text-[13px] mt-10 animate-pulse">
        Accessing institutional stat shop registry...
      </div>
    );
  }

  // Round 1 Lock
  if (!data.r2_unlocked) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center max-w-lg mx-auto my-auto space-y-4">
        <div className="w-14 h-14 bg-bg-raised border border-bd-subtle rounded-2xl flex items-center justify-center text-tx-muted shadow-card">
          <Lock className="w-6 h-6 text-tx-muted" />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-bg-raised border border-bd-subtle text-warn">
            Round 1 Restricted
          </span>
          <h2 className="text-[22px] sm:text-[26px] font-bold text-tx-primary tracking-tight">
            Stat Shop Opens in Round 2
          </h2>
          <p className="text-[13px] sm:text-[14px] text-tx-secondary leading-relaxed max-w-md">
            The Stat Shop is restricted during Retail Trading (Round 1). Accumulate capital now and prepare to purchase institutional capabilities before Session 7 begins.
          </p>
        </div>
      </div>
    );
  }

  const isSessionActive = ["STARTING", "RUNNING", "PAUSED"].includes(sessionState);

  const getStatIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case "research": return <BookOpen className="w-5 h-5 text-accent" />;
      case "capital": return <Wallet className="w-5 h-5 text-warn" />;
      case "speed": return <Gauge className="w-5 h-5 text-cyan-400" />;
      default: return <Zap className="w-5 h-5 text-accent" />;
    }
  };

  const StatCard = ({ title, currentLvl, costs, max, desc }: any) => {
    const nextLvl = currentLvl + 1;
    const canBuy = nextLvl <= max;
    const cost = canBuy ? costs[nextLvl] : null;

    return (
      <div className="bg-bg-raised/75 hover:bg-bg-raised border border-bd-subtle hover:border-accent-border/60 rounded-xl p-5 sm:p-6 flex flex-col justify-between gap-5 transition-all shadow-card group">
        <div>
          <div className="flex justify-between items-start gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-bg-base border border-bd-subtle flex items-center justify-center">
                {getStatIcon(title)}
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-tx-primary tracking-tight">{title}</h3>
                <span className="text-[10px] font-mono uppercase tracking-wider text-tx-muted">Max Lvl {max}</span>
              </div>
            </div>

            <div className="bg-accent-dim text-accent border border-accent-border font-mono font-bold px-2.5 py-1 rounded text-[11px] uppercase tracking-wider">
              Lvl {currentLvl}
            </div>
          </div>

          <p className="text-[13px] text-tx-secondary leading-relaxed font-medium">
            {desc}
          </p>
        </div>
        
        <div className="pt-4 border-t border-bd-hairline mt-auto">
          {canBuy ? (
            <button
              disabled={loading || isSessionActive}
              onClick={() => buyStat(title, nextLvl)}
              className="w-full py-2.5 sm:py-3 bg-accent text-tx-inverse hover:brightness-110 active:scale-[0.99] font-mono font-bold uppercase tracking-wider text-[11px] sm:text-[12px] rounded-md transition-all disabled:opacity-40 flex items-center justify-between px-3.5 cursor-pointer shadow-[0_0_15px_rgba(0,212,170,0.2)]"
            >
              <span>Unlock Level {nextLvl}</span>
              <span className="font-mono font-bold">₹{(cost / 100).toLocaleString('en-IN')}</span>
            </button>
          ) : (
            <div className="w-full py-2.5 bg-bg-base border border-bd-subtle text-tx-muted font-mono font-bold uppercase tracking-wider text-[11px] rounded-md flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-gain" />
              <span>Max Level Unlocked</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      
      {/* Cash Panel */}
      <div className="bg-bg-raised/80 border border-bd-subtle p-5 sm:p-6 rounded-2xl flex items-center justify-between shadow-card relative overflow-hidden">
        <div
          className="absolute -top-16 -right-16 w-60 h-60 bg-accent/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10">
          <div className="text-[10px] font-mono font-bold text-tx-muted uppercase tracking-widest">
            Available Capital for Upgrades
          </div>
          <div className="font-mono font-bold text-[28px] sm:text-[36px] text-tx-primary tracking-tight mt-0.5">
            ₹{(data.cash_paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>

        <div className="w-12 h-12 rounded-xl bg-accent-dim border border-accent-border flex items-center justify-center text-accent relative z-10 shrink-0">
          <Zap className="w-6 h-6" />
        </div>
      </div>

      {error && (
        <div className="text-center text-[12px] font-mono uppercase tracking-wider font-bold text-loss bg-loss-dim border border-loss-border py-2.5 px-4 rounded-md">
          {error}
        </div>
      )}

      {isSessionActive && (
        <div className="text-center text-[11px] font-mono uppercase tracking-wider font-bold text-warn bg-warn-dim border border-warn-border py-2.5 px-4 rounded-md">
          Purchasing is locked during active trading ticks. Upgrades open between sessions.
        </div>
      )}

      {/* Upgrades Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <StatCard 
          title="Research" 
          desc="Slashes news delay from 12s to instant. Level 2 unlocks privileged Insider rumors."
          currentLvl={data.stats.research} max={3} 
          costs={{1: 20000000, 2: 50000000, 3: 100000000}} 
        />
        <StatCard 
          title="Capital" 
          desc="Expands trading capacity. Level 1 unlocks short selling. Level 2 unlocks 2x margin leverage."
          currentLvl={data.stats.capital} max={2} 
          costs={{1: 30000000, 2: 80000000}} 
        />
        <StatCard 
          title="Speed" 
          desc="Sub-millisecond execution priority queue. Eliminates order slippage on rapid momentum spikes."
          currentLvl={data.stats.speed} max={3} 
          costs={{1: 20000000, 2: 40000000, 3: 80000000}} 
        />
      </div>
    </div>
  );
}

export default StatsTab;

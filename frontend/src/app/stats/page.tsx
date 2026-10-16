"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useMarketStore } from "@/store/marketStore";
import { Lock, Zap, BookOpen, Wallet, Gauge, Check } from "lucide-react";

export function StatsTab() {
  const data = useMarketStore((s) => s.portfolioData);
  const setPortfolioData = useMarketStore((s) => s.setPortfolioData);
  const sessionState = useMarketStore((s) => s.sessionState);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSessionActive = ["STARTING", "RUNNING", "PAUSED"].includes(sessionState);

  const buyStat = async (statName: string, level: number) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("merx_token");
      const res: any = await api.post("/stats/purchase", { stat: statName, level }, token || "");

      // Immediately refresh portfolio so cash and level update instantly
      try {
        const portRes = await api.get("/portfolio", token || "");
        setPortfolioData(portRes);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("merx_portfolio_refresh"));
        }
      } catch {
        if (data && res?.new_balance !== undefined) {
          setPortfolioData({
            ...data,
            cash_paise: res.new_balance,
            stats: {
              ...data.stats,
              [statName.toLowerCase()]: level
            }
          });
        }
      }
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

  const getStatIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case "research": return <BookOpen className="w-5 h-5 text-accent" />;
      case "capital": return <Wallet className="w-5 h-5 text-warn" />;
      case "speed": return <Gauge className="w-5 h-5 text-cyan-400" />;
      default: return <Zap className="w-5 h-5 text-accent" />;
    }
  };

  // Concise, direct description of what the upcoming upgrade actually does
  const UPGRADE_DESCRIPTIONS: Record<string, Record<number, string>> = {
    Research: {
      1: "Reduces news delivery delay from 15s to 10s (5-second lead over base teams).",
      2: "Reduces news delay to 7s and unlocks privileged Insider Wire rumors (90% directional accuracy).",
      3: "Reduces news delay to 3s for ultra-fast, near-instantaneous news execution."
    },
    Capital: {
      1: "Unlocks short selling capability across all equities (up to 1.0x total equity).",
      2: "Unlocks 2.0x margin leverage, doubling your total buying power across positions."
    },
    Speed: {
      1: "Reduces order execution delay from 2.4s to 1.8s (25% faster order fills).",
      2: "Reduces order execution delay to 1.2s with Direct Market Access (DMA) priority queue.",
      3: "Reduces order execution delay to 0.6s with co-located instant institutional fills."
    }
  };

  const MAX_DESCRIPTIONS: Record<string, string> = {
    Research: "Maximum level unlocked. 3.0s ultra-fast news wire active.",
    Capital: "Maximum level unlocked. Short selling and 2.0x margin leverage active.",
    Speed: "Maximum level unlocked. 0.6s co-located priority execution active."
  };

  const StatCard = ({ title, currentLvl, costs, max }: any) => {
    const nextLvl = currentLvl + 1;
    const canBuy = nextLvl <= max;
    const cost = canBuy ? costs[nextLvl] : null;
    const hasEnoughCash = canBuy && cost && data.cash_paise >= cost;

    const description = canBuy
      ? UPGRADE_DESCRIPTIONS[title]?.[nextLvl] || "Upgrades system capability."
      : MAX_DESCRIPTIONS[title] || "Maximum tier unlocked.";

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

          {/* Clean, direct description of what upgrading gives */}
          <p className="text-[13px] text-tx-secondary leading-relaxed font-medium">
            {description}
          </p>
        </div>
        
        <div className="pt-4 border-t border-bd-hairline mt-auto">
          {canBuy ? (
            <button
              disabled={loading || isSessionActive || !hasEnoughCash}
              onClick={() => buyStat(title, nextLvl)}
              className={`w-full py-2.5 sm:py-3 font-mono font-bold uppercase tracking-wider text-[11px] sm:text-[12px] rounded-md transition-all flex items-center justify-between px-3.5 ${
                !hasEnoughCash
                  ? "bg-bg-base border border-bd-subtle text-tx-muted cursor-not-allowed"
                  : isSessionActive
                  ? "bg-warn-dim border border-warn-border text-warn cursor-not-allowed"
                  : "bg-accent text-tx-inverse hover:brightness-110 active:scale-[0.99] cursor-pointer shadow-[0_0_15px_rgba(0,212,170,0.2)]"
              }`}
            >
              <span>
                {isSessionActive 
                  ? "Market Active (Wait for Pause)" 
                  : !hasEnoughCash
                  ? "Insufficient Balance"
                  : `Unlock Level ${nextLvl}`}
              </span>
              <span className="font-mono font-bold">
                ₹{((cost || 0) / 100).toLocaleString('en-IN')}
              </span>
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
          currentLvl={data.stats.research} 
          max={3} 
          costs={{1: 35000000, 2: 75000000, 3: 130000000}} 
        />
        <StatCard 
          title="Capital" 
          currentLvl={data.stats.capital} 
          max={2} 
          costs={{1: 50000000, 2: 110000000}} 
        />
        <StatCard 
          title="Speed" 
          currentLvl={data.stats.speed} 
          max={3} 
          costs={{1: 30000000, 2: 60000000, 3: 105000000}} 
        />
      </div>
    </div>
  );
}

export default StatsTab;

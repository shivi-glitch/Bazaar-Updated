"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useMarketStore } from "@/store/marketStore";
import { 
  Lock, Zap, BookOpen, Wallet, Gauge, Check, 
  ArrowRight, ShieldAlert, Sparkles, X, Activity, Radio
} from "lucide-react";

interface UpgradeImpact {
  title: string;
  summary: string;
  bullets: string[];
}

interface PurchasedFeedback {
  stat: string;
  level: number;
  costPaise: number;
  impact: UpgradeImpact;
}

export function StatsTab() {
  const data = useMarketStore((s) => s.portfolioData);
  const setPortfolioData = useMarketStore((s) => s.setPortfolioData);
  const sessionState = useMarketStore((s) => s.sessionState);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recentUpgrade, setRecentUpgrade] = useState<PurchasedFeedback | null>(null);

  const isSessionActive = ["STARTING", "RUNNING", "PAUSED"].includes(sessionState);

  const buyStat = async (statName: string, level: number) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("merx_token");
      const res: any = await api.post("/stats/purchase", { stat: statName, level }, token || "");
      
      // Store upgrade feedback
      if (res && res.impact) {
        setRecentUpgrade({
          stat: res.stat,
          level: res.level,
          costPaise: res.cost_paise,
          impact: res.impact
        });
      }

      // Immediately refresh portfolio to reflect updated cash and stat levels
      try {
        const portRes = await api.get("/portfolio", token || "");
        setPortfolioData(portRes);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("merx_portfolio_refresh"));
        }
      } catch (e) {
        // Fallback: local optimistic update if network blips
        if (data && res.new_balance !== undefined) {
          const updated = {
            ...data,
            cash_paise: res.new_balance,
            stats: {
              ...data.stats,
              [statName.toLowerCase()]: level
            }
          };
          setPortfolioData(updated);
        }
      }
    } catch (err: any) {
      setError(err.message || "Purchase failed. Please verify cash balance and market state.");
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

  // Detailed specification mapping for active capabilities and future unlocks
  const SPEC_MAP: Record<string, {
    activeSpec: (lvl: number) => { summary: string; detail: string };
    unlocks: Record<number, { title: string; bullets: string[] }>;
  }> = {
    Research: {
      activeSpec: (lvl) => {
        if (lvl === 0) return { summary: "15.0s Wire Latency", detail: "Standard Retail News Feed (Insider Wires Blocked)" };
        if (lvl === 1) return { summary: "10.0s Wire Latency", detail: "5s speed advantage over unupgraded retail teams" };
        if (lvl === 2) return { summary: "7.0s Wire Latency + Insider Feed", detail: "Privileged access to Insider Rumor Wire ('IN' tag, 90% accuracy)" };
        return { summary: "3.0s Ultra-Fast Wire", detail: "Maximum high-frequency intelligence tier (12s ahead of base)" };
      },
      unlocks: {
        1: {
          title: "Tier 1 Wire (10s Delivery)",
          bullets: [
            "News wire latency cut from 15.0s to 10.0s (33% faster).",
            "5-second lead over base teams on all news releases.",
            "Allows taking early breakout positions before crowd reactions."
          ]
        },
        2: {
          title: "Tier 2 Wire + Insider Intel (7s Delivery)",
          bullets: [
            "News wire latency cut to 7.0s (over 2x faster than base).",
            "UNLOCKED: Institutional Insider Rumor Wire ('IN' tag).",
            "90% directional accuracy on rumors before official announcements."
          ]
        },
        3: {
          title: "Tier 3 Ultra-Low Latency Wire (3s Delivery)",
          bullets: [
            "Sub-5s institutional news feed (3.0s latency).",
            "Receive news 12 full seconds ahead of standard retail terminals.",
            "Capture ground-floor entries on violent news spikes."
          ]
        }
      }
    },
    Capital: {
      activeSpec: (lvl) => {
        if (lvl === 0) return { summary: "Long-Only Cash (1.0x)", detail: "No short selling permitted. Gross exposure strictly <= 1.0x Equity" };
        if (lvl === 1) return { summary: "Short Selling Active (1.0x)", detail: "Unlocks shorting power. Profit from market collapses and negative shocks" };
        return { summary: "2.0x Margin Leverage Active", detail: "Double trading capacity. Maximum gross position limit expanded to 2.0x Equity" };
      },
      unlocks: {
        1: {
          title: "Tier 1: Short Selling Unlocked",
          bullets: [
            "Sell to open short positions across any live equity.",
            "Profit directly from adverse market crashes and bearish news.",
            "Position limit capped at 1.0x total portfolio liquidation value."
          ]
        },
        2: {
          title: "Tier 2: 2.0x Margin Leverage",
          bullets: [
            "Doubles maximum purchasing and shorting power to 2.0x equity.",
            "Hold up to ₹2 Crore in positions on ₹1 Crore equity.",
            "Amplifies portfolio return on high-conviction trades."
          ]
        }
      }
    },
    Speed: {
      activeSpec: (lvl) => {
        if (lvl === 0) return { summary: "2.4s Standard Execution", detail: "Base retail order routing queue with standard fill delay" };
        if (lvl === 1) return { summary: "1.8s Fast Routing", detail: "25% faster order fills over base retail queues" };
        if (lvl === 2) return { summary: "1.2s Direct Market Access", detail: "50% faster fills. Priority execution ahead of standard queues" };
        return { summary: "0.6s Co-Located Elite Route", detail: "Instantaneous execution priority on high-volatility news spikes" };
      },
      unlocks: {
        1: {
          title: "Tier 1: Fast Routing (1.8s Delay)",
          bullets: [
            "Order fill latency reduced from 2.4s to 1.8s.",
            "25% faster fills reduce price slippage on fast moves.",
            "Faster position confirmations on market orders."
          ]
        },
        2: {
          title: "Tier 2: DMA Priority Route (1.2s Delay)",
          bullets: [
            "Order fill latency reduced to 1.2s (50% faster than base).",
            "Jumps ahead of retail order queues when liquidity is thin.",
            "Higher fill rate on rapid breakout candles."
          ]
        },
        3: {
          title: "Tier 3: Co-Located Ultra Route (0.6s Delay)",
          bullets: [
            "Order fill latency slashed to 0.6s (maximum speed tier).",
            "Instant institutional fill priority during news shocks.",
            "Guaranteed earliest queue placement ahead of competing teams."
          ]
        }
      }
    }
  };

  const StatCard = ({ title, currentLvl, costs, max }: any) => {
    const nextLvl = currentLvl + 1;
    const canBuy = nextLvl <= max;
    const cost = canBuy ? costs[nextLvl] : null;
    const hasEnoughCash = canBuy && data.cash_paise >= cost;

    const specInfo = SPEC_MAP[title];
    const active = specInfo?.activeSpec(currentLvl) || { summary: `Level ${currentLvl}`, detail: "Active" };
    const nextUnlock = canBuy ? specInfo?.unlocks[nextLvl] : null;

    return (
      <div className="bg-bg-raised/75 hover:bg-bg-raised border border-bd-subtle hover:border-accent-border/60 rounded-xl p-5 sm:p-6 flex flex-col justify-between gap-5 transition-all shadow-card group">
        <div>
          {/* Card Header */}
          <div className="flex justify-between items-start gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-bg-base border border-bd-subtle flex items-center justify-center shrink-0">
                {getStatIcon(title)}
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-tx-primary tracking-tight">{title}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-tx-muted">
                    Tier {currentLvl} of {max}
                  </span>
                  <div className="flex gap-1 ml-1">
                    {Array.from({ length: max }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-2 h-1.5 rounded-xs transition-colors ${
                          i < currentLvl ? "bg-accent" : "bg-bd-subtle"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-accent-dim text-accent border border-accent-border font-mono font-bold px-2.5 py-1 rounded text-[11px] uppercase tracking-wider">
              Lvl {currentLvl}
            </div>
          </div>

          {/* Active System Capability */}
          <div className="p-3 rounded-lg bg-bg-base/60 border border-bd-subtle/80 mb-3.5 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-tx-muted uppercase tracking-wider">
              <span>Active System Specification</span>
              <span className="text-gain flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="text-[13px] font-bold text-tx-primary">
              {active.summary}
            </div>
            <p className="text-[12px] text-tx-secondary leading-snug">
              {active.detail}
            </p>
          </div>

          {/* Next Level Specs Preview */}
          {canBuy && nextUnlock && (
            <div className="p-3 rounded-lg bg-accent/5 border border-accent-border/40 space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-accent uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next Upgrade: {nextUnlock.title}</span>
              </div>
              <ul className="space-y-1 text-[11px] text-tx-secondary leading-tight">
                {nextUnlock.bullets.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-accent mt-0.5">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Purchase Action Button */}
        <div className="pt-4 border-t border-bd-hairline mt-auto">
          {canBuy ? (
            <button
              disabled={loading || isSessionActive || !hasEnoughCash}
              onClick={() => buyStat(title, nextLvl)}
              className={`w-full py-2.5 sm:py-3 font-mono font-bold uppercase tracking-wider text-[11px] sm:text-[12px] rounded-md transition-all flex items-center justify-between px-3.5 cursor-pointer ${
                !hasEnoughCash
                  ? "bg-bg-base border border-bd-subtle text-tx-muted cursor-not-allowed"
                  : isSessionActive
                  ? "bg-warn-dim border border-warn-border text-warn cursor-not-allowed"
                  : "bg-accent text-tx-inverse hover:brightness-110 active:scale-[0.99] shadow-[0_0_15px_rgba(0,212,170,0.25)]"
              }`}
            >
              <span>
                {isSessionActive 
                  ? "Market Active (Wait for Pause)" 
                  : !hasEnoughCash 
                  ? "Insufficient Balance" 
                  : `Install Tier ${nextLvl}`}
              </span>
              <span className="font-mono font-bold">
                ₹{((cost || 0) / 100).toLocaleString('en-IN')}
              </span>
            </button>
          ) : (
            <div className="w-full py-2.5 bg-bg-base border border-bd-subtle text-tx-muted font-mono font-bold uppercase tracking-wider text-[11px] rounded-md flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-gain" />
              <span>Maximum Tier Installed</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      
      {/* Capital & Balance HUD */}
      <div className="bg-bg-raised/80 border border-bd-subtle p-5 sm:p-6 rounded-2xl flex items-center justify-between shadow-card relative overflow-hidden">
        <div
          className="absolute -top-16 -right-16 w-60 h-60 bg-accent/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10">
          <div className="text-[10px] font-mono font-bold text-tx-muted uppercase tracking-widest">
            Liquid Capital Available for Terminal Upgrades
          </div>
          <div className="font-mono font-bold text-[28px] sm:text-[36px] text-tx-primary tracking-tight mt-0.5">
            ₹{(data.cash_paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-tx-muted mt-1 font-mono">
            Purchases take effect immediately upon installation.
          </div>
        </div>

        <div className="w-12 h-12 rounded-xl bg-accent-dim border border-accent-border flex items-center justify-center text-accent relative z-10 shrink-0">
          <Zap className="w-6 h-6" />
        </div>
      </div>

      {/* Immediate Post-Purchase Feedback Banner */}
      {recentUpgrade && (
        <div className="p-5 rounded-xl bg-gain-dim/40 border border-gain/40 text-tx-primary relative overflow-hidden shadow-lg animate-in fade-in duration-300">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gain text-tx-inverse flex items-center justify-center text-[12px] font-bold">
                ✓
              </span>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gain">
                  Upgrade Successfully Installed & Activated
                </span>
                <h4 className="text-[15px] font-bold text-tx-primary">
                  {recentUpgrade.stat} Tier {recentUpgrade.level} — {recentUpgrade.impact.title}
                </h4>
              </div>
            </div>

            <button 
              onClick={() => setRecentUpgrade(null)}
              className="text-tx-muted hover:text-tx-primary p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[13px] text-tx-secondary font-medium mb-3">
            {recentUpgrade.impact.summary}
          </p>

          <div className="bg-bg-base/70 rounded-lg p-3 border border-bd-subtle/80 space-y-1.5">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent">
              Active System Capabilities Changed:
            </div>
            <ul className="space-y-1 text-[12px] text-tx-secondary">
              {recentUpgrade.impact.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gain font-bold">→</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Error or Warnings */}
      {error && (
        <div className="text-center text-[12px] font-mono uppercase tracking-wider font-bold text-loss bg-loss-dim border border-loss-border py-2.5 px-4 rounded-md">
          {error}
        </div>
      )}

      {isSessionActive && (
        <div className="flex items-center justify-center gap-2 text-center text-[11px] font-mono uppercase tracking-wider font-bold text-warn bg-warn-dim border border-warn-border py-2.5 px-4 rounded-md">
          <ShieldAlert className="w-4 h-4 text-warn" />
          <span>Purchasing is locked during active trading ticks. Upgrades open between market sessions.</span>
        </div>
      )}

      {/* Terminal Active Specs Telemetry HUD */}
      <div className="bg-bg-raised/60 border border-bd-subtle rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 border-b border-bd-subtle pb-2">
          <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-tx-muted">
            <Activity className="w-3.5 h-3.5 text-accent" />
            <span>Terminal Operating Specs (Live Rig)</span>
          </div>
          <span className="text-[10px] font-mono text-tx-muted">All Systems Normal</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-bg-base/50 border border-bd-subtle">
            <div className="text-[10px] font-mono text-tx-muted uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-accent" />
              <span>News Intelligence</span>
            </div>
            <div className="text-[13px] font-bold text-tx-primary mt-1">
              {SPEC_MAP.Research.activeSpec(data.stats.research).summary}
            </div>
            <div className="text-[11px] text-tx-muted mt-0.5 line-clamp-1">
              {SPEC_MAP.Research.activeSpec(data.stats.research).detail}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-bg-base/50 border border-bd-subtle">
            <div className="text-[10px] font-mono text-tx-muted uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-3 h-3 text-warn" />
              <span>Capital & Leverage</span>
            </div>
            <div className="text-[13px] font-bold text-tx-primary mt-1">
              {SPEC_MAP.Capital.activeSpec(data.stats.capital).summary}
            </div>
            <div className="text-[11px] text-tx-muted mt-0.5 line-clamp-1">
              {SPEC_MAP.Capital.activeSpec(data.stats.capital).detail}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-bg-base/50 border border-bd-subtle">
            <div className="text-[10px] font-mono text-tx-muted uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-3 h-3 text-cyan-400" />
              <span>Order Fill Speed</span>
            </div>
            <div className="text-[13px] font-bold text-tx-primary mt-1">
              {SPEC_MAP.Speed.activeSpec(data.stats.speed).summary}
            </div>
            <div className="text-[11px] text-tx-muted mt-0.5 line-clamp-1">
              {SPEC_MAP.Speed.activeSpec(data.stats.speed).detail}
            </div>
          </div>
        </div>
      </div>

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

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Sun,
  Moon,
  Home,
  Shield,
  LogOut,
  Coffee,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Terminal,
  Smile
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import clsx from "clsx";

interface TeamScoreData {
  team_id: string;
  team_name?: string;
  eliminated?: boolean;
  is_r2?: boolean;
  r1_start_capital_paise?: number;
  r1_equity_paise?: number;
  r1_return_pct?: number;
  r2_start_capital_paise?: number;
  r2_equity_paise?: number;
  r2_return_pct?: number;
  total_pnl_paise?: number;
}

export default function PodiumPage() {
  const [data, setData] = useState<TeamScoreData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("merx_token");
        const res = await api.get("/leaderboard", token || "");
        setData(res);
      } catch (err) {
        console.error("Failed to load results", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("merx_token");
    router.push("/");
  };

  const formatMoney = (paise?: number | null) => {
    if (paise === undefined || paise === null) return "—";
    const absVal = Math.abs(paise) / 100;
    const formatted = `₹${absVal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
    return paise < 0 ? `-${formatted}` : formatted;
  };

  const r1Start = data?.r1_start_capital_paise ?? 100000000; // 10 Lakhs
  const r2Start = data?.r2_start_capital_paise ?? 1000000000; // 1 Crore

  const r1Equity = data?.r1_equity_paise;
  const r1Pnl = r1Equity !== undefined && r1Equity !== null ? r1Equity - r1Start : null;
  const r1Ret = data?.r1_return_pct;

  const r2Equity = data?.r2_equity_paise;
  const r2Pnl = r2Equity !== undefined && r2Equity !== null ? r2Equity - r2Start : null;
  const r2Ret = data?.r2_return_pct;

  const totalPnl = data?.total_pnl_paise ?? ((r1Pnl ?? 0) + (r2Pnl ?? 0));

  // Determine witty developer roast based on team's actual performance
  const getDevRoast = () => {
    if (data?.eliminated) {
      return {
        title: "Terminal Velocity Achieved 💥",
        badge: "Speedrun to Zero",
        quote:
          "Full leverage, maximum speed, zero brakes. You didn't just exit the trade—you exited existence itself. Legendary conviction.",
        statusColor: "text-loss",
        badgeColor: "bg-loss-dim border-loss-border text-loss"
      };
    }

    const totalStart = r1Start + (data?.is_r2 ? r2Start : 0);
    const returnPct = totalStart > 0 ? (totalPnl / totalStart) * 100 : 0;

    if (returnPct >= 20) {
      return {
        title: "Certified Market Wizard 🧙‍♂️",
        badge: "Hedge Fund Material",
        quote:
          "Wait, you actually walked away with serious profit? Did you decode our websocket packets or did you just ruthlessly short the bank collapse? Frame this screenshot immediately.",
        statusColor: "text-gain",
        badgeColor: "bg-gain-dim border-gain-border text-gain"
      };
    }

    if (returnPct > 2) {
      return {
        title: "Green on the Screen 📈",
        badge: "Alpha Seeker",
        quote:
          "Profit is profit! You dodged the panic sells, ignored the noise, and took money off our bots. In trading, walking away green is 90% discipline.",
        statusColor: "text-gain",
        badgeColor: "bg-gain-dim border-gain-border text-gain"
      };
    }

    if (returnPct >= -5) {
      return {
        title: "The Zen Hodler 🧘",
        badge: "Capital Preserver",
        quote:
          "You basically treated Bazaar like a sovereign fixed deposit. While everyone else was getting whiplash from rate hikes, you kept your cool and survived intact.",
        statusColor: "text-tx-primary",
        badgeColor: "bg-accent-dim border-accent-border text-accent"
      };
    }

    if (returnPct >= -40) {
      return {
        title: "Battle-Tested Trader 🛡️",
        badge: "Tuition Paid",
        quote:
          "A few scrapes and bruises from Round 2's volatility. If anyone asks, tell them you were executing a sophisticated non-linear macro hedge.",
        statusColor: "text-warn",
        badgeColor: "bg-warn-dim border-warn-border text-warn"
      };
    }

    // Heavy drawdown (-40% or worse)
    return {
      title: "Exit Liquidity Specialist 📉💥",
      badge: "Diamond Hands",
      quote:
        "We watched that portfolio in Round 2... did you buy the dip on Apex Bank while the building was actively on fire? Respect the bravery, but your virtual risk manager has left the country.",
      statusColor: "text-loss",
      badgeColor: "bg-loss-dim border-loss-border text-loss"
    };
  };

  const roast = getDevRoast();

  return (
    <div className="min-h-screen bg-bg-void text-tx-primary flex flex-col items-center pt-5 pb-16 px-4 sm:px-6 md:px-8 font-sans selection:bg-accent-dim selection:text-accent">
      {/* ── TOP UTILITY NAVIGATION ─────────────────────────────────── */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-8 pb-4 border-b border-bd-hairline">
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-raised border border-bd-subtle hover:border-bd-strong text-tx-secondary hover:text-tx-primary text-xs font-mono font-medium transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <Link
            href="/market"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-raised border border-bd-subtle hover:border-bd-strong text-tx-secondary hover:text-tx-primary text-xs font-mono font-medium transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg bg-bg-raised border border-bd-subtle hover:border-bd-strong text-tx-secondary hover:text-tx-primary transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-warn" /> : <Moon className="w-4 h-4 text-accent" />}
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-raised border border-bd-subtle hover:border-bd-strong text-tx-secondary hover:text-tx-primary text-xs font-mono transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── TEAM HEADER & TOTAL P&L ──────────────────────────────── */}
      <div className="w-full max-w-4xl mb-6">
        <div className="bg-bg-raised/80 border border-bd-subtle rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-card">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-dim border border-accent-border font-mono text-[10px] uppercase tracking-wider text-accent font-semibold mb-2">
              <Shield className="w-3 h-3" />
              <span>Tournament Debrief</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-tx-primary">
              {data?.team_name || data?.team_id || "Your Trading Desk"}
            </h1>
            <div className="flex items-center gap-2 mt-1 font-mono text-xs text-tx-secondary">
              <span>Desk ID: <strong className="text-tx-primary">{data?.team_id || "—"}</strong></span>
              <span>·</span>
              <span>
                {data?.eliminated ? (
                  <span className="text-loss font-semibold">Margin Called</span>
                ) : (
                  <span className="text-gain font-semibold">Solvent & Settled</span>
                )}
              </span>
            </div>
          </div>

          <div className="bg-bg-base/70 border border-bd-hairline rounded-xl px-4 py-3 flex flex-col sm:items-end font-mono">
            <span className="text-[10px] uppercase font-bold text-tx-muted tracking-wider">
              Total Cumulative P&L
            </span>
            <div
              className={clsx(
                "text-2xl sm:text-3xl font-extrabold mt-0.5 tracking-tight",
                totalPnl >= 0 ? "text-gain" : "text-loss"
              )}
            >
              {totalPnl >= 0 ? "+" : ""}
              {formatMoney(totalPnl)}
            </div>
          </div>
        </div>
      </div>

      {/* ── SIMPLE & CLEAN SCORE BRIEF (ROUND 1 & ROUND 2) ────────── */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* ROUND 1 */}
        <div className="bg-bg-raised/70 border border-bd-subtle rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-card">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-accent-dim border border-accent-border font-mono font-bold text-xs text-accent">
                  R1
                </span>
                <span className="font-mono font-bold text-sm text-tx-primary">Round 1 (Sessions 1–6)</span>
              </div>
              <span className="text-[11px] font-mono text-tx-muted">
                Start: ₹10,00,000
              </span>
            </div>

            <div className="mb-4">
              <div className="text-[10px] font-mono uppercase font-bold text-tx-muted tracking-wider">
                Final Equity
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-tx-primary mt-1">
                {formatMoney(r1Equity)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-bd-hairline font-mono">
              <div>
                <div className="text-[10px] uppercase font-bold text-tx-muted">Net P&L</div>
                <div
                  className={clsx(
                    "text-sm font-bold mt-0.5",
                    (r1Pnl ?? 0) >= 0 ? "text-gain" : "text-loss"
                  )}
                >
                  {(r1Pnl ?? 0) >= 0 ? "+" : ""}
                  {formatMoney(r1Pnl)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-tx-muted">Return</div>
                <div
                  className={clsx(
                    "text-sm font-bold mt-0.5",
                    (r1Ret ?? 0) >= 0 ? "text-gain" : "text-loss"
                  )}
                >
                  {r1Ret !== undefined && r1Ret !== null
                    ? `${r1Ret >= 0 ? "+" : ""}${r1Ret.toFixed(2)}%`
                    : "—"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROUND 2 */}
        <div className="bg-bg-raised/70 border border-bd-subtle rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-card">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 font-mono font-bold text-xs text-purple-300">
                  R2
                </span>
                <span className="font-mono font-bold text-sm text-tx-primary">Round 2 (Sessions 7–11)</span>
              </div>
              <span className="text-[11px] font-mono text-tx-muted">
                Start: ₹1,00,00,000
              </span>
            </div>

            <div className="mb-4">
              <div className="text-[10px] font-mono uppercase font-bold text-tx-muted tracking-wider">
                Final Equity
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-tx-primary mt-1">
                {formatMoney(r2Equity)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-bd-hairline font-mono">
              <div>
                <div className="text-[10px] uppercase font-bold text-tx-muted">Net P&L</div>
                <div
                  className={clsx(
                    "text-sm font-bold mt-0.5",
                    (r2Pnl ?? 0) >= 0 ? "text-gain" : "text-loss"
                  )}
                >
                  {(r2Pnl ?? 0) >= 0 ? "+" : ""}
                  {formatMoney(r2Pnl)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-tx-muted">Return</div>
                <div
                  className={clsx(
                    "text-sm font-bold mt-0.5",
                    (r2Ret ?? 0) >= 0 ? "text-gain" : "text-loss"
                  )}
                >
                  {r2Ret !== undefined && r2Ret !== null
                    ? `${r2Ret >= 0 ? "+" : ""}${r2Ret.toFixed(2)}%`
                    : "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── NOTES FROM DEVELOPER (FUN & HUMOROUS) ────────────────── */}
      <div className="w-full max-w-4xl space-y-4">
        {/* Roast / Verdict Box */}
        <div className="bg-bg-raised border border-bd-subtle rounded-2xl p-5 sm:p-6 shadow-card relative overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-accent" />
              <h3 className="font-mono font-bold text-sm uppercase tracking-wider text-tx-primary">
                Developer&apos;s Post-Mortem
              </h3>
            </div>
            <span
              className={clsx(
                "text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                roast.badgeColor
              )}
            >
              {roast.badge}
            </span>
          </div>

          <h4 className={clsx("text-lg font-bold mb-2", roast.statusColor)}>
            {roast.title}
          </h4>

          <p className="text-sm text-tx-secondary leading-relaxed italic mb-5">
            &ldquo;{roast.quote}&rdquo;
          </p>

          {/* Quick humorous bullet points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-bd-hairline">
            <div className="bg-bg-base/70 border border-bd-subtle/80 rounded-xl p-3.5 flex items-start gap-2.5">
              <span className="text-base shrink-0 select-none">💸</span>
              <div className="text-xs">
                <span className="font-bold text-tx-primary block mb-0.5">Your Debt is 100% Fictional</span>
                <span className="text-tx-secondary leading-relaxed">
                  No recovery agents will knock on your door. Simulated losses build pure, unadulterated character.
                </span>
              </div>
            </div>

            <div className="bg-bg-base/70 border border-bd-subtle/80 rounded-xl p-3.5 flex items-start gap-2.5">
              <span className="text-base shrink-0 select-none">🤖</span>
              <div className="text-xs">
                <span className="font-bold text-tx-primary block mb-0.5">The @BullRunBhai Secret</span>
                <span className="text-tx-secondary leading-relaxed">
                  The Finfluencer alerts were coded with a 35% truth rate. Doing the exact opposite was literally a 65% mathematical advantage!
                </span>
              </div>
            </div>

            <div className="bg-bg-base/70 border border-bd-subtle/80 rounded-xl p-3.5 flex items-start gap-2.5">
              <span className="text-base shrink-0 select-none">⚡</span>
              <div className="text-xs">
                <span className="font-bold text-tx-primary block mb-0.5">Round 2 Was a Meatgrinder</span>
                <span className="text-tx-secondary leading-relaxed">
                  A 75bps rate shock, bank panic, and aggressive market-making bots—if you felt dizziness, you experienced authentic trading.
                </span>
              </div>
            </div>

            <div className="bg-bg-base/70 border border-bd-subtle/80 rounded-xl p-3.5 flex items-start gap-2.5">
              <span className="text-base shrink-0 select-none">☕</span>
              <div className="text-xs">
                <span className="font-bold text-tx-primary block mb-0.5">Doctor&apos;s Prescription</span>
                <span className="text-tx-secondary leading-relaxed">
                  Close all candlestick charts, hydrate, touch some grass, and don&apos;t look at financial news for at least 12 hours.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ACTIONS ────────────────────────────────────────── */}
      <footer className="w-full max-w-4xl mt-10 pt-5 border-t border-bd-hairline flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-tx-muted">
        <div>Bazaar Simulation · Tournament Concluded</div>

        <div className="flex items-center gap-3">
          <Link
            href="/market"
            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-tx-inverse font-bold transition-all"
          >
            Back to Terminal
          </Link>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-lg bg-bg-raised hover:bg-bg-overlay border border-bd-subtle text-tx-secondary hover:text-tx-primary transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </footer>
    </div>
  );
}

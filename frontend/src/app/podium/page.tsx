"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Trophy, BookOpen, Radio, Sparkles,
  ArrowLeft, Sun, Moon, Home, Clock,
  CheckCircle2, AlertTriangle, ChevronDown,
  ChevronUp, Compass, LogOut, Award,
  Users, DollarSign, Activity, Percent
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import clsx from "clsx";

// ── TYPES ──────────────────────────────────────────────────────────
interface LeaderboardRow {
  team_id: string;
  team_name?: string;
  equity_paise: number;
  eliminated?: boolean;
  rank: number;
}

interface LeaderboardData {
  top_10: LeaderboardRow[];
  my_result?: LeaderboardRow;
}

interface SessionGuide {
  g: number;
  code: string;
  round: string;
  title: string;
  subtitle: string;
  world: string;
  theEdge: string;
  winningPlay: string;
  trapToAvoid: string;
  keyAssets: string[];
}

// ── 11 SESSIONS ARC & TACTICAL PLAYBOOK ─────────────────────────────
const SESSION_GUIDES: SessionGuide[] = [
  // ROUND 1: THE RETAIL CREDIT BOOM
  {
    g: 1,
    code: "R1S1",
    round: "Round 1",
    title: "Opening Bell · The Credit Foundation",
    subtitle: "Calm regime · Stable credit · Baseline trend discovery",
    world: "Stable growth and cheap credit. The Meridian Central Bank (MCB) held rates at 4.00%. GOLDCORE barely moved, while broad equities enjoyed calm liquidity.",
    theEdge: "INFN (+3.0%) and HRZN (+2.5%) were established as steady trend names. TYRL swung ±1.8% around its mean—the first recurring range-bound oscillator.",
    winningPlay: "Buy the trend on INFN / HRZN; scalp TYRL's swings using SMA20; minimize churn.",
    trapToAvoid: "@BullRunBhai pumped BZR-V with urgent tweets. Chasing the pump resulted in immediate losses when it faded −1.5%. Over-trading also drained capital through fees.",
    keyAssets: ["INFN", "HRZN", "TYRL", "BZR-V"]
  },
  {
    g: 2,
    code: "R1S2",
    round: "Round 1",
    title: "Cheap Money · Post-News Drift",
    subtitle: "Euphoric growth names · Nimbus Datacenters unlocks",
    world: "Bank credit growth surged to 16%. Euphoria spread through tech and speculative high-beta names. PULSE caught its first retail rally.",
    theEdge: "The Post-Earnings Announcement Drift (PEAD): When INFN and NIMBUS beat estimates, their price didn't jump instantly—it drifted upward for 40+ seconds.",
    winningPlay: "Buy INFN and NIMBUS the moment analyst wires confirmed earnings, then patiently hold the drift. Ride PULSE and take profit into the rally.",
    trapToAvoid: "Selling tech the instant the headline hit. The move had prolonged momentum after the print.",
    keyAssets: ["NIMBUS", "INFN", "PULSE"]
  },
  {
    g: 3,
    code: "R1S3",
    round: "Round 1",
    title: "A Small Cough · Silent Events & Noise",
    subtitle: "Inflation ticks up · Staple Agro unlocks",
    world: "CPI inflation ticked up to 4.5%. Central bank soothing was contradicted by bank margins. Chatrooms buzzed with rumors.",
    theEdge: "Silent Events: BZR-V spiked +7% purely on chatroom speculation without a single news item, then fully retraced. Not every move has a legitimate catalyst.",
    winningPlay: "Do not chase unverified spikes. Fade BZR-V at resistance. Hold disciplined long trends or take refuge in STAPLE and GOLDCORE.",
    trapToAvoid: "Assuming every rapid price movement has an underlying corporate announcement. Chatroom FOMO is designed to trap liquidity.",
    keyAssets: ["BZR-V", "STAPLE", "GOLDCORE"]
  },
  {
    g: 4,
    code: "R1S4",
    round: "Round 1",
    title: "The Corridor Closes · The War Shock",
    subtitle: "Geopolitical shock · Voltage Power unlocks · Market correlation jumps to 1",
    world: "A sudden regional conflict severed the key maritime oil corridor. Energy prices exploded; broad equity correlations jumped toward 1.",
    theEdge: "Asset Decoupling: RLNT (pure energy producer) surged +5%, and GOLDCORE caught safe-haven inflows. Meanwhile, VOLTAGE spiked initially on correlation but crashed −12% because its feedstock was cut.",
    winningPlay: "Aggressively buy RLNT; allocate capital to GOLDCORE as a hedge; avoid or short VOLTAGE (the Calder & Wyn analyst explicitly warned of its corridor exposure).",
    trapToAvoid: "Buying VOLTAGE because 'all energy is rising'. Sector is not destiny—feedstock vulnerabilities matter.",
    keyAssets: ["RLNT", "VOLTAGE", "GOLDCORE"]
  },
  {
    g: 5,
    code: "R1S5",
    round: "Round 1",
    title: "Stimulus Whispers · Sector Rotation",
    subtitle: "State infrastructure pivot · Crane Maritime unlocks",
    world: "The government signaled targeted maritime infrastructure stimulus to bypass the closed corridor. Capital rotated out of expensive energy into infrastructure.",
    theEdge: "Mean-Reversion on Panic: TYRL missed delivery targets and dipped −2.5%, but immediately reverted to positive net gains.",
    winningPlay: "Rotate capital into CRANE on the stimulus signal; buy the TYRL earnings dip; take profits on RLNT before its −3.0% retracement.",
    trapToAvoid: "Panic selling TYRL at the absolute low. Heavy industrials mean-revert when supported by broad infrastructure spending.",
    keyAssets: ["CRANE", "TYRL", "RLNT"]
  },
  {
    g: 6,
    code: "R1S6",
    round: "Round 1",
    title: "Last Dance of the Boom · Euphoria Before Reset",
    subtitle: "Consumer confidence peak · MERX50 Index unlocks · The Reset approaching",
    world: "Consumer confidence hit an 18-month high. Valuations were stretched to perfection. PULSE experienced a massive blow-off top (+14%).",
    theEdge: "The Fundamentals Clue: Looking at Horizon Bank (HRZN)'s fundamentals tab revealed Gross NPAs quietly creeping from 2.1% → 2.3%, foreshadowing future distress.",
    winningPlay: "Ride PULSE early then aggressively exit near the top; lighten exposure to banks; stash capital in GOLDCORE or cash before the Round 2 reset.",
    trapToAvoid: "Holding speculative bags into the end of Round 1. Taking profits and observing was optimal.",
    keyAssets: ["PULSE", "HRZN", "MERX50"]
  },

  // ROUND 2: THE INSTITUTIONAL RECKONING
  {
    g: 7,
    code: "R2S1",
    round: "Round 2",
    title: "The Hike · The Shared Order Book",
    subtitle: "War inflation forces surprise 75bps hike · Algorithmic bot swarms online",
    world: "Persistent commodity inflation forced the Meridian Central Bank into an emergency rate hike (4.00% → 4.75%). Round 2 commenced: all teams traded on a single shared order book, and algorithmic market-making bots penalized blind market pushes.",
    theEdge: "Microstructure & Bot Liquidity: Market orders triggered price impact, but bot market-makers defended fair value and pulled prices back over 8–15 seconds. Firing blind market orders resulted in self-inflicted slippage.",
    winningPlay: "Accumulate GOLDCORE as a risk hedge (+1.2%); trade patient limit orders; unlock Research L2 in the Stat Shop to intercept desk leaks.",
    trapToAvoid: "Believing @BullRunBhai that 'PULSE is a digital hedge against inflation'. PULSE dropped −5% immediately as liquidity dried up.",
    keyAssets: ["GOLDCORE", "HRZN", "PULSE"]
  },
  {
    g: 8,
    code: "R2S2",
    round: "Round 2",
    title: "Apex Falls · The Value Trap",
    subtitle: "Acute banking panic · Apex Bank unlocks · Short selling unlocked",
    world: "Apex Capital Bank disclosed catastrophic bad loans from the retail boom. Gross NPA skyrocketed from 3.1% → 8.9%. Contagion dragged down Horizon Bank (HRZN).",
    theEdge: "The Value Trap: APEX appeared deceptively cheap with an apparent low P/E of 12, but its earnings were an accounting illusion. The Wyckoff distribution wave guaranteed a multi-wave selloff.",
    winningPlay: "Unlock Capital ≥ 1 to short APEX (−14%) and HRZN (−9%) early with Calder & Wyn research leaks; fade the temporary retail dip buyers.",
    trapToAvoid: "Buying APEX because 'it fell 10% and looks like a discount'. Broken balance sheets in a credit crunch go to zero.",
    keyAssets: ["APEX", "HRZN", "GOLDCORE"]
  },
  {
    g: 9,
    code: "R2S3",
    round: "Round 2",
    title: "Contagion · Flight to Quality",
    subtitle: "Risk-off panic · Ledger FinTech unlocks · Crypto protocol exploit",
    world: "Interbank credit froze as lenders refused unsecured paper. High-flying growth tech was liquidated to cover banking margin calls. A smart-contract exploit struck PULSE.",
    theEdge: "Flight to Quality Inside Tech: While NIMBUS and INFN were dumped for liquidity, LEDGER (unlocked with enterprise recurring SaaS revenue) gained +4%. PULSE plunged −16%.",
    winningPlay: "Go long LEDGER on enterprise safety; stay short or flat on banking names; avoid PULSE entirely; anchor core capital in GOLDCORE.",
    trapToAvoid: "Trying to catch the falling knife on PULSE. Protocol exploits paired with regulatory investigations are unrecoverable intraday.",
    keyAssets: ["LEDGER", "PULSE", "NIMBUS"]
  },
  {
    g: 10,
    code: "R2S4",
    round: "Round 2",
    title: "The Turn · The Bailout & Short Squeeze",
    subtitle: "State intervention · Forge Steel unlocks · Violent short squeeze",
    world: "The government announced an emergency liquidity backstop and massive state reconstruction contracts. Panic violently inverted into relief.",
    theEdge: "The Short Squeeze: Crowded retail shorts remained aggressively short on banks. When the state facility was announced, HRZN and APEX squeezed +4%, while FORGE surged +9% on contracts.",
    winningPlay: "Immediately cover bank short positions; buy FORGE on the reconstruction news; ride industrial momentum into the print.",
    trapToAvoid: "Staying stubbornly short into state liquidity intervention. Fighting central bank backstops is guaranteed liquidation.",
    keyAssets: ["FORGE", "CRANE", "HRZN", "APEX"]
  },
  {
    g: 11,
    code: "R2S5",
    round: "Round 2",
    title: "New Normal · Final Resolution",
    subtitle: "Peak rates signaled · Partial recovery · The Closing Bell",
    world: "The Central Bank signaled that policy rates had peaked. The financial system stabilized into a selective, post-crisis equilibrium as the simulation concluded.",
    theEdge: "Discipline & Execution: With macro volatility tapering off, excessive churn and execution fees were the primary destroyers of rank. Patient capital outperformed.",
    winningPlay: "Hold high-conviction quality recovery names (INFN, NIMBUS, select cyclicals); avoid over-leveraged bets; close open risk before terminal bell.",
    trapToAvoid: "Believing finfluencer calls that 'the market is heading to new all-time highs'. The structural environment was permanently transformed.",
    keyAssets: ["INFN", "NIMBUS", "APEX", "MERX50"]
  }
];

// ── NEWS SOURCES TRUTH MATRIX ──────────────────────────────────────
const NEWS_SOURCES = [
  {
    code: "IN",
    name: "Desk Insider Leak",
    voice: "Terse, oddly specific, zero adjectives, anonymous",
    truthRate: "90% Accuracy",
    badge: "The Golden Wire",
    access: "Round 2 · Requires Research Level ≥ 2",
    description: "Delivered directly from institutional syndicate trading desks before public release. Only 1 rumor across the entire simulation was inaccurate.",
    tagColor: "text-purple-400 bg-purple-500/10 border-purple-500/30"
  },
  {
    code: "AN",
    name: "Calder & Wyn / Northgate",
    voice: "Measured, hedged, names explicit time horizons",
    truthRate: "75% Accuracy",
    badge: "Institutional Analysis",
    access: "Available to all (delivered earlier with higher Research)",
    description: "Equity research by Tier-1 brokerages. When Calder & Wyn warned of VOLTAGE feedstock exposure or APEX credit distress, they were virtually always on target.",
    tagColor: "text-accent bg-accent-dim border-accent-border"
  },
  {
    code: "NP",
    name: "The Meridian Standard",
    voice: "Formal, journalistic, recounts past events",
    truthRate: "55% (Coin Flip)",
    badge: "Mainstream Press",
    access: "Public wire",
    description: "Reports what already happened. Often lagged and promoted consensus soothing—such as assuring readers inflation was 'transitory' right before the rate shock.",
    tagColor: "text-tx-secondary bg-bg-base border-bd-subtle"
  },
  {
    code: "FF",
    name: "@BullRunBhai",
    voice: "Loud, emotional, ALL-CAPS urgency (BUY NOW, LAST CHANCE)",
    truthRate: "35% (65% INVERSE!)",
    badge: "Retail Liquidity Trap",
    access: "Public social feed",
    description: "The ultimate retail trap. He never quoted concrete numbers and hyped every dip. Top quant teams printed alpha by taking the exact opposite side of his tweets.",
    tagColor: "text-loss bg-loss-dim border-loss-border"
  }
];

// ── ASSET ARCHETYPES ───────────────────────────────────────────────
const ASSET_ARCHETYPES = [
  {
    ticker: "GOLDCORE",
    sector: "Commodities / Reserve",
    role: "Ultra Safe Haven",
    rule: "Flat during calm sessions; massive alpha during the S4 war shock, S7 rate hike, and S8-S9 banking crisis. The core hedge for defensive capital."
  },
  {
    ticker: "RLNT",
    sector: "Energy / Crude",
    role: "Commodity Engine",
    rule: "Surged +5% when the maritime corridor closed in S4. Benefited from high oil prices until state stimulus rotated capital into infrastructure in S5."
  },
  {
    ticker: "HRZN",
    sector: "Commercial Banking",
    role: "Credit Cycle Core",
    rule: "Fueled the retail boom in S1-S2. Fundamentals quietly flagged rising Gross NPAs in S6 before crashing in S8-S9 and recovering in S10."
  },
  {
    ticker: "APEX",
    sector: "Investment Banking",
    role: "The Value Trap",
    rule: "Appeared cheap with an initial P/E of 12 in R2S2, but gross bad debt exploded to 8.9%. Shorting APEX was the highest-conviction trade of Round 2."
  },
  {
    ticker: "PULSE",
    sector: "Speculative / High-Beta",
    role: "Retail FOMO Magnet",
    rule: "Massive speculative runs in S2 (+5%) and S6 (+14%), followed by a devastating exploit flash crash in S9 (−16%). Riding and exiting early was vital."
  },
  {
    ticker: "INFN & NIMBUS",
    sector: "Tech Growth & Cloud",
    role: "Post-Earnings Drift",
    rule: "Exhibited classic 40-second drift in S2. Liquidated for margin during the S8-S9 banking panic, then led the relief rally in S10-S11."
  },
  {
    ticker: "CRANE & FORGE",
    sector: "Industrials / Metals",
    role: "State Stimulus Plays",
    rule: "Exploded during S5 maritime logistics stimulus and S10 reconstruction contracts (+9%). Fast buyers reaped rapid momentum gains."
  },
  {
    ticker: "TYRL",
    sector: "Automotive / Industrials",
    role: "Mean-Reverting Oscillator",
    rule: "Cleanly oscillated ±1.8% around its 20-period moving average. Buying oversold dips and fading euphoria at resistance generated steady profits."
  },
  {
    ticker: "BZR-V",
    sector: "Media / Speculation",
    role: "Chatroom Noise Trap",
    rule: "Pumped on social rumor spikes without real catalysts, followed by 100% retracements. Experienced desks faded every unverified spike."
  }
];

export default function PodiumPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"STANDINGS" | "STORY" | "NEWS" | "ASSETS">("STANDINGS");
  const [selectedRoundFilter, setSelectedRoundFilter] = useState<"ALL" | "R1" | "R2">("ALL");
  const [expandedSession, setExpandedSession] = useState<number | null>(7); // Default to R2S1 for immediate insight

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

  const filteredSessions = SESSION_GUIDES.filter((s) => {
    if (selectedRoundFilter === "R1") return s.g <= 6;
    if (selectedRoundFilter === "R2") return s.g >= 7;
    return true;
  });

  const formatMoney = (paise: number) =>
    `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const calculateReturn = (equityPaise: number) => {
    // Starting capital: 1 Crore (100,000,000 paise)
    const diff = equityPaise - 100000000;
    const pct = (diff / 100000000) * 100;
    return {
      diffPaise: diff,
      pct: pct,
      isPositive: diff >= 0
    };
  };

  const top10 = data?.top_10 || [];
  const myResult = data?.my_result;

  const firstPlace = top10.length > 0 ? top10[0] : null;
  const secondPlace = top10.length > 1 ? top10[1] : null;
  const thirdPlace = top10.length > 2 ? top10[2] : null;

  return (
    <div className="min-h-screen bg-bg-void text-tx-primary flex flex-col items-center pt-5 pb-20 px-4 sm:px-6 md:px-8 font-sans selection:bg-accent-dim selection:text-accent">
      
      {/* ── TOP UTILITY NAVIGATION ─────────────────────────────────── */}
      <header className="w-full max-w-5xl flex items-center justify-between mb-8 pb-4 border-b border-bd-hairline">
        <div className="flex items-center gap-3">
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

      {/* ── HEADER BANNER: CLEAN & DIGNIFIED ──────────────────────── */}
      <div className="w-full max-w-5xl text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-dim border border-accent-border font-mono text-[11px] uppercase tracking-wider text-accent font-semibold mb-3">
          <Trophy className="w-3.5 h-3.5" />
          <span>Official Results & Strategy Playbook</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-tx-primary mb-2">
          The Bazaar Podium
        </h1>
        <p className="text-tx-secondary text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          The matching engine has settled all positions. Review the final tournament standings, verified returns, and the complete institutional strategy debrief.
        </p>
      </div>

      {/* ── NAVIGATION TABS ───────────────────────────────────────── */}
      <div className="w-full max-w-5xl mb-8">
        <div className="flex items-center gap-2 border-b border-bd-hairline pb-2.5 overflow-x-auto scrollbar-none font-mono text-xs">
          <button
            onClick={() => setActiveTab("STANDINGS")}
            className={clsx(
              "px-4 py-2 rounded-lg font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap",
              activeTab === "STANDINGS"
                ? "bg-accent text-tx-inverse"
                : "bg-bg-raised text-tx-secondary hover:text-tx-primary border border-bd-subtle"
            )}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Final Standings</span>
          </button>

          <button
            onClick={() => setActiveTab("STORY")}
            className={clsx(
              "px-4 py-2 rounded-lg font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap",
              activeTab === "STORY"
                ? "bg-accent text-tx-inverse"
                : "bg-bg-raised text-tx-secondary hover:text-tx-primary border border-bd-subtle"
            )}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Story & 11 Sessions Arc</span>
          </button>

          <button
            onClick={() => setActiveTab("NEWS")}
            className={clsx(
              "px-4 py-2 rounded-lg font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap",
              activeTab === "NEWS"
                ? "bg-accent text-tx-inverse"
                : "bg-bg-raised text-tx-secondary hover:text-tx-primary border border-bd-subtle"
            )}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>News Sources Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab("ASSETS")}
            className={clsx(
              "px-4 py-2 rounded-lg font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap",
              activeTab === "ASSETS"
                ? "bg-accent text-tx-inverse"
                : "bg-bg-raised text-tx-secondary hover:text-tx-primary border border-bd-subtle"
            )}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Asset Playbook</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          TAB 1: STANDINGS & PODIUM
         ════════════════════════════════════════════════════════════ */}
      {activeTab === "STANDINGS" && (
        <div className="w-full max-w-5xl space-y-8">
          
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            
            {/* 🥈 2nd Place (Silver) */}
            <div className="order-2 md:order-1 bg-bg-raised border border-bd-subtle rounded-xl p-5 flex flex-col items-center text-center relative overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-slate-400/10 border border-slate-400/30 flex items-center justify-center text-slate-300 font-mono font-bold text-sm mb-3">
                🥈 2nd
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-tx-muted font-bold mb-1">
                Runner-Up
              </span>
              <div className="text-lg font-bold text-tx-primary truncate max-w-[200px]">
                {secondPlace ? secondPlace.team_name || secondPlace.team_id : "TBD"}
              </div>
              <div className="text-xl font-bold font-mono text-tx-primary mt-2">
                {secondPlace ? formatMoney(secondPlace.equity_paise) : "—"}
              </div>
              {secondPlace && (
                <div className={clsx(
                  "text-xs font-mono font-semibold mt-1 px-2 py-0.5 rounded",
                  calculateReturn(secondPlace.equity_paise).isPositive
                    ? "text-gain bg-gain-dim"
                    : "text-loss bg-loss-dim"
                )}>
                  {calculateReturn(secondPlace.equity_paise).isPositive ? "+" : ""}
                  {calculateReturn(secondPlace.equity_paise).pct.toFixed(2)}%
                </div>
              )}
            </div>

            {/* 🥇 1st Place (Gold / Champion) */}
            <div className="order-1 md:order-2 bg-bg-raised border-2 border-amber-500/40 rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden shadow-sm md:-translate-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 font-mono font-bold text-base mb-3">
                🥇 1st
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold mb-1">
                Simulation Champion
              </span>
              <div className="text-xl font-bold text-tx-primary truncate max-w-[240px]">
                {firstPlace ? firstPlace.team_name || firstPlace.team_id : "TBD"}
              </div>
              <div className="text-2xl font-black font-mono text-tx-primary mt-2">
                {firstPlace ? formatMoney(firstPlace.equity_paise) : "—"}
              </div>
              {firstPlace && (
                <div className={clsx(
                  "text-xs font-mono font-semibold mt-1 px-2.5 py-0.5 rounded",
                  calculateReturn(firstPlace.equity_paise).isPositive
                    ? "text-gain bg-gain-dim"
                    : "text-loss bg-loss-dim"
                )}>
                  {calculateReturn(firstPlace.equity_paise).isPositive ? "+" : ""}
                  {calculateReturn(firstPlace.equity_paise).pct.toFixed(2)}%
                </div>
              )}
            </div>

            {/* 🥉 3rd Place (Bronze) */}
            <div className="order-3 bg-bg-raised border border-bd-subtle rounded-xl p-5 flex flex-col items-center text-center relative overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-amber-700/15 border border-amber-700/30 flex items-center justify-center text-amber-600 font-mono font-bold text-sm mb-3">
                🥉 3rd
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-tx-muted font-bold mb-1">
                Podium Finish
              </span>
              <div className="text-lg font-bold text-tx-primary truncate max-w-[200px]">
                {thirdPlace ? thirdPlace.team_name || thirdPlace.team_id : "TBD"}
              </div>
              <div className="text-xl font-bold font-mono text-tx-primary mt-2">
                {thirdPlace ? formatMoney(thirdPlace.equity_paise) : "—"}
              </div>
              {thirdPlace && (
                <div className={clsx(
                  "text-xs font-mono font-semibold mt-1 px-2 py-0.5 rounded",
                  calculateReturn(thirdPlace.equity_paise).isPositive
                    ? "text-gain bg-gain-dim"
                    : "text-loss bg-loss-dim"
                )}>
                  {calculateReturn(thirdPlace.equity_paise).isPositive ? "+" : ""}
                  {calculateReturn(thirdPlace.equity_paise).pct.toFixed(2)}%
                </div>
              )}
            </div>

          </div>

          {/* User's Team Scorecard */}
          {myResult && (
            <div className="bg-bg-raised border border-accent-border/50 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-accent-dim border border-accent-border flex items-center justify-center font-mono font-bold text-sm text-accent shrink-0">
                  #{myResult.rank}
                </div>
                <div>
                  <div className="text-xs font-mono text-accent font-bold uppercase tracking-wider">
                    Your Team Scorecard
                  </div>
                  <div className="text-base font-bold text-tx-primary flex items-center gap-2">
                    <span>{myResult.team_name || myResult.team_id}</span>
                    {myResult.eliminated && (
                      <span className="text-[10px] font-mono text-loss bg-loss-dim border border-loss-border px-1.5 py-0.2 rounded font-bold">
                        LIQUIDATED
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 font-mono text-right w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-bd-hairline">
                <div>
                  <div className="text-[10px] text-tx-muted uppercase font-bold">Portfolio Value</div>
                  <div className="text-base font-bold text-tx-primary">
                    {formatMoney(myResult.equity_paise)}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-tx-muted uppercase font-bold">Total Return</div>
                  <div className={clsx(
                    "text-base font-bold",
                    calculateReturn(myResult.equity_paise).isPositive ? "text-gain" : "text-loss"
                  )}>
                    {calculateReturn(myResult.equity_paise).isPositive ? "+" : ""}
                    {calculateReturn(myResult.equity_paise).pct.toFixed(2)}%
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-tx-muted uppercase font-bold">Placement</div>
                  <div className="text-base font-bold text-accent">
                    Rank #{myResult.rank}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="bg-bg-raised border border-bd-subtle rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-bd-subtle flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-accent" />
                <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-tx-primary">
                  Top Standings
                </h3>
              </div>
              <span className="text-xs font-mono text-tx-muted">
                {top10.length} teams listed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-bd-hairline bg-bg-base/60 text-tx-muted text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-4 font-bold w-16">Rank</th>
                    <th className="py-2.5 px-4 font-bold">Team Name</th>
                    <th className="py-2.5 px-4 font-bold text-right">Terminal Equity</th>
                    <th className="py-2.5 px-4 font-bold text-right">Net Return</th>
                    <th className="py-2.5 px-4 font-bold text-center w-24">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bd-hairline">
                  {top10.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-tx-muted">
                        No team results recorded yet.
                      </td>
                    </tr>
                  ) : (
                    top10.map((row) => {
                      const isMe = myResult && myResult.team_id === row.team_id;
                      const ret = calculateReturn(row.equity_paise);

                      return (
                        <tr
                          key={row.team_id}
                          className={clsx(
                            "transition-colors",
                            isMe ? "bg-accent-dim/20" : "hover:bg-bg-base/40"
                          )}
                        >
                          <td className="py-3 px-4 font-bold">
                            <span
                              className={clsx(
                                "inline-flex items-center justify-center w-6 h-6 rounded text-xs",
                                row.rank === 1 && "bg-amber-500/20 text-amber-400 font-black",
                                row.rank === 2 && "bg-slate-400/20 text-slate-300 font-bold",
                                row.rank === 3 && "bg-amber-700/20 text-amber-600 font-bold",
                                row.rank > 3 && "text-tx-muted"
                              )}
                            >
                              #{row.rank}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className={clsx("font-bold", isMe ? "text-accent" : "text-tx-primary")}>
                                {row.team_name || row.team_id}
                              </span>
                              {isMe && (
                                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-accent text-tx-inverse">
                                  You
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-tx-primary">
                            {formatMoney(row.equity_paise)}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold">
                            <span className={ret.isPositive ? "text-gain" : "text-loss"}>
                              {ret.isPositive ? "+" : ""}
                              {ret.pct.toFixed(2)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {row.eliminated ? (
                              <span className="text-[10px] text-loss bg-loss-dim border border-loss-border px-1.5 py-0.5 rounded font-bold">
                                LIQ
                              </span>
                            ) : (
                              <span className="text-[10px] text-gain bg-gain-dim border border-gain-border px-1.5 py-0.5 rounded font-bold">
                                ACTIVE
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 2: STORYLINE & 11 SESSIONS ARC
         ════════════════════════════════════════════════════════════ */}
      {activeTab === "STORY" && (
        <div className="w-full max-w-5xl space-y-6">
          
          {/* Narrative Overview Box */}
          <div className="bg-bg-raised border border-bd-subtle rounded-xl p-5 text-sm leading-relaxed text-tx-secondary">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-accent mb-2">
              The Two-Act Economic Arc
            </div>
            <p className="mb-2">
              <strong className="text-tx-primary">Round 1 (The Retail Credit Boom):</strong> Cheap money and stable credit fuel euphoric rallies. Even when a geopolitical shock closes the maritime oil corridor, government stimulus temporarily props up sentiment for one final dance.
            </p>
            <p>
              <strong className="text-tx-primary">Round 2 (The Institutional Reckoning):</strong> The bill arrives. An emergency rate hike, algorithmic market makers, and bad debts trigger bank collapses and margin calls. A state reconstruction bailout fuels a violent short squeeze before the market settles into a selective new normal.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-tx-muted uppercase font-bold mr-1">Filter:</span>
              <button
                onClick={() => setSelectedRoundFilter("ALL")}
                className={clsx(
                  "px-3 py-1 rounded-lg border font-bold uppercase tracking-wider transition-all cursor-pointer",
                  selectedRoundFilter === "ALL"
                    ? "bg-accent text-tx-inverse border-accent"
                    : "bg-bg-raised text-tx-secondary border-bd-subtle hover:text-tx-primary"
                )}
              >
                All (11 Sessions)
              </button>
              <button
                onClick={() => setSelectedRoundFilter("R1")}
                className={clsx(
                  "px-3 py-1 rounded-lg border font-bold uppercase tracking-wider transition-all cursor-pointer",
                  selectedRoundFilter === "R1"
                    ? "bg-accent text-tx-inverse border-accent"
                    : "bg-bg-raised text-tx-secondary border-bd-subtle hover:text-tx-primary"
                )}
              >
                Round 1 (S1–S6)
              </button>
              <button
                onClick={() => setSelectedRoundFilter("R2")}
                className={clsx(
                  "px-3 py-1 rounded-lg border font-bold uppercase tracking-wider transition-all cursor-pointer",
                  selectedRoundFilter === "R2"
                    ? "bg-accent text-tx-inverse border-accent"
                    : "bg-bg-raised text-tx-secondary border-bd-subtle hover:text-tx-primary"
                )}
              >
                Round 2 (S7–S11)
              </button>
            </div>

            <span className="text-tx-muted text-[11px] hidden sm:inline">
              Click session to expand details
            </span>
          </div>

          {/* Sessions List */}
          <div className="space-y-3">
            {filteredSessions.map((guide) => {
              const isExpanded = expandedSession === guide.g;
              const isR2 = guide.g >= 7;

              return (
                <div
                  key={guide.g}
                  className={clsx(
                    "rounded-xl border transition-all overflow-hidden bg-bg-raised",
                    isExpanded ? "border-accent" : "border-bd-subtle hover:border-bd-strong"
                  )}
                >
                  {/* Card Header */}
                  <button
                    onClick={() => setExpandedSession(isExpanded ? null : guide.g)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={clsx(
                          "w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 border",
                          isR2
                            ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                            : "bg-accent-dim text-accent border-accent-border"
                        )}
                      >
                        S{guide.g}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-bg-base border border-bd-subtle text-tx-muted">
                            {guide.code} · {guide.round}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-tx-primary truncate">
                          {guide.title}
                        </h4>
                        <p className="text-xs font-mono text-tx-secondary truncate">
                          {guide.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="hidden sm:flex items-center gap-1">
                        {guide.keyAssets.map((asset) => (
                          <span
                            key={asset}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-base border border-bd-subtle text-tx-muted"
                          >
                            {asset}
                          </span>
                        ))}
                      </div>
                      <div className="p-1 rounded bg-bg-base border border-bd-subtle text-tx-secondary">
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-bd-hairline space-y-3.5 text-xs">
                      
                      {/* Macro Backdrop */}
                      <div className="bg-bg-base rounded-lg p-3.5 border border-bd-hairline">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-tx-muted mb-1 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-tx-muted" />
                          <span>Macro Narrative</span>
                        </div>
                        <p className="text-tx-secondary leading-relaxed">
                          {guide.world}
                        </p>
                      </div>

                      {/* Strategy & Trap Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-gain-dim/20 border border-gain-border/30 rounded-lg p-3.5">
                          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-gain mb-1 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-gain" />
                            <span>The Winning Play</span>
                          </div>
                          <p className="text-tx-primary leading-relaxed">
                            {guide.winningPlay}
                          </p>
                        </div>

                        <div className="bg-loss-dim/20 border border-loss-border/30 rounded-lg p-3.5">
                          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-loss mb-1 flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3 text-loss" />
                            <span>The Trap to Avoid</span>
                          </div>
                          <p className="text-tx-primary leading-relaxed">
                            {guide.trapToAvoid}
                          </p>
                        </div>
                      </div>

                      {/* Mathematical Market Dynamic */}
                      <div className="bg-bg-base rounded-lg p-3 border border-bd-subtle font-mono text-[11px] text-tx-secondary flex items-start gap-2">
                        <Activity className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-tx-primary mr-1">Market Mechanism:</strong>
                          <span>{guide.theEdge}</span>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 3: NEWS SOURCES MATRIX
         ════════════════════════════════════════════════════════════ */}
      {activeTab === "NEWS" && (
        <div className="w-full max-w-5xl space-y-6">
          <div className="bg-bg-raised border border-bd-subtle rounded-xl p-6">
            <h3 className="text-base sm:text-lg font-bold text-tx-primary mb-1">
              The Information Hierarchy & Truth Rates
            </h3>
            <p className="text-xs sm:text-sm text-tx-secondary leading-relaxed mb-6">
              In Bazaar, not all news feeds carry equal truth. Institutional algorithms traded based on the statistical reliability and arrival latency of each wire source.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {NEWS_SOURCES.map((src) => (
                <div
                  key={src.code}
                  className="bg-bg-base border border-bd-subtle rounded-xl p-5 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={clsx("text-xs font-mono font-bold px-2 py-0.5 rounded border", src.tagColor)}>
                        {src.code} · {src.name}
                      </span>
                      <span className="text-xs font-mono font-bold text-tx-primary">
                        {src.truthRate}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-tx-muted mb-2 italic">
                      Voice: &ldquo;{src.voice}&rdquo;
                    </div>

                    <p className="text-xs text-tx-secondary leading-relaxed">
                      {src.description}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-bd-hairline text-[11px] font-mono text-tx-muted">
                    <span className="font-bold text-tx-primary">Access: </span>
                    <span>{src.access}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Inverse Finfluencer Note */}
            <div className="mt-5 p-4 rounded-lg border border-loss-border/40 bg-loss-dim/15 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-loss shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-mono font-bold text-loss uppercase tracking-wider mb-0.5">
                  The Inverse Finfluencer Strategy
                </div>
                <p className="text-tx-primary leading-relaxed">
                  @BullRunBhai carried a 35% truth rate—making him a <strong>65% reliable inverse indicator</strong>. When he tweeted urgent all-caps buy recommendations, institutional market makers were actively offloading into retail liquidity. Taking the exact opposite side generated consistent alpha.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 4: ASSET PLAYBOOK
         ════════════════════════════════════════════════════════════ */}
      {activeTab === "ASSETS" && (
        <div className="w-full max-w-5xl space-y-6">
          <div className="bg-bg-raised border border-bd-subtle rounded-xl p-6">
            <h3 className="text-base sm:text-lg font-bold text-tx-primary mb-1">
              Asset Archetypes & Market Roles
            </h3>
            <p className="text-xs sm:text-sm text-tx-secondary leading-relaxed mb-6">
              Each asset was engineered with distinct sector sensitivities, liquidity dynamics, and behavior patterns across the 11 sessions:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {ASSET_ARCHETYPES.map((asset) => (
                <div
                  key={asset.ticker}
                  className="bg-bg-base border border-bd-subtle rounded-lg p-4 flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-sm text-tx-primary">
                        {asset.ticker}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-accent-dim text-accent border border-accent-border font-bold">
                        {asset.role}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-tx-muted mb-2">
                      {asset.sector}
                    </div>
                    <p className="text-xs text-tx-secondary leading-relaxed">
                      {asset.rule}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ACTIONS ────────────────────────────────────────── */}
      <footer className="w-full max-w-5xl mt-12 pt-6 border-t border-bd-hairline flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-tx-muted">
        <div>
          Bazaar Simulation Terminal · Event Concluded
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-tx-inverse font-bold transition-all"
          >
            Return to Home
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

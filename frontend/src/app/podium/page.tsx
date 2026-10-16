"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, BookOpen, Radio, Sparkles, TrendingUp, TrendingDown,
  Shield, CheckCircle2, AlertTriangle, ArrowLeft, Sun, Moon,
  Home, Clock, Zap, ChevronDown, ChevronUp, Layers, Compass,
  Flame, Lock, Award, LogOut
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import clsx from "clsx";

// ── SESSION-BY-SESSION NARRATIVE DATA ──────────────────────────────
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
    trapToAvoid: "Holding speculative bags into the end of Round 1. The reset wiped positions to ₹1 Cr, so taking profits and observing was optimal.",
    keyAssets: ["PULSE", "HRZN", "MERX50"]
  },

  // ROUND 2: THE INSTITUTIONAL RECKONING
  {
    g: 7,
    code: "R2S1",
    round: "Round 2",
    title: "The Hike · The Shared Order Book",
    subtitle: "War inflation forces surprise 75bps hike · Algorithmic bots online",
    world: "War inflation forced the Meridian Central Bank into an emergency rate hike (4.00% → 4.75%). Round 2 began: all teams traded against one shared book, and bots penalized liquidity pushes.",
    theEdge: "Reactive Math Engine: Market orders moved prices, but market maker bots pulled prices back over 10–25 seconds. Pushing price without size was self-inflicted slippage.",
    winningPlay: "Buy GOLDCORE as safe haven (+1.2%); avoid aggressive market-buys; use the Stat Shop between sessions to unlock Research L2.",
    trapToAvoid: "Believing @BullRunBhai that 'PULSE is a digital hedge against inflation'. PULSE dumped −5% immediately.",
    keyAssets: ["GOLDCORE", "HRZN", "PULSE"]
  },
  {
    g: 8,
    code: "R2S2",
    round: "Round 2",
    title: "Apex Falls · The Value Trap",
    subtitle: "Acute banking panic · Apex Bank unlocks · Short selling unlocks",
    world: "Apex Capital Bank disclosed catastrophic bad loans from the retail boom. Gross NPA surged from 3.1% → 8.9%. Contagion hit Horizon Bank (HRZN).",
    theEdge: "The Value Trap: APEX appeared deceptively cheap with a P/E of 12, but its 'E' (earnings) was based on stale pre-crisis numbers. It was insolvent.",
    winningPlay: "Unlock Capital ≥ 1 in the Stat Shop to short APEX (−14%) and HRZN (−9%) early with fast Research L2 leaks; fade the temporary PULSE herd.",
    trapToAvoid: "Buying APEX because 'it fell 10% and looks like a discount'. Cheap banks in a credit crunch go to zero.",
    keyAssets: ["APEX", "HRZN", "GOLDCORE"]
  },
  {
    g: 9,
    code: "R2S3",
    round: "Round 2",
    title: "Contagion · Flight to Quality",
    subtitle: "Risk-off panic · Ledger FinTech unlocks · Crypto exploit",
    world: "Lenders froze interbank credit lines. High-flying growth tech was liquidated for margin collateral. A protocol exploit struck PULSE.",
    theEdge: "Flight to Quality Inside Tech: While NIMBUS and INFN were dumped for margin, LEDGER (unlocked with steady enterprise cash flows) gained +4%. Meanwhile, PULSE crashed −16%.",
    winningPlay: "Long LEDGER; stay short or flat on banks; avoid PULSE entirely; keep core equity in GOLDCORE.",
    trapToAvoid: "Trying to catch the falling knife on PULSE. Exploits plus regulatory crackdowns are unrecoverable in the short term.",
    keyAssets: ["LEDGER", "PULSE", "NIMBUS"]
  },
  {
    g: 10,
    code: "R2S4",
    round: "Round 2",
    title: "The Turn · The Bailout & Short Squeeze",
    subtitle: "State intervention · Forge Steel unlocks · Violent short squeeze",
    world: "The government announced an emergency liquidity backstop and massive reconstruction contracts. Panic transitioned violently into relief.",
    theEdge: "The Short Squeeze: Over-confident retail traders remained short on banks. When the liquidity facility was announced, HRZN and APEX spiked +4%, while FORGE exploded +9%.",
    winningPlay: "Immediately cover bank shorts; buy FORGE on the contract announcement; ride the infrastructure momentum and take profits into the spike.",
    trapToAvoid: "Staying short into state intervention. Fighting central bank liquidity is financial suicide.",
    keyAssets: ["FORGE", "CRANE", "HRZN", "APEX"]
  },
  {
    g: 11,
    code: "R2S5",
    round: "Round 2",
    title: "New Normal · Final Resolution",
    subtitle: "Peak rates signaled · Partial recovery · The Closing Bell",
    world: "The Central Bank signaled peak policy rates. The banking crisis settled into an uneven, partial recovery. The market reached its final equilibrium.",
    theEdge: "Calm Discipline: With volatility subsiding, churn and excessive fees were the primary destroyer of rank. High-conviction holdings won the day.",
    winningPlay: "Hold quality recovery assets (INFN, NIMBUS, select banks); avoid over-leveraged intraday gambles; close open risk before the terminal tick.",
    trapToAvoid: "Believing finfluencer calls that 'we are going to all-time highs'. The post-war economy was permanently transformed—recovery was selective.",
    keyAssets: ["INFN", "NIMBUS", "APEX", "MERX50"]
  }
];

// ── NEWS SOURCES SECRET MATRIX ─────────────────────────────────────
const NEWS_SOURCES = [
  {
    code: "IN",
    name: "Desk Insider Leak",
    voice: "Terse, oddly specific, zero adjectives, anonymous",
    truthRate: "90% (Near Flawless)",
    access: "Round 2 Only · Requires Research Level ≥ 2",
    description: "The crown jewel of market intelligence. Delivered directly from trading desks before public release. Only 1 rumor was wrong across the entire simulation.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30"
  },
  {
    code: "AN",
    name: "Calder & Wyn / Northgate Research",
    voice: "Measured, hedged, names explicit time horizons",
    truthRate: "75% (Highly Reliable)",
    access: "Available to all teams (delivered earlier with higher Research)",
    description: "Institutional equity research. When Calder & Wyn warned that VOLTAGE had corridor exposure or that APEX bad loans were accelerating, they were virtually always correct.",
    color: "text-accent",
    bg: "bg-accent-dim",
    border: "border-accent-border"
  },
  {
    code: "NP",
    name: "The Meridian Standard",
    voice: "Factual, newspaper reporting, recounts past events",
    truthRate: "55% (Coin Flip / Late)",
    access: "Public newspaper wire",
    description: "Reports what already happened. Often missed the forward-looking market dynamic—for example, reassuring readers that inflation was transitory right before the shock.",
    color: "text-gain",
    bg: "bg-gain-dim",
    border: "border-gain-border"
  },
  {
    code: "FF",
    name: "@BullRunBhai (Fast Feed / Finfluencer)",
    voice: "Loud, emotional, ALL-CAPS urgency words (BUY NOW, LAST CHANCE)",
    truthRate: "35% (65% INVERSE INDICATOR!)",
    access: "Public social feed",
    description: "The ultimate retail trap. He never quoted a number and called every dip a generational opportunity. Quant teams that consistently traded the exact OPPOSITE of his calls printed alpha.",
    color: "text-loss",
    bg: "bg-loss-dim",
    border: "border-loss-border"
  }
];

export default function PodiumPage() {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"STORY" | "NEWS" | "CHEATSHEET">("STORY");
  const [selectedRoundFilter, setSelectedRoundFilter] = useState<"ALL" | "R1" | "R2">("ALL");
  const [expandedSession, setExpandedSession] = useState<number | null>(null);

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
      }
    };
    fetchResults();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("merx_token");
    router.push("/");
  };

  const filteredSessions = SESSION_GUIDES.filter(s => {
    if (selectedRoundFilter === "R1") return s.g <= 6;
    if (selectedRoundFilter === "R2") return s.g >= 7;
    return true;
  });

  const myResult = data?.my_result;
  const formatMoney = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <div className="min-h-screen bg-bg-void text-tx-primary flex flex-col items-center pt-6 sm:pt-10 pb-24 px-3 sm:px-6 md:px-8 overflow-x-hidden relative font-sans selection:bg-accent-dim selection:text-accent">
      
      {/* ── AMBIENT ELECTRIC GLOW ─────────────────────────────────── */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] pointer-events-none rounded-full"
        style={{
          background: "radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)",
          filter: "blur(100px)",
          opacity: 0.75
        }}
      />

      {/* ── TOP UTILITY BAR ───────────────────────────────────────── */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8 z-20">
        <Link 
          href="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-bg-raised border border-bd-subtle hover:border-bd-strong text-tx-secondary hover:text-tx-primary text-xs font-mono font-bold transition-all shadow-sm"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home Screen</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/market"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-raised border border-bd-subtle text-tx-secondary hover:text-tx-primary text-xs font-mono transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Market Terminal</span>
          </Link>

          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg bg-bg-raised border border-bd-subtle hover:border-bd-strong text-tx-secondary hover:text-tx-primary transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-warn" /> : <Moon className="w-4 h-4 text-accent" />}
          </button>
        </div>
      </div>

      {/* ── HERO BANNER: DEVELOPER CONCLUSION ─────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }} 
        className="w-full max-w-5xl text-center z-10 mb-10 sm:mb-14"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-dim border border-accent-border font-mono text-[11px] uppercase tracking-wider text-accent font-bold mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Developer Debrief · The Story Behind Bazaar</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-tx-primary mb-4">
          The Master Playbook
        </h1>

        <p className="text-tx-secondary text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          The order book has resolved. Here is the hidden narrative, the designed market mechanics, and the master strategies that separated true institutional alpha from retail liquidation.
        </p>

        {/* The Designer's Golden Spine Quote */}
        <div className="mt-8 mx-auto max-w-3xl bg-bg-raised/80 border border-bd-subtle rounded-2xl p-5 sm:p-7 backdrop-blur-md shadow-card text-left relative overflow-hidden">
          <div 
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: "linear-gradient(90deg, transparent, var(--color-accent), transparent)"
            }}
          />

          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent mb-2">
            The Intended Narrative Spine
          </div>

          <p className="text-sm sm:text-base text-tx-primary italic leading-relaxed font-sans">
            &ldquo;<strong>Round 1:</strong> Money is cheap, everyone feels like a genius. Then a war closes the oil corridor, the state tries to buy its way out, and the euphoria lasts just one more night.<br />
            <strong>Round 2:</strong> The bill arrives. Rates rise, an over-leveraged bank breaks, panic spreads through interbank lines, the government bails out the survivors—and the winners split into those who saw it early and those who read about it.&rdquo;
          </p>
        </div>
      </motion.div>

      {/* ── STRATEGY SECTION NAV TABS ─────────────────────────────── */}
      <div className="w-full max-w-5xl z-10 mb-8">
        <div className="flex items-center gap-2 border-b border-bd-hairline pb-3 overflow-x-auto scrollbar-none font-mono text-xs">
          <button
            onClick={() => setActiveTab("STORY")}
            className={clsx(
              "px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap",
              activeTab === "STORY"
                ? "bg-accent text-tx-inverse shadow-sm"
                : "bg-bg-raised text-tx-secondary hover:text-tx-primary border border-bd-subtle"
            )}
          >
            <BookOpen className="w-4 h-4" />
            <span>The 11 Sessions Arc & Hints</span>
          </button>

          <button
            onClick={() => setActiveTab("NEWS")}
            className={clsx(
              "px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap",
              activeTab === "NEWS"
                ? "bg-accent text-tx-inverse shadow-sm"
                : "bg-bg-raised text-tx-secondary hover:text-tx-primary border border-bd-subtle"
            )}
          >
            <Radio className="w-4 h-4" />
            <span>The 4 News Feeds & Truth Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab("CHEATSHEET")}
            className={clsx(
              "px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap",
              activeTab === "CHEATSHEET"
                ? "bg-accent text-tx-inverse shadow-sm"
                : "bg-bg-raised text-tx-secondary hover:text-tx-primary border border-bd-subtle"
            )}
          >
            <Compass className="w-4 h-4" />
            <span>Stock-by-Stock Strategy</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: THE 11 SESSIONS ARC & WINNING STRATEGY ─────────── */}
      {activeTab === "STORY" && (
        <div className="w-full max-w-5xl z-10 space-y-6">
          
          {/* Filter Pills for Rounds */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 font-mono text-xs">
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
                    ? "bg-accent-dim text-accent border-accent-border font-bold"
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
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold"
                    : "bg-bg-raised text-tx-secondary border-bd-subtle hover:text-tx-primary"
                )}
              >
                Round 2 (S7–S11)
              </button>
            </div>

            <span className="text-xs font-mono text-tx-muted hidden sm:inline">
              Click any session card to expand strategy details
            </span>
          </div>

          {/* Session Cards List */}
          <div className="space-y-4">
            {filteredSessions.map((guide) => {
              const isExpanded = expandedSession === guide.g;
              const isR2 = guide.g >= 7;

              return (
                <div
                  key={guide.g}
                  className={clsx(
                    "rounded-2xl border transition-all duration-200 overflow-hidden bg-bg-raised/70 shadow-card",
                    isExpanded
                      ? isR2
                        ? "border-purple-500/60 shadow-purple-500/5 ring-1 ring-purple-500/30"
                        : "border-accent/60 shadow-accent/5 ring-1 ring-accent/30"
                      : "border-bd-subtle hover:border-bd-strong"
                  )}
                >
                  {/* Card Header (Click to expand) */}
                  <button
                    onClick={() => setExpandedSession(isExpanded ? null : guide.g)}
                    className="w-full text-left p-5 sm:p-6 flex items-start sm:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div
                        className={clsx(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 border",
                          isR2
                            ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                            : "bg-accent-dim text-accent border-accent-border"
                        )}
                      >
                        S{guide.g}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={clsx(
                              "text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.2 rounded border",
                              isR2
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                : "bg-accent-dim text-accent border-accent-border"
                            )}
                          >
                            {guide.code} · {guide.round}
                          </span>
                        </div>
                        <h2 className="text-base sm:text-lg font-bold text-tx-primary tracking-tight truncate">
                          {guide.title}
                        </h2>
                        <p className="text-xs font-mono text-tx-secondary truncate mt-0.5">
                          {guide.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="hidden md:flex items-center gap-1.5">
                        {guide.keyAssets.map(asset => (
                          <span key={asset} className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-base border border-bd-subtle text-tx-muted">
                            {asset}
                          </span>
                        ))}
                      </div>

                      <div className="p-1 rounded-lg bg-bg-base border border-bd-subtle text-tx-secondary">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Strategy Deep-Dive */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-5 sm:px-6 pb-6 pt-2 border-t border-bd-hairline space-y-4"
                      >
                        {/* Macro World Context */}
                        <div className="bg-bg-base/70 rounded-xl p-4 border border-bd-hairline">
                          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-tx-muted mb-1 flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-tx-muted" />
                            <span>Macro Backdrop & Event Arc</span>
                          </div>
                          <p className="text-xs sm:text-sm text-tx-secondary leading-relaxed">
                            {guide.world}
                          </p>
                        </div>

                        {/* The Hidden Edge & The Winning Strategy */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gain-dim/20 border border-gain-border/40 rounded-xl p-4">
                            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-gain mb-1.5 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>The Winning Strategy (How to Win)</span>
                            </div>
                            <p className="text-xs sm:text-sm text-tx-primary font-normal leading-relaxed">
                              {guide.winningPlay}
                            </p>
                          </div>

                          <div className="bg-loss-dim/20 border border-loss-border/40 rounded-xl p-4">
                            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-loss mb-1.5 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>The Trap to Avoid (Retail Mistake)</span>
                            </div>
                            <p className="text-xs sm:text-sm text-tx-primary font-normal leading-relaxed">
                              {guide.trapToAvoid}
                            </p>
                          </div>
                        </div>

                        {/* Underlying Mathematical Edge */}
                        <div className="bg-bg-base/90 rounded-xl p-4 border border-bd-subtle font-mono text-xs text-tx-secondary flex items-start gap-2.5">
                          <Zap className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          <div>
                            <span className="text-tx-primary font-bold mr-1">Underlying Market Edge:</span>
                            <span>{guide.theEdge}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: THE 4 NEWS FEEDS & TRUTH MATRIX ────────────────── */}
      {activeTab === "NEWS" && (
        <div className="w-full max-w-5xl z-10 space-y-6">
          <div className="bg-bg-raised/80 border border-bd-subtle rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-card">
            <h2 className="text-xl sm:text-2xl font-bold text-tx-primary mb-2">
              The Information Matrix: Who to Trust
            </h2>
            <p className="text-xs sm:text-sm text-tx-secondary font-mono leading-relaxed max-w-3xl mb-6">
              In Bazaar, news items differed fundamentally by their mathematical truth rates and arrival latency. While retail traders treated all tweets and headlines as equal, top algorithmic funds decoded the sources.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {NEWS_SOURCES.map((src) => (
                <div
                  key={src.code}
                  className={clsx(
                    "rounded-2xl p-6 border flex flex-col justify-between gap-4 bg-bg-base shadow-sm",
                    src.border
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={clsx("text-xs font-mono font-bold px-2.5 py-1 rounded-md border", src.bg, src.color, src.border)}>
                        {src.code} · {src.name}
                      </span>
                      <span className={clsx("text-xs font-mono font-bold", src.color)}>
                        {src.truthRate}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-tx-primary mb-1">
                      {src.name}
                    </h3>
                    <p className="text-xs font-mono text-tx-muted mb-3 italic">
                      Voice: &ldquo;{src.voice}&rdquo;
                    </p>
                    <p className="text-xs sm:text-sm text-tx-secondary leading-relaxed">
                      {src.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-bd-hairline text-[11px] font-mono text-tx-muted">
                    <span className="font-bold text-tx-primary">Access Rule: </span>
                    <span>{src.access}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Special Callout: The Finfluencer Inverse Rule */}
            <div className="mt-6 p-5 rounded-xl border border-loss-border/50 bg-loss-dim/15 flex items-start gap-3">
              <Flame className="w-5 h-5 text-loss shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-loss font-mono uppercase tracking-wider mb-1">
                  The Inverse Finfluencer Rule (Alpha Goldmine)
                </h4>
                <p className="text-xs sm:text-sm text-tx-primary leading-relaxed">
                  @BullRunBhai held a mere 35% truth rate—which made him a <strong>65% reliable INVERSE indicator</strong>. Whenever he urged traders to market-buy a stock with urgency words, institutional bots used retail liquidity to dump. Taking the opposite side of his calls was one of the highest expected-value strategies in the simulation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: STOCK-BY-STOCK STRATEGY CHEATSHEET ─────────────── */}
      {activeTab === "CHEATSHEET" && (
        <div className="w-full max-w-5xl z-10 space-y-6">
          <div className="bg-bg-raised/80 border border-bd-subtle rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-card">
            <h2 className="text-xl sm:text-2xl font-bold text-tx-primary mb-2">
              Stock Archetypes & Intended Mechanics
            </h2>
            <p className="text-xs sm:text-sm text-tx-secondary font-mono leading-relaxed mb-6">
              Every ticker in Bazaar was programmed with specific beta, sector sensitivity, and liquidity profiles:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  ticker: "GOLDCORE",
                  name: "Goldcore Safe Haven",
                  nature: "Ultra Safe Haven",
                  rule: "Zero move during calm, explosive alpha during S4 war shock, S7 hike, and S8-S9 banking panic. The anchor of any defensive portfolio."
                },
                {
                  ticker: "RLNT",
                  name: "Reliant Energy Corp",
                  nature: "Energy Anchor & Commodity Spine",
                  rule: "Insulated from corridor shock in S4 (+5%), steady momentum driver. Trimmed in S5 as capital rotated to infrastructure."
                },
                {
                  ticker: "HRZN",
                  name: "Horizon Commercial Bank",
                  nature: "Credit Cycle Core",
                  rule: "Drove the retail boom in S1-S2. Fundamentals page quietly warned of NPA distress in S6 before crashing in S8-S9 and recovering in S10."
                },
                {
                  ticker: "APEX",
                  name: "Apex Capital Bank",
                  nature: "The Ultimate Value Trap",
                  rule: "Unlocked in R2S2 with an apparent low P/E of 12. Bad loans exploded to 8.9%. Shorting APEX was the premier high-conviction trade of Round 2."
                },
                {
                  ticker: "PULSE",
                  name: "Pulsechain High-Beta",
                  nature: "Speculative Retail Magnet",
                  rule: "Huge multi-day runs in S2 (+5%) and S6 (+14%), followed by devastating exploit crashes in S9 (−16%). Riding then exiting before the music stopped was key."
                },
                {
                  ticker: "INFN & NIMBUS",
                  name: "Tech Growth Twins",
                  nature: "Post-Earnings Drift",
                  rule: "Showcased the Post-Earnings Drift in S2. Liquidated for margin during S8-S9, then led the relief rally in S10-S11."
                },
                {
                  ticker: "CRANE & FORGE",
                  name: "State Stimulus Beneficiaries",
                  nature: "Targeted Infrastructure",
                  rule: "Exploded during S5 maritime stimulus and S10 reconstruction contracts (+9%). Fast buyers reaped instant momentum gains."
                },
                {
                  ticker: "TYRL",
                  name: "Tyrell Autoworks",
                  nature: "Mean-Reverting Oscillator",
                  rule: "Oscillated ±1.8% cleanly around its 20-period moving average. Buying earnings dips and fading euphoria was free cash."
                },
                {
                  ticker: "BZR-V",
                  name: "Bazaar Ventures Media",
                  nature: "Chatroom Noise Magnet",
                  rule: "Frequently pumped without news. High volatility but near-zero net long-term return. Experienced traders faded every unverified spike."
                }
              ].map((stock) => (
                <div key={stock.ticker} className="bg-bg-base border border-bd-subtle rounded-xl p-4 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-base text-tx-primary">{stock.ticker}</span>
                      <span className="text-[10px] font-mono text-accent bg-accent-dim border border-accent-border px-2 py-0.5 rounded">
                        {stock.nature}
                      </span>
                    </div>
                    <div className="text-xs text-tx-muted font-sans mb-2">{stock.name}</div>
                    <p className="text-xs text-tx-secondary leading-relaxed">
                      {stock.rule}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          BOTTOM SECTION: WAITING FOR THE RESULTS & RETURN HOME
         ════════════════════════════════════════════════════════════ */}
      <div className="w-full max-w-5xl z-10 mt-12 space-y-6">
        
        {/* Waiting for Results Banner */}
        <div className="w-full bg-bg-raised/85 border border-bd-subtle rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-card relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Subtle Ambient Radial Highlight */}
          <div 
            className="absolute top-0 right-0 w-80 h-full pointer-events-none"
            style={{
              background: "radial-gradient(circle at top right, var(--color-accent-glow), transparent 70%)"
            }}
          />

          {/* Left: Radar Beacon & Status Text */}
          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
            {/* Pulsing Radar Ring */}
            <div className="relative flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 bg-accent shadow-[0_0_12px_var(--color-accent)]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-accent bg-accent-dim px-2 py-0.5 rounded border border-accent-border">
                  Official Simulation Audit
                </span>
                <span className="text-xs font-mono text-tx-muted hidden sm:inline">
                  Mark-to-Market Reconciliation
                </span>
              </div>

              <h2 className="text-xl sm:text-3xl font-mono font-bold tracking-tight text-tx-primary">
                Waiting for the results<span className="text-accent animate-pulse">...</span>
              </h2>

              <p className="text-xs sm:text-sm text-tx-secondary mt-1 font-sans leading-relaxed">
                The matching engine is currently auditing live participant portfolios, settling zero-crossing contracts, and compiling the official podium standings.
              </p>
            </div>
          </div>

          {/* Right: Personal Result Card (if available) */}
          {myResult && (
            <div className="bg-bg-base/90 border border-bd-subtle rounded-xl p-4 font-mono flex items-center gap-6 shrink-0 z-10 w-full sm:w-auto justify-between sm:justify-start">
              <div>
                <div className="text-[10px] font-bold text-tx-muted uppercase tracking-wider">Your Team</div>
                <div className="text-base font-bold text-tx-primary flex items-center gap-1.5 mt-0.5">
                  <span>{myResult.team_id}</span>
                  {myResult.eliminated && (
                    <span className="text-[9px] text-loss bg-loss-dim border border-loss-border px-1.5 py-0.2 rounded">
                      LIQ
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-tx-muted uppercase tracking-wider">Terminal Equity</div>
                <div className="text-base font-bold text-gain mt-0.5">
                  {formatMoney(myResult.equity_paise)}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-tx-muted uppercase tracking-wider">Rank</div>
                <div className="text-xl font-bold text-accent mt-0.5">
                  #{myResult.rank}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Home Navigation Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-bd-hairline">
          <div className="text-xs font-mono text-tx-muted text-center sm:text-left">
            Thank you for participating in EIC X Bazaar. Official prize distribution follows the organizer stage announcement.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-accent hover:bg-accent/90 text-tx-inverse font-mono font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Return to Home Screen</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-3.5 rounded-xl bg-bg-raised hover:bg-bg-overlay border border-bd-subtle text-tx-secondary hover:text-tx-primary font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              title="Sign out of terminal"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

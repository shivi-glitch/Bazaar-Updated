"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface TeamEntry {
  id: string;
  rank: number;
  prevRank: number;
  name: string;
  width: string;
  live: boolean;
  trades: number;
}

const getRankWidth = (rank: number): string => {
  switch (rank) {
    case 1:
      return "92%";
    case 2:
      return "76%";
    case 3:
      return "60%";
    case 4:
      return "44%";
    case 5:
      return "28%";
    default:
      return "20%";
  }
};

const INITIAL_TEAMS: TeamEntry[] = [
  { id: "quantum", rank: 1, prevRank: 1, name: "QUANTUM CAPITAL", width: "92%", live: true, trades: 142 },
  { id: "apex", rank: 2, prevRank: 2, name: "APEX HORIZON", width: "76%", live: false, trades: 118 },
  { id: "nova", rank: 3, prevRank: 3, name: "NOVA QUANT", width: "60%", live: true, trades: 96 },
  { id: "echo", rank: 4, prevRank: 4, name: "ECHO TRADERS", width: "44%", live: false, trades: 79 },
  { id: "spectra", rank: 5, prevRank: 5, name: "SPECTRA CORP", width: "28%", live: false, trades: 52 },
];

export function LeaderboardRace() {
  const [teams, setTeams] = useState<TeamEntry[]>(INITIAL_TEAMS);
  const [lastSwappedId, setLastSwappedId] = useState<string | null>(null);

  // Live leaderboard position swapping animation
  useEffect(() => {
    let tickCount = 0;
    const interval = setInterval(() => {
      setTeams((prev) => {
        const next = prev.map((t) => ({ ...t }));
        tickCount++;

        // Select swap index: alternates through various ranks
        const swapPairs = [
          [1, 2], // Apex & Nova swap
          [2, 3], // Nova & Echo swap
          [0, 1], // Quantum & Leader swap
          [1, 2],
          [3, 4], // Echo & Spectra swap
          [0, 1],
        ];
        const [idxA, idxB] = swapPairs[tickCount % swapPairs.length];

        const itemA = next[idxA];
        const itemB = next[idxB];

        // Reset prevRank for other teams so only the swapping teams show rank shift arrows
        next.forEach((item) => {
          item.prevRank = item.rank;
        });

        // Swap their ranks
        const tempRank = itemA.rank;
        itemA.rank = itemB.rank;
        itemB.rank = tempRank;

        // The team moving up expands its profit bar (moves right)
        // The team moving down shrinks its profit bar (moves left)
        itemA.width = getRankWidth(itemA.rank);
        itemB.width = getRankWidth(itemB.rank);

        // Update trade counts
        itemA.trades += 1;
        itemB.trades += 2;

        setLastSwappedId(itemB.rank < itemA.rank ? itemB.id : itemA.id);

        // Keep sorted by rank
        next.sort((a, b) => a.rank - b.rank);
        return next;
      });
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="competition"
      className="scroll-mt-20 bg-bg-void py-24 sm:py-28 border-t border-bd-subtle relative overflow-hidden"
    >
      <div id="leaderboard" className="absolute -top-20" aria-hidden="true" />

      {/* Ambient background glow */}
      <div
        className="absolute top-1/2 right-1/4 w-[500px] h-[350px] -translate-y-1/2 pointer-events-none opacity-30"
        style={{
          background: "radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
        aria-hidden="true"
      />

      {/* Centered bounded container with generous side margins */}
      <div className="max-w-4xl mx-auto px-5 sm:px-10 lg:px-12 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-accent-dim border border-accent-border text-[11px] font-mono uppercase tracking-[0.1em] font-bold mb-4 text-accent">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse inline-block" />
              Real-Time Competition
            </div>
            <h2
              className="font-sans font-bold tracking-[-0.03em] leading-[1.05] text-tx-primary max-w-xl text-balance"
              style={{ fontSize: "var(--text-display-md)" }}
            >
              Real-Time Leaderboard
            </h2>
            <p
              className="text-tx-secondary mt-3 max-w-md leading-relaxed"
              style={{ fontSize: "var(--text-body-md)" }}
            >
              Watch positions shift tick-by-tick. Every executed block order dynamically reshuffles team standings in real time.
            </p>
          </div>
        </div>

        {/* Live Leaderboard Standings with Layout Animation */}
        <div className="space-y-3">
          <AnimatePresence>
            {teams.map((team) => {
              const isLeader = team.rank === 1;
              const rankDelta = team.prevRank - team.rank; // >0 means moved up, <0 means moved down

              return (
                <motion.div
                  layout
                  key={team.id}
                  transition={{
                    layout: { type: "spring", damping: 26, stiffness: 220 },
                  }}
                  className={`relative flex items-center gap-3 sm:gap-4 group ${isLeader ? "ring-1 ring-accent/40 rounded-lg" : ""
                    }`}
                >
                  {/* Rank number badge + directional shift indicator */}
                  <div className="w-10 sm:w-12 shrink-0 font-mono text-right flex items-center justify-end gap-1 tabular-nums pr-1">
                    {rankDelta > 0 && (
                      <span className="text-[10px] text-gain font-bold animate-bounce">▲</span>
                    )}
                    {rankDelta < 0 && (
                      <span className="text-[10px] text-loss font-bold">▼</span>
                    )}
                    <span
                      className={`text-[13px] sm:text-[15px] font-bold ${isLeader ? "text-accent" : "text-tx-muted"
                        }`}
                    >
                      #{String(team.rank).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Team Bar card */}
                  <div
                    className={`flex-1 min-h-[56px] sm:min-h-[62px] rounded-lg relative overflow-hidden transition-all duration-300 border ${isLeader
                      ? "bg-bg-raised/95 border-accent/50 shadow-[0_0_24px_rgba(0,212,170,0.12)]"
                      : lastSwappedId === team.id
                        ? "bg-bg-raised/90 border-bd-strong"
                        : "bg-bg-raised/75 border-bd-subtle hover:border-bd-strong"
                      }`}
                  >
                    {/* Race fill bar representing profit */}
                    <div
                      className="absolute left-0 top-0 bottom-0 pointer-events-none transition-all duration-700 ease-out"
                      style={{
                        width: team.width,
                        background: isLeader
                          ? "linear-gradient(90deg, rgba(0, 212, 170, 0.24) 0%, rgba(0, 212, 170, 0.06) 100%)"
                          : rankDelta > 0
                          ? "linear-gradient(90deg, rgba(34, 211, 122, 0.20) 0%, rgba(34, 211, 122, 0.05) 100%)"
                          : "linear-gradient(90deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)",
                        borderRight: isLeader
                          ? "2px solid var(--color-accent)"
                          : rankDelta > 0
                          ? "2px solid var(--color-gain)"
                          : "1px solid var(--color-bd-strong)",
                        boxShadow: isLeader
                          ? "inset 0 0 16px rgba(0, 212, 170, 0.12)"
                          : rankDelta > 0
                          ? "inset 0 0 14px rgba(34, 211, 122, 0.08)"
                          : "none",
                      }}
                    />

                    {/* Content overlay */}
                    <div className="relative z-10 flex items-center justify-between gap-3 w-full h-full p-3 sm:px-5 sm:py-3.5">
                      {/* Team info */}
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <span className="font-sans font-bold text-[14px] sm:text-[15px] text-tx-primary tracking-tight truncate">
                          {team.name}
                        </span>
                        {isLeader && (
                          <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-accent-dim border border-accent-border text-[9px] font-mono font-bold uppercase tracking-wider text-accent shrink-0">
                            Leader
                          </span>
                        )}
                        {team.live && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-gain-dim border border-gain-border text-[9px] font-mono font-bold uppercase tracking-widest text-gain shrink-0">
                            <span className="w-1 h-1 rounded-full bg-gain animate-pulse inline-block" />
                            Live
                          </span>
                        )}
                      </div>

                      {/* Stats (trades only, profit text removed) */}
                      <div className="flex items-center gap-3 sm:gap-6 ml-auto shrink-0">
                        <span className="font-mono text-[11px] sm:text-[12px] text-tx-secondary px-2.5 py-1 rounded-sm bg-bg-base/70 border border-bd-hairline">
                          {team.trades} trades
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

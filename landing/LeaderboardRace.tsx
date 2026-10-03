"use client";

import { useEffect, useState } from "react";
import { useReveal } from "./useReveal";
import { LANDING_COPY } from "@/lib/landing-content";

// Five teams, three preset orders
const TEAMS = [
  { id: 0, label: "Team A", color: "var(--color-indigo-val)" },
  { id: 1, label: "Team B", color: "var(--color-gold-val)" },
  { id: 2, label: "Team C", color: "var(--color-green-val)" },
  { id: 3, label: "Team D", color: "var(--tx-dim)" },
  { id: 4, label: "Team E", color: "var(--tx-dim)" }
];

const PRESETS = [
  [0, 1, 2, 3, 4], // Order 1
  [1, 0, 3, 2, 4], // Order 2
  [2, 3, 1, 4, 0]  // Order 3
];

const BARS = [
  [100, 85, 70, 50, 30],
  [100, 95, 80, 60, 40],
  [100, 90, 75, 55, 35]
];

export default function LeaderboardRace() {
  const { ref, isInView } = useReveal(false);
  const [presetIdx, setPresetIdx] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setPresetIdx(prev => (prev + 1) % PRESETS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <div className="py-24 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
       <div className="text-center mb-16 sm:mb-24">
          <h2 className="text-chapter text-tx-primary">{LANDING_COPY.leaderboard.h2}</h2>
          <p className="text-body text-tx-dim mt-4 mx-auto">{LANDING_COPY.leaderboard.body}</p>
       </div>

       <div className="relative h-[400px] w-full max-w-3xl mx-auto">
          {TEAMS.map((team) => {
             const currentPreset = PRESETS[presetIdx];
             const rank = currentPreset.indexOf(team.id);
             const barWidth = BARS[presetIdx][rank];

             return (
               <div 
                 key={team.id} 
                 className="absolute left-0 right-0 flex items-center gap-4 transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-reduce:!transform-none"
                 style={{ 
                   transform: `translateY(${rank * 80}px)`
                 }}
               >
                 <span className="font-mono text-xl font-bold text-tx-dim w-8">{rank + 1}</span>
                 <div className="flex-1 h-12 relative flex items-center">
                    <div 
                      className="absolute top-0 bottom-0 left-0 rounded-r-full transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] origin-left"
                      style={{ 
                        width: "100%",
                        backgroundColor: team.color,
                        transform: `scaleX(${barWidth / 100})`,
                      }}
                    />
                    <span className="relative z-10 text-base font-bold text-base px-4 mix-blend-difference drop-shadow-sm" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                       {team.label}
                    </span>
                 </div>
               </div>
             )
          })}
       </div>
    </div>
  )
}

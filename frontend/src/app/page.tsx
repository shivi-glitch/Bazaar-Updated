"use client";

import { LandingNav } from "../components/home/LandingNav";
import { Hero } from "../components/home/Hero";
import { TickerStrip } from "../components/home/TickerStrip";
import { PinnedStory } from "../components/home/PinnedStory";
import { NewsRace } from "../components/home/NewsRace";
import { LeaderboardRace } from "../components/home/LeaderboardRace";
import { FinalCta } from "../components/home/FinalCta";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070B14] text-slate-50 selection:bg-blue-500/30 relative font-sans">
      
      {/* Subtle Glowing Spotlight Mesh */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[120vw] h-[80vh] bg-[radial-gradient(ellipse_80%_80%_at_50%_0%,rgba(59,130,246,0.15),transparent)] pointer-events-none z-0" />
      <div className="fixed top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0 opacity-20" />

      <LandingNav />
      
      <Hero />
      <TickerStrip />
      
      <PinnedStory />
      
      <NewsRace />
      <LeaderboardRace />
      
      <FinalCta />
    </div>
  );
}

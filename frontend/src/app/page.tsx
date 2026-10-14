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
    <div className="min-h-[100dvh] bg-bg-void text-tx-primary selection:bg-accent-dim relative">
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

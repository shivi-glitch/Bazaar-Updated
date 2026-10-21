"use client";

import { useMarketStore } from "@/store/marketStore";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ArrowRight, LineChart, Lock, Sparkles } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { PortfolioTab } from "../portfolio/page";
import { NewsTab } from "../news/page";
import { StatsTab } from "../stats/page";
import { AssetDetailTab } from "./[ticker]/page";

const UPCOMING_IPOS = [
  { ticker: "NIMBUS", name: "Nimbus Cloud Datacenters", sector: "IT & Server Infrastructure", opensIn: "Round 1 · Session 2", issuePrice: "₹410.00", category: "Mid Cap" },
  { ticker: "STAPLE", name: "Staple & Co. Provisions", sector: "Consumer Staples & FMCG", opensIn: "Round 1 · Session 3", issuePrice: "₹1,180.00", category: "Defensive Mid Cap" },
  { ticker: "VOLTAGE", name: "Voltage Power Matrix", sector: "Energy & Battery Storage", opensIn: "Round 1 · Session 4", issuePrice: "₹310.00", category: "Small Cap" },
  { ticker: "CRANE", name: "Crane Maritime Logistics", sector: "Infrastructure & Freight", opensIn: "Round 1 · Session 5", issuePrice: "₹520.00", category: "Small Cap" },
];

function MarketContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const prices = useMarketStore((s) => s.prices);
  const sessionState = useMarketStore((s) => s.sessionState);
  const currentSession = useMarketStore((s) => s.currentSession);

  // Sync tab and ticker with URL query parameters for robust browser history support
  const tickerFromUrl = searchParams.get("ticker");
  const tabFromUrl = searchParams.get("tab") || "chart";

  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    const token = localStorage.getItem("merx_token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "chart") {
      router.push("/market");
    } else {
      router.push(`/market?tab=${tabId}`);
    }
  };

  const handleOpenStock = (ticker: string) => {
    const currentTab = activeTab !== "chart" ? `&tab=${activeTab}` : "";
    router.push(`/market?ticker=${ticker}${currentTab}`);
  };

  const handleBackToMarkets = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      if (activeTab !== "chart") {
        router.push(`/market?tab=${activeTab}`);
      } else {
        router.push("/market");
      }
    }
  };

  const isDemo = currentSession === 0;
  const isEarlyRound1 = currentSession <= 1;

  const renderContent = () => {
    if (tickerFromUrl) {
      return <AssetDetailTab ticker={tickerFromUrl} onBack={handleBackToMarkets} />;
    }

    switch (activeTab) {
      case "holdings":
      case "portfolio":
        return <PortfolioTab />;

      case "news":
        return <NewsTab />;

      case "shop":
      case "stats":
        return <StatsTab />;

      case "chart":
      default:
        return (
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-6">
            
            {/* Real-time Session Status Banner */}
            {isDemo ? (
              <div className="p-3.5 sm:p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-md flex items-center justify-between gap-3 text-xs font-mono font-bold shadow-card text-amber-300">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  <span className="truncate">
                    Demo Practice Session · Test your buy & sell orders, live charts, and news reactions with the 7 core assets!
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded border border-amber-500/40 bg-amber-500/20 text-amber-200 shrink-0">
                  DEMO MODE · {sessionState}
                </span>
              </div>
            ) : sessionState !== "RUNNING" && (
              <div 
                className={clsx(
                  "p-3 sm:p-4 rounded-xl border backdrop-blur-md flex items-center justify-between gap-3 text-xs font-mono font-bold transition-all shadow-card",
                  sessionState === "STARTING" ? "bg-accent-dim border-accent-border text-accent animate-pulse" :
                  sessionState === "PAUSED" ? "bg-warn-dim border-warn-border text-warn" :
                  sessionState === "FINISHED" ? "bg-bg-raised border-bd-subtle text-tx-muted" :
                  "bg-bg-raised border-bd-subtle text-tx-secondary"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={clsx(
                    "w-2 h-2 rounded-full shrink-0",
                    sessionState === "STARTING" ? "bg-accent animate-ping" :
                    sessionState === "PAUSED" ? "bg-warn animate-pulse" :
                    "bg-tx-muted"
                  )} />
                  <span className="truncate">
                    {sessionState === "STARTING" ? `Session ${currentSession} Starting now · Initializing live market order books...` :
                     sessionState === "PAUSED" ? `Session ${currentSession} is Paused by Admin · Order entry is temporarily locked.` :
                     sessionState === "FINISHED" ? (
                       currentSession === 11 
                         ? "Round 2 Final Session Concluded · Simulation Finished."
                         : `Session ${currentSession} Finished · Awaiting next session.`
                     ) :
                     `Session ${currentSession} Standby · Trading engine is waiting for Admin to start the session.`}
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border border-current opacity-80 shrink-0">
                  {sessionState}
                </span>
              </div>
            )}

            {/* Section Header: Active Live Assets */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[13px] font-mono font-bold uppercase tracking-wider text-tx-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gain animate-pulse" />
                  Active Market Instruments ({Object.keys(prices).length})
                </h2>
                <p className="text-[11px] text-tx-muted font-sans mt-0.5">
                  Real-time equities currently quoting and tradeable in Session {isDemo ? "DEMO" : currentSession}
                </p>
              </div>
            </div>

            {/* Fluid Responsive Grid of Active Assets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
              {Object.entries(prices).map(([ticker, priceData]) => {
                const price_paise = Array.isArray(priceData) ? priceData[0] : 0;
                return (
                  <button
                    key={ticker}
                    onClick={() => handleOpenStock(ticker)}
                    className="w-full text-left group bg-bg-raised/75 hover:bg-bg-raised border border-bd-subtle hover:border-accent-border/80 rounded-xl p-4 sm:p-5 transition-all duration-200 relative overflow-hidden flex flex-col justify-between shadow-card cursor-pointer active:scale-[0.99]"
                  >
                    {/* Ticker & Price */}
                    <div className="relative z-10 w-full mb-4 sm:mb-5">
                      <div className="font-bold text-[clamp(18px,2.2vw,22px)] text-tx-primary tracking-tight mb-2">
                        {ticker}
                      </div>
                      <div className="text-[clamp(20px,2.4vw,26px)] font-mono text-accent tracking-tight">
                        ₹{(price_paise / 100).toFixed(2)}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="border-t border-bd-hairline pt-3 flex justify-between items-center relative z-10 w-full mt-auto">
                      <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider font-bold text-tx-secondary group-hover:text-accent transition-colors flex items-center gap-1.5">
                        <LineChart className="w-3.5 h-3.5" />
                        <span>Open Terminal</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-tx-muted group-hover:text-accent group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Section: Upcoming IPOs (Shown during Round 1 Session 1 or Demo Round) */}
            {isEarlyRound1 && (
              <div className="mt-8 pt-6 border-t border-bd-hairline space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[12px] font-mono font-bold uppercase tracking-wider text-tx-muted flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-accent" />
                      Upcoming Market Listings & IPOs
                    </h3>
                    <p className="text-[11px] text-tx-muted font-sans mt-0.5">
                      New corporate market entrants scheduled to list and begin trading in subsequent sessions
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                  {UPCOMING_IPOS.map((ipo) => (
                    <div 
                      key={ipo.ticker}
                      className="bg-bg-raised/40 border border-bd-subtle/60 rounded-xl p-4 flex flex-col justify-between opacity-80 hover:opacity-100 transition-opacity"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-[16px] text-tx-primary tracking-tight">{ipo.ticker}</span>
                          <span className="flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider text-tx-muted bg-bg-void px-2 py-0.5 rounded border border-bd-subtle">
                            <Lock className="w-2.5 h-2.5" /> Locked
                          </span>
                        </div>
                        <div className="text-[12px] text-tx-secondary font-medium truncate">{ipo.name}</div>
                        <div className="text-[10px] font-mono text-tx-muted mt-0.5">{ipo.sector}</div>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-bd-hairline flex items-center justify-between text-[11px] font-mono">
                        <span className="text-accent font-bold">IPO: {ipo.issuePrice}</span>
                        <span className="text-[10px] text-warn font-semibold">{ipo.opensIn}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        );
    }
  };

  return (
    <DashboardShell
      activeTab={activeTab}
      onTabChange={handleTabChange}
      isViewingStock={Boolean(tickerFromUrl)}
    >
      {renderContent()}
    </DashboardShell>
  );
}

export default function MarketSPA() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] bg-bg-void flex items-center justify-center font-mono text-sm text-tx-muted animate-pulse">
        Loading Market Terminal...
      </div>
    }>
      <MarketContent />
    </Suspense>
  );
}

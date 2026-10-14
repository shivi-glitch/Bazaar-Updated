"use client";

import { useMarketStore } from "@/store/marketStore";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ArrowRight, LineChart } from "lucide-react";
import { useState } from "react";
import { PortfolioTab } from "../portfolio/page";
import { NewsTab } from "../news/page";
import { StatsTab } from "../stats/page";
import { AssetDetailTab } from "./[ticker]/page";

export default function MarketSPA() {
  const prices = useMarketStore((s) => s.prices);
  const [activeTab, setActiveTab] = useState("chart");
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const renderContent = () => {
    if (selectedTicker) {
      return <AssetDetailTab ticker={selectedTicker} onBack={() => setSelectedTicker(null)} />;
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
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6">
            {/* Fluid Responsive Grid of Active Assets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
              {Object.entries(prices).map(([ticker, [price_paise]]) => {
                return (
                  <button
                    key={ticker}
                    onClick={() => setSelectedTicker(ticker)}
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
          </div>
        );
    }
  };

  return (
    <DashboardShell
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
        setSelectedTicker(null);
      }}
    >
      {renderContent()}
    </DashboardShell>
  );
}

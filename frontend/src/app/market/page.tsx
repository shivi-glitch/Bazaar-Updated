"use client";

import { useMarketStore } from "@/store/marketStore";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ArrowRight, LineChart } from "lucide-react";
import { useState } from "react";
import { PortfolioTab } from "../portfolio/page";
import { NewsTab } from "../news/page";
import { StatsTab } from "../stats/page";
import { AssetDetailTab, ASSET_META } from "./[ticker]/page";

export default function MarketSPA() {
  const prices = useMarketStore((s) => s.prices);
  
  const [activeTab, setActiveTab] = useState("explore");
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const getArchetypeBadgeClass = (archetype?: string) => {
    switch (archetype) {
      case "Trending":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "Mean-Reverting":
        return "bg-blue-500/10 border-blue-500/20 text-blue-400";
      case "Safe Haven":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      default:
        return "bg-red-500/10 border-red-500/20 text-red-400";
    }
  };

  const renderContent = () => {
    if (selectedTicker) {
      return <AssetDetailTab ticker={selectedTicker} onBack={() => setSelectedTicker(null)} />;
    }

    switch (activeTab) {
      case "portfolio": return <PortfolioTab />;
      case "news": return <NewsTab />;
      case "stats": return <StatsTab />;
      case "explore":
      default:
        return (
          <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <LineChart className="w-4 h-4" /> Active Markets
              </h2>
              <span className="text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1 rounded-full">{Object.keys(prices).length} Assets</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Object.entries(prices).map(([ticker, [price_paise]]) => {
                const meta = ASSET_META[ticker] || { name: ticker, sector: "General Market", archetype: "High-Beta Volatile" as const };
                return (
                  <div 
                    key={ticker} 
                    onClick={() => setSelectedTicker(ticker)}
                    className="glass-panel p-6 hover:border-white/20 transition-all cursor-pointer group relative overflow-hidden bg-white/[0.01] hover:bg-white/[0.03]"
                  >
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-black text-white tracking-tighter">{ticker}</h3>
                          <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-sm border ${getArchetypeBadgeClass(meta.archetype)}`}>
                            {meta.archetype}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-slate-400 tracking-tight">{meta.name}</div>
                        <div className="text-xs text-slate-600 mt-1 uppercase tracking-widest font-bold">{meta.sector}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-mono font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">₹{(price_paise / 100).toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="border-t border-white/5 pt-4 flex justify-between items-center relative z-10">
                      <span className="text-xs uppercase tracking-widest font-bold text-slate-400 group-hover:text-blue-400 transition-colors">Open Live Chart & Trade</span>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
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

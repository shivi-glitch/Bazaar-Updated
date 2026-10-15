"use client";

import { useMarketStore } from "@/store/marketStore";
import { Newspaper, X, Radio } from "lucide-react";
import { useEffect } from "react";
import clsx from "clsx";
import { api } from "@/lib/api";

export function NewsToast() {
  const latestToast = useMarketStore((s) => s.latestToast);
  const clearToast = useMarketStore((s) => s.clearToast);

  useEffect(() => {
    if (latestToast) {
      const timer = setTimeout(() => clearToast(), 5000); 
      return () => clearTimeout(timer);
    }
  }, [latestToast, clearToast]);

  if (!latestToast) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[92vw] max-w-md z-[100] bg-bg-raised/95 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-accent-border shadow-modal animate-in slide-in-from-top-4 duration-300">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-gain to-transparent rounded-t-xl" />
      <div className="flex justify-between items-start mb-2">
        <span className="flex items-center gap-2 bg-accent-dim text-accent text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-sm border border-accent-border uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          BREAKING WIRE
        </span>
        <button 
          onClick={clearToast} 
          className="text-tx-muted hover:text-tx-primary transition-colors p-1 cursor-pointer"
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-[13px] sm:text-[14px] font-medium leading-relaxed text-tx-primary mt-1">
        {latestToast.text}
      </p>
    </div>
  );
}

export function NewsTab() {
  const news = useMarketStore((s) => s.news);

  // Load all previous rounds' and sessions' news on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("merx_token");
        const res = await api.get("/news", token || "");
        if (res?.news && Array.isArray(res.news)) {
          const currentStore = useMarketStore.getState();
          const existingIds = new Set(currentStore.news.map((n) => n.id));
          const newItems = res.news.filter((n: any) => !existingIds.has(n.id));
          if (newItems.length > 0) {
            useMarketStore.setState({ news: [...newItems, ...currentStore.news] });
          }
        }
      } catch (err) {}
    };
    fetchHistory();
  }, []);

  const getSourceBadge = (source: string) => {
    switch(source) {
      case "NP":
        return <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold tracking-wider uppercase bg-accent-dim border border-accent-border text-accent">Newspaper</span>;
      case "AN":
        return <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold tracking-wider uppercase bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">Analyst Wire</span>;
      case "FF":
        return <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold tracking-wider uppercase bg-warn-dim border border-warn-border text-warn">Finfluencer</span>;
      case "IN":
        return <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold tracking-wider uppercase bg-loss-dim border border-loss-border text-loss">Insider Rumor</span>;
      default:
        return <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold tracking-wider uppercase bg-bg-base border border-bd-subtle text-tx-secondary">{source}</span>;
    }
  };

  const parseSessionInfo = (id: string) => {
    if (!id || typeof id !== "string") return null;
    const parts = id.split("-");
    if (parts.length >= 2) {
      const g = parseInt(parts[0], 10);
      const tick = parseInt(parts[1], 10);
      if (!isNaN(g)) {
        const isR2 = g >= 7;
        return {
          roundText: isR2 ? `R2 · S${g - 6}` : `R1 · S${g}`,
          tickText: isNaN(tick) ? "" : `T+${tick}`
        };
      }
    }
    return null;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      
      {/* Header bar with summary */}
      <div className="flex items-center justify-between border-b border-bd-subtle pb-4">
        <div>
          <h2 className="text-[18px] sm:text-[20px] font-bold text-tx-primary tracking-tight">
            Market Intelligence Wire
          </h2>
          <p className="text-[12px] sm:text-[13px] text-tx-secondary mt-0.5">
            Real-time multi-round intelligence feed · Older catalysts cascade downward
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-tx-muted bg-bg-raised px-3 py-1.5 rounded-md border border-bd-subtle">
          <span className="w-2 h-2 rounded-full bg-gain animate-pulse" />
          <span>{news.length} Catalysts Logged</span>
        </div>
      </div>

      {news.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 text-tx-muted uppercase tracking-wider text-[11px] font-mono border border-dashed border-bd-subtle rounded-xl bg-bg-raised/40 p-6 text-center space-y-2">
          <Newspaper className="w-8 h-8 opacity-25 mb-1" />
          <div className="font-bold text-tx-secondary">Awaiting breaking news wire...</div>
          <p className="text-[12px] text-tx-muted normal-case max-w-xs">
            Market catalysts and news headlines will populate here in real-time as events unfold.
          </p>
        </div>
      ) : (
        /* Alternating Timeline with Center Dividing Line */
        <div className="relative py-4">
          
          {/* Vertical center divider line (centered on sm+, left-aligned on mobile) */}
          <div 
            className="absolute top-0 bottom-0 left-4 sm:left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-accent/60 via-bd-subtle to-transparent" 
            aria-hidden="true"
          />

          <div className="space-y-6 sm:space-y-8">
            {news.map((item, index) => {
              const isEven = index % 2 === 0;
              const sessionInfo = parseSessionInfo(item.id);

              return (
                <div 
                  key={item.id || index}
                  className={clsx(
                    "relative flex flex-col sm:flex-row items-center w-full",
                    isEven ? "sm:justify-start" : "sm:justify-end"
                  )}
                >
                  {/* Timeline Node on the center line */}
                  <div 
                    className="absolute left-4 sm:left-1/2 -translate-x-1/2 top-4 w-4 h-4 rounded-full bg-bg-base border-2 border-accent flex items-center justify-center z-10 shadow-[0_0_8px_rgba(0,212,170,0.4)]"
                    aria-hidden="true"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  </div>

                  {/* News Card: Left for Even, Right for Odd on sm+; Indented right on mobile */}
                  <div 
                    className={clsx(
                      "w-full sm:w-[calc(50%-28px)] pl-10 sm:pl-0 transition-all",
                      isEven ? "sm:pr-4" : "sm:pl-4"
                    )}
                  >
                    <div className="bg-bg-raised/85 hover:bg-bg-raised border border-bd-subtle hover:border-accent-border/60 rounded-xl p-4 sm:p-5 transition-all shadow-card flex flex-col gap-3 group">
                      
                      {/* Meta header: Session + Source + Ticker */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getSourceBadge(item.source)}
                          {item.ticker && (
                            <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase bg-bg-base border border-bd-subtle text-tx-primary">
                              {item.ticker}
                            </span>
                          )}
                        </div>

                        {sessionInfo && (
                          <span className="text-[10px] font-mono font-bold text-tx-muted uppercase tracking-wider bg-bg-base px-2 py-0.5 rounded border border-bd-hairline">
                            {sessionInfo.roundText} {sessionInfo.tickText && `· ${sessionInfo.tickText}`}
                          </span>
                        )}
                      </div>
                      
                      {/* Headline body */}
                      <p className="text-[13px] sm:text-[14px] font-medium text-tx-primary leading-relaxed font-sans">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default NewsTab;


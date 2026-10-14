"use client";

import { useMarketStore } from "@/store/marketStore";
import { Newspaper, X, Radio } from "lucide-react";
import { useEffect } from "react";

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

  const getSourceBadge = (source: string) => {
    switch(source) {
      case "NP":
        return <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-mono font-bold tracking-wider uppercase bg-accent-dim border border-accent-border text-accent">Newspaper</span>;
      case "AN":
        return <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-mono font-bold tracking-wider uppercase bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">Analyst Wire</span>;
      case "FF":
        return <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-mono font-bold tracking-wider uppercase bg-warn-dim border border-warn-border text-warn">Finfluencer</span>;
      case "IN":
        return <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-mono font-bold tracking-wider uppercase bg-loss-dim border border-loss-border text-loss">Insider Rumor</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-mono font-bold tracking-wider uppercase bg-bg-base border border-bd-subtle text-tx-secondary">{source}</span>;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5">
      
      {news.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 text-tx-muted uppercase tracking-wider text-[11px] font-mono border border-dashed border-bd-subtle rounded-xl bg-bg-raised/40 p-6 text-center space-y-2">
          <Newspaper className="w-8 h-8 opacity-25 mb-1" />
          <div className="font-bold text-tx-secondary">Awaiting breaking news wire...</div>
          <p className="text-[12px] text-tx-muted normal-case max-w-xs">
            Market catalysts and news headlines will populate here in real-time as events unfold.
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-3.5">
          {news.map((item) => (
            <div 
              key={item.id} 
              className="bg-bg-raised/75 hover:bg-bg-raised border border-bd-subtle hover:border-accent-border/60 rounded-xl p-4 sm:p-5 transition-all shadow-card flex flex-col gap-2.5"
            >
              {/* Only the source badge */}
              <div className="flex items-center">
                {getSourceBadge(item.source)}
              </div>
              
              {/* Only the news text */}
              <p className="text-[13px] sm:text-[15px] font-medium text-tx-primary leading-relaxed font-sans">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NewsTab;

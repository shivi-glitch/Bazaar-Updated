"use client";

import { useMarketStore } from "@/store/marketStore";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Newspaper, X } from "lucide-react";
import { useEffect } from "react";

// (Keep NewsToast exactly as it was)
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
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-md z-[100] glass-panel bg-[#070B14]/95 p-5 animate-in slide-in-from-top-5 duration-300 border border-blue-500/30 shadow-[0_10px_40px_-10px_rgba(59,130,246,0.3)]">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-emerald-400 to-transparent" />
      <div className="flex justify-between items-start mb-2">
        <span className="flex items-center gap-2 bg-blue-500/10 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-sm border border-blue-500/20 uppercase tracking-widest">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          BREAKING • {latestToast.ticker}
        </span>
        <button onClick={clearToast} className="text-slate-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
      </div>
      <p className="text-sm font-medium leading-snug mt-2 text-white">{latestToast.text}</p>
    </div>
  );
}

export function NewsTab() {
  const news = useMarketStore((s) => s.news);

  const getSourceBadge = (source: string) => {
    switch(source) {
      case "NP": return <span className="px-2 py-0.5 rounded-sm text-[10px] font-black tracking-widest uppercase bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]">Newspaper</span>;
      case "AN": return <span className="px-2 py-0.5 rounded-sm text-[10px] font-black tracking-widest uppercase bg-purple-500/10 border border-purple-500/20 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.1)]">Analyst</span>;
      case "FF": return <span className="px-2 py-0.5 rounded-sm text-[10px] font-black tracking-widest uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)]">Finfluencer</span>;
      case "IN": return <span className="px-2 py-0.5 rounded-sm text-[10px] font-black tracking-widest uppercase bg-red-500/10 border border-red-500/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]">Insider</span>;
      default: return <span className="px-2 py-0.5 rounded-sm text-[10px] font-black tracking-widest uppercase bg-[#111827] border border-white/10 text-slate-400">{source}</span>;
    }
  };

  return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-4">
        {news.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 text-slate-500 uppercase tracking-widest text-[10px] font-bold border border-dashed border-white/10 rounded-sm bg-[#070B14]">
            <Newspaper className="w-8 h-8 mb-3 opacity-20" />
            Awaiting breaking market alerts...
          </div>
        ) : (
          <div className="relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent space-y-6">
            {news.map((item) => (
              <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-[#0B1120] text-slate-500 group-[.is-active]:text-emerald-400 group-[.is-active]:border-emerald-500/30 group-[.is-active]:bg-emerald-500/10 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2rem)] glass-panel p-5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/20 transition-all flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    {getSourceBadge(item.source)}
                    <span className="text-[10px] font-bold text-white bg-[#111827] border border-white/10 px-2 py-0.5 rounded-sm tracking-widest uppercase">
                      {item.ticker}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-200 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}

export default NewsTab;

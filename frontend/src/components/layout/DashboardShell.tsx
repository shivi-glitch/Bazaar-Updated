"use client";

import { LineChart, Briefcase, Newspaper, Zap, Moon, Sun, LogOut, Clock, Activity, Shield } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { useMarketStore } from "@/store/marketStore";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import clsx from "clsx";
import { NewsToast } from "@/app/news/page";

export function DashboardShell({ children, activeTab = "explore", onTabChange = () => {} }: { children: React.ReactNode; activeTab?: string; onTabChange?: (tab: string) => void }) {
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  
  const sessionState = useMarketStore((s) => s.sessionState);
  const currentSession = useMarketStore((s) => s.currentSession);
  const connected = useMarketStore((s) => s.connected);
  const currentTick = useMarketStore((s) => s.globalTick);

  const setPortfolioData = useMarketStore((s) => s.setPortfolioData);

  const [teamId, setTeamId] = useState("");
  const [portfolio, setPortfolio] = useState({ equity: 100000000, cash: 100000000 });

  useEffect(() => {
    const token = localStorage.getItem("merx_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setTeamId(payload.sub);
      } catch (e) {}
    }

    const fetchPortfolio = async () => {
      try {
        const res = await api.get("/portfolio", token || "");
        setPortfolio({ equity: res.equity_paise, cash: res.cash_paise });
        setPortfolioData(res);
      } catch (err) {}
    };

    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 2000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: "explore", name: "Explore", icon: LineChart },
    { id: "portfolio", name: "Holdings", icon: Briefcase },
    { id: "news", name: "News", icon: Newspaper },
    { id: "stats", name: "Stats", icon: Zap }
  ];

  const handleLogout = () => {
    localStorage.removeItem("merx_token");
    router.push("/");
  };

  const formatMoney = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  let remainingSecs = Math.max(0, Math.floor((200 - currentTick) * 1.5));
  if (sessionState === "FINISHED") {
    remainingSecs = 0;
  } else if (sessionState === "LOCKED" || sessionState === "READY") {
    remainingSecs = 300;
  }
  const formattedTime = `${Math.floor(remainingSecs / 60).toString().padStart(2, '0')}:${(remainingSecs % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col h-screen w-full bg-[#070B14] text-slate-200 overflow-hidden font-sans relative">
      <NewsToast />
      
      {/* Top Utility Bar */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#070B14]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-sm bg-[#111827] border border-white/10 flex items-center justify-center shadow-inner">
            <Shield className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{teamId || "Participant"}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-sm border border-amber-500/20 tracking-wider">
                SESSION {currentSession > 6 ? currentSession - 6 : currentSession} / {currentSession > 6 ? 5 : 6}
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-sm border border-emerald-500/20 flex items-center gap-1.5 tracking-wider">
                <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                {sessionState}
              </span>
              <span className="text-[10px] font-bold text-slate-400 font-mono bg-[#111827] px-2 py-0.5 rounded-sm border border-white/5 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {formattedTime}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-sm border border-transparent hover:bg-white/5 hover:border-white/10 text-slate-400 transition-all">
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={handleLogout} className="px-4 py-1.5 rounded-sm bg-[#111827] border border-white/10 hover:bg-white/5 hover:border-white/20 text-slate-300 text-[10px] uppercase font-bold tracking-widest transition-all">
            Log Out
          </button>
        </div>
      </div>


      {/* Navigation Tabs */}
      <div className="px-6 border-b border-white/5 shrink-0 bg-[#070B14]">
        <div className="flex gap-2 max-w-7xl mx-auto">
          {navItems.map(tab => (
            <button 
              key={tab.id} onClick={() => onTabChange(tab.id)}
              className={clsx("flex items-center gap-2 px-6 py-3 rounded-t-sm font-bold transition-all text-xs uppercase tracking-widest relative mt-2", 
                activeTab === tab.id ? "text-blue-400 bg-blue-500/10 border-t border-x border-blue-500/20" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              )}
            >
              <tab.icon className="w-4 h-4" /> <span className="hidden md:inline">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto bg-[#070B14] relative z-0">
        {children}
      </main>
    </div>
  );
}

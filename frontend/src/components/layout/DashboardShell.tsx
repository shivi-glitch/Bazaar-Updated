"use client";

import { LineChart, Briefcase, Newspaper, Shield, Moon, Sun, Clock, Zap, LogOut, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { useMarketStore } from "@/store/marketStore";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import clsx from "clsx";
import { NewsToast } from "@/app/news/page";
import Link from "next/link";

export function DashboardShell({ 
  children, 
  activeTab = "chart", 
  onTabChange = () => {} 
}: { 
  children: React.ReactNode; 
  activeTab?: string; 
  onTabChange?: (tab: string) => void 
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  
  const sessionState = useMarketStore((s) => s.sessionState);
  const currentSession = useMarketStore((s) => s.currentSession);
  const connected = useMarketStore((s) => s.connected);
  const currentTick = useMarketStore((s) => s.globalTick);
  const setPortfolioData = useMarketStore((s) => s.setPortfolioData);

  const [teamId, setTeamId] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        setPortfolioData(res);
        if (res.session) {
          useMarketStore.getState().updateSessionFromPoll(res.session);
        }
      } catch (err) {}
    };

    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 2500);
    return () => clearInterval(interval);
  }, [setPortfolioData]);

  // Only the 4 essential subtabs: Markets, News, Portfolio, Stat Shop (orderbook & standings removed)
  const navItems = [
    { id: "chart", name: "Markets", icon: LineChart },
    { id: "news", name: "News", icon: Newspaper },
    { id: "holdings", name: "Portfolio", icon: Briefcase },
    { id: "shop", name: "Stat Shop", icon: Zap },
  ];

  const handleLogout = () => {
    localStorage.removeItem("merx_token");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("merx_auth_change"));
    }
    router.push("/");
  };
  
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 && sessionState === "RUNNING" ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionState]);

  useEffect(() => {
    let serverSecs = Math.max(0, Math.floor((200 - currentTick) * 1.5));
    if (sessionState === "FINISHED") serverSecs = 0;
    else if (sessionState === "LOCKED" || sessionState === "READY") serverSecs = 300;
    
    setTimeLeft((prev) => {
      if (Math.abs(prev - serverSecs) > 2) return serverSecs;
      return prev;
    });
  }, [currentTick, sessionState]);

  const formattedTime = `${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;
  const isRound2 = currentSession >= 7;

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-bg-void text-tx-primary overflow-hidden relative font-sans transition-colors duration-150">
      <NewsToast />
      
      {/* ─── Top Utility Bar ─── */}
      <header className="h-[54px] sm:h-[56px] border-b border-bd-subtle flex items-center justify-between px-3 sm:px-6 shrink-0 bg-bg-base/90 backdrop-blur-md z-30">
        
        {/* Left: Brand ("MERX") + Team + Telemetry */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <Link 
            href="/" 
            className="font-bold text-[18px] sm:text-[20px] tracking-[-0.04em] text-tx-primary shrink-0 hover:text-accent transition-colors"
          >
            MERX
          </Link>

          <span className="text-bd-strong hidden sm:inline">|</span>

          {/* Team and Session Info */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-mono font-bold text-tx-secondary uppercase tracking-wider px-2 py-0.5 rounded bg-bg-raised border border-bd-subtle truncate max-w-[80px] sm:max-w-none">
              {teamId || "Trader"}
            </span>

            {/* Session indicator */}
            <span className="text-[10px] font-mono font-bold text-warn bg-warn-dim px-1.5 sm:px-2 py-0.5 rounded border border-warn-border shrink-0">
              S{currentSession} · {isRound2 ? "R2" : "R1"}
            </span>

            {/* State indicator */}
            <span className={clsx(
              "text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1.5 shrink-0",
              sessionState === "RUNNING" ? "text-gain bg-gain-dim border-gain-border" :
              sessionState === "STARTING" ? "text-accent bg-accent-dim border-accent-border animate-pulse" :
              sessionState === "PAUSED" ? "text-warn bg-warn-dim border-warn-border" :
              sessionState === "FINISHED" ? "text-tx-muted bg-bg-raised border-bd-subtle" :
              "text-tx-secondary bg-bg-raised border-bd-subtle"
            )}>
              <span className={clsx(
                "w-1.5 h-1.5 rounded-full",
                !connected ? 'bg-loss' :
                sessionState === 'RUNNING' ? 'bg-gain animate-pulse' :
                sessionState === 'STARTING' ? 'bg-accent animate-ping' :
                sessionState === 'PAUSED' ? 'bg-warn' : 'bg-tx-muted'
              )} />
              <span>{sessionState}</span>
            </span>

            {/* Clock */}
            <span className="text-[10px] sm:text-[11px] font-mono font-bold text-tx-secondary bg-bg-raised px-2 py-0.5 rounded border border-bd-subtle flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3 text-tx-muted" />
              <span>{formattedTime}</span>
            </span>
          </div>
        </div>
        
        {/* Right: Theme Toggle & Logout (Reddish) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Color Mode Toggle Button */}
          <button 
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} 
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-tx-secondary hover:text-tx-primary bg-bg-raised hover:bg-bg-overlay rounded-md border border-bd-subtle transition-colors flex items-center gap-1.5 text-[11px] font-mono cursor-pointer"
            aria-label="Toggle color mode"
            title={resolvedTheme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {resolvedTheme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-warn" />
                <span className="hidden md:inline text-tx-muted">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-accent" />
                <span className="hidden md:inline text-tx-muted">Dark</span>
              </>
            )}
          </button>

          {/* Logout button (Reddish styling) */}
          <button 
            onClick={handleLogout} 
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-loss-dim hover:bg-loss/20 border border-loss-border/70 hover:border-loss text-loss text-[11px] font-mono font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer"
            aria-label="Log out"
            title="Sign out of trading session"
          >
            <LogOut className="w-3.5 h-3.5 text-loss" />
            <span className="hidden xs:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* ─── Responsive Sub-tabs Navigation (4 tabs) ─── */}
      <nav 
        className="px-3 sm:px-6 border-b border-bd-subtle shrink-0 bg-bg-base overflow-x-auto hide-scrollbar z-20" 
        role="tablist" 
        aria-label="Dashboard sub-tabs"
      >
        <div className="flex max-w-7xl mx-auto w-full min-w-max gap-1 sm:gap-2 py-1.5">
          {navItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => onTabChange(tab.id)}
                role="tab"
                aria-selected={isActive}
                className={clsx(
                  "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 font-mono font-bold text-[11px] sm:text-[12px] uppercase tracking-wider transition-all rounded-md relative cursor-pointer",
                  isActive 
                    ? "text-accent bg-accent-dim border border-accent-border shadow-[0_0_12px_rgba(0,212,170,0.15)]" 
                    : "text-tx-secondary hover:text-tx-primary hover:bg-bg-raised border border-transparent"
                )}
              >
                <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ─── Main Content Container ─── */}
      <main className="flex-1 overflow-y-auto bg-bg-void relative z-0 flex flex-col" role="tabpanel">
        {children}
      </main>
    </div>
  );
}

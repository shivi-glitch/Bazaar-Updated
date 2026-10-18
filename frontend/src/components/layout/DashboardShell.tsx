"use client";

import { LineChart, Briefcase, Newspaper, Shield, Moon, Sun, Clock, Zap, LogOut, Menu, X, Settings } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
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
  onTabChange = () => {},
  isViewingStock = false
}: { 
  children: React.ReactNode; 
  activeTab?: string; 
  onTabChange?: (tab: string) => void;
  isViewingStock?: boolean;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isStockViewing = isViewingStock || (pathname?.startsWith("/market/") && pathname !== "/market");
  
  const sessionState = useMarketStore((s) => s.sessionState);
  const currentSession = useMarketStore((s) => s.currentSession);
  const connected = useMarketStore((s) => s.connected);
  const currentTick = useMarketStore((s) => s.globalTick);
  const setPortfolioData = useMarketStore((s) => s.setPortfolioData);
  const isChartFullscreen = useMarketStore((s) => s.isChartFullscreen);

  const [teamId, setTeamId] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
    const interval = setInterval(fetchPortfolio, 10000);

    const handleRefreshEvent = () => {
      fetchPortfolio();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("merx_portfolio_refresh", handleRefreshEvent);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== "undefined") {
        window.removeEventListener("merx_portfolio_refresh", handleRefreshEvent);
      }
    };
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
      {!isChartFullscreen && <NewsToast />}
      
      {/* ─── Top Utility Bar (Hidden in Fullscreen Chart) ─── */}
      {!isChartFullscreen && (
        <header className="h-[54px] sm:h-[56px] border-b border-bd-subtle flex items-center justify-between px-3 sm:px-6 shrink-0 bg-bg-base/90 backdrop-blur-md z-30">
          
          {/* Left: Brand ("MERX") + Team + Telemetry */}
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            <Link 
              href="/" 
              className="font-black text-[18px] sm:text-[20px] tracking-[-0.03em] shrink-0 hover:brightness-110 transition-all flex items-center"
            >
              <span className="text-gain">MER</span><span className="text-loss">X</span>
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

              {/* Minimal Green Ticker Indicator (no text) */}
              <span 
                className={clsx(
                  "w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full shrink-0 shadow-xs",
                  !connected ? 'bg-loss' :
                  sessionState === 'RUNNING' ? 'bg-gain animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.7)]' :
                  sessionState === 'STARTING' ? 'bg-accent animate-ping' :
                  sessionState === 'PAUSED' ? 'bg-warn' : 'bg-tx-muted'
                )} 
                title={`Status: ${sessionState}`} 
              />

              {/* Clock */}
              <span className="text-[10px] sm:text-[11px] font-mono font-bold text-tx-primary bg-bg-raised px-2 py-0.5 rounded border border-bd-subtle flex items-center gap-1.5 shrink-0 shadow-xs">
                <Clock className="w-3 h-3 text-tx-muted" />
                <span className="font-mono font-bold tracking-wider">{formattedTime}</span>
              </span>
            </div>
          </div>
          
          {/* Right: Consolidated Settings Menu (Theme & Logout) - Only visible when not viewing a stock */}
          {!isStockViewing ? (
            <div className="relative shrink-0">
              <button 
                onClick={() => setSettingsOpen(!settingsOpen)} 
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-tx-secondary hover:text-tx-primary bg-bg-raised hover:bg-bg-overlay rounded-md border border-bd-subtle transition-colors flex items-center gap-1.5 text-[11px] font-mono cursor-pointer"
                aria-label="Open settings"
                title="Settings"
              >
                <Settings className="w-3.5 h-3.5 text-tx-secondary" />
                <span className="hidden sm:inline text-tx-muted">Settings</span>
              </button>

              {settingsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setSettingsOpen(false)} 
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-bg-base border border-bd-subtle rounded-xl shadow-modal p-2 z-50 flex flex-col gap-1 text-[12px] font-mono animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2 py-1 text-[10px] uppercase font-bold text-tx-muted tracking-wider border-b border-bd-hairline">
                      User Settings
                    </div>
                    
                    {/* Theme Toggle Button */}
                    <button
                      onClick={() => {
                        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
                        setSettingsOpen(false);
                      }}
                      className="flex items-center justify-between w-full px-2.5 py-2 rounded-md hover:bg-bg-raised text-tx-secondary hover:text-tx-primary transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        {resolvedTheme === 'dark' ? <Sun className="w-3.5 h-3.5 text-warn" /> : <Moon className="w-3.5 h-3.5 text-accent" />}
                        <span>Mode</span>
                      </span>
                      <span className="text-[10px] text-tx-muted uppercase font-bold">{resolvedTheme === 'dark' ? 'Dark' : 'Light'}</span>
                    </button>

                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        setSettingsOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2 w-full px-2.5 py-2 rounded-md text-loss hover:bg-loss-dim transition-colors cursor-pointer font-bold"
                    >
                      <LogOut className="w-3.5 h-3.5 text-loss" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : <div className="w-1" />}
        </header>
      )}

      {/* ─── Responsive Sub-tabs Navigation (Hidden in Fullscreen Chart) ─── */}
      {!isChartFullscreen && (
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
      )}

      {/* ─── Main Content Container ─── */}
      <main 
        className={clsx(
          "flex-1 bg-bg-void relative flex flex-col",
          isChartFullscreen ? "overflow-hidden p-0 m-0" : "overflow-y-auto z-0"
        )} 
        role="tabpanel"
      >
        {children}
      </main>
    </div>
  );
}

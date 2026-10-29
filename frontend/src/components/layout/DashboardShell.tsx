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
  const remainingSecondsStore = useMarketStore((s) => s.remainingSeconds);
  const setPortfolioData = useMarketStore((s) => s.setPortfolioData);
  const isChartFullscreen = useMarketStore((s) => s.isChartFullscreen);

  const [teamId, setTeamId] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("merx_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setTeamId(payload.sub);
    } catch (e) {}

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
  
  // ── Countdown Timer ─────────────────────────────────────────────────────
  // Rule: Tick smoothly every real second via setInterval.
  // Snap when session state changes, gently nudge on drift, freeze on pause.
  const [timeLeft, setTimeLeft] = useState(300);

  // Sync clock when session state changes
  useEffect(() => {
    if (sessionState === "RUNNING") {
      const serverSecs = typeof remainingSecondsStore === "number"
        ? remainingSecondsStore
        : Math.max(0, Math.floor((200 - (currentTick || 0)) * 1.5));
      setTimeLeft(serverSecs);
    } else if (sessionState === "FINISHED" || sessionState === "LOCKED") {
      setTimeLeft(0);
    } else if (sessionState === "PAUSED") {
      // Freeze remaining seconds, do NOT reset to 300!
      const serverSecs = typeof remainingSecondsStore === "number"
        ? remainingSecondsStore
        : Math.max(0, Math.floor((200 - (currentTick || 0)) * 1.5));
      setTimeLeft((prev) => (prev > 0 ? prev : serverSecs));
    } else {
      setTimeLeft(300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionState]);

  // Smooth real-time countdown (1 tick per real second)
  useEffect(() => {
    if (sessionState !== "RUNNING") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionState]);

  // Gentle drift correction: nudge by 1s if slightly off, hard snap only on major lag/sleep
  useEffect(() => {
    if (sessionState !== "RUNNING") return;
    const serverSecs = typeof remainingSecondsStore === "number"
      ? remainingSecondsStore
      : Math.max(0, Math.floor((200 - (currentTick || 0)) * 1.5));
    setTimeLeft((prev) => {
      const diff = serverSecs - prev;
      if (Math.abs(diff) > 12) return serverSecs; // Major desync (tab sleep) -> snap
      if (Math.abs(diff) > 3) return diff > 0 ? prev + 1 : prev - 1; // Subtle 1s nudge
      return prev;
    });
  }, [currentTick, remainingSecondsStore, sessionState]);

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
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-medium text-tx-secondary px-2.5 py-1 rounded-md bg-bg-raised border border-bd-subtle truncate max-w-[100px] sm:max-w-none">
                {teamId || "Trader"}
              </span>

              {/* Session indicator */}
              <span className={clsx(
                "text-xs font-medium px-2.5 py-1 rounded-md border shrink-0",
                currentSession === 0 
                  ? "text-amber-400 bg-amber-500/10 border-amber-500/25 font-semibold" 
                  : "text-tx-secondary bg-bg-raised border-bd-subtle"
              )}>
                {currentSession === 0 ? "Demo Round" : `S${currentSession} · ${isRound2 ? "R2" : "R1"}`}
              </span>

              {/* Minimal Green Ticker Indicator (no text, clean pulse) */}
              <span 
                className={clsx(
                  "w-2 h-2 rounded-full shrink-0",
                  !connected ? 'bg-loss' :
                  sessionState === 'RUNNING' ? 'bg-gain animate-pulse' :
                  sessionState === 'STARTING' ? 'bg-accent animate-ping' :
                  sessionState === 'PAUSED' ? 'bg-warn' : 'bg-tx-muted'
                )} 
                title={`Status: ${sessionState}`} 
              />

              {/* Clock */}
              <span className="text-xs font-semibold text-tx-primary bg-bg-raised px-2.5 py-1 rounded-md border border-bd-subtle flex items-center gap-1.5 shrink-0 tabular-nums">
                <Clock className="w-3.5 h-3.5 text-tx-muted" />
                <span className="tabular-nums font-semibold">{formattedTime}</span>
              </span>
            </div>
          </div>
          
          {/* Right: Consolidated Settings Menu (Theme & Logout) - Only visible when not viewing a stock */}
          {!isStockViewing ? (
            <div className="relative shrink-0">
              <button 
                onClick={() => setSettingsOpen(!settingsOpen)} 
                className="px-2.5 py-1.5 text-tx-secondary hover:text-tx-primary bg-bg-raised hover:bg-bg-overlay rounded-md border border-bd-subtle transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                aria-label="Open settings"
                title="Settings"
              >
                <Settings className="w-3.5 h-3.5 text-tx-secondary" />
                <span className="hidden sm:inline">Settings</span>
              </button>

              {settingsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setSettingsOpen(false)} 
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-bg-base border border-bd-subtle rounded-xl shadow-modal p-2 z-50 flex flex-col gap-1 text-xs font-sans animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2.5 py-1.5 text-[11px] font-medium text-tx-muted tracking-wider border-b border-bd-hairline">
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
                        <span>Appearance</span>
                      </span>
                      <span className="text-xs text-tx-muted capitalize font-medium">{resolvedTheme === 'dark' ? 'Dark' : 'Light'}</span>
                    </button>

                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        setSettingsOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2 w-full px-2.5 py-2 rounded-md text-loss hover:bg-loss-dim transition-colors cursor-pointer font-medium"
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
          <div className="flex max-w-7xl mx-auto w-full min-w-max gap-1.5 py-2">
            {navItems.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id} 
                  onClick={() => onTabChange(tab.id)}
                  role="tab"
                  aria-selected={isActive}
                  className={clsx(
                    "flex items-center gap-2 px-3.5 py-1.5 font-medium text-xs sm:text-sm transition-all rounded-lg cursor-pointer",
                    isActive 
                      ? "text-tx-primary bg-bg-raised border border-bd-subtle font-semibold shadow-xs" 
                      : "text-tx-secondary hover:text-tx-primary hover:bg-bg-raised/60 border border-transparent"
                  )}
                >
                  <tab.icon className="w-4 h-4 shrink-0" />
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

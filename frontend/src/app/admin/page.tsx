"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import {
  Activity, Radio, Users, AlertTriangle, Search, LineChart, Trophy, LogOut,
  Sun, Moon, X, Zap, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle,
  Lock, ShieldAlert, Plus, Power, RotateCcw, KeyRound, RefreshCw, Terminal
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import clsx from "clsx";
import { ASSET_META } from "../market/[ticker]/page";
import { SCRIPTED_NEWS_DATABASE, ScriptedNewsItem } from "@/lib/scriptedNews";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const [sysState, setSysState] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [cumulativeLeaderboard, setCumulativeLeaderboard] = useState<any>(null);
  const [leaderboardView, setLeaderboardView] = useState<"ROUND" | "CUMULATIVE">("ROUND");
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"SESSION" | "TEAMS" | "ASSETS" | "NEWS" | "LEADERBOARD" | "DANGER">("SESSION");
  const [searchQuery, setSearchQuery] = useState("");

  // 10-second leaderboard refresh telemetry
  const [lastLbSync, setLastLbSync] = useState<string>("");
  const [lbSecondsRemaining, setLbSecondsRemaining] = useState(10);

  const { resolvedTheme, setTheme } = useTheme();

  // News State
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [newsTabView, setNewsTabView] = useState<"UPCOMING" | "HISTORY">("UPCOMING");
  const [newsSessionFilter, setNewsSessionFilter] = useState<number | "ALL">("ALL");
  const [newsSearch, setNewsSearch] = useState("");
  const [newsSource, setNewsSource] = useState("IN");
  const [newsTicker, setNewsTicker] = useState("RELI-X");
  const [newsText, setNewsText] = useState("");

  // Danger Zone State
  const [jumpTarget, setJumpTarget] = useState(1);

  const getAdminToken = () => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem("admin_auth") || "";
  };

  useEffect(() => {
    if (getAdminToken()) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim()) {
      sessionStorage.setItem("admin_auth", passwordInput.trim());
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
  };

  // Dedicated Leaderboard fetcher (Primary Round Leaderboard)
  const fetchLeaderboard = useCallback(async () => {
    if (!getAdminToken()) return;
    try {
      const lbRes = await api.get("/admin/leaderboard/live", getAdminToken());
      setLeaderboard(lbRes);
      const now = new Date();
      setLastLbSync(now.toLocaleTimeString());
      setLbSecondsRemaining(10);
    } catch {
      // background fetch fail
    }
  }, []);

  // Cumulative Leaderboard fetcher (Updates after both rounds finish)
  const fetchCumulativeLeaderboard = useCallback(async (force = false) => {
    if (!getAdminToken()) return;
    try {
      const url = force ? "/admin/leaderboard/cumulative?force=true" : "/admin/leaderboard/cumulative";
      const res = await api.get(url, getAdminToken());
      setCumulativeLeaderboard(res);
    } catch {
      // background fetch fail
    }
  }, []);

  // General simulation & teams fetcher
  const fetchSysData = useCallback(async () => {
    if (!getAdminToken()) return;
    try {
      const [stateRes, teamsRes] = await Promise.all([
        api.get("/admin/sessions", getAdminToken()),
        api.get("/admin/teams", getAdminToken())
      ]);
      setSysState(stateRes);
      setTeams(teamsRes.teams || []);
    } catch {
      // background fetch fail
    }
  }, []);

  // Combined fetch
  const fetchAllData = useCallback(async () => {
    await Promise.all([fetchSysData(), fetchLeaderboard(), fetchCumulativeLeaderboard()]);
  }, [fetchSysData, fetchLeaderboard, fetchCumulativeLeaderboard]);

  // Initial load & Polling loops
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAllData();

    // Fast 1s loop for session clock & teams
    const sysInterval = setInterval(fetchSysData, 1000);

    // Dedicated 10s loop for Leaderboard automatic refresh
    const lbInterval = setInterval(fetchLeaderboard, 10000);

    // 1s ticker for countdown display
    const countdownInterval = setInterval(() => {
      setLbSecondsRemaining(prev => (prev <= 1 ? 10 : prev - 1));
    }, 1000);

    return () => {
      clearInterval(sysInterval);
      clearInterval(lbInterval);
      clearInterval(countdownInterval);
    };
  }, [isAuthenticated, fetchAllData, fetchSysData, fetchLeaderboard]);

  const handleAction = async (endpoint: string, payload: any = {}) => {
    setLoading(true);
    try {
      await api.post(endpoint, payload, getAdminToken());
      // Re-fetch everything immediately on any session/engine action
      await fetchAllData();
    } catch (err: any) {
      alert(err.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeam = () => {
    const rawName = prompt("Enter new Team ID (lowercase alphanumeric, no spaces):");
    if (!rawName) return;
    const teamId = rawName.trim().toLowerCase().replace(/\s/g, "");
    handleAction("/admin/teams/create", { team_id: teamId });
  };

  const handleResetPin = (teamId: string) => {
    if (confirm(`Regenerate a random 6-digit PIN for team '${teamId}'?`)) {
      handleAction("/admin/teams/reset-pin", { team_id: teamId });
    }
  };

  const handleSetPin = () => {
    // Overloaded with argument below
  };

  const onSetTeamPin = (teamId: string) => {
    const customPin = prompt(`Enter custom PIN for team '${teamId}':`);
    if (customPin === null) return;
    const clean = customPin.trim();
    if (!clean) {
      alert("PIN cannot be empty.");
      return;
    }
    handleAction("/admin/teams/set-pin", { team_id: teamId, pin: clean });
  };

  const handleRemoveTeam = (teamId: string) => {
    if (confirm(`CRITICAL WARNING: Permanently delete team '${teamId}' and wipe all their open positions?`)) {
      handleAction("/admin/teams/remove", { team_id: teamId });
    }
  };

  const fireNews = async () => {
    if (!newsText.trim()) return alert("Headline text is required");
    await handleAction("/admin/news/fire", { source: newsSource, ticker: newsTicker, text: newsText.trim() });
    setNewsText("");
    setShowNewsModal(false);
    setNewsTabView("HISTORY");
  };

  const fireSpecificNews = async (item: ScriptedNewsItem) => {
    if (!confirm(`Force-trigger news for ${item.ticker} (Session ${item.g}) immediately into active order flow?`)) return;
    await handleAction("/admin/news/fire", { source: item.source, ticker: item.ticker, text: item.text });
  };

  // ── 0. LOGIN GATE (TERMINAL AUTH) ───────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] w-full bg-bg-void flex flex-col items-center justify-center p-4 selection:bg-accent-dim selection:text-accent font-sans relative">
        <div className="absolute top-6 right-6">
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-md border border-bd-subtle bg-bg-base hover:bg-bg-raised text-tx-secondary hover:text-tx-primary transition-colors"
            title="Toggle theme"
          >
            {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-accent" />}
          </button>
        </div>

        <div className="w-full max-w-md bg-bg-raised border border-bd-subtle rounded-xl p-8 shadow-card relative overflow-hidden">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-12 h-12 rounded-lg bg-accent-dim border border-accent-border flex items-center justify-center mb-4">
              <Lock className="w-5 h-5 text-accent" />
            </div>

            <h1 className="text-2xl font-bold text-tx-primary tracking-tight">Admin Terminal</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-tx-muted mb-2 font-bold">
                Do you still love her?
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-bg-base border border-bd-subtle rounded-lg px-4 py-3 text-tx-primary font-mono text-center tracking-widest text-sm outline-none focus:border-accent transition-colors placeholder:text-tx-muted"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-tx-inverse font-mono font-bold text-xs uppercase tracking-wider py-3 rounded-lg transition-all shadow-md active:scale-[0.98]"
            >
              Authenticate your Love
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── 1. LOADING STATE ──────────────────────────────────────────
  if (!sysState || !leaderboard) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center bg-bg-void text-tx-secondary font-mono text-xs gap-3">
        <Activity className="w-6 h-6 text-accent animate-pulse" />
        <span className="uppercase tracking-widest">Connecting to simulation telemetry...</span>
      </div>
    );
  }

  // ── 2. DATA PROCESSING ─────────────────────────────────────────
  const round1Tickers = ["RELI-X", "INFY-Z", "HDFC-W", "BZR-V", "PULSE", "GOLDCORE", "TATA-Y"];
  const round2Tickers = ["RELI-X", "INFY-Z", "HDFC-W", "BZR-V", "PULSE", "GOLDCORE", "TATA-Y", "NIMBUS", "STAPLE", "VOLTAGE", "CRANE"];

  const activeTickers = (sysState?.current_g >= 7) ? round2Tickers : round1Tickers;
  const activeAssets = activeTickers.map(ticker => {
    const meta = ASSET_META[ticker] || { name: ticker, sector: "General", archetype: "High-Beta Volatile" as const };
    return {
      ticker,
      ...meta
    };
  });

  const tabs = [
    { id: "SESSION" as const, name: "Session", icon: Activity },
    { id: "TEAMS" as const, name: "Teams", badge: teams.length, icon: Users },
    { id: "ASSETS" as const, name: "Assets", badge: activeAssets.length, icon: LineChart },
    { id: "NEWS" as const, name: "News", icon: Radio },
    { id: "LEADERBOARD" as const, name: "Leaderboard", icon: Trophy },
    { id: "DANGER" as const, name: "Danger Zone", icon: AlertTriangle }
  ];

  const filteredTeams = teams.filter(t => t.id.toLowerCase().includes(searchQuery.toLowerCase()));

  let currentRoundStr = "Market Halted";
  if (sysState.current_g < 7 && sysState.current_g > 0) {
    currentRoundStr = `Round 1 (Retail) • S${sysState.current_g}`;
  } else if (sysState.current_g >= 7 && sysState.current_g <= 11) {
    currentRoundStr = `Round 2 (Inst) • S${sysState.current_g - 6}`;
  }

  const remainingSecs = Math.max(0, Math.floor((200 - (sysState.n || 0)) * 1.5));
  const formattedTime = `${Math.floor(remainingSecs / 60).toString().padStart(2, '0')}:${(remainingSecs % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-[100dvh] w-full bg-bg-void text-tx-primary overflow-x-hidden font-sans selection:bg-accent-dim selection:text-accent flex flex-col">

      {/* ── TOP HEADER (LOGO AT LEFT, LOGOUT TERMINAL AT RIGHT) ── */}
      <header className="sticky top-0 z-30 w-full bg-bg-base/95 backdrop-blur-md border-b border-bd-subtle">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Row 1: Brand & Terminal Controls */}
          <div className="h-16 flex items-center justify-between gap-4">

            {/* Left: Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-dim border border-accent-border flex items-center justify-center">
                <Activity className="w-4 h-4 text-accent" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight"><span className="text-gain">MER</span><span className="text-loss">X</span></span>
                <span className="bg-accent-dim text-accent text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-widest border border-accent-border font-bold">
                  ADMIN
                </span>
                <span className={clsx(
                  "w-2 h-2 rounded-full ml-1",
                  sysState.is_frozen ? "bg-loss animate-pulse" : "bg-gain animate-pulse"
                )} />
              </div>
            </div>

            {/* Center (Desktop Telemetry Pill) */}
            <div className="hidden lg:flex items-center gap-4 text-xs font-mono bg-bg-raised/70 border border-bd-subtle px-4 py-1.5 rounded-full">
              <div className="flex items-center gap-2">
                <span className="text-tx-muted uppercase">Status:</span>
                {sysState.is_frozen ? (
                  <span className="text-loss font-bold">FROZEN</span>
                ) : (
                  <span className="text-gain font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
                    ACTIVE
                  </span>
                )}
              </div>
              <span className="text-bd-strong">•</span>
              <div className="flex items-center gap-2">
                <span className="text-tx-muted uppercase">Phase:</span>
                <span className="text-tx-primary font-bold">{currentRoundStr}</span>
              </div>
              <span className="text-bd-strong">•</span>
              <div className="flex items-center gap-2">
                <span className="text-tx-muted uppercase">Clock:</span>
                <span className="text-accent font-bold">T+{sysState.n || 0} ({formattedTime})</span>
              </div>
            </div>

            {/* Right: Theme Toggle & Logout Terminal */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="p-2 sm:px-2.5 sm:py-2 rounded-lg border border-bd-subtle hover:border-bd-strong bg-bg-raised text-tx-secondary hover:text-tx-primary transition-colors flex items-center gap-1.5"
                title="Toggle Light / Dark Mode"
              >
                {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-accent" />}
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs font-mono font-bold text-loss hover:text-loss bg-loss-dim/40 hover:bg-loss-dim border border-loss-border/40 hover:border-loss-border transition-all active:scale-[0.98]"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout Terminal</span>
                <span className="sm:hidden">Logout</span>
              </button>
            </div>

          </div>

          {/* Row 2: Top Tabs Navigation */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none border-t border-bd-hairline py-1.5">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all whitespace-nowrap",
                    isActive
                      ? "bg-accent-dim text-accent border border-accent-border font-bold shadow-sm"
                      : "text-tx-secondary hover:text-tx-primary hover:bg-bg-raised/70 border border-transparent"
                  )}
                >
                  <tab.icon className={clsx("w-3.5 h-3.5", isActive ? "text-accent" : "text-tx-muted")} />
                  <span>{tab.name}</span>
                  {tab.badge !== undefined && (
                    <span className={clsx(
                      "text-[10px] px-1.5 py-0.2 rounded font-mono border ml-0.5",
                      isActive
                        ? "bg-accent text-tx-inverse border-accent font-bold"
                        : "bg-bg-raised text-tx-muted border-bd-subtle"
                    )}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </header>

      {/* ── MAIN CONTENT AREA ────────────────────────────────── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* ══════════════════════════════════════════════════════
            TAB 1: SESSION CONTROLS
           ══════════════════════════════════════════════════════ */}
        {activeTab === "SESSION" && (
          <div className="space-y-6">

            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-tx-primary tracking-tight">Session Controller</h1>
                <p className="text-tx-secondary text-sm mt-0.5">
                  Trigger, pause, and advance market simulations across Round 1 & Round 2.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
                <div className="px-3.5 py-2 rounded-lg border border-bd-subtle bg-bg-raised flex items-center gap-2">
                  <span className="text-tx-muted uppercase font-bold">Tick:</span>
                  <span className="font-bold text-accent">T+{sysState.n || 0}</span>
                  <span className="text-tx-muted">•</span>
                  <span className="text-tx-primary font-bold">{formattedTime} remaining</span>
                </div>
              </div>
            </div>

            {/* Round 1 Block */}
            <div className="glass-panel p-5 sm:p-6 border border-bd-subtle">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-bd-hairline">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                    <h2 className="text-base sm:text-lg font-bold text-tx-primary tracking-tight">Round 1: Retail Order Flow</h2>
                  </div>
                  <p className="text-xs text-tx-secondary mt-0.5">7 core assets • Retail participant market making</p>
                </div>
                <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-bg-base border border-bd-subtle text-tx-secondary font-bold">
                  Sessions 1 – 6
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(g => {
                  const isCurrent = g === sysState.current_g;
                  const state = sysState.states[g] || "PENDING";
                  const isRunning = state === "RUNNING";
                  const isPaused = state === "PAUSED";

                  return (
                    <div
                      key={g}
                      className={clsx(
                        "p-4 rounded-xl border transition-all flex flex-col justify-between gap-4 bg-bg-base",
                        isCurrent
                          ? "border-accent/60 shadow-md shadow-accent/5 ring-1 ring-accent/30"
                          : "border-bd-subtle hover:border-bd-strong"
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-tx-primary">Session {g}</span>
                          {isCurrent && (
                            <span className="text-[10px] font-mono font-bold text-accent bg-accent-dim px-2 py-0.5 rounded border border-accent-border uppercase">
                              Active
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isCurrent && (isRunning || isPaused) && (
                            <span className="text-xs font-mono font-bold text-gain bg-gain-dim px-2 py-0.5 rounded border border-gain-border">
                              {formattedTime}
                            </span>
                          )}
                          <span className={clsx(
                            "text-xs font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider",
                            isRunning ? "text-gain bg-gain-dim border-gain-border" :
                              isPaused ? "text-warn bg-warn-dim border-warn-border" :
                                state === "ENDED" ? "text-tx-muted bg-bg-raised border-bd-subtle" :
                                  "text-tx-secondary bg-bg-raised border-bd-subtle"
                          )}>
                            {state}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          disabled={loading}
                          onClick={() => handleAction(`/admin/sessions/${g}/start`)}
                          className="bg-gain-dim text-gain hover:bg-gain hover:text-tx-inverse border border-gain-border text-xs font-mono font-bold uppercase tracking-wider py-2 rounded-lg transition-all active:scale-[0.98]"
                        >
                          Start
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => handleAction(`/admin/sessions/${g}/pause`)}
                          className="bg-warn-dim text-warn hover:bg-warn hover:text-tx-inverse border border-warn-border text-xs font-mono font-bold uppercase tracking-wider py-2 rounded-lg transition-all active:scale-[0.98]"
                        >
                          Pause
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => handleAction(`/admin/sessions/${g}/end`)}
                          className="bg-bg-raised text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay border border-bd-subtle text-xs font-mono font-bold uppercase tracking-wider py-2 rounded-lg transition-all active:scale-[0.98]"
                        >
                          End
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Round 2 Block */}
            <div className="glass-panel p-5 sm:p-6 border border-bd-subtle">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-bd-hairline">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                    <h2 className="text-base sm:text-lg font-bold text-tx-primary tracking-tight">Round 2: Institutional (Algorithmic Trading)</h2>
                  </div>
                  <p className="text-xs text-tx-secondary mt-0.5">11 assets • AI order flow injection • Liquidity shocks</p>
                </div>

                {!sysState.r2_unlocked ? (
                  <button
                    disabled={loading}
                    onClick={() => handleAction("/admin/round2/unlock")}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md self-start sm:self-auto"
                  >
                    Unlock Round 2
                  </button>
                ) : (
                  <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 font-bold self-start sm:self-auto">
                    UNLOCKED • SESSIONS 1 – 5
                  </span>
                )}
              </div>

              <div className={clsx(
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity",
                sysState.r2_unlocked ? "opacity-100" : "opacity-40 pointer-events-none"
              )}>
                {[7, 8, 9, 10, 11].map(g => {
                  const isCurrent = g === sysState.current_g;
                  const state = sysState.states[g] || "PENDING";
                  const isRunning = state === "RUNNING";
                  const isPaused = state === "PAUSED";

                  return (
                    <div
                      key={g}
                      className={clsx(
                        "p-4 rounded-xl border transition-all flex flex-col justify-between gap-4 bg-bg-base",
                        isCurrent
                          ? "border-purple-500/60 shadow-md shadow-purple-500/10 ring-1 ring-purple-500/30"
                          : "border-bd-subtle hover:border-bd-strong"
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-tx-primary">Session {g - 6}</span>
                          <span className="text-xs font-mono text-tx-muted">(S{g})</span>
                          {isCurrent && (
                            <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/40 uppercase">
                              Active
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isCurrent && (isRunning || isPaused) && (
                            <span className="text-xs font-mono font-bold text-gain bg-gain-dim px-2 py-0.5 rounded border border-gain-border">
                              {formattedTime}
                            </span>
                          )}
                          <span className={clsx(
                            "text-xs font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider",
                            isRunning ? "text-gain bg-gain-dim border-gain-border" :
                              isPaused ? "text-warn bg-warn-dim border-warn-border" :
                                state === "ENDED" ? "text-tx-muted bg-bg-raised border-bd-subtle" :
                                  "text-tx-secondary bg-bg-raised border-bd-subtle"
                          )}>
                            {state}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          disabled={loading}
                          onClick={() => handleAction(`/admin/sessions/${g}/start`)}
                          className="bg-gain-dim text-gain hover:bg-gain hover:text-tx-inverse border border-gain-border text-xs font-mono font-bold uppercase tracking-wider py-2 rounded-lg transition-all active:scale-[0.98]"
                        >
                          Start
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => handleAction(`/admin/sessions/${g}/pause`)}
                          className="bg-warn-dim text-warn hover:bg-warn hover:text-tx-inverse border border-warn-border text-xs font-mono font-bold uppercase tracking-wider py-2 rounded-lg transition-all active:scale-[0.98]"
                        >
                          Pause
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => handleAction(`/admin/sessions/${g}/end`)}
                          className="bg-bg-raised text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay border border-bd-subtle text-xs font-mono font-bold uppercase tracking-wider py-2 rounded-lg transition-all active:scale-[0.98]"
                        >
                          End
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB 2: TEAMS & CREDENTIALS
           ══════════════════════════════════════════════════════ */}
        {activeTab === "TEAMS" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-tx-primary tracking-tight">Teams & Credentials</h1>
                <p className="text-tx-secondary text-sm mt-0.5">
                  Manage participant credentials, set or regenerate live PINs, and track connection status.
                </p>
              </div>
              <button
                onClick={handleAddTeam}
                disabled={loading}
                className="bg-accent hover:bg-accent/90 text-tx-inverse px-4 py-2 rounded-lg font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-[0.98] flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" /> Add Team
              </button>
            </div>

            <div className="glass-panel overflow-hidden border border-bd-subtle">
              {/* Search Bar */}
              <div className="p-4 border-b border-bd-subtle bg-bg-base">
                <div className="relative max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tx-muted" />
                  <input
                    type="text"
                    placeholder="Search teams by ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-bg-raised border border-bd-subtle rounded-lg pl-10 pr-4 py-2 text-sm text-tx-primary font-mono outline-none focus:border-accent transition-colors placeholder:text-tx-muted"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs font-mono font-bold text-tx-secondary bg-bg-base uppercase tracking-wider border-b border-bd-subtle">
                    <tr>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Team ID</th>
                      <th className="px-5 py-3.5">Live PIN</th>
                      <th className="px-5 py-3.5">Starting Cash</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bd-hairline">
                    {filteredTeams.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-tx-muted font-mono text-sm">
                          No teams matching &quot;{searchQuery}&quot;
                        </td>
                      </tr>
                    ) : (
                      filteredTeams.map((t) => (
                        <tr key={t.id} className="hover:bg-bg-overlay/40 transition-colors">
                          <td className="px-5 py-4 whitespace-nowrap">
                            {t.is_online ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gain-dim border border-gain-border text-xs font-mono font-bold text-gain">
                                <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" /> ONLINE
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-bg-raised border border-bd-subtle text-xs font-mono font-medium text-tx-muted">
                                <span className="w-1.5 h-1.5 rounded-full bg-tx-muted" /> OFFLINE
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 font-mono font-bold text-tx-primary whitespace-nowrap text-base">
                            {t.id}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="font-mono font-bold text-accent bg-accent-dim px-3 py-1.5 rounded-md border border-accent-border text-sm">
                              {t.pin}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-mono font-bold text-tx-primary whitespace-nowrap text-sm">
                            ₹{(t.cash_paise / 100).toLocaleString('en-IN')}
                          </td>
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {/* Set PIN by Admin */}
                              <button
                                onClick={() => onSetTeamPin(t.id)}
                                disabled={loading}
                                className="text-xs font-mono font-bold text-accent hover:text-tx-inverse bg-accent-dim hover:bg-accent border border-accent-border px-3 py-1.5 rounded-md transition-all active:scale-[0.98] flex items-center gap-1"
                                title="Admin sets a custom PIN for this team"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                                <span>Set PIN</span>
                              </button>

                              {/* Reset PIN */}
                              <button
                                onClick={() => handleResetPin(t.id)}
                                disabled={loading}
                                className="text-xs font-mono font-bold text-warn hover:bg-warn-dim border border-warn-border px-3 py-1.5 rounded-md transition-colors"
                                title="Generate a random new PIN"
                              >
                                Reset PIN
                              </button>

                              {/* Remove Team */}
                              <button
                                onClick={() => handleRemoveTeam(t.id)}
                                disabled={loading}
                                className="text-xs font-mono font-bold text-loss hover:bg-loss-dim border border-loss-border px-3 py-1.5 rounded-md transition-colors"
                                title="Permanently delete team"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB 3: ASSET INVENTORY
           ══════════════════════════════════════════════════════ */}
        {activeTab === "ASSETS" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-tx-primary tracking-tight">Asset Inventory</h1>
                <p className="text-tx-secondary text-sm mt-0.5">
                  {sysState.current_g >= 7
                    ? "Round 2 Active: 11 Tradable Instruments"
                    : "Round 1 Active: 7 Tradable Instruments"}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-accent bg-accent-dim px-3.5 py-2 rounded-lg border border-accent-border self-start sm:self-auto">
                {activeAssets.length} Active Instruments
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeAssets.map((asset) => {
                const archetypeColor =
                  asset.archetype === "Trending" ? "bg-gain-dim border-gain-border text-gain" :
                    asset.archetype === "Mean-Reverting" ? "bg-accent-dim border-accent-border text-accent" :
                      asset.archetype === "Safe Haven" ? "bg-warn-dim border-warn-border text-warn" :
                        "bg-loss-dim border-loss-border text-loss";

                return (
                  <div
                    key={asset.ticker}
                    className="glass-panel p-5 border border-bd-subtle bg-bg-base hover:border-bd-strong transition-all flex flex-col justify-between gap-4 rounded-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-lg bg-accent-dim border border-accent-border flex items-center justify-center font-mono font-bold text-accent text-sm">
                          {asset.ticker.slice(0, 4)}
                        </div>
                        <div>
                          <div className="font-mono font-bold text-tx-primary text-lg tracking-tight">
                            {asset.ticker}
                          </div>
                          <div className="text-sm text-tx-secondary font-medium">
                            {asset.name}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3.5 border-t border-bd-hairline text-xs font-mono">
                      <span className="text-tx-secondary font-medium">{asset.sector}</span>
                      <span className={clsx("text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border", archetypeColor)}>
                        {asset.archetype}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB 4: NEWS & SIGNALS (OVERHAULED READABILITY)
           ══════════════════════════════════════════════════════ */}
        {activeTab === "NEWS" && (() => {
          const allScriptedNews: ScriptedNewsItem[] = (sysState?.scripted_news && sysState.scripted_news.length > 0)
            ? sysState.scripted_news
            : SCRIPTED_NEWS_DATABASE;

          const filteredUpcomingNews = allScriptedNews.filter(item => {
            if (newsSessionFilter !== "ALL" && item.g !== newsSessionFilter) return false;
            if (newsSearch.trim()) {
              const q = newsSearch.toLowerCase();
              return (
                item.ticker.toLowerCase().includes(q) ||
                item.text.toLowerCase().includes(q) ||
                item.source.toLowerCase().includes(q)
              );
            }
            return true;
          });

          const sessionCounts = allScriptedNews.reduce((acc, curr) => {
            acc[curr.g] = (acc[curr.g] || 0) + 1;
            return acc;
          }, {} as Record<number, number>);

          return (
            <div className="space-y-6 relative">
              <div className="glass-panel overflow-hidden border border-bd-subtle">

                {/* Top Bar: Tabs & Actions */}
                <div className="p-4 sm:p-5 border-b border-bd-subtle flex flex-col lg:flex-row items-start lg:items-center justify-between bg-bg-base gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex bg-bg-raised p-1 rounded-lg border border-bd-subtle">
                      <button
                        onClick={() => setNewsTabView("UPCOMING")}
                        className={clsx(
                          "px-4 py-2 rounded-md font-mono text-xs uppercase tracking-wider font-bold transition-all",
                          newsTabView === "UPCOMING"
                            ? "bg-accent text-tx-inverse shadow-sm"
                            : "text-tx-secondary hover:text-tx-primary"
                        )}
                      >
                        Upcoming Scripted ({allScriptedNews.length})
                      </button>
                      <button
                        onClick={() => setNewsTabView("HISTORY")}
                        className={clsx(
                          "px-4 py-2 rounded-md font-mono text-xs uppercase tracking-wider font-bold transition-all",
                          newsTabView === "HISTORY"
                            ? "bg-accent text-tx-inverse shadow-sm"
                            : "text-tx-secondary hover:text-tx-primary"
                        )}
                      >
                        Dispatched ({sysState.news_history?.length || 0})
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {newsTabView === "UPCOMING" && (
                      <div className="relative flex-1 sm:w-72">
                        <Search className="w-4 h-4 text-tx-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={newsSearch}
                          onChange={(e) => setNewsSearch(e.target.value)}
                          placeholder="Search headlines, tickers, sources..."
                          className="w-full bg-bg-raised border border-bd-subtle rounded-lg pl-10 pr-3.5 py-2 font-sans text-sm text-tx-primary placeholder:text-tx-muted focus:outline-none focus:border-accent"
                        />
                      </div>
                    )}
                    <button
                      onClick={() => setShowNewsModal(true)}
                      className="bg-accent hover:bg-accent/90 text-tx-inverse px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]"
                    >
                      <Zap className="w-4 h-4" /> Draft News
                    </button>
                  </div>
                </div>

                {/* Session Filter Bar (for Upcoming) */}
                {newsTabView === "UPCOMING" && (
                  <div className="px-4 sm:px-5 py-3 bg-bg-base/70 border-b border-bd-subtle flex items-center gap-2 overflow-x-auto scrollbar-none">
                    <span className="text-xs font-mono font-bold text-tx-secondary uppercase tracking-wider mr-1 shrink-0">Filter:</span>
                    <button
                      onClick={() => setNewsSessionFilter("ALL")}
                      className={clsx(
                        "px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wider font-bold shrink-0 transition-colors border",
                        newsSessionFilter === "ALL"
                          ? "bg-accent text-tx-inverse border-accent"
                          : "bg-bg-raised text-tx-secondary border-bd-subtle hover:text-tx-primary"
                      )}
                    >
                      All ({allScriptedNews.length})
                    </button>

                    <div className="h-5 w-px bg-bd-subtle mx-1 shrink-0" />

                    {/* Round 1 (1-6) */}
                    <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider shrink-0">R1:</span>
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <button
                        key={g}
                        onClick={() => setNewsSessionFilter(g)}
                        className={clsx(
                          "px-3 py-1.5 rounded-md font-mono text-xs font-bold shrink-0 transition-colors border flex items-center gap-1.5",
                          newsSessionFilter === g
                            ? "bg-accent-dim text-accent border-accent-border font-bold"
                            : g === sysState.current_g
                              ? "bg-gain-dim text-gain border-gain-border font-bold"
                              : "bg-bg-raised text-tx-secondary border-bd-subtle hover:text-tx-primary"
                        )}
                      >
                        S{g}
                        {g === sysState.current_g && <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />}
                        <span className="text-[11px] opacity-75">({sessionCounts[g] || 0})</span>
                      </button>
                    ))}

                    <div className="h-5 w-px bg-bd-subtle mx-1 shrink-0" />

                    {/* Round 2 (7-11) */}
                    <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider shrink-0">R2:</span>
                    {[7, 8, 9, 10, 11].map(g => (
                      <button
                        key={g}
                        onClick={() => setNewsSessionFilter(g)}
                        className={clsx(
                          "px-3 py-1.5 rounded-md font-mono text-xs font-bold shrink-0 transition-colors border flex items-center gap-1.5",
                          newsSessionFilter === g
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold"
                            : g === sysState.current_g
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/30 font-bold"
                              : "bg-bg-raised text-tx-secondary border-bd-subtle hover:text-tx-primary"
                        )}
                      >
                        S{g - 6}
                        {g === sysState.current_g && <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />}
                        <span className="text-[11px] opacity-75">({sessionCounts[g] || 0})</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* News Table with Highly Readable Typography */}
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-xs font-mono font-bold text-tx-secondary bg-bg-base uppercase tracking-wider border-b border-bd-subtle">
                      <tr>
                        <th className="px-5 py-3.5 whitespace-nowrap">Session & Timing</th>
                        <th className="px-4 py-3.5 whitespace-nowrap">Source</th>
                        <th className="px-4 py-3.5 whitespace-nowrap">Target</th>
                        <th className="px-6 py-3.5">Headline Content</th>
                        <th className="px-4 py-3.5 text-center whitespace-nowrap">Impact</th>
                        <th className="px-4 py-3.5 text-center whitespace-nowrap">Status</th>
                        <th className="px-5 py-3.5 text-right whitespace-nowrap">Dispatch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-bd-hairline">
                      {newsTabView === "UPCOMING" ? (
                        filteredUpcomingNews.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-tx-muted font-sans text-sm">
                              No scripted news items match the active filters.
                            </td>
                          </tr>
                        ) : (
                          filteredUpcomingNews.map((news, idx) => {
                            const isFired = sysState.current_g > news.g || (sysState.current_g === news.g && sysState.n >= news.public_tick);
                            const isCurrentSession = sysState.current_g === news.g;
                            const isImminent = isCurrentSession && sysState.n < news.public_tick;

                            const impactPercent = (news.impact * 100).toFixed(1);
                            const isPositive = news.impact > 0;
                            const isNegative = news.impact < 0;

                            const sourceDetails: Record<string, { label: string; color: string }> = {
                              "IN": { label: "IN • Insider Leak", color: "bg-purple-500/15 text-purple-300 border-purple-500/40" },
                              "AN": { label: "AN • Analyst Wire", color: "bg-accent-dim text-accent border-accent-border" },
                              "NP": { label: "NP • Newspaper", color: "bg-gain-dim text-gain border-gain-border" },
                              "FF": { label: "FF • Fast Feed", color: "bg-warn-dim text-warn border-warn-border" }
                            };
                            const badge = sourceDetails[news.source] || { label: news.source, color: "bg-bg-raised text-tx-secondary border-bd-subtle" };

                            return (
                              <tr key={idx} className={clsx("hover:bg-bg-overlay/40 transition-colors", isCurrentSession && "bg-accent-dim/10")}>

                                {/* Session & Timing */}
                                <td className="px-5 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <span className={clsx(
                                      "text-xs font-mono font-bold px-2 py-0.5 rounded border uppercase",
                                      news.g <= 6
                                        ? "bg-accent-dim text-accent border-accent-border"
                                        : "bg-purple-500/15 text-purple-300 border-purple-500/30"
                                    )}>
                                      {news.g <= 6 ? `R1 • S${news.g}` : `R2 • S${news.g - 6}`}
                                    </span>
                                    {isCurrentSession && (
                                      <span className="text-[10px] font-mono font-bold text-gain bg-gain-dim px-2 py-0.5 rounded border border-gain-border uppercase">
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs font-mono text-tx-secondary mt-1">
                                    Tick <span className="font-bold text-tx-primary">T+{news.public_tick}</span>
                                    <span className="text-tx-muted ml-1.5">({Math.floor(news.public_tick * 1.5)}s)</span>
                                  </div>
                                </td>

                                {/* Source */}
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className={clsx("text-xs font-mono font-bold px-2.5 py-1 rounded-md border", badge.color)}>
                                    {badge.label}
                                  </span>
                                </td>

                                {/* Target Asset */}
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="font-mono font-bold text-tx-primary text-base">{news.ticker}</div>
                                  <div className="text-xs text-tx-muted truncate max-w-[130px] font-sans">
                                    {ASSET_META[news.ticker]?.name || "Broad Market"}
                                  </div>
                                </td>

                                {/* Headline (High Readability) */}
                                <td className="px-6 py-4 max-w-2xl">
                                  <p className="text-sm sm:text-base text-tx-primary font-normal leading-relaxed">
                                    {news.text}
                                  </p>
                                </td>

                                {/* Impact */}
                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                  {isPositive ? (
                                    <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-gain-dim border border-gain-border text-gain">
                                      <ArrowUpRight className="w-4 h-4" /> +{impactPercent}%
                                    </span>
                                  ) : isNegative ? (
                                    <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-loss-dim border border-loss-border text-loss">
                                      <ArrowDownRight className="w-4 h-4" /> {impactPercent}%
                                    </span>
                                  ) : (
                                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-bg-raised text-tx-muted border border-bd-subtle">
                                      0.0%
                                    </span>
                                  )}
                                </td>

                                {/* Authenticity */}
                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                  {news.is_fake ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-warn-dim border border-warn-border text-warn">
                                      <AlertCircle className="w-3.5 h-3.5" /> Rumor
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-gain-dim border border-gain-border text-gain">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                                    </span>
                                  )}
                                </td>

                                {/* Dispatch Control */}
                                <td className="px-5 py-4 whitespace-nowrap text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {isFired ? (
                                      <span className="text-xs font-mono font-bold text-tx-muted bg-bg-raised border border-bd-subtle px-2.5 py-1 rounded-md">
                                        Dispatched
                                      </span>
                                    ) : isImminent ? (
                                      <span className="text-xs font-mono font-bold text-warn bg-warn-dim border border-warn-border px-2.5 py-1 rounded-md">
                                        In {news.public_tick - sysState.n}t
                                      </span>
                                    ) : null}

                                    <button
                                      onClick={() => fireSpecificNews(news)}
                                      className="text-xs font-mono font-bold text-accent hover:text-tx-inverse bg-accent-dim hover:bg-accent border border-accent-border px-3 py-1.5 rounded-md transition-all active:scale-[0.98]"
                                      title="Dispatch news immediately"
                                    >
                                      Trigger
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )
                      ) : (
                        !sysState.news_history || sysState.news_history.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-tx-muted font-sans text-sm">
                              No live or custom news has been dispatched in this simulation session yet.
                            </td>
                          </tr>
                        ) : (
                          sysState.news_history.map((news: any, idx: number) => (
                            <tr key={idx} className="hover:bg-bg-overlay/40 transition-colors">
                              <td className="px-5 py-4 font-mono text-sm text-tx-muted">
                                #{idx + 1}
                              </td>
                              <td className="px-4 py-4">
                                <span className="bg-accent-dim text-accent border border-accent-border text-xs font-mono font-bold px-2.5 py-1 rounded-md">
                                  {news.source || "IN"}
                                </span>
                              </td>
                              <td className="px-4 py-4 font-mono font-bold text-tx-primary text-base">
                                {news.ticker || "GLOBAL"}
                              </td>
                              <td colSpan={4} className="px-6 py-4 text-tx-primary text-sm sm:text-base font-normal leading-relaxed">
                                {news.text || "Market breaking event."}
                              </td>
                            </tr>
                          ))
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* News Drafting Modal */}
              {showNewsModal && (
                <div className="fixed inset-0 bg-bg-void/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-bg-raised border border-bd-subtle p-6 rounded-xl w-full max-w-lg shadow-card relative">
                    <div className="flex justify-between items-center mb-5 pb-4 border-b border-bd-subtle">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-accent" />
                        <h3 className="text-base font-bold text-tx-primary">Broadcast Custom Market News</h3>
                      </div>
                      <button
                        onClick={() => setShowNewsModal(false)}
                        className="text-tx-muted hover:text-tx-primary p-1 rounded transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-mono font-bold text-tx-secondary uppercase mb-1.5">
                            Target Ticker
                          </label>
                          <select
                            value={newsTicker}
                            onChange={e => setNewsTicker(e.target.value)}
                            className="w-full bg-bg-base border border-bd-subtle rounded-lg px-3.5 py-2.5 text-tx-primary font-mono text-sm font-bold outline-none focus:border-accent"
                          >
                            <option value="GLOBAL">GLOBAL (Market-Wide)</option>
                            <option value="RELI-X">RELI-X (Reliant Energy)</option>
                            <option value="INFY-Z">INFY-Z (Infinity Systems)</option>
                            <option value="HDFC-W">HDFC-W (Horizon Bank)</option>
                            <option value="BZR-V">BZR-V (Bazaar Ventures)</option>
                            <option value="PULSE">PULSE (Pulsechain)</option>
                            <option value="GOLDCORE">GOLDCORE (Goldcore Reserve)</option>
                            <option value="TATA-Y">TATA-Y (Tyrell Autoworks)</option>
                            <option value="NIMBUS">NIMBUS (Cloud Datacenters)</option>
                            <option value="STAPLE">STAPLE (Staple Agro)</option>
                            <option value="VOLTAGE">VOLTAGE (Power Matrix)</option>
                            <option value="CRANE">CRANE (Maritime Logistics)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-mono font-bold text-tx-secondary uppercase mb-1.5">
                            Intel Feed Source
                          </label>
                          <select
                            value={newsSource}
                            onChange={e => setNewsSource(e.target.value)}
                            className="w-full bg-bg-base border border-bd-subtle rounded-lg px-3.5 py-2.5 text-tx-primary font-mono text-sm font-bold outline-none focus:border-accent"
                          >
                            <option value="IN">IN (Insider Leak - L2+)</option>
                            <option value="AN">AN (Analyst Wire)</option>
                            <option value="NP">NP (Newspaper)</option>
                            <option value="FF">FF (Fast Feed / Social)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-tx-secondary uppercase mb-1.5">
                          Breaking Headline Text
                        </label>
                        <textarea
                          value={newsText}
                          onChange={e => setNewsText(e.target.value)}
                          placeholder="Type custom breaking market headline..."
                          className="w-full bg-bg-base border border-bd-subtle rounded-lg p-3.5 text-tx-primary text-sm sm:text-base outline-none min-h-[120px] placeholder:text-tx-muted focus:border-accent font-sans leading-relaxed"
                        />
                      </div>

                      <button
                        onClick={fireNews}
                        disabled={loading || !newsText.trim()}
                        className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-tx-inverse font-mono font-bold text-xs uppercase tracking-wider py-3 rounded-lg transition-all shadow-md active:scale-[0.98]"
                      >
                        Dispatch Alert Now To Market
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ══════════════════════════════════════════════════════
            TAB 5: DUAL LEADERBOARD (ROUND & CUMULATIVE MULTI-ROUND)
           ══════════════════════════════════════════════════════ */}
        {activeTab === "LEADERBOARD" && (
          <div className="space-y-6">
            
            {/* Top Header & Telemetry */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-tx-primary tracking-tight">
                  EIC X Bazaar Tournament Leaderboards
                </h1>
                <p className="text-tx-secondary text-sm mt-0.5">
                  Round-specific active rankings and overall multi-round tournament standings.
                </p>
              </div>

              {/* View Selector & Telemetry Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* 10s auto-refresh indicator (for active round) */}
                {leaderboardView === "ROUND" && (
                  <div className="px-3.5 py-1.5 rounded-lg border border-bd-subtle bg-bg-base flex items-center gap-2 text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-gain animate-pulse" />
                    <span className="text-tx-secondary">Sync in:</span>
                    <span className="font-bold text-accent">{lbSecondsRemaining}s</span>
                    {lastLbSync && (
                      <>
                        <span className="text-tx-muted">•</span>
                        <span className="text-tx-muted">Synced: {lastLbSync}</span>
                      </>
                    )}
                  </div>
                )}

                <button
                  onClick={() => {
                    if (leaderboardView === "ROUND") {
                      fetchLeaderboard();
                    } else {
                      fetchCumulativeLeaderboard(true);
                    }
                  }}
                  className="p-2 rounded-lg border border-bd-subtle bg-bg-raised hover:bg-bg-overlay text-tx-secondary hover:text-tx-primary transition-colors flex items-center gap-1.5 text-xs font-mono font-bold"
                  title="Force refresh standings now"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* ── Tab Switcher: Primary Round vs Cumulative ── */}
            <div className="flex items-center gap-2 bg-bg-base p-1 rounded-xl border border-bd-subtle w-fit">
              <button
                onClick={() => setLeaderboardView("ROUND")}
                className={clsx(
                  "px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
                  leaderboardView === "ROUND"
                    ? "bg-accent text-tx-inverse shadow-sm"
                    : "text-tx-secondary hover:text-tx-primary hover:bg-bg-raised"
                )}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Round Leaderboard (Active Round)</span>
                <span className={clsx(
                  "text-[10px] px-1.5 py-0.2 rounded font-mono",
                  leaderboardView === "ROUND" ? "bg-black/20 text-tx-inverse" : "bg-bg-raised text-tx-muted"
                )}>
                  {leaderboard?.round === 2 ? "R2" : "R1"}
                </span>
              </button>

              <button
                onClick={() => {
                  setLeaderboardView("CUMULATIVE");
                  fetchCumulativeLeaderboard();
                }}
                className={clsx(
                  "px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
                  leaderboardView === "CUMULATIVE"
                    ? "bg-accent text-tx-inverse shadow-sm"
                    : "text-tx-secondary hover:text-tx-primary hover:bg-bg-raised"
                )}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Overall Cumulative Leaderboard</span>
                {cumulativeLeaderboard?.is_final ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-gain-dim text-gain font-mono font-bold border border-gain-border">
                    Finalized
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-warn-dim text-warn font-mono font-bold border border-warn-border">
                    Locks Post-R2
                  </span>
                )}
              </button>
            </div>

            {/* ── View 1: Active Round Leaderboard ── */}
            {leaderboardView === "ROUND" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="text-xs font-mono font-bold text-tx-secondary uppercase tracking-wider">
                    {leaderboard?.round_name || "Active Round"} · Live MTM Standings
                  </div>
                  <div className="text-xs font-mono text-tx-muted">
                    Auto-updates every 10 seconds
                  </div>
                </div>

                <div className="glass-panel overflow-hidden border border-bd-subtle">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-xs font-mono font-bold text-tx-secondary bg-bg-base uppercase tracking-wider border-b border-bd-subtle">
                        <tr>
                          <th className="px-6 py-4 w-28">Rank</th>
                          <th className="px-6 py-4">Participant Team</th>
                          <th className="px-6 py-4 text-center">Round Return %</th>
                          <th className="px-6 py-4 text-center">Status</th>
                          <th className="px-6 py-4 text-right">Round Equity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-bd-hairline">
                        {!leaderboard?.rows || leaderboard.rows.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-12 text-tx-muted font-sans text-sm">
                              No leaderboard standings available for this round yet.
                            </td>
                          </tr>
                        ) : (
                          leaderboard.rows.map((row: any) => {
                            const rankColor =
                              row.rank === 1 ? "text-accent font-bold" :
                                row.rank === 2 ? "text-tx-primary font-bold" :
                                  row.rank === 3 ? "text-warn font-bold" :
                                    "text-tx-muted";

                            const isEliminated = row.status === "ELIM" || row.eliminated;

                            return (
                              <tr key={row.team_id} className="hover:bg-bg-overlay/40 transition-colors">
                                <td className="px-6 py-4 font-mono font-bold whitespace-nowrap">
                                  <span className={clsx("text-base", rankColor)}>
                                    #{row.rank}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-mono font-bold text-tx-primary whitespace-nowrap text-base">
                                  <div className="flex items-center gap-2">
                                    <span>{row.team_id}</span>
                                    {row.rank === 1 && (
                                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-accent-dim text-accent border border-accent-border uppercase">
                                        Round Leader
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-center whitespace-nowrap">
                                  {row.return_pct !== undefined ? (
                                    <span className={clsx("text-sm font-bold", row.return_pct >= 0 ? "text-gain" : "text-loss")}>
                                      {row.return_pct >= 0 ? `+${row.return_pct.toFixed(2)}%` : `${row.return_pct.toFixed(2)}%`}
                                    </span>
                                  ) : (
                                    <span className="text-tx-muted text-sm">0.00%</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                  {isEliminated ? (
                                    <span className="text-xs font-mono font-bold text-loss bg-loss-dim px-2.5 py-1 rounded-md border border-loss-border">
                                      LIQUIDATED
                                    </span>
                                  ) : (
                                    <span className="text-xs font-mono font-bold text-gain bg-gain-dim px-2.5 py-1 rounded-md border border-gain-border">
                                      ACTIVE
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 font-mono font-bold text-right text-gain text-base whitespace-nowrap">
                                  ₹{(row.equity_paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── View 2: Cumulative Multi-Round Leaderboard ── */}
            {leaderboardView === "CUMULATIVE" && (
              <div className="space-y-4">
                
                {/* Status banner when both rounds have not finished */}
                {!cumulativeLeaderboard?.is_final ? (
                  <div className="glass-panel p-6 border border-bd-subtle bg-bg-raised/70 rounded-xl space-y-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-warn-dim border border-warn-border flex items-center justify-center text-warn shrink-0 mt-0.5">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-tx-primary tracking-tight">
                          Cumulative Tournament Leaderboard Locked
                        </h3>
                        <p className="text-sm text-tx-secondary leading-relaxed max-w-2xl">
                          The cumulative multi-round leaderboard combines portfolio performances from Round 1 (Retail Momentum) and Round 2 (Institutional Desk).
                          As designed, cumulative standings only finalize and lock after Session 11 completes.
                        </p>
                      </div>
                    </div>

                    {/* Progress Trackers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="bg-bg-base border border-bd-subtle p-3.5 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-xs font-mono font-bold text-tx-primary">Round 1 (Sessions 1 – 6)</div>
                          <div className="text-[11px] text-tx-muted mt-0.5">Retail trading & liquidation rules</div>
                        </div>
                        <span className={clsx(
                          "text-xs font-mono font-bold px-2.5 py-1 rounded border",
                          cumulativeLeaderboard?.round_1_complete
                            ? "bg-gain-dim text-gain border-gain-border"
                            : "bg-warn-dim text-warn border-warn-border"
                        )}>
                          {cumulativeLeaderboard?.round_1_complete ? "Complete" : "In Progress"}
                        </span>
                      </div>

                      <div className="bg-bg-base border border-bd-subtle p-3.5 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-xs font-mono font-bold text-tx-primary">Round 2 (Sessions 7 – 11)</div>
                          <div className="text-[11px] text-tx-muted mt-0.5">Institutional execution & Stat Shop</div>
                        </div>
                        <span className={clsx(
                          "text-xs font-mono font-bold px-2.5 py-1 rounded border",
                          cumulativeLeaderboard?.round_2_complete
                            ? "bg-gain-dim text-gain border-gain-border"
                            : "bg-bg-raised text-tx-muted border-bd-subtle"
                        )}>
                          {cumulativeLeaderboard?.round_2_complete ? "Finished" : "Active / Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => fetchCumulativeLeaderboard(true)}
                        className="px-3.5 py-2 bg-bg-base hover:bg-bg-overlay border border-bd-subtle hover:border-accent-border rounded-md text-xs font-mono font-bold text-tx-secondary hover:text-tx-primary transition-all cursor-pointer"
                      >
                        Preview Live Multi-Round Estimates
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-1">
                    <div className="text-xs font-mono font-bold text-gain flex items-center gap-2 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-gain animate-pulse" />
                      Final Tournament Standings Locked (Round 1 + Round 2 Cumulative)
                    </div>
                  </div>
                )}

                {/* Cumulative Table (Renders preview or final standings) */}
                {cumulativeLeaderboard?.rows && cumulativeLeaderboard.rows.length > 0 && (
                  <div className="glass-panel overflow-hidden border border-bd-subtle">
                    <div className="w-full overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="text-xs font-mono font-bold text-tx-secondary bg-bg-base uppercase tracking-wider border-b border-bd-subtle">
                          <tr>
                            <th className="px-6 py-4 w-28">Overall Rank</th>
                            <th className="px-6 py-4">Participant Team</th>
                            <th className="px-6 py-4 text-center">R1 Return %</th>
                            <th className="px-6 py-4 text-center">R2 Return %</th>
                            <th className="px-6 py-4 text-center">Cumulative Return %</th>
                            <th className="px-6 py-4 text-right">Net Tournament P&L</th>
                            <th className="px-6 py-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-bd-hairline">
                          {cumulativeLeaderboard.rows.map((row: any) => {
                            const isFirst = row.rank === 1;
                            const isSecond = row.rank === 2;
                            const isThird = row.rank === 3;
                            const rankColor = isFirst ? "text-accent font-bold" : isSecond ? "text-tx-primary font-bold" : isThird ? "text-warn font-bold" : "text-tx-muted";
                            const isElim = row.status === "ELIM";

                            return (
                              <tr key={row.team_id} className={clsx("hover:bg-bg-overlay/40 transition-colors", isFirst && "bg-accent-dim/10")}>
                                <td className="px-6 py-4 font-mono font-bold whitespace-nowrap">
                                  <span className={clsx("text-base", rankColor)}>
                                    #{row.rank}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-mono font-bold text-tx-primary whitespace-nowrap text-base">
                                  <div className="flex items-center gap-2">
                                    <span>{row.team_id}</span>
                                    {isFirst && (
                                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-accent-dim text-accent border border-accent-border uppercase shadow-xs">
                                        Tournament Champion
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-center whitespace-nowrap text-sm">
                                  <span className={row.r1_return_pct >= 0 ? "text-gain" : "text-loss"}>
                                    {row.r1_return_pct >= 0 ? `+${row.r1_return_pct.toFixed(2)}%` : `${row.r1_return_pct.toFixed(2)}%`}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-center whitespace-nowrap text-sm">
                                  <span className={row.r2_return_pct >= 0 ? "text-gain" : "text-loss"}>
                                    {row.r2_return_pct >= 0 ? `+${row.r2_return_pct.toFixed(2)}%` : `${row.r2_return_pct.toFixed(2)}%`}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-center whitespace-nowrap">
                                  <span className={clsx("text-sm sm:text-base font-bold", row.cumulative_return_pct >= 0 ? "text-gain font-bold" : "text-loss font-bold")}>
                                    {row.cumulative_return_pct >= 0 ? `+${row.cumulative_return_pct.toFixed(2)}%` : `${row.cumulative_return_pct.toFixed(2)}%`}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-mono font-bold text-right whitespace-nowrap text-sm sm:text-base">
                                  <span className={row.cumulative_pnl_paise >= 0 ? "text-gain" : "text-loss"}>
                                    {row.cumulative_pnl_paise >= 0 ? "+" : ""}
                                    ₹{(row.cumulative_pnl_paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                  {isElim ? (
                                    <span className="text-xs font-mono font-bold text-loss bg-loss-dim px-2.5 py-1 rounded-md border border-loss-border">
                                      LIQUIDATED
                                    </span>
                                  ) : (
                                    <span className="text-xs font-mono font-bold text-gain bg-gain-dim px-2.5 py-1 rounded-md border border-gain-border">
                                      ACTIVE
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB 6: DANGER ZONE
           ══════════════════════════════════════════════════════ */}
        {activeTab === "DANGER" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-tx-primary tracking-tight">Danger Zone & Override Controls</h1>
              <p className="text-tx-secondary text-sm mt-0.5">
                Emergency market halts, state jump overrides, and nuclear reset controls.
              </p>
            </div>

            {/* Environment Jump & Freeze */}
            <div className="glass-panel p-6 border border-bd-subtle space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-warn" />
                  <h2 className="text-base font-bold text-tx-primary">Session Jump Override</h2>
                </div>
                <p className="text-xs text-tx-secondary mt-1">Force snap the simulation state directly to any target session.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-bg-base p-4 rounded-xl border border-bd-subtle">
                <span className="text-xs font-mono font-bold text-tx-secondary uppercase shrink-0">Target:</span>
                <select
                  value={jumpTarget}
                  onChange={(e) => setJumpTarget(Number(e.target.value))}
                  className="flex-1 bg-bg-raised border border-bd-subtle rounded-lg px-3.5 py-2.5 text-tx-primary font-mono text-xs font-bold outline-none focus:border-accent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(g => (
                    <option key={g} value={g}>
                      {g < 7 ? `Round 1 • Session ${g}` : `Round 2 • Session ${g - 6}`}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleAction("/admin/sessions/jump", { target_g: jumpTarget })}
                  disabled={loading}
                  className="bg-accent hover:bg-accent/90 text-tx-inverse px-5 py-2.5 rounded-lg font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-[0.98]"
                >
                  Execute Jump
                </button>
              </div>

              <div className="pt-4 border-t border-bd-hairline">
                <h3 className="text-xs font-mono font-bold text-tx-secondary uppercase tracking-wider mb-3">Emergency Engine Freeze</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleAction("/admin/freeze")}
                    className="bg-loss-dim hover:bg-loss hover:text-tx-inverse border border-loss-border text-loss py-4 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    <span>Freeze Engine (Halt All Trades)</span>
                  </button>
                  <button
                    onClick={() => handleAction("/admin/unfreeze")}
                    className="bg-gain-dim hover:bg-gain hover:text-tx-inverse border border-gain-border text-gain py-4 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                  >
                    <Power className="w-5 h-5" />
                    <span>Resume Engine (Unfreeze)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Nuclear Reset */}
            <div className="p-6 rounded-xl border border-loss-border/50 bg-loss-dim/20 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-loss" />
                <h2 className="text-base font-bold text-loss">Nuclear Reset Option</h2>
              </div>
              <p className="text-xs text-tx-secondary leading-relaxed">
                Permanently wipe all trades, reset participant ledger balances back to ₹1,00,00,000 (₹1 Crore), strip upgrades, and rewind the engine clock to Round 1 Session 1.
              </p>
              <button
                onClick={() => {
                  if (window.confirm("CRITICAL WARNING: This action is irreversible. Wipe all ledger entries and restart the event from scratch?")) {
                    handleAction("/admin/sessions/reset");
                  }
                }}
                className="bg-loss hover:bg-loss/90 text-tx-inverse w-full py-3 rounded-lg font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Hard Reset Entire Simulation
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import {
  Activity, Radio, Users, AlertTriangle, Search, LineChart, Trophy, LogOut,
  Sun, Moon, X, Zap, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle,
  Lock, ShieldAlert, Plus, Power, RotateCcw, KeyRound, RefreshCw, Terminal,
  Eye, EyeOff
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
  const [newsTicker, setNewsTicker] = useState("RLNT");
  const [newsText, setNewsText] = useState("");

  // News Headline Reveal State
  const [revealedHeadlines, setRevealedHeadlines] = useState<Record<string, boolean>>({});
  const toggleHeadline = (key: string) => {
    setRevealedHeadlines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ── Smooth countdown timer (placed at top to adhere to React Rules of Hooks) ──
  const [adminTimeLeft, setAdminTimeLeft] = useState(300);
  const sysSessionState = sysState?.states?.[sysState?.current_g] ?? "READY";

  // Snap to server time only when session state changes
  useEffect(() => {
    if (!sysState) return;
    const n = sysState.n || 0;
    const serverSecs = Math.max(0, Math.floor((200 - n) * 1.5));
    if (sysSessionState === "RUNNING") setAdminTimeLeft(serverSecs);
    else if (sysSessionState === "FINISHED" || sysSessionState === "LOCKED") setAdminTimeLeft(0);
    else setAdminTimeLeft(300);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sysSessionState]);

  // Smooth 1s countdown
  useEffect(() => {
    if (sysSessionState !== "RUNNING") return;
    const t = setInterval(() => setAdminTimeLeft((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [sysSessionState]);

  // Gentle drift correction only when >10s off
  useEffect(() => {
    if (!sysState || sysSessionState !== "RUNNING") return;
    const serverSecs = Math.max(0, Math.floor((200 - (sysState.n || 0)) * 1.5));
    setAdminTimeLeft((prev) => Math.abs(prev - serverSecs) > 10 ? serverSecs : prev);
  }, [sysState?.n, sysSessionState]);

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

    // Reduced to 3s to minimize layout thrashing from frequent re-renders
    const sysInterval = setInterval(fetchSysData, 3000);

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
            className="p-2 rounded-lg border border-bd-subtle bg-bg-base hover:bg-bg-raised text-tx-secondary hover:text-tx-primary transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-accent" />}
          </button>
        </div>

        <div className="w-full max-w-sm bg-bg-base border border-bd-subtle rounded-2xl p-7 shadow-xs relative">
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-bg-raised border border-bd-subtle flex items-center justify-center mb-3">
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>

            <h1 className="text-xl font-bold text-tx-primary tracking-tight">Admin Terminal</h1>
            <p className="text-xs text-tx-secondary mt-1">Authenticate session to enter controls</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-tx-secondary mb-1.5">
                Admin Passkey
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-bg-raised border border-bd-subtle rounded-lg px-3.5 py-2.5 text-tx-primary text-center text-sm outline-none focus:border-accent transition-colors placeholder:text-tx-muted"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Sign In to Terminal
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── 1. LOADING STATE ──────────────────────────────────────────
  if (!sysState || !leaderboard) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center bg-bg-void text-tx-secondary text-xs gap-3 font-sans">
        <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
        <span className="text-tx-muted">Connecting to simulation telemetry...</span>
      </div>
    );
  }

  // ── 2. DATA PROCESSING ─────────────────────────────────────────
  const round1Tickers = ["RLNT", "INFN", "HRZN", "BZR-V", "PULSE", "GOLDCORE", "TYRL"];
  const round2Tickers = ["RLNT", "INFN", "HRZN", "BZR-V", "PULSE", "GOLDCORE", "TYRL", "NIMBUS", "STAPLE", "VOLTAGE", "CRANE"];

  const activeTickers = (sysState?.current_g >= 7) ? round2Tickers : round1Tickers;
  const activeAssets = activeTickers.map(ticker => {
    const meta = ASSET_META[ticker] || { name: ticker, sector: "General", archetype: "High-Beta Volatile" as const };
    return {
      ticker,
      ...meta
    };
  });

  const tabs = [
    { id: "SESSION" as const, name: "Sessions", icon: Activity },
    { id: "TEAMS" as const, name: "Teams", badge: teams.length, icon: Users },
    { id: "ASSETS" as const, name: "Assets", badge: activeAssets.length, icon: LineChart },
    { id: "NEWS" as const, name: "News", icon: Radio },
    { id: "LEADERBOARD" as const, name: "Leaderboard", icon: Trophy },
    { id: "DANGER" as const, name: "Danger Zone", icon: AlertTriangle }
  ];

  const filteredTeams = teams.filter(t => t.id.toLowerCase().includes(searchQuery.toLowerCase()));

  let currentRoundStr = "Market Halted";
  if (sysState.current_g === 0) {
    currentRoundStr = "Demo Practice (7 Assets)";
  } else if (sysState.current_g < 7 && sysState.current_g > 0) {
    currentRoundStr = `Round 1 (Retail) · S${sysState.current_g}`;
  } else if (sysState.current_g >= 7 && sysState.current_g <= 11) {
    currentRoundStr = `Round 2 (Inst) · S${sysState.current_g - 6}`;
  }

  const formattedTime = `${Math.floor(adminTimeLeft / 60).toString().padStart(2, '0')}:${(adminTimeLeft % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-[100dvh] w-full bg-bg-void text-tx-primary overflow-x-hidden font-sans selection:bg-accent-dim selection:text-accent flex flex-col" style={{ contain: 'layout style' }}>

      {/* ── TOP HEADER (CLEAN GROWW-STYLE PRECISION BAR) ── */}
      <header className="sticky top-0 z-30 w-full bg-bg-base/95 backdrop-blur-md border-b border-bd-subtle">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Row 1: Brand & Terminal Controls */}
          <div className="h-15 flex items-center justify-between gap-4">

            {/* Left: Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Activity className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight"><span className="text-gain">MER</span><span className="text-loss">X</span></span>
                <span className="bg-bg-raised text-tx-secondary text-[11px] font-medium px-2 py-0.5 rounded-md border border-bd-subtle">
                  Admin
                </span>
              </div>
            </div>

            {/* Center (Desktop Telemetry Strip - Clean & Tabular) */}
            <div className="hidden lg:flex items-center gap-3 text-xs bg-bg-raised/60 border border-bd-subtle px-4 py-1.5 rounded-full">
              <div className="flex items-center gap-1.5">
                <span className={clsx("w-2 h-2 rounded-full", sysState.is_frozen ? "bg-loss" : "bg-gain")} />
                <span className={clsx("font-semibold", sysState.is_frozen ? "text-loss" : "text-gain")}>
                  {sysState.is_frozen ? "Frozen" : "Active"}
                </span>
              </div>
              <span className="text-bd-strong">·</span>
              <div className="flex items-center gap-1.5">
                <span className="text-tx-muted">Phase:</span>
                <span className="text-tx-primary font-medium">{currentRoundStr}</span>
              </div>
              <span className="text-bd-strong">·</span>
              <div className="flex items-center gap-1.5 tabular-nums">
                <span className="text-tx-muted">Clock:</span>
                <span className="text-emerald-400 font-semibold">T+{sysState.n || 0}</span>
                <span className="text-tx-secondary">({formattedTime})</span>
              </div>
            </div>

            {/* Right: Theme Toggle & Logout */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg border border-bd-subtle hover:bg-bg-raised text-tx-secondary hover:text-tx-primary transition-colors flex items-center justify-center"
                title="Toggle Theme"
              >
                {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-accent" />}
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-tx-secondary hover:text-loss hover:bg-loss-dim/40 border border-bd-subtle hover:border-loss-border/40 transition-colors"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>

          </div>

          {/* Row 2: Top Tabs Navigation */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none border-t border-bd-hairline py-1.5">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer",
                    isActive
                      ? "bg-bg-raised text-tx-primary border border-bd-subtle font-semibold shadow-xs"
                      : "text-tx-secondary hover:text-tx-primary hover:bg-bg-raised/40 border border-transparent"
                  )}
                >
                  <tab.icon className={clsx("w-3.5 h-3.5", isActive ? "text-accent" : "text-tx-muted")} />
                  <span>{tab.name}</span>
                  {tab.badge !== undefined && (
                    <span className={clsx(
                      "text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-medium",
                      isActive
                        ? "bg-accent/15 text-accent border border-accent/25"
                        : "bg-bg-raised text-tx-muted border border-bd-subtle"
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
              <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
                <div className="px-3.5 py-1.5 rounded-lg border border-bd-subtle bg-bg-raised flex items-center gap-2 tabular-nums">
                  <span className="text-tx-muted font-medium">Tick</span>
                  <span className="font-semibold text-tx-primary">T+{sysState.n || 0}</span>
                  <span className="text-tx-muted">·</span>
                  <span className="text-emerald-400 font-semibold">{formattedTime} remaining</span>
                </div>
              </div>
            </div>

            {/* Demo Round Block (Clean & Subtle) */}
            <div className="p-5 border border-bd-subtle bg-bg-base hover:border-bd-strong rounded-xl transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-bd-hairline">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-tx-primary tracking-tight">
                      Demo Practice Round
                    </h2>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-400">
                      Practice Environment
                    </span>
                  </div>
                  <p className="text-xs text-tx-secondary mt-1">
                    7 core assets with randomized order flow and simulated breaking news shocks.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {sysState.current_g === 0 ? (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-300">
                      Active: {sysState.states?.[0] || "READY"}
                    </span>
                  ) : (
                    <button
                      disabled={loading}
                      onClick={() => handleAction("/admin/demo/unlock")}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Unlock Demo Round
                    </button>
                  )}
                </div>
              </div>

              {/* Demo Telemetry */}
              <div className={clsx(
                "bg-bg-raised/70 border border-bd-subtle rounded-lg p-3.5 mt-3 flex flex-col sm:flex-row items-center justify-between gap-3 transition-opacity duration-200",
                sysState.current_g === 0 ? "opacity-100" : "opacity-0 h-0 p-0 m-0 border-0 overflow-hidden"
              )}>
                <div className="flex items-center gap-2.5 text-xs tabular-nums">
                  <span className="font-medium text-amber-400">Demo Telemetry</span>
                  <span className="text-tx-muted">·</span>
                  <span className="font-semibold text-tx-primary">Tick T+{sysState.n || 0} / 200</span>
                  <span className="text-tx-muted">·</span>
                  <span className="font-semibold text-emerald-400">{formattedTime} remaining</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    disabled={loading}
                    onClick={() => handleAction("/admin/sessions/0/start")}
                    className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-black border border-emerald-500/25 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Start Demo
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => handleAction("/admin/sessions/0/pause")}
                    className="bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black border border-amber-500/25 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Pause
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => handleAction("/admin/sessions/0/end")}
                    className="bg-bg-raised text-tx-secondary hover:text-tx-primary border border-bd-subtle text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    End
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => handleAction("/admin/demo/reset")}
                    className="bg-bg-raised text-tx-secondary hover:text-tx-primary border border-bd-subtle text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Reset Demo
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => handleAction("/admin/demo/exit")}
                    className="bg-loss-dim/40 text-loss hover:bg-loss hover:text-white border border-loss-border/30 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Exit Demo
                  </button>
                </div>
              </div>
            </div>

            {/* Round 1 Block (Clean Modern Groww Grid) */}
            <div className="p-5 sm:p-6 border border-bd-subtle bg-bg-base rounded-xl">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-bd-hairline">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <h2 className="text-base sm:text-lg font-bold text-tx-primary tracking-tight">Round 1: Retail Order Flow</h2>
                  </div>
                  <p className="text-xs text-tx-secondary mt-0.5">7 core assets · Retail participant market making</p>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-bg-raised border border-bd-subtle text-tx-secondary">
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
                        "p-4 rounded-xl border transition-all flex flex-col justify-between gap-3.5 bg-bg-base",
                        isCurrent
                          ? "border-emerald-500/40 bg-emerald-500/[0.02] shadow-xs"
                          : "border-bd-subtle hover:border-bd-strong"
                      )}
                    >
                      <div className="flex justify-between items-center" style={{ minHeight: '28px' }}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-tx-primary">Session {g}</span>
                          {isCurrent && (
                            <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              Active
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className={clsx(
                            "text-xs font-medium px-2 py-0.5 rounded-md border tabular-nums",
                            isRunning ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25 flex items-center gap-1.5" :
                              isPaused ? "text-amber-400 bg-amber-500/10 border-amber-500/25 flex items-center gap-1.5" :
                                state === "ENDED" ? "text-tx-muted bg-bg-raised border-bd-subtle" :
                                  state === "READY" ? "text-accent bg-accent-dim border-accent-border" :
                                    "text-tx-muted bg-bg-raised border-bd-subtle flex items-center gap-1"
                          )}>
                            {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                            {isPaused && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                            {state === "LOCKED" && <Lock className="w-3 h-3 text-tx-muted" />}
                            {isRunning ? `Running · ${formattedTime}` :
                              isPaused ? `Paused · ${formattedTime}` :
                                state === "ENDED" ? "Completed" :
                                  state === "READY" ? "Ready" :
                                    "Locked"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          disabled={loading}
                          onClick={() => handleAction(`/admin/sessions/${g}/start`)}
                          className={clsx(
                            "text-xs font-medium py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50",
                            isCurrent && (state === "READY" || isPaused)
                              ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold"
                              : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                          )}
                        >
                          Start
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => handleAction(`/admin/sessions/${g}/pause`)}
                          className={clsx(
                            "text-xs font-medium py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50",
                            isRunning
                              ? "bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold"
                              : "bg-bg-raised hover:bg-bg-overlay text-tx-secondary hover:text-tx-primary border border-bd-subtle"
                          )}
                        >
                          Pause
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => handleAction(`/admin/sessions/${g}/end`)}
                          className="bg-bg-raised text-tx-secondary hover:text-loss hover:bg-loss-dim/40 border border-bd-subtle hover:border-loss-border/40 text-xs font-medium py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
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
            <div className="p-5 sm:p-6 border border-bd-subtle bg-bg-base rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-bd-hairline">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <h2 className="text-base sm:text-lg font-bold text-tx-primary tracking-tight">Round 2: Institutional (Algorithmic Trading)</h2>
                  </div>
                  <p className="text-xs text-tx-secondary mt-0.5">11 assets · AI order flow injection · Liquidity shocks</p>
                </div>

                {!sysState.r2_unlocked ? (
                  <button
                    disabled={loading}
                    onClick={() => handleAction("/admin/round2/unlock")}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 self-start sm:self-auto"
                  >
                    Unlock Round 2
                  </button>
                ) : (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/25 self-start sm:self-auto">
                    Unlocked · Sessions 1 – 5
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
                        "p-4 rounded-xl border transition-all flex flex-col justify-between gap-3.5 bg-bg-base",
                        isCurrent
                          ? "border-purple-500/40 bg-purple-500/[0.02] shadow-xs"
                          : "border-bd-subtle hover:border-bd-strong"
                      )}
                    >
                      <div className="flex justify-between items-center" style={{ minHeight: '28px' }}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-tx-primary">Session {g - 6}</span>
                          <span className="text-xs text-tx-muted">(S{g})</span>
                          {isCurrent && (
                            <span className="text-[10px] font-medium text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-md border border-purple-500/30">
                              Active
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className={clsx(
                            "text-xs font-medium px-2 py-0.5 rounded-md border tabular-nums",
                            isRunning ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25 flex items-center gap-1.5" :
                              isPaused ? "text-amber-400 bg-amber-500/10 border-amber-500/25 flex items-center gap-1.5" :
                                state === "ENDED" ? "text-tx-muted bg-bg-raised border-bd-subtle" :
                                  state === "READY" ? "text-accent bg-accent-dim border-accent-border" :
                                    "text-tx-muted bg-bg-raised border-bd-subtle flex items-center gap-1"
                          )}>
                            {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                            {isPaused && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                            {state === "LOCKED" && <Lock className="w-3 h-3 text-tx-muted" />}
                            {isRunning ? `Running · ${formattedTime}` :
                              isPaused ? `Paused · ${formattedTime}` :
                                state === "ENDED" ? "Completed" :
                                  state === "READY" ? "Ready" :
                                    "Locked"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          disabled={loading}
                          onClick={() => handleAction(`/admin/sessions/${g}/start`)}
                          className={clsx(
                            "text-xs font-medium py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50",
                            isCurrent && (state === "READY" || isPaused)
                              ? "bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                              : "bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20"
                          )}
                        >
                          Start
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => handleAction(`/admin/sessions/${g}/pause`)}
                          className={clsx(
                            "text-xs font-medium py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50",
                            isRunning
                              ? "bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold"
                              : "bg-bg-raised hover:bg-bg-overlay text-tx-secondary hover:text-tx-primary border border-bd-subtle"
                          )}
                        >
                          Pause
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => handleAction(`/admin/sessions/${g}/end`)}
                          className="bg-bg-raised text-tx-secondary hover:text-loss hover:bg-loss-dim/40 border border-bd-subtle hover:border-loss-border/40 text-xs font-medium py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
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
                <h1 className="text-xl sm:text-2xl font-bold text-tx-primary tracking-tight">Teams &amp; Credentials</h1>
                <p className="text-tx-secondary text-sm mt-0.5">
                  Manage participant credentials, set or regenerate live PINs, and track connection status.
                </p>
              </div>
              <button
                onClick={handleAddTeam}
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-3.5 py-1.5 rounded-lg font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" /> Add Team
              </button>
            </div>

            <div className="overflow-hidden border border-bd-subtle bg-bg-base rounded-xl">
              {/* Search Bar */}
              <div className="p-3.5 border-b border-bd-subtle">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tx-muted" />
                  <input
                    type="text"
                    placeholder="Search teams by ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-bg-raised border border-bd-subtle rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-tx-primary font-sans outline-none focus:border-accent transition-colors placeholder:text-tx-muted"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs font-medium text-tx-secondary bg-bg-raised/40 uppercase tracking-wider border-b border-bd-subtle">
                    <tr>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Team ID</th>
                      <th className="px-5 py-3">Live PIN</th>
                      <th className="px-5 py-3">Starting Cash</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bd-hairline">
                    {filteredTeams.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-tx-muted font-sans text-xs">
                          No teams matching &quot;{searchQuery}&quot;
                        </td>
                      </tr>
                    ) : (
                      filteredTeams.map((t) => (
                        <tr key={t.id} className="hover:bg-bg-raised/40 transition-colors">
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            {t.is_online ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-bg-raised border border-bd-subtle text-xs font-medium text-tx-muted">
                                <span className="w-1.5 h-1.5 rounded-full bg-tx-muted" /> Offline
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 font-mono font-semibold text-tx-primary whitespace-nowrap text-sm">
                            {t.id}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className="font-mono font-semibold text-tx-primary bg-bg-raised px-2.5 py-1 rounded-md border border-bd-subtle text-xs tabular-nums">
                              {t.pin}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-tx-primary whitespace-nowrap text-sm tabular-nums">
                            ₹{(t.cash_paise / 100).toLocaleString('en-IN')}
                          </td>
                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Set PIN by Admin */}
                              <button
                                onClick={() => onSetTeamPin(t.id)}
                                disabled={loading}
                                className="text-xs font-medium text-tx-secondary hover:text-tx-primary bg-bg-raised hover:bg-bg-overlay border border-bd-subtle px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                                title="Admin sets a custom PIN for this team"
                              >
                                <KeyRound className="w-3 h-3 text-accent" />
                                <span>Set PIN</span>
                              </button>

                              {/* Reset PIN */}
                              <button
                                onClick={() => handleResetPin(t.id)}
                                disabled={loading}
                                className="text-xs font-medium text-tx-secondary hover:text-amber-400 bg-bg-raised hover:bg-amber-500/10 border border-bd-subtle hover:border-amber-500/25 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                                title="Generate a random new PIN"
                              >
                                Reset PIN
                              </button>

                              {/* Remove Team */}
                              <button
                                onClick={() => handleRemoveTeam(t.id)}
                                disabled={loading}
                                className="text-xs font-medium text-tx-secondary hover:text-loss bg-bg-raised hover:bg-loss-dim/40 border border-bd-subtle hover:border-loss-border/30 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
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
              <span className="text-xs font-medium text-tx-secondary bg-bg-raised px-3 py-1.5 rounded-lg border border-bd-subtle self-start sm:self-auto tabular-nums">
                {activeAssets.length} Active Instruments
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeAssets.map((asset) => {
                const categoryColor =
                  asset.category === "Large Cap" ? "bg-accent-dim border-accent-border text-accent" :
                    asset.category === "Sovereign Reserve" ? "bg-warn-dim border-warn-border text-warn" :
                      asset.category === "Micro Cap" || asset.category === "Digital Asset" ? "bg-loss-dim border-loss-border text-loss" :
                        "bg-cyan-500/10 border-cyan-500/25 text-cyan-400";

                return (
                  <div
                    key={asset.ticker}
                    className="p-4 border border-bd-subtle bg-bg-base hover:border-bd-strong transition-all flex flex-col justify-between gap-3.5 rounded-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-bg-raised border border-bd-subtle flex items-center justify-center font-mono font-bold text-accent text-xs">
                          {asset.ticker.slice(0, 4)}
                        </div>
                        <div>
                          <div className="font-semibold text-tx-primary text-base tracking-tight">
                            {asset.ticker}
                          </div>
                          <div className="text-xs text-tx-secondary font-normal">
                            {asset.name}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-bd-hairline text-xs">
                      <span className="text-tx-secondary">{asset.sector}</span>
                      <span className={clsx("text-[11px] font-medium px-2 py-0.5 rounded-md border", categoryColor)}>
                        {asset.category}
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
              <div className="overflow-hidden border border-bd-subtle bg-bg-base rounded-xl">

                {/* Top Bar: Tabs & Actions */}
                <div className="p-4 sm:p-5 border-b border-bd-subtle flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex bg-bg-raised p-1 rounded-lg border border-bd-subtle">
                      <button
                        onClick={() => setNewsTabView("UPCOMING")}
                        className={clsx(
                          "px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
                          newsTabView === "UPCOMING"
                            ? "bg-bg-base text-tx-primary font-semibold shadow-xs"
                            : "text-tx-secondary hover:text-tx-primary"
                        )}
                      >
                        Upcoming Scripted ({allScriptedNews.length})
                      </button>
                      <button
                        onClick={() => setNewsTabView("HISTORY")}
                        className={clsx(
                          "px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
                          newsTabView === "HISTORY"
                            ? "bg-bg-base text-tx-primary font-semibold shadow-xs"
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
                        <Search className="w-4 h-4 text-tx-muted absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={newsSearch}
                          onChange={(e) => setNewsSearch(e.target.value)}
                          placeholder="Search headlines, tickers, sources..."
                          className="w-full bg-bg-raised border border-bd-subtle rounded-lg pl-9 pr-3.5 py-1.5 font-sans text-xs text-tx-primary placeholder:text-tx-muted focus:outline-none focus:border-accent"
                        />
                      </div>
                    )}
                    <button
                      onClick={() => setShowNewsModal(true)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" /> Draft News
                    </button>
                  </div>
                </div>

                {/* Session Filter Bar (for Upcoming) */}
                {newsTabView === "UPCOMING" && (
                  <div className="px-4 sm:px-5 py-2.5 bg-bg-raised/30 border-b border-bd-subtle flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
                    <span className="font-medium text-tx-muted mr-1 shrink-0">Filter:</span>
                    <button
                      onClick={() => setNewsSessionFilter("ALL")}
                      className={clsx(
                        "px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors border tabular-nums cursor-pointer",
                        newsSessionFilter === "ALL"
                          ? "bg-bg-overlay text-tx-primary border-bd-strong font-semibold"
                          : "bg-bg-raised text-tx-secondary border-bd-subtle hover:text-tx-primary"
                      )}
                    >
                      All ({allScriptedNews.length})
                    </button>

                    <div className="h-4 w-px bg-bd-subtle mx-1 shrink-0" />

                    {/* Round 1 (1-6) */}
                    <span className="font-medium text-tx-muted shrink-0">R1:</span>
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <button
                        key={g}
                        onClick={() => setNewsSessionFilter(g)}
                        className={clsx(
                          "px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors border flex items-center gap-1 tabular-nums cursor-pointer",
                          newsSessionFilter === g
                            ? "bg-bg-overlay text-tx-primary border-bd-strong font-semibold"
                            : "bg-bg-raised text-tx-secondary border-bd-subtle hover:text-tx-primary"
                        )}
                      >
                        S{g}
                        <span className="text-[10px] text-tx-muted">({sessionCounts[g] || 0})</span>
                      </button>
                    ))}

                    <div className="h-4 w-px bg-bd-subtle mx-1 shrink-0" />

                    {/* Round 2 (7-11) */}
                    <span className="font-medium text-tx-muted shrink-0">R2:</span>
                    {[7, 8, 9, 10, 11].map(g => (
                      <button
                        key={g}
                        onClick={() => setNewsSessionFilter(g)}
                        className={clsx(
                          "px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors border flex items-center gap-1 tabular-nums cursor-pointer",
                          newsSessionFilter === g
                            ? "bg-bg-overlay text-tx-primary border-bd-strong font-semibold"
                            : "bg-bg-raised text-tx-secondary border-bd-subtle hover:text-tx-primary"
                        )}
                      >
                        S{g - 6}
                        <span className="text-[10px] text-tx-muted">({sessionCounts[g] || 0})</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* News Table with Clean Groww-Style Layout */}
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-xs font-medium text-tx-secondary bg-bg-raised/40 uppercase tracking-wider border-b border-bd-subtle">
                      <tr>
                        <th className="px-5 py-3 whitespace-nowrap">Session &amp; Timing</th>
                        <th className="px-4 py-3 whitespace-nowrap">Source</th>
                        <th className="px-4 py-3 whitespace-nowrap">Target</th>
                        <th className="px-6 py-3">Headline</th>
                        <th className="px-4 py-3 text-center whitespace-nowrap">Impact</th>
                        <th className="px-4 py-3 text-center whitespace-nowrap">Status</th>
                        <th className="px-5 py-3 text-right whitespace-nowrap">Dispatch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-bd-hairline">
                      {newsTabView === "UPCOMING" ? (
                        filteredUpcomingNews.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-tx-muted font-sans text-xs">
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

                            const sourceLabels: Record<string, string> = {
                              "IN": "Insider Leak",
                              "AN": "Analyst Wire",
                              "NP": "Newspaper",
                              "FF": "Fast Feed"
                            };
                            const sourceLabel = sourceLabels[news.source] || news.source;
                            const headlineKey = `${news.g}-${news.public_tick}-${news.ticker}-${idx}`;
                            const isRevealed = Boolean(revealedHeadlines[headlineKey]);

                            return (
                              <tr key={idx} className={clsx("hover:bg-bg-raised/40 transition-colors", isCurrentSession && "bg-bg-raised/20")}>

                                {/* Session & Timing: Strictly session, round, and time */}
                                <td className="px-5 py-3.5 whitespace-nowrap">
                                  <div className="text-xs font-semibold text-tx-primary tracking-tight">
                                    {news.g <= 6 ? `Round 1 · Session ${news.g}` : `Round 2 · Session ${news.g - 6}`}
                                  </div>
                                  <div className="text-xs text-tx-muted mt-0.5 tabular-nums">
                                    T+{news.public_tick} ({Math.floor(news.public_tick * 1.5)}s)
                                  </div>
                                </td>

                                {/* Source: Clean text without colored blob */}
                                <td className="px-4 py-3.5 whitespace-nowrap">
                                  <span className="text-xs font-medium text-tx-secondary">
                                    {sourceLabel}
                                  </span>
                                </td>

                                {/* Target Asset */}
                                <td className="px-4 py-3.5 whitespace-nowrap">
                                  <div className="font-semibold text-tx-primary text-sm">{news.ticker}</div>
                                  <div className="text-xs text-tx-muted truncate max-w-[130px]">
                                    {ASSET_META[news.ticker]?.name || "Broad Market"}
                                  </div>
                                </td>

                                {/* Headline: Wrapped in click-to-reveal */}
                                <td className="px-6 py-3.5 max-w-xl">
                                  {isRevealed ? (
                                    <div className="space-y-1.5">
                                      <p className="text-sm text-tx-primary font-normal leading-relaxed">
                                        {news.text}
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() => toggleHeadline(headlineKey)}
                                        className="inline-flex items-center gap-1 text-[11px] text-tx-muted hover:text-tx-secondary cursor-pointer transition-colors"
                                      >
                                        <EyeOff className="w-3 h-3" /> Hide headline
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => toggleHeadline(headlineKey)}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-tx-secondary hover:text-tx-primary bg-bg-raised hover:bg-bg-overlay border border-bd-subtle transition-colors cursor-pointer"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-tx-muted" />
                                      <span>Click to read headline</span>
                                    </button>
                                  )}
                                </td>

                                {/* Impact: Plain tabular text, no colored blob */}
                                <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                  {isPositive ? (
                                    <span className="text-xs font-semibold text-gain tabular-nums">
                                      +{impactPercent}%
                                    </span>
                                  ) : isNegative ? (
                                    <span className="text-xs font-semibold text-loss tabular-nums">
                                      {impactPercent}%
                                    </span>
                                  ) : (
                                    <span className="text-xs font-medium text-tx-muted tabular-nums">
                                      0.0%
                                    </span>
                                  )}
                                </td>

                                {/* Status: Plain text, no colored blob */}
                                <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                  <span className="text-xs font-medium text-tx-secondary">
                                    {news.is_fake ? "Rumor" : "Verified"}
                                  </span>
                                </td>

                                {/* Dispatch Control */}
                                <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {isFired ? (
                                      <span className="text-xs font-medium text-tx-muted">
                                        Dispatched
                                      </span>
                                    ) : isImminent ? (
                                      <span className="text-xs font-medium text-tx-secondary tabular-nums">
                                        In {news.public_tick - sysState.n}t
                                      </span>
                                    ) : null}

                                    <button
                                      onClick={() => fireSpecificNews(news)}
                                      className="text-xs font-medium text-tx-secondary hover:text-tx-primary bg-bg-raised hover:bg-bg-overlay border border-bd-subtle px-2.5 py-1 rounded-md transition-colors cursor-pointer"
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
                            <td colSpan={7} className="px-6 py-12 text-center text-tx-muted font-sans text-xs">
                              No live or custom news has been dispatched in this simulation session yet.
                            </td>
                          </tr>
                        ) : (
                          sysState.news_history.map((news: any, idx: number) => {
                            const histKey = `hist-${idx}`;
                            const isHistRevealed = Boolean(revealedHeadlines[histKey]);
                            return (
                              <tr key={idx} className="hover:bg-bg-raised/40 transition-colors">
                                <td className="px-5 py-3.5 text-xs text-tx-muted tabular-nums">
                                  #{idx + 1}
                                </td>
                                <td className="px-4 py-3.5 text-xs text-tx-secondary font-medium">
                                  {news.source || "IN"}
                                </td>
                                <td className="px-4 py-3.5 font-semibold text-tx-primary text-sm">
                                  {news.ticker || "GLOBAL"}
                                </td>
                                <td colSpan={4} className="px-6 py-3.5 max-w-xl">
                                  {isHistRevealed ? (
                                    <div className="space-y-1.5">
                                      <p className="text-sm text-tx-primary font-normal leading-relaxed">
                                        {news.text || "Market breaking event."}
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() => toggleHeadline(histKey)}
                                        className="inline-flex items-center gap-1 text-[11px] text-tx-muted hover:text-tx-secondary cursor-pointer transition-colors"
                                      >
                                        <EyeOff className="w-3 h-3" /> Hide
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => toggleHeadline(histKey)}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-tx-secondary hover:text-tx-primary bg-bg-raised hover:bg-bg-overlay border border-bd-subtle transition-colors cursor-pointer"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-tx-muted" />
                                      <span>Click to read headline</span>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* News Drafting Modal */}
              {showNewsModal && (
                <div className="fixed inset-0 bg-bg-void/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-bg-base border border-bd-subtle p-6 rounded-xl w-full max-w-lg shadow-modal relative">
                    <div className="flex justify-between items-center mb-5 pb-4 border-b border-bd-subtle">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-accent" />
                        <h3 className="text-base font-semibold text-tx-primary">Broadcast Market News</h3>
                      </div>
                      <button
                        onClick={() => setShowNewsModal(false)}
                        className="text-tx-muted hover:text-tx-primary p-1 rounded transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-tx-secondary mb-1.5">
                            Target Ticker
                          </label>
                          <select
                            value={newsTicker}
                            onChange={e => setNewsTicker(e.target.value)}
                            className="w-full bg-bg-raised border border-bd-subtle rounded-lg px-3 py-2 text-tx-primary text-xs font-semibold outline-none focus:border-accent"
                          >
                            <option value="GLOBAL">GLOBAL (Market-Wide)</option>
                            <option value="RLNT">RLNT (Reliant Energy)</option>
                            <option value="INFN">INFN (Infinity Systems)</option>
                            <option value="HRZN">HRZN (Horizon Bank)</option>
                            <option value="BZR-V">BZR-V (Bazaar Ventures)</option>
                            <option value="PULSE">PULSE (Pulsechain)</option>
                            <option value="GOLDCORE">GOLDCORE (Goldcore Reserve)</option>
                            <option value="TYRL">TYRL (Tyrell Autoworks)</option>
                            <option value="NIMBUS">NIMBUS (Cloud Datacenters)</option>
                            <option value="STAPLE">STAPLE (Staple Agro)</option>
                            <option value="VOLTAGE">VOLTAGE (Power Matrix)</option>
                            <option value="CRANE">CRANE (Maritime Logistics)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-tx-secondary mb-1.5">
                            Intel Feed Source
                          </label>
                          <select
                            value={newsSource}
                            onChange={e => setNewsSource(e.target.value)}
                            className="w-full bg-bg-raised border border-bd-subtle rounded-lg px-3 py-2 text-tx-primary text-xs font-semibold outline-none focus:border-accent"
                          >
                            <option value="IN">IN (Insider Leak - L2+)</option>
                            <option value="AN">AN (Analyst Wire)</option>
                            <option value="NP">NP (Newspaper)</option>
                            <option value="FF">FF (Fast Feed / Social)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-tx-secondary mb-1.5">
                          Breaking Headline Text
                        </label>
                        <textarea
                          value={newsText}
                          onChange={e => setNewsText(e.target.value)}
                          placeholder="Type custom breaking market headline..."
                          className="w-full bg-bg-raised border border-bd-subtle rounded-lg p-3 text-tx-primary text-sm outline-none min-h-[100px] placeholder:text-tx-muted focus:border-accent font-sans leading-relaxed"
                        />
                      </div>

                      <button
                        onClick={fireNews}
                        disabled={loading || !newsText.trim()}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-semibold text-xs py-2.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Dispatch Alert To Market
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
                  Tournament Leaderboards
                </h1>
                <p className="text-tx-secondary text-sm mt-0.5">
                  Round-specific active rankings and overall multi-round tournament standings.
                </p>
              </div>

              {/* View Selector & Telemetry Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* 10s auto-refresh indicator (for active round) */}
                {leaderboardView === "ROUND" && (
                  <div className="px-3.5 py-1.5 rounded-lg border border-bd-subtle bg-bg-base flex items-center gap-2 text-xs tabular-nums">
                    <span className="w-1.5 h-1.5 rounded-full bg-gain" />
                    <span className="text-tx-muted">Sync in</span>
                    <span className="font-semibold text-emerald-400">{lbSecondsRemaining}s</span>
                    {lastLbSync && (
                      <>
                        <span className="text-tx-muted">·</span>
                        <span className="text-tx-muted">{lastLbSync}</span>
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
                  className="px-3 py-1.5 rounded-lg border border-bd-subtle bg-bg-raised hover:bg-bg-overlay text-tx-secondary hover:text-tx-primary transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                  title="Force refresh standings now"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* ── Tab Switcher: Primary Round vs Cumulative ── */}
            <div className="flex items-center gap-1.5 bg-bg-base p-1 rounded-xl border border-bd-subtle w-fit">
              <button
                onClick={() => setLeaderboardView("ROUND")}
                className={clsx(
                  "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer",
                  leaderboardView === "ROUND"
                    ? "bg-bg-raised text-tx-primary font-semibold shadow-xs"
                    : "text-tx-secondary hover:text-tx-primary"
                )}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Round Standings</span>
                <span className={clsx(
                  "text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-medium",
                  leaderboardView === "ROUND" ? "bg-accent/15 text-accent" : "bg-bg-raised text-tx-muted"
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
                  "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer",
                  leaderboardView === "CUMULATIVE"
                    ? "bg-bg-raised text-tx-primary font-semibold shadow-xs"
                    : "text-tx-secondary hover:text-tx-primary"
                )}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Overall Cumulative</span>
                {cumulativeLeaderboard?.is_final ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gain-dim text-gain font-medium">
                    Finalized
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-warn-dim text-warn font-medium">
                    Locks Post-R2
                  </span>
                )}
              </button>
            </div>

            {/* ── View 1: Active Round Leaderboard ── */}
            {leaderboardView === "ROUND" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="text-xs font-medium text-tx-secondary uppercase tracking-wider">
                    {leaderboard?.round_name || "Active Round"} · Live MTM Standings
                  </div>
                  <div className="text-xs text-tx-muted tabular-nums">
                    Auto-updates every 10 seconds
                  </div>
                </div>

                <div className="overflow-hidden border border-bd-subtle bg-bg-base rounded-xl">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-xs font-medium text-tx-secondary bg-bg-raised/40 uppercase tracking-wider border-b border-bd-subtle">
                        <tr>
                          <th className="px-6 py-3 w-24">Rank</th>
                          <th className="px-6 py-3">Participant Team</th>
                          <th className="px-6 py-3 text-center">Round Return</th>
                          <th className="px-6 py-3 text-right">Round Equity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-bd-hairline">
                        {!leaderboard?.rows || leaderboard.rows.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-12 text-tx-muted font-sans text-xs">
                              No leaderboard standings available for this round yet.
                            </td>
                          </tr>
                        ) : (
                          leaderboard.rows.map((row: any) => {
                            const isTop3 = row.rank <= 3;

                            return (
                              <tr key={row.team_id} className="hover:bg-bg-raised/40 transition-colors">
                                <td className="px-6 py-3.5 whitespace-nowrap">
                                  {row.rank === 1 ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-500/15 text-emerald-400 font-bold text-xs border border-emerald-500/25 tabular-nums">
                                      1
                                    </span>
                                  ) : row.rank === 2 ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-500/15 text-slate-300 font-bold text-xs border border-slate-500/25 tabular-nums">
                                      2
                                    </span>
                                  ) : row.rank === 3 ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-500/15 text-amber-400 font-bold text-xs border border-amber-500/25 tabular-nums">
                                      3
                                    </span>
                                  ) : (
                                    <span className="text-tx-muted text-xs font-medium tabular-nums pl-1.5">
                                      #{row.rank}
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-3.5 font-mono font-semibold text-tx-primary whitespace-nowrap text-sm">
                                  <div className="flex items-center gap-2">
                                    <span>{row.team_id}</span>
                                    {row.rank === 1 && (
                                      <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        Leader
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-3.5 text-center whitespace-nowrap tabular-nums">
                                  {row.return_pct !== undefined ? (
                                    <span className={clsx("text-sm font-semibold", row.return_pct >= 0 ? "text-gain" : "text-loss")}>
                                      {row.return_pct >= 0 ? `+${row.return_pct.toFixed(2)}%` : `${row.return_pct.toFixed(2)}%`}
                                    </span>
                                  ) : (
                                    <span className="text-tx-muted text-sm font-medium">0.00%</span>
                                  )}
                                </td>
                                <td className="px-6 py-3.5 font-semibold text-right text-tx-primary text-sm whitespace-nowrap tabular-nums">
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
                  <div className="p-5 border border-bd-subtle bg-bg-base rounded-xl space-y-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-tx-primary tracking-tight">
                          Cumulative Tournament Leaderboard
                        </h3>
                        <p className="text-xs text-tx-secondary leading-relaxed max-w-2xl">
                          Combines portfolio performances from Round 1 (Retail Momentum) and Round 2 (Institutional Desk).
                          Cumulative standings finalize and lock after Session 11 completes.
                        </p>
                      </div>
                    </div>

                    {/* Progress Trackers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="bg-bg-raised/50 border border-bd-subtle p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-tx-primary">Round 1 (Sessions 1 – 6)</div>
                          <div className="text-[11px] text-tx-muted mt-0.5">Retail trading &amp; liquidation rules</div>
                        </div>
                        <span className={clsx(
                          "text-xs font-medium px-2 py-0.5 rounded-md border",
                          cumulativeLeaderboard?.round_1_complete
                            ? "bg-gain-dim text-gain border-gain-border"
                            : "bg-warn-dim text-warn border-warn-border"
                        )}>
                          {cumulativeLeaderboard?.round_1_complete ? "Complete" : "In Progress"}
                        </span>
                      </div>

                      <div className="bg-bg-raised/50 border border-bd-subtle p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-tx-primary">Round 2 (Sessions 7 – 11)</div>
                          <div className="text-[11px] text-tx-muted mt-0.5">Institutional execution &amp; Stat Shop</div>
                        </div>
                        <span className={clsx(
                          "text-xs font-medium px-2 py-0.5 rounded-md border",
                          cumulativeLeaderboard?.round_2_complete
                            ? "bg-gain-dim text-gain border-gain-border"
                            : "bg-bg-raised text-tx-muted border-bd-subtle"
                        )}>
                          {cumulativeLeaderboard?.round_2_complete ? "Finished" : "Active / Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center gap-3">
                      <button
                        onClick={() => fetchCumulativeLeaderboard(true)}
                        className="px-3.5 py-1.5 bg-bg-raised hover:bg-bg-overlay border border-bd-subtle rounded-md text-xs font-medium text-tx-secondary hover:text-tx-primary transition-colors cursor-pointer"
                      >
                        Preview Live Estimates
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-1">
                    <div className="text-xs font-medium text-gain flex items-center gap-2 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-gain" />
                      Final Tournament Standings Locked (Round 1 + Round 2 Cumulative)
                    </div>
                  </div>
                )}

                {/* Cumulative Table */}
                {cumulativeLeaderboard?.rows && cumulativeLeaderboard.rows.length > 0 && (
                  <div className="overflow-hidden border border-bd-subtle bg-bg-base rounded-xl">
                    <div className="w-full overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="text-xs font-medium text-tx-secondary bg-bg-raised/40 uppercase tracking-wider border-b border-bd-subtle">
                          <tr>
                            <th className="px-6 py-3 w-24">Rank</th>
                            <th className="px-6 py-3">Participant Team</th>
                            <th className="px-6 py-3 text-center">R1 Return</th>
                            <th className="px-6 py-3 text-center">R2 Return</th>
                            <th className="px-6 py-3 text-center">Cumulative Return</th>
                            <th className="px-6 py-3 text-right">Net P&amp;L</th>
                            <th className="px-6 py-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-bd-hairline">
                          {cumulativeLeaderboard.rows.map((row: any) => {
                            const isFirst = row.rank === 1;
                            const isSecond = row.rank === 2;
                            const isThird = row.rank === 3;
                            const isElim = row.status === "ELIM";

                            return (
                              <tr key={row.team_id} className={clsx("hover:bg-bg-raised/40 transition-colors", isFirst && "bg-emerald-500/[0.03]")}>
                                <td className="px-6 py-3.5 whitespace-nowrap">
                                  {isFirst ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-500/15 text-emerald-400 font-bold text-xs border border-emerald-500/25 tabular-nums">
                                      1
                                    </span>
                                  ) : isSecond ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-500/15 text-slate-300 font-bold text-xs border border-slate-500/25 tabular-nums">
                                      2
                                    </span>
                                  ) : isThird ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-500/15 text-amber-400 font-bold text-xs border border-amber-500/25 tabular-nums">
                                      3
                                    </span>
                                  ) : (
                                    <span className="text-tx-muted text-xs font-medium tabular-nums pl-1.5">
                                      #{row.rank}
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-3.5 font-mono font-semibold text-tx-primary whitespace-nowrap text-sm">
                                  <div className="flex items-center gap-2">
                                    <span>{row.team_id}</span>
                                    {isFirst && (
                                      <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        Champion
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-3.5 text-center whitespace-nowrap text-xs tabular-nums">
                                  <span className={row.r1_return_pct >= 0 ? "text-gain font-semibold" : "text-loss font-semibold"}>
                                    {row.r1_return_pct >= 0 ? `+${row.r1_return_pct.toFixed(2)}%` : `${row.r1_return_pct.toFixed(2)}%`}
                                  </span>
                                </td>
                                <td className="px-6 py-3.5 text-center whitespace-nowrap text-xs tabular-nums">
                                  <span className={row.r2_return_pct >= 0 ? "text-gain font-semibold" : "text-loss font-semibold"}>
                                    {row.r2_return_pct >= 0 ? `+${row.r2_return_pct.toFixed(2)}%` : `${row.r2_return_pct.toFixed(2)}%`}
                                  </span>
                                </td>
                                <td className="px-6 py-3.5 text-center whitespace-nowrap tabular-nums">
                                  <span className={clsx("text-sm font-bold", row.cumulative_return_pct >= 0 ? "text-gain" : "text-loss")}>
                                    {row.cumulative_return_pct >= 0 ? `+${row.cumulative_return_pct.toFixed(2)}%` : `${row.cumulative_return_pct.toFixed(2)}%`}
                                  </span>
                                </td>
                                <td className="px-6 py-3.5 font-semibold text-right whitespace-nowrap text-sm tabular-nums">
                                  <span className={row.cumulative_pnl_paise >= 0 ? "text-gain" : "text-loss"}>
                                    {row.cumulative_pnl_paise >= 0 ? "+" : ""}
                                    ₹{(row.cumulative_pnl_paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                  </span>
                                </td>
                                <td className="px-6 py-3.5 text-center whitespace-nowrap">
                                  {isElim ? (
                                    <span className="text-xs font-medium text-loss bg-loss-dim px-2 py-0.5 rounded-md border border-loss-border">
                                      Liquidated
                                    </span>
                                  ) : (
                                    <span className="text-xs font-medium text-gain bg-gain-dim px-2 py-0.5 rounded-md border border-gain-border">
                                      Active
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
          <div className="space-y-6 max-w-4xl">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-tx-primary tracking-tight">Danger Zone</h1>
              <p className="text-tx-secondary text-sm mt-0.5">
                Emergency market halts and full simulation reset controls.
              </p>
            </div>

            {/* Market Operations Card */}
            <div className="p-6 border border-bd-subtle bg-bg-base rounded-xl space-y-4">
              <div>
                <h2 className="text-base font-semibold text-tx-primary">Market Trading Status</h2>
                <p className="text-xs text-tx-secondary mt-0.5">
                  Temporarily pause all participant order placements or resume trading across all active order books.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => handleAction("/admin/freeze")}
                  disabled={loading}
                  className="bg-bg-raised hover:bg-bg-overlay text-tx-primary border border-bd-subtle hover:border-bd-strong py-2.5 px-4 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Freeze Market (Halt Orders)</span>
                </button>
                <button
                  onClick={() => handleAction("/admin/unfreeze")}
                  disabled={loading}
                  className="bg-bg-raised hover:bg-bg-overlay text-tx-primary border border-bd-subtle hover:border-bd-strong py-2.5 px-4 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Power className="w-4 h-4 text-emerald-400" />
                  <span>Resume Market (Unfreeze)</span>
                </button>
              </div>
            </div>

            {/* Hard Reset Card */}
            <div className="p-6 border border-bd-subtle bg-bg-base rounded-xl space-y-4">
              <div>
                <h2 className="text-base font-semibold text-tx-primary">Reset Entire Simulation</h2>
                <p className="text-xs text-tx-secondary mt-0.5 leading-relaxed">
                  Permanently clears all trades, resets participant cash back to starting ₹1,00,00,000 (₹1 Crore), removes purchased stat upgrades, and rewinds the engine to Round 1 Session 1.
                </p>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to reset the simulation? All trades and balances will be wiped back to Session 1.")) {
                      handleAction("/admin/sessions/reset");
                    }
                  }}
                  disabled={loading}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 px-4 py-2 rounded-lg font-medium text-xs transition-colors inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Simulation</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

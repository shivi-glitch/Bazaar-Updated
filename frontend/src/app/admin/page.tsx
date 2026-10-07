"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Activity, Radio, Users, AlertTriangle, Search, LineChart, Trophy, LogOut, Sun, Moon, X, Zap, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import clsx from "clsx";
import { ASSET_META } from "../market/[ticker]/page";
import { SCRIPTED_NEWS_DATABASE, ScriptedNewsItem } from "@/lib/scriptedNews";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  
  const [sysState, setSysState] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("SESSION"); // Default to Session
  const [searchQuery, setSearchQuery] = useState("");
  
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

  const adminToken = "admin-master-secret";

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") === adminToken) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin") || passwordInput === adminToken) {
      sessionStorage.setItem("admin_auth", adminToken);
      setIsAuthenticated(true);
    } else {
      alert("UNAUTHORIZED: Invalid Credentials");
      setPasswordInput("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
  };

  const fetchData = async () => {
    try {
      const [stateRes, lbRes, teamsRes] = await Promise.all([
        api.get("/admin/sessions", adminToken),
        api.get("/admin/leaderboard/live", adminToken),
        api.get("/admin/teams", adminToken)
      ]);
      setSysState(stateRes);
      setLeaderboard(lbRes);
      setTeams(teamsRes.teams || []);
    } catch (err) {}
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleAction = async (endpoint: string, payload: any = {}) => {
    setLoading(true);
    try {
      await api.post(endpoint, payload, adminToken);
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeam = () => {
    const rawName = prompt("Enter new Team Name (no spaces):");
    if (!rawName) return;
    const teamId = rawName.trim().toLowerCase().replace(/\s/g, '');
    handleAction("/admin/teams/create", { team_id: teamId });
  };

  const handleResetPin = (teamId: string) => {
    if (confirm(`Reset PIN for ${teamId}?`)) handleAction("/admin/teams/reset-pin", { team_id: teamId });
  };

  const handleRemoveTeam = (teamId: string) => {
    if (confirm(`CRITICAL: Delete ${teamId} and all their trades forever?`)) handleAction("/admin/teams/remove", { team_id: teamId });
  };

  const fireNews = async () => {
    if (!newsText) return alert("News text required");
    await handleAction("/admin/news/fire", { source: newsSource, ticker: newsTicker, text: newsText });
    setNewsText("");
    setShowNewsModal(false);
    setNewsTabView("HISTORY");
  };

  const fireSpecificNews = async (item: ScriptedNewsItem) => {
    if (!confirm(`Force-trigger news for ${item.ticker} (Session ${item.g}) immediately?`)) return;
    await handleAction("/admin/news/fire", { source: item.source, ticker: item.ticker, text: item.text });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center p-4 selection:bg-blue-500/30">
        <div className="w-full max-w-md bg-[#0B1120] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-blue-500" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Terminal</h1>
            <p className="text-sm text-slate-500 mt-2">Restricted Simulation Access</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter Master Key"
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-center outline-none focus:border-blue-500 transition-colors"
                autoFocus
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20"
            >
              INITIALIZE OVERRIDE
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!sysState || !leaderboard) return <div className="h-screen flex items-center justify-center bg-[#0B1120] text-slate-400 font-bold">Initializing Admin Terminal...</div>;

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
    { id: "TEAMS", name: `Teams`, badge: teams.length, icon: Users },
    { id: "ASSETS", name: "Assets", badge: activeAssets.length, icon: LineChart },
    { id: "SESSION", name: "Session", icon: Activity },
    { id: "NEWS", name: "News & Signals", icon: Radio },
    { id: "LEADERBOARD", name: "Leaderboard", icon: Trophy },
    { id: "DANGER", name: "Danger", icon: AlertTriangle }
  ];

  const filteredTeams = teams.filter(t => t.id.toLowerCase().includes(searchQuery.toLowerCase()));

  let currentRoundStr = "No Session Active";
  if (sysState.current_g < 7) currentRoundStr = `Round 1 (Retail) - S${sysState.current_g}`;
  else if (sysState.current_g < 12) currentRoundStr = `Round 2 (Inst) - S${sysState.current_g - 6}`;

  const remainingSecs = Math.max(0, Math.floor((200 - sysState.n) * 1.5));
  const formattedTime = `${Math.floor(remainingSecs / 60).toString().padStart(2, '0')}:${(remainingSecs % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col h-screen w-full bg-[#070B14] text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30 relative">
      
      {/* Top Header */}
      <header className="h-16 border-b border-white/5 bg-[#070B14]/80 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-black text-white tracking-tighter flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center"><Activity className="w-4 h-4 text-white" /></div>
            MERX <span className="bg-blue-600/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-widest ml-1 border border-blue-500/20">Admin</span>
          </h1>
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase tracking-widest font-bold">
              <div className="w-2 h-2 rounded-full bg-amber-500" />{currentRoundStr}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] uppercase tracking-widest font-bold">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />{teams.length} Registered
            </div>
            {sysState.is_frozen && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase tracking-widest font-bold animate-pulse">
                SYSTEM FROZEN
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition">
            <LogOut className="w-4 h-4" /> Disconnect
          </button>
          <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-sm border border-transparent hover:border-white/10 hover:bg-white/5 text-slate-400 transition-colors">
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-10 border-b border-white/5 pb-2">
            {tabs.map(tab => (
              <button 
                key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={clsx("flex items-center gap-2 px-4 py-2.5 rounded-t-sm font-bold transition-all text-[10px] uppercase tracking-widest relative", 
                  activeTab === tab.id ? "text-white bg-white/5" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                )}
              >
                <tab.icon className="w-4 h-4" /> {tab.name}
                {tab.badge && <span className="bg-[#111827] text-slate-300 text-[10px] px-1.5 py-0.5 rounded-sm ml-1 border border-white/5">{tab.badge}</span>}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 translate-y-2" />}
              </button>
            ))}
          </div>

          {/* 1. TEAMS TAB */}
          {activeTab === "TEAMS" && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Teams & Credentials</h2>
                  <p className="text-slate-400 text-sm">Manage participant accounts, PINs, and active connection tracking.</p>
                </div>
                <button onClick={handleAddTeam} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                  + ADD TEAM
                </button>
              </div>

              <div className="glass-panel overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-[#070B14]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" placeholder="Filter teams by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#111827] border border-white/10 rounded-sm pl-10 pr-4 py-2.5 text-sm text-white font-medium outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="text-[10px] font-bold text-slate-500 bg-[#070B14] uppercase tracking-widest border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Team Name</th>
                      <th className="px-6 py-4">PIN (Live)</th>
                      <th className="px-6 py-4">Starting Cash</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeams.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-8 text-slate-500">No teams found.</td></tr>
                    )}
                    {filteredTeams.map((t) => (
                      <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          {t.is_online ? (
                            <span className="flex items-center gap-2 w-fit px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ONLINE
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 w-fit px-2 py-1 rounded bg-slate-500/10 border border-slate-500/20 text-[10px] font-bold text-slate-400">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-500" /> OFFLINE
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-white">{t.id}</td>
                        <td className="px-6 py-4 font-mono font-bold text-blue-400">{t.pin}</td>
                        <td className="px-6 py-4 font-mono font-bold text-white">₹{(t.cash_paise / 100).toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleResetPin(t.id)} disabled={loading} className="text-xs font-bold text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded hover:bg-amber-500/10 transition-colors mr-2">Reset PIN</button>
                          <button onClick={() => handleRemoveTeam(t.id)} disabled={loading} className="text-xs font-bold text-red-500 border border-red-500/20 px-3 py-1.5 rounded hover:bg-red-500/10 transition-colors">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. ASSETS TAB */}
          {activeTab === "ASSETS" && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Asset Inventory</h2>
                  <p className="text-slate-400 text-sm">
                    {sysState.current_g >= 7 
                      ? "Round 2 (Institutional Trading): 11 Active Instruments" 
                      : "Round 1 (Retail Trading): 7 Active Instruments"}
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-[#111827] px-3 py-1.5 rounded-sm border border-white/5">
                  {activeAssets.length} Active Assets
                </span>
              </div>
              <div className="space-y-3">
                {activeAssets.map((asset) => (
                  <div key={asset.ticker} className="glass-panel p-4 flex items-center justify-between bg-white/[0.01]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-sm bg-[#111827] border border-white/5 flex items-center justify-center font-black text-slate-400">{asset.ticker.split('-')[0]}</div>
                      <div>
                        <div className="flex items-center gap-3 mb-0.5">
                          <h3 className="font-black text-white text-lg tracking-tighter">{asset.ticker}</h3>
                          <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-sm border ${
                            asset.archetype === "Trending"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : asset.archetype === "Mean-Reverting"
                              ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                              : asset.archetype === "Safe Haven"
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              : "bg-red-500/10 border-red-500/20 text-red-400"
                          }`}>{asset.archetype}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{asset.name} • {asset.sector}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. SESSION TAB */}
          {activeTab === "SESSION" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* ROUND 1 BLOCK */}
              <div className="glass-panel p-6 bg-white/[0.01]">
                <h2 className="text-lg font-black text-white tracking-tighter mb-6">Round 1: Retail Trading</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(g => (
                    <div key={g} className="p-4 bg-[#070B14] border border-white/5 rounded-md flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-300 tracking-tight">Session {g}</span>
                        <div className="flex items-center gap-2">
                          {g === sysState.current_g && ["RUNNING", "PAUSED"].includes(sysState.states[g]) && (
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              {formattedTime}
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-1 rounded bg-[#0B1120] border border-white/5 ${sysState.states[g] === 'RUNNING' ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {sysState.states[g]}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button disabled={loading} onClick={() => handleAction(`/admin/sessions/${g}/start`)} className="flex-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-[10px] uppercase tracking-widest font-bold py-2 rounded-sm transition-colors">Start</button>
                        <button disabled={loading} onClick={() => handleAction(`/admin/sessions/${g}/pause`)} className="flex-1 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-[10px] uppercase tracking-widest font-bold py-2 rounded-sm transition-colors">Pause</button>
                        <button disabled={loading} onClick={() => handleAction(`/admin/sessions/${g}/end`)} className="flex-1 bg-[#111827] text-slate-400 hover:bg-white/5 text-[10px] uppercase tracking-widest font-bold py-2 rounded-sm transition-colors">End</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ROUND 2 BLOCK */}
              <div className="glass-panel border-t-4 border-t-purple-500 p-6 bg-white/[0.01]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-black text-white tracking-tighter">Round 2: Institutional (Reactive Bots)</h2>
                  {!sysState.r2_unlocked && (
                    <button disabled={loading} onClick={() => handleAction("/admin/round2/unlock")} className="bg-purple-600 text-white px-4 py-2 rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-900/50">
                      Unlock Round 2
                    </button>
                  )}
                </div>
                <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 transition-opacity ${sysState.r2_unlocked ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  {[7, 8, 9, 10, 11].map(g => (
                    <div key={g} className="p-4 bg-[#070B14] border border-purple-500/10 rounded-md flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-purple-200 tracking-tight">Session {g-6}</span>
                        <div className="flex items-center gap-2">
                          {g === sysState.current_g && ["RUNNING", "PAUSED"].includes(sysState.states[g]) && (
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              {formattedTime}
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#0B1120] text-slate-400">
                            {sysState.states[g]}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button disabled={loading} onClick={() => handleAction(`/admin/sessions/${g}/start`)} className="flex-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-[10px] uppercase tracking-widest font-bold py-2 rounded-sm transition-colors">Start</button>
                        <button disabled={loading} onClick={() => handleAction(`/admin/sessions/${g}/pause`)} className="flex-1 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-[10px] uppercase tracking-widest font-bold py-2 rounded-sm transition-colors">Pause</button>
                        <button disabled={loading} onClick={() => handleAction(`/admin/sessions/${g}/end`)} className="flex-1 bg-[#111827] text-slate-400 hover:bg-white/5 text-[10px] uppercase tracking-widest font-bold py-2 rounded-sm transition-colors">End</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 4. NEWS TAB */}
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
              <div className="space-y-6 animate-in fade-in duration-300 relative">
                <div className="glass-panel overflow-hidden">
                  {/* Top Bar: Tabs & Actions */}
                  <div className="p-6 border-b border-white/5 flex flex-col lg:flex-row items-start lg:items-center justify-between bg-[#070B14] gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex bg-[#111827] p-1 rounded-sm border border-white/5">
                        <button 
                          onClick={() => setNewsTabView("UPCOMING")}
                          className={clsx("px-4 py-1.5 rounded-sm text-[10px] uppercase tracking-widest font-bold transition-colors", newsTabView === "UPCOMING" ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:text-slate-300")}
                        >
                          Upcoming Scripted ({allScriptedNews.length})
                        </button>
                        <button 
                          onClick={() => setNewsTabView("HISTORY")}
                          className={clsx("px-4 py-1.5 rounded-sm text-[10px] uppercase tracking-widest font-bold transition-colors", newsTabView === "HISTORY" ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:text-slate-300")}
                        >
                          Injected History ({sysState.news_history?.length || 0})
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                      {newsTabView === "UPCOMING" && (
                        <div className="relative flex-1 sm:w-64">
                          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input 
                            type="text"
                            value={newsSearch}
                            onChange={(e) => setNewsSearch(e.target.value)}
                            placeholder="Filter by ticker, headline, source..."
                            className="w-full bg-[#111827] border border-white/10 rounded-sm pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      )}
                      <button onClick={() => setShowNewsModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-sm text-[10px] uppercase tracking-widest font-bold transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" /> Draft Custom News
                      </button>
                    </div>
                  </div>

                  {/* Session Filter Bar (for Upcoming) */}
                  {newsTabView === "UPCOMING" && (
                    <div className="px-6 py-3 bg-[#0B1120] border-b border-white/5 flex items-center gap-2 overflow-x-auto">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2 shrink-0">Filter Session:</span>
                      <button 
                        onClick={() => setNewsSessionFilter("ALL")}
                        className={clsx(
                          "px-2.5 py-1 rounded-sm text-[10px] uppercase tracking-widest font-bold shrink-0 transition-colors border",
                          newsSessionFilter === "ALL"
                            ? "bg-white/15 text-white border-white/20"
                            : "bg-[#111827] text-slate-500 border-white/5 hover:text-slate-300"
                        )}
                      >
                        All ({allScriptedNews.length})
                      </button>

                      <div className="h-4 w-px bg-white/10 mx-1 shrink-0" />

                      {/* Round 1 (1-6) */}
                      <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider shrink-0">R1:</span>
                      {[1, 2, 3, 4, 5, 6].map(g => (
                        <button
                          key={g}
                          onClick={() => setNewsSessionFilter(g)}
                          className={clsx(
                            "px-2.5 py-1 rounded-sm text-[10px] font-bold shrink-0 transition-colors border flex items-center gap-1",
                            newsSessionFilter === g
                              ? "bg-blue-600/30 text-blue-300 border-blue-500/50"
                              : g === sysState.current_g
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
                              : "bg-[#111827] text-slate-500 border-white/5 hover:text-slate-300"
                          )}
                        >
                          S{g}
                          {g === sysState.current_g && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                          <span className="text-[9px] opacity-60">({sessionCounts[g] || 0})</span>
                        </button>
                      ))}

                      <div className="h-4 w-px bg-white/10 mx-1 shrink-0" />

                      {/* Round 2 (7-11) */}
                      <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider shrink-0">R2:</span>
                      {[7, 8, 9, 10, 11].map(g => (
                        <button
                          key={g}
                          onClick={() => setNewsSessionFilter(g)}
                          className={clsx(
                            "px-2.5 py-1 rounded-sm text-[10px] font-bold shrink-0 transition-colors border flex items-center gap-1",
                            newsSessionFilter === g
                              ? "bg-purple-600/30 text-purple-300 border-purple-500/50"
                              : g === sysState.current_g
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20"
                              : "bg-[#111827] text-slate-500 border-white/5 hover:text-slate-300"
                          )}
                        >
                          S{g-6} <span className="text-[9px] text-slate-500">(S{g})</span>
                          {g === sysState.current_g && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                          <span className="text-[9px] opacity-60">({sessionCounts[g] || 0})</span>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Table View */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-[10px] font-bold text-slate-500 bg-[#070B14] uppercase tracking-widest border-b border-white/5">
                        <tr>
                          <th className="px-5 py-3.5">Session / Timing</th>
                          <th className="px-4 py-3.5">Source</th>
                          <th className="px-4 py-3.5">Target Asset</th>
                          <th className="px-6 py-3.5">Headline & Dossier</th>
                          <th className="px-4 py-3.5 text-center">Impact</th>
                          <th className="px-4 py-3.5 text-center">Intel Type</th>
                          <th className="px-5 py-3.5 text-right">Dispatch Control</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {newsTabView === "UPCOMING" ? (
                          filteredUpcomingNews.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                No scripted news found for the selected filter.
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

                              const sourceDetails = {
                                "IN": { label: "IN (Insider Leak)", color: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
                                "AN": { label: "AN (Analyst Wire)", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
                                "NP": { label: "NP (Newspaper)", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
                                "FF": { label: "FF (Fast Feed)", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" }
                              }[news.source] || { label: news.source, color: "bg-slate-500/10 text-slate-400 border-slate-500/30" };

                              return (
                                <tr key={idx} className={clsx("hover:bg-white/[0.02] transition-colors", isCurrentSession && "bg-blue-500/[0.03]")}>
                                  {/* Session & Timing */}
                                  <td className="px-5 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <span className={clsx(
                                        "text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider",
                                        news.g <= 6 
                                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                          : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                      )}>
                                        {news.g <= 6 ? `R1 • S${news.g}` : `R2 • S${news.g-6}`}
                                      </span>
                                      {isCurrentSession && (
                                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Active</span>
                                      )}
                                    </div>
                                    <div className="text-[11px] font-mono text-slate-400 mt-1">
                                      Tick <span className="font-bold text-white">T+{news.public_tick}</span> 
                                      <span className="text-[9px] text-slate-500 ml-1">({Math.floor(news.public_tick * 1.5)}s)</span>
                                    </div>
                                    <div className="text-[9px] font-mono text-purple-400/80">
                                      Early Leak: T+{news.public_tick - 6}
                                    </div>
                                  </td>

                                  {/* Source */}
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={clsx("text-[10px] font-bold px-2 py-1 rounded border", sourceDetails.color)}>
                                      {sourceDetails.label}
                                    </span>
                                  </td>

                                  {/* Target Asset */}
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="font-mono font-bold text-white tracking-tight">{news.ticker}</div>
                                    <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                                      {ASSET_META[news.ticker]?.name || "Broad Market"}
                                    </div>
                                  </td>

                                  {/* Headline */}
                                  <td className="px-6 py-4">
                                    <div className="text-xs text-slate-200 font-medium leading-relaxed max-w-2xl">
                                      {news.text}
                                    </div>
                                  </td>

                                  {/* Impact */}
                                  <td className="px-4 py-4 whitespace-nowrap text-center">
                                    {isPositive ? (
                                      <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                        <ArrowUpRight className="w-3.5 h-3.5" /> +{impactPercent}%
                                      </span>
                                    ) : isNegative ? (
                                      <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-sm bg-red-500/10 border border-red-500/20 text-red-400">
                                        <ArrowDownRight className="w-3.5 h-3.5" /> {impactPercent}%
                                      </span>
                                    ) : (
                                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-sm bg-slate-800 text-slate-400 border border-white/5">
                                        0.0%
                                      </span>
                                    )}
                                  </td>

                                  {/* Authenticity */}
                                  <td className="px-4 py-4 whitespace-nowrap text-center">
                                    {news.is_fake ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                        <AlertCircle className="w-3 h-3" /> Fake / Rumor
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                        <CheckCircle2 className="w-3 h-3" /> Verified
                                      </span>
                                    )}
                                  </td>

                                  {/* Action */}
                                  <td className="px-5 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {isFired ? (
                                        <span className="text-[10px] font-bold text-slate-500 bg-white/5 border border-white/5 px-2.5 py-1 rounded-sm">
                                          Dispatched
                                        </span>
                                      ) : isImminent ? (
                                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-sm">
                                          In {news.public_tick - sysState.n} ticks
                                        </span>
                                      ) : null}
                                      
                                      <button 
                                        onClick={() => fireSpecificNews(news)}
                                        className="text-xs font-bold text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-600 border border-blue-500/20 px-3 py-1.5 rounded-sm transition-colors shadow-sm"
                                        title="Force trigger this exact news now into the market"
                                      >
                                        Trigger Now
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
                              <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                No live or custom news has been injected yet.
                              </td>
                            </tr>
                          ) : (
                            sysState.news_history.map((news: any, idx: number) => (
                              <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-5 py-4 font-mono text-xs text-slate-400">
                                  #{idx + 1}
                                </td>
                                <td className="px-4 py-4">
                                  <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold px-2 py-1 rounded">
                                    {news.source || "IN"}
                                  </span>
                                </td>
                                <td className="px-4 py-4 font-mono font-bold text-white">
                                  {news.ticker || "GLOBAL"}
                                </td>
                                <td colSpan={4} className="px-6 py-4 text-slate-300 text-xs font-medium">
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

                {/* NEWS DRAFTING MODAL */}
                {showNewsModal && (
                  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#111827] border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom-4">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-blue-400" />
                          <h3 className="text-lg font-bold text-white">Broadcast Custom Live News</h3>
                        </div>
                        <button onClick={() => setShowNewsModal(false)} className="text-slate-500 hover:text-white transition-colors">
                          <X className="w-5 h-5"/>
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Impact Ticker</label>
                            <select 
                              value={newsTicker} 
                              onChange={e => setNewsTicker(e.target.value)} 
                              className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-3 py-2.5 text-white font-bold outline-none"
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
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">News Source</label>
                            <select 
                              value={newsSource} 
                              onChange={e => setNewsSource(e.target.value)} 
                              className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-3 py-2.5 text-white font-bold outline-none"
                            >
                              <option value="IN">IN (Insider Leak - L2+)</option>
                              <option value="AN">AN (Analyst Wire)</option>
                              <option value="NP">NP (Newspaper)</option>
                              <option value="FF">FF (Fast Feed / Social)</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Headline</label>
                          <textarea 
                            value={newsText} 
                            onChange={e => setNewsText(e.target.value)} 
                            placeholder="Type custom breaking market headline..." 
                            className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-3 text-white text-sm outline-none min-h-[100px] placeholder:text-slate-600 focus:border-blue-500" 
                          />
                        </div>
                        <button 
                          onClick={fireNews} 
                          disabled={loading || !newsText.trim()} 
                          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-900/30"
                        >
                          Fire Alert Now to Active Market
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 5. LEADERBOARD TAB */}
          {activeTab === "LEADERBOARD" && (
             <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl h-[700px] flex flex-col animate-in fade-in duration-300">
               <h2 className="text-lg font-bold text-white mb-6 flex justify-between items-center">Live Standings</h2>
               <div className="flex-1 overflow-y-auto pr-2">
                 <table className="w-full text-left text-sm">
                   <thead className="text-[10px] font-bold text-slate-500 bg-[#0B1120] uppercase tracking-wider">
                     <tr>
                       <th className="px-4 py-4 rounded-tl-lg">Rank</th>
                       <th className="px-4 py-4">Team</th>
                       <th className="px-4 py-4 text-right rounded-tr-lg">Total Equity (₹)</th>
                     </tr>
                   </thead>
                   <tbody>
                     {leaderboard?.rows?.map((row: any) => (
                         <tr key={row.team_id} className="border-b border-white/5 hover:bg-white/5">
                           <td className="px-4 py-4 font-black text-slate-500">{row.rank}</td>
                           <td className="px-4 py-4 font-bold text-white">{row.team_id}</td>
                           <td className="px-4 py-4 font-mono font-bold text-right text-emerald-400">
                             ₹{(row.equity_paise / 100).toLocaleString('en-IN', {maximumFractionDigits: 0})}
                           </td>
                         </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
          )}

          {/* 6. DANGER TAB */}
          {activeTab === "DANGER" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-[#111827] border border-white/10 p-8 rounded-3xl max-w-2xl">
                <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2"><Zap className="text-amber-500" /> Environment Control</h2>
                <p className="text-sm text-slate-400 mb-8">Rapidly jump through sessions for testing.</p>
                
                <div className="flex gap-4 items-center bg-[#0B1120] p-4 rounded-2xl border border-white/5 mb-6">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Test Jump</span>
                  <select 
                    value={jumpTarget} onChange={(e) => setJumpTarget(Number(e.target.value))}
                    className="flex-1 bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none"
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11].map(g => (
                      <option key={g} value={g}>{g < 7 ? `Round 1 - Session ${g}` : `Round 2 - Session ${g-6}`}</option>
                    ))}
                  </select>
                  <button onClick={() => handleAction("/admin/sessions/jump", { target_g: jumpTarget })} disabled={loading} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-bold transition-colors">
                    Execute Jump
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                  <button onClick={() => handleAction("/admin/freeze")} className="bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 py-4 rounded-xl font-black transition-colors flex flex-col items-center justify-center gap-1">
                    <AlertTriangle className="w-5 h-5 mb-1" /> KILL SWITCH (Freeze)
                  </button>
                  <button onClick={() => handleAction("/admin/unfreeze")} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 py-4 rounded-xl font-black transition-colors flex flex-col items-center justify-center gap-1">
                    <Zap className="w-5 h-5 mb-1" /> UNFREEZE MARKET
                  </button>
                </div>
              </div>

              <div className="bg-red-950/20 border border-red-900/50 p-8 rounded-2xl max-w-2xl">
                <h2 className="text-xl font-black text-red-500 mb-2">Nuclear Option</h2>
                <p className="text-sm text-red-400/80 mb-6">Wipe all active trades, reset ledger balances to exactly ₹1 Crore, strip all team upgrades, and snap the engine back to Round 1 Session 1.</p>
                <button 
                  onClick={() => { if (window.confirm("WARNING: Irreversible Hard Reset. Continue?")) handleAction("/admin/sessions/reset"); }}
                  className="bg-red-600 hover:bg-red-700 text-white w-full py-3 rounded-lg font-bold transition-colors shadow-lg shadow-red-900/50"
                >
                  HARD RESET ENTIRE EVENT
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, LogOut, ArrowLeft, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

export default function PodiumPage() {
  const [data, setData] = useState<any>(null);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("merx_token");
        const res = await api.get("/leaderboard", token || "");
        setData(res);
      } catch (err) {
        console.error("Failed to load results", err);
      }
    };
    fetchResults();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("merx_token");
    router.push("/");
  };

  if (!data) {
    return (
      <div className="h-screen bg-bg-void flex items-center justify-center text-tx-muted font-mono text-[13px] animate-pulse">
        Computing official simulation standings...
      </div>
    );
  }

  const top3 = (data.top_10 || []).slice(0, 3);
  const myResult = data.my_result;
  
  const formatMoney = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <div className="min-h-screen bg-bg-void text-tx-primary flex flex-col items-center pt-8 sm:pt-12 pb-24 px-4 overflow-hidden relative font-sans selection:bg-accent-dim selection:text-accent">
      
      {/* Decorative Glow */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none rounded-full"
        style={{
          background: "radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />

      {/* Top Bar with Nav & Theme Toggle */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8 z-20">
        <Link 
          href="/market"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-bg-raised border border-bd-subtle text-tx-secondary hover:text-tx-primary text-[12px] font-mono transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Market Board</span>
        </Link>

        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="p-2 rounded-md bg-bg-raised border border-bd-subtle hover:border-bd-strong text-tx-secondary hover:text-tx-primary transition-colors"
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-warn" /> : <Moon className="w-4 h-4 text-accent" />}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center z-10 mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-accent-dim border border-accent-border font-mono text-[11px] uppercase tracking-wider text-accent font-bold mb-3">
          <Trophy className="w-3.5 h-3.5" />
          Official Results · EIC X Bazaar
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-tx-primary mb-3">
          Simulation Standings
        </h1>
        <p className="text-tx-secondary text-[14px] sm:text-[16px] max-w-md mx-auto">
          The order book has resolved. Here are the final institutional rankings.
        </p>
      </motion.div>

      {/* The Podium */}
      <div className="flex items-end justify-center gap-3 sm:gap-6 w-full max-w-3xl z-10 mb-12 sm:mb-16 h-64 sm:h-72">
        {/* 2nd Place */}
        {top3[1] && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="flex flex-col items-center w-1/3">
            <div className="text-center mb-3">
              <Medal className="w-8 h-8 sm:w-10 sm:h-10 text-tx-secondary mx-auto mb-1.5" />
              <div className="font-bold text-[13px] sm:text-[15px] truncate max-w-[100px] sm:max-w-none">{top3[1].team_id}</div>
              <div className="text-[11px] text-tx-muted font-mono font-bold">{formatMoney(top3[1].equity_paise)}</div>
            </div>
            <div className="w-full bg-bg-raised border border-bd-subtle border-t-4 border-t-bd-strong h-32 sm:h-36 rounded-t-xl flex items-end justify-center pb-3 text-3xl sm:text-4xl font-mono font-bold text-tx-muted/40 shadow-card">
              2
            </div>
          </motion.div>
        )}

        {/* 1st Place */}
        {top3[0] && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }} className="flex flex-col items-center w-1/3">
            <div className="text-center mb-3">
              <Trophy className="w-12 h-12 sm:w-14 sm:h-14 text-accent mx-auto mb-1.5 drop-shadow-[0_0_20px_rgba(0,212,170,0.4)]" />
              <div className="font-bold text-[15px] sm:text-[17px] text-accent truncate max-w-[110px] sm:max-w-none">{top3[0].team_id}</div>
              <div className="text-[11px] sm:text-[12px] text-accent font-mono font-bold bg-accent-dim border border-accent-border px-2.5 py-0.5 rounded mt-1.5">
                {formatMoney(top3[0].equity_paise)}
              </div>
            </div>
            <div className="w-full bg-bg-raised border border-accent-border border-t-4 border-t-accent h-48 sm:h-52 rounded-t-xl flex items-end justify-center pb-5 text-5xl sm:text-6xl font-mono font-bold text-accent/30 shadow-[0_0_35px_rgba(0,212,170,0.15)]">
              1
            </div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {top3[2] && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="flex flex-col items-center w-1/3">
            <div className="text-center mb-3">
              <Award className="w-8 h-8 sm:w-10 sm:h-10 text-warn mx-auto mb-1.5" />
              <div className="font-bold text-[13px] sm:text-[15px] truncate max-w-[100px] sm:max-w-none">{top3[2].team_id}</div>
              <div className="text-[11px] text-tx-muted font-mono font-bold">{formatMoney(top3[2].equity_paise)}</div>
            </div>
            <div className="w-full bg-bg-raised border border-bd-subtle border-t-4 border-t-warn h-24 sm:h-28 rounded-t-xl flex items-end justify-center pb-2 text-2xl sm:text-3xl font-mono font-bold text-warn/30 shadow-card">
              3
            </div>
          </motion.div>
        )}
      </div>

      {/* Your Personal Result */}
      {myResult && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1, duration: 0.4 }} className="w-full max-w-2xl bg-bg-raised/80 border border-bd-subtle rounded-2xl p-6 sm:p-8 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-card backdrop-blur-sm">
          <div>
            <div className="text-[10px] font-mono font-bold text-tx-muted uppercase tracking-wider mb-1">Your Team Performance</div>
            <div className="text-[20px] sm:text-[22px] font-bold text-tx-primary flex items-center gap-2.5">
              <span>{myResult.team_id}</span>
              {myResult.eliminated && (
                <span className="bg-loss-dim text-loss text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-loss-border">
                  LIQUIDATED
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-8 text-left sm:text-right">
            <div>
              <div className="text-[10px] font-mono font-bold text-tx-muted uppercase tracking-wider mb-1">Rank</div>
              <div className="text-[26px] sm:text-[30px] font-mono font-bold text-tx-primary">#{myResult.rank}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold text-tx-muted uppercase tracking-wider mb-1">Final Equity</div>
              <div className="text-[20px] sm:text-[24px] font-mono font-bold text-gain">{formatMoney(myResult.equity_paise)}</div>
            </div>
          </div>
        </motion.div>
      )}

      <button 
        onClick={handleLogout} 
        className="mt-10 flex items-center gap-2 text-tx-muted hover:text-tx-primary transition-colors text-[12px] font-mono font-bold uppercase tracking-wider z-10 cursor-pointer"
      >
        <LogOut className="w-4 h-4" /> Exit Session
      </button>

    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PodiumPage() {
  const [data, setData] = useState<any>(null);
  const router = useRouter();

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

  if (!data) return <div className="h-screen bg-slate-950 flex items-center justify-center text-white font-bold animate-pulse">Computing Final Standings...</div>;

  const top3 = data.top_10.slice(0, 3);
  const myResult = data.my_result;
  
  const formatMoney = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center pt-12 pb-24 px-4 overflow-hidden relative selection:bg-blue-500/30">
      
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center z-10 mb-16">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-4">
          SIMULATION COMPLETE
        </h1>
        <p className="text-slate-400 font-medium text-lg">The markets have closed. Here are your final standings.</p>
      </motion.div>

      {/* The Podium */}
      <div className="flex items-end justify-center gap-2 md:gap-6 w-full max-w-3xl z-10 mb-16 h-64">
        {/* 2nd Place */}
        {top3[1] && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="flex flex-col items-center w-1/3">
            <div className="text-center mb-4">
              <Medal className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <div className="font-bold text-lg">{top3[1].team_id}</div>
              <div className="text-xs text-slate-400 font-mono">{formatMoney(top3[1].equity_paise)}</div>
            </div>
            <div className="w-full bg-gradient-to-t from-slate-800 to-slate-700 h-32 rounded-t-2xl border-t-4 border-slate-300 flex items-end justify-center pb-4 text-4xl font-black text-slate-500/50">2</div>
          </motion.div>
        )}

        {/* 1st Place */}
        {top3[0] && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.8 }} className="flex flex-col items-center w-1/3">
            <div className="text-center mb-4">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-2 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
              <div className="font-black text-xl text-yellow-400">{top3[0].team_id}</div>
              <div className="text-sm text-yellow-100 font-mono font-bold bg-yellow-500/20 px-3 py-1 rounded-full mt-2">{formatMoney(top3[0].equity_paise)}</div>
            </div>
            <div className="w-full bg-gradient-to-t from-yellow-900/40 to-yellow-600/40 h-48 rounded-t-2xl border-t-4 border-yellow-400 flex items-end justify-center pb-6 text-6xl font-black text-yellow-500/20 shadow-[0_0_50px_rgba(250,204,21,0.1)]">1</div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {top3[2] && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="flex flex-col items-center w-1/3">
            <div className="text-center mb-4">
              <Award className="w-10 h-10 text-amber-600 mx-auto mb-2" />
              <div className="font-bold text-lg">{top3[2].team_id}</div>
              <div className="text-xs text-slate-400 font-mono">{formatMoney(top3[2].equity_paise)}</div>
            </div>
            <div className="w-full bg-gradient-to-t from-amber-900/30 to-amber-800/40 h-24 rounded-t-2xl border-t-4 border-amber-600 flex items-end justify-center pb-2 text-3xl font-black text-amber-700/50">3</div>
          </motion.div>
        )}
      </div>

      {/* Your Personal Result */}
      {myResult && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.8, duration: 0.5 }} className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-8 z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Your Performance</div>
            <div className="text-2xl font-bold flex items-center gap-3">
              {myResult.team_id} 
              {myResult.eliminated && <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded border border-red-500/20">LIQUIDATED</span>}
            </div>
          </div>
          
          <div className="flex gap-8 text-center">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Final Rank</div>
              <div className="text-3xl font-black text-white">#{myResult.rank}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Equity</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">{formatMoney(myResult.equity_paise)}</div>
            </div>
          </div>
        </motion.div>
      )}

      <button onClick={handleLogout} className="mt-12 flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold z-10">
        <LogOut className="w-4 h-4" /> Exit Simulation
      </button>

    </div>
  );
}

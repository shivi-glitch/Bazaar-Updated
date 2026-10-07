"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Lock, User, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [teamId, setTeamId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);

    try {
      const formattedId = teamId.trim().toLowerCase();
      const res = await api.post("/auth/login", { team_id: formattedId, pin });
      localStorage.setItem("merx_token", res.token);
      router.push("/market");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] h-[80vh] bg-[radial-gradient(ellipse_80%_80%_at_50%_0%,rgba(59,130,246,0.15),transparent)] pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0 opacity-20" />

      <div className="w-full max-w-md glass-panel p-8 relative overflow-hidden z-10 bg-white/[0.01]">
        <Link href="/" className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        
        <div className="text-center mb-10 mt-6">
          <h1 className="text-4xl font-black text-white tracking-tighter">MERX</h1>
          <p className="text-blue-400 mt-2 font-bold text-[10px] uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 inline-block px-3 py-1 rounded-sm">Participant Terminal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-sm text-[10px] font-bold text-center uppercase tracking-widest">{error}</div>}

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="text" placeholder="TEAM ID (e.g., T001)" value={teamId}
                onChange={(e) => setTeamId(e.target.value)} required
                className="w-full pl-12 pr-4 py-3 bg-[#111827] border border-white/10 rounded-sm focus:border-blue-500/50 outline-none transition-colors font-mono font-bold text-white placeholder-slate-600 uppercase tracking-widest text-xs"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="password" placeholder="PIN" value={pin}
                onChange={(e) => setPin(e.target.value)} required
                className="w-full pl-12 pr-4 py-3 bg-[#111827] border border-white/10 rounded-sm focus:border-blue-500/50 outline-none transition-colors font-mono font-bold text-white placeholder-slate-600 tracking-widest text-xl"
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-sm hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            {loading ? "Authenticating..." : "Connect to Engine"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Lock, User, ArrowLeft, ArrowRight, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

export default function LoginPage() {
  const [teamId, setTeamId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem("merx_token");
    if (token) {
      router.replace("/market");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formattedId = teamId.trim().toLowerCase();
      const res = await api.post("/auth/login", { team_id: formattedId, pin });
      localStorage.setItem("merx_token", res.token);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("merx_auth_change"));
      }
      router.replace("/market");
    } catch (err: any) {
      setError(err.message || "Authentication failed. Check your Team ID and PIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-bg-void text-tx-primary flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-accent-dim selection:text-accent">

      {/* Ambient background glows */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] pointer-events-none rounded-full"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, var(--color-accent-glow) 0%, transparent 65%)",
          filter: "blur(80px)",
        }}
        aria-hidden="true"
      />

      {/* Subtle Dot Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle, var(--color-bd-subtle) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      {/* Top right Theme toggle */}
      <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-20">
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="p-2.5 rounded-md bg-bg-raised/70 border border-bd-subtle hover:border-bd-strong text-tx-secondary hover:text-tx-primary transition-colors backdrop-blur-sm"
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-warn" /> : <Moon className="w-4 h-4 text-accent" />}
        </button>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[420px] bg-bg-raised/80 border border-bd-subtle p-7 sm:p-9 rounded-2xl shadow-card relative z-10 backdrop-blur-md">

        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-tx-secondary hover:text-tx-primary transition-colors text-[12px] font-mono mb-6 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-1.5 text-[24px] sm:text-[28px] font-bold tracking-[-0.03em] text-tx-primary">
            <span>EIC</span>
            <span className="text-accent font-mono font-bold text-[18px] sm:text-[20px]">X</span>
            <span>Bazaar</span>
          </div>
          <div className="mt-2.5">
            <span className="inline-flex items-center gap-1.5 text-accent bg-accent-dim border border-accent-border font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Participant Terminal
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-loss-dim border border-loss-border text-loss px-3.5 py-2.5 rounded-md text-[11px] font-mono font-bold text-center leading-relaxed">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {/* Team ID */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-tx-muted mb-1.5 font-bold">
                Team Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-tx-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Team Big Bull"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  required
                  autoCapitalize="characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-base border border-bd-subtle rounded-md focus:border-accent text-tx-primary font-mono text-[13px] placeholder:text-tx-muted uppercase tracking-widest outline-none transition-colors"
                />
              </div>
            </div>

            {/* PIN */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-tx-muted mb-1.5 font-bold">
                PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-tx-muted pointer-events-none" />
                <input
                  type="password"
                  placeholder="Harshad Mehta"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-base border border-bd-subtle rounded-md focus:border-accent text-tx-primary font-mono text-[15px] placeholder:text-tx-muted tracking-widest outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-accent text-tx-inverse font-mono font-bold uppercase tracking-wider text-[12px] sm:text-[13px] rounded-md hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 shadow-[0_0_24px_rgba(0,212,170,0.25)] flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Connect</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

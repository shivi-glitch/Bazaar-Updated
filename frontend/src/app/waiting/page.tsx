"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Shield, LogOut } from "lucide-react";

export default function WaitingPage() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("merx_token");
    if (!storedToken) {
      router.push("/login");
    } else {
      setToken(storedToken);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("merx_token");
    router.push("/");
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-bg-void text-tx-primary flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans">
      {/* Subtle ambient glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] pointer-events-none rounded-full"
        style={{
          background: "radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      <div className="relative z-10 max-w-md w-full bg-bg-raised/75 border border-bd-subtle rounded-2xl p-8 sm:p-10 shadow-card backdrop-blur-md space-y-6">
        <div className="w-14 h-14 bg-accent-dim border border-accent-border rounded-2xl flex items-center justify-center text-accent mx-auto animate-pulse">
          <Clock className="w-7 h-7" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-warn-dim border border-warn-border text-[10px] font-mono font-bold uppercase tracking-wider text-warn mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-warn animate-pulse" />
            Arena Standby Mode
          </span>
          <h1 className="text-[22px] sm:text-[26px] font-bold text-tx-primary tracking-tight">
            Waiting for Engine Start
          </h1>
          <p className="text-[13px] sm:text-[14px] text-tx-secondary mt-2 leading-relaxed">
            Your connection to the matching engine is active. Trading will commence as soon as the session is opened by organizers.
          </p>
        </div>

        <div className="pt-4 border-t border-bd-hairline flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-tx-muted">
          <span className="flex items-center gap-1.5 text-gain">
            <span className="w-1.5 h-1.5 rounded-full bg-gain animate-ping" />
            SYNCHRONIZED WITH SERVER
          </span>
          <button 
            onClick={handleLogout}
            className="text-tx-secondary hover:text-tx-primary flex items-center gap-1 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

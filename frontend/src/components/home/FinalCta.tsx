import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCta() {
  return (
    <div className="relative py-40 border-t border-white/5 bg-[#070B14] overflow-hidden flex flex-col items-center text-center">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-8 z-10">
        Ready to Trade?
      </h2>
      
      <Link href="/login" className="z-10 group relative inline-flex items-center justify-center px-10 py-5 font-bold text-[#070B14] bg-white rounded-sm overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#070B14]">
        <span className="mr-2 uppercase tracking-widest text-sm">Join the Market</span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Link>

      <div className="mt-20 z-10 text-slate-600 font-mono tabular-nums text-[10px] uppercase tracking-widest font-bold">
        Meridian Exchange v2.0 &bull; Institutional Simulation
      </div>
    </div>
  );
}

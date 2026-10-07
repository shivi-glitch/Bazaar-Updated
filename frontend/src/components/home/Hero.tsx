import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ChartLine } from "./ChartLine";
import { PATHS } from "./chart-paths";

export function Hero() {
  return (
    <main className="relative z-10 pt-40 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden min-h-[80vh] justify-center">
      <div className="absolute inset-0 w-full h-full opacity-40">
        <ChartLine path={PATHS.heroLine} delay={0.2} color="#3B82F6" strokeWidth={2} />
      </div>

      <motion.div 
        initial={{ opacity: 0, filter: "blur(10px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.8 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase tracking-widest font-bold mb-8 z-10"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        Live Trading Engine Online
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 10, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.8, delay: 0.1 }}
        className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1.1] z-10"
      >
        Trade the market. <br className="hidden md:block" />
        <span className="text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]">
          Beat the room.
        </span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
        className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 font-medium z-10"
      >
        An institutional-grade trading simulation. React to live news, utilize leverage, buy asymmetric data, and trade against a reactive AI order book.
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="z-10 flex gap-4">
        <Link href="/login" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-blue-600 rounded-sm overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#070B14]">
          <span className="mr-2 uppercase tracking-widest text-xs">Enter Simulation</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link href="#explore" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-[#111827] border border-white/10 rounded-sm overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-[#161D2E] focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-[#070B14]">
          <span className="uppercase tracking-widest text-xs">Explore Rounds</span>
        </Link>
      </motion.div>
    </main>
  );
}

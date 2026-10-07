import { motion } from "framer-motion";
import { Zap, Clock } from "lucide-react";
import { ChartLine } from "./ChartLine";

export function NewsRace() {
  return (
    <div className="bg-[#0B1120] py-32 border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Text */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] uppercase tracking-widest font-bold mb-6">
            Information Asymmetry
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-6">The 12-Second Advantage</h2>
          <p className="text-slate-400 font-medium mb-8 max-w-lg text-lg">
            In MERX, news isn't just text—it's a weapon. Upgrade your research capabilities to intercept market-moving events up to 12 seconds before retail traders see them. 
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111827] border border-white/5 p-4 rounded-sm">
              <Zap className="w-5 h-5 text-amber-400 mb-2" />
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Early Reaction</div>
              <div className="text-sm font-bold text-white">Capture Alpha</div>
            </div>
            <div className="bg-[#111827] border border-white/5 p-4 rounded-sm">
              <Clock className="w-5 h-5 text-slate-500 mb-2" />
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Late Reaction</div>
              <div className="text-sm font-bold text-white">Provide Exit Liquidity</div>
            </div>
          </div>
        </div>

        {/* Visual */}
        <div className="relative h-[400px] bg-[#070B14] border border-white/5 rounded-sm p-6 overflow-hidden">
           {/* Breaking news slide in */}
           <motion.div 
             initial={{ x: "100%", opacity: 0 }}
             whileInView={{ x: 0, opacity: 1 }}
             transition={{ type: "spring", damping: 20, delay: 0.5 }}
             viewport={{ once: true }}
             className="absolute top-6 right-6 bg-[#161D2E] border border-white/10 p-3 flex items-center gap-3 rounded-sm shadow-xl z-20"
           >
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
             <span className="font-mono tabular-nums text-xs font-bold text-white uppercase">BREAKING: FED RATE CUT</span>
           </motion.div>

           {/* Early reaction line (Gold) */}
           <div className="absolute inset-0 pt-16">
             <ChartLine path="M 0,200 L 300,200 L 400,100 L 600,50 L 1000,60" color="#F59E0B" strokeWidth={3} delay={0.8} />
           </div>

           {/* Late reaction line (Dim) */}
           <div className="absolute inset-0 pt-16">
             <ChartLine path="M 0,200 L 300,200 L 600,200 L 700,150 L 1000,140" color="#334155" strokeWidth={2} delay={1.5} />
           </div>
        </div>
      </div>
    </div>
  );
}

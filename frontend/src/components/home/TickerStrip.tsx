import { motion } from "framer-motion";

export function TickerStrip() {
  const dummyTickers = ["RELI-X +2.4%", "INFY-Z -1.2%", "HDFC-W +0.8%", "TATA-Y +4.1%", "GOLDCORE +0.2%", "PULSE -5.5%", "BZR-V +8.9%"];
  
  return (
    <div className="relative z-10 w-full overflow-hidden border-y border-white/5 bg-[#0B1120]/50 backdrop-blur-sm py-2">
      {/* Left and Right Fade Masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#070B14] to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#070B14] to-transparent z-20 pointer-events-none" />
      
      <div className="flex w-[200%] animate-marquee whitespace-nowrap">
        {[...dummyTickers, ...dummyTickers, ...dummyTickers, ...dummyTickers].map((ticker, i) => {
          const isUp = ticker.includes('+');
          return (
            <div key={i} className="flex-none w-48 flex items-center gap-2 px-4">
              <span className="font-bold text-slate-400 text-sm tracking-tight">{ticker.split(' ')[0]}</span>
              <span className={`font-mono tabular-nums text-xs font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>{ticker.split(' ')[1]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

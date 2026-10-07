import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";
import { StoryChart } from "./StoryChart";

export function PinnedStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const sectionProgress = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 2]);
  const opacity1 = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.5], [1, 1, 0, 0]);
  const opacity2 = useTransform(scrollYProgress, [0.4, 0.6, 0.8, 1], [0, 1, 1, 1]);

  return (
    <div ref={containerRef} id="explore" className="relative h-[300svh] bg-[#070B14]">
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto w-full px-6 flex flex-col lg:flex-row items-center gap-12 z-10">
          
          {/* Text Content */}
          <div className="flex-1 w-full relative h-[40vh] lg:h-auto min-h-[300px]">
            {/* Round 1 */}
            <motion.div style={{ opacity: opacity1 }} className="absolute inset-0 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-white/5 border border-white/10 text-slate-300 text-[10px] uppercase tracking-widest font-bold mb-4 w-fit">
                Round 1: Retail
              </div>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4 text-white">Baseline Markets</h2>
              <p className="text-slate-400 font-medium mb-6 max-w-md">
                Start with ₹10,00,000. Navigate standard technical overlays like SMA 9, SMA 20, and RSI. Build your wealth in a steady, predictable retail environment before the real game begins.
              </p>
              <div className="flex gap-4">
                <div className="bg-[#111827] border border-white/5 p-4 rounded-sm flex-1">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Capital</div>
                  <div className="font-mono tabular-nums text-white text-xl font-bold">₹10,00,000</div>
                </div>
                <div className="bg-[#111827] border border-white/5 p-4 rounded-sm flex-1">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Pace</div>
                  <div className="font-mono tabular-nums text-emerald-400 text-xl font-bold">Steady</div>
                </div>
              </div>
            </motion.div>

            {/* Round 2 */}
            <motion.div style={{ opacity: opacity2 }} className="absolute inset-0 flex flex-col justify-center pointer-events-none">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase tracking-widest font-bold mb-4 w-fit">
                Round 2: Institutional
              </div>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4 text-white">The AI Order Flow</h2>
              <p className="text-slate-400 font-medium mb-6 max-w-md">
                Scale up to ₹1,00,00,000. The market now reacts to you. Experience institutional order-flow behavior, bid/ask volume walls, and green pulse nodes as you trade against aggressive AI bots.
              </p>
              <div className="flex gap-4 pointer-events-auto">
                <div className="bg-[#111827] border border-white/5 p-4 rounded-sm flex-1">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Capital</div>
                  <div className="font-mono tabular-nums text-white text-xl font-bold">₹1,00,00,000</div>
                </div>
                <div className="bg-[#111827] border border-white/5 p-4 rounded-sm flex-1">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Pace</div>
                  <div className="font-mono tabular-nums text-amber-400 text-xl font-bold">Volatile</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Chart Graphic */}
          <div className="flex-1 w-full h-[40vh] lg:h-[60vh] bg-[#111827] border border-white/5 rounded-sm relative overflow-hidden shadow-2xl">
            <StoryChart progress={sectionProgress} />
          </div>

        </div>
      </div>
    </div>
  );
}

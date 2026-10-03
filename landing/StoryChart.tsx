"use client";

import { motion, useTransform, MotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import { PATHS } from "./chart-paths";

export function StoryChart({ p, isMobile }: { p: MotionValue<number>; isMobile?: boolean }) {
  // Crossfade between 0.30 and 0.62 for lines
  const goldOpacity = useTransform(p, [0, 0.30, 0.62, 1], [1, 1, 0, 0]);
  const greenOpacity = useTransform(p, [0, 0.30, 0.62, 1], [0, 0, 1, 1]);
  
  // Staggered slide and fade for text to avoid overlap
  const goldTextOpacity = useTransform(p, [0, 0.30, 0.40, 1], [1, 1, 0, 0]);
  const goldTextY = useTransform(p, [0, 0.30, 0.40, 1], [0, 0, -10, -10]);
  const greenTextOpacity = useTransform(p, [0, 0.45, 0.55, 1], [0, 0, 1, 1]);
  const greenTextY = useTransform(p, [0, 0.45, 0.55, 1], [10, 10, 0, 0]);
  
  const round1Opacity = useTransform(p, [0, 0.4, 0.5, 1], [1, 1, 0, 0]);
  const round2Opacity = useTransform(p, [0, 0.55, 0.65, 1], [0, 0, 1, 1]);

  const amountRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    return p.on("change", (val) => {
      if (!amountRef.current) return;
      let num = 1000000;
      if (val >= 0.65) num = 10000000;
      else if (val > 0.35) {
        const progress = (val - 0.35) / 0.3;
        num = 1000000 + progress * 9000000;
      }
      amountRef.current.textContent = new Intl.NumberFormat("en-IN").format(Math.floor(num));
    });
  }, [p]);

  const pulseRadius = useTransform(p, [0, 0.65, 0.85, 1], [0, 0, 40, 40]);
  const pulseOpacity = useTransform(p, [0, 0.65, 0.75, 0.85, 1], [0, 0, 1, 0, 0]);
  const gaugeX = useTransform(p, [0, 0.7, 1], [100, 100, 180]);

  const drawVariant = {
    hidden: { pathLength: 0 },
    visible: { 
      pathLength: 1,
      transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] as const }
    }
  };

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-elevated rounded-[20px] overflow-hidden border border-bd-subtle shadow-xl">
      <div className="absolute top-5 left-5 sm:top-6 sm:left-6 z-10 flex flex-col gap-3">
        {/* State Chip */}
        <div className="relative inline-flex items-center gap-2 rounded-full px-3 py-1.5 overflow-hidden">
          <motion.div style={{ opacity: goldOpacity }} className="absolute inset-0 bg-base/80 backdrop-blur-md border border-gold/40 rounded-full" />
          <motion.div style={{ opacity: greenOpacity }} className="absolute inset-0 bg-base/80 backdrop-blur-md border border-green/40 rounded-full" />
          <div className="relative flex items-center gap-2 text-[11px] sm:text-xs font-bold tracking-wide uppercase">
             <motion.span style={{ opacity: goldTextOpacity, y: goldTextY }} className="text-gold absolute left-3 whitespace-nowrap">Round 1 / Retail</motion.span>
             <motion.span style={{ opacity: greenTextOpacity, y: greenTextY }} className="text-green absolute left-3 whitespace-nowrap">Round 2 / Institutional</motion.span>
             <span className="invisible px-1">Round 2 / Institutional</span>
          </div>
        </div>
        
        {/* Starting Capital */}
        <div className="flex flex-col">
          <span className="text-[10px] sm:text-xs text-tx-dim font-bold uppercase tracking-widest">Starting capital</span>
          <span className="text-data text-tx-primary text-base sm:text-lg flex items-baseline gap-1 mt-0.5">
            ₹<span ref={amountRef}>10,00,000</span>
          </span>
        </div>
      </div>

      <motion.svg 
        viewBox="0 0 640 400" 
        className="absolute inset-0 w-full h-full" 
        preserveAspectRatio="xMidYMid slice"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <g stroke="currentColor" strokeWidth="1" strokeOpacity="0.08" strokeLinecap="round">
          {[100, 200, 300].map(y => <line key={`h${y}`} x1="0" y1={y} x2="640" y2={y} />)}
          {[160, 320, 480].map(x => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="400" />)}
        </g>

        {/* Round 1 Underlays */}
        <motion.g style={{ opacity: round1Opacity }}>
          <motion.path variants={drawVariant} d={PATHS.storySma9} fill="none" stroke="var(--color-indigo-val)" strokeWidth="1.5" />
          <motion.path variants={drawVariant} d={PATHS.storySma20} fill="none" stroke="var(--tx-dim)" strokeWidth="1.5" strokeOpacity="0.6" />
          
          <line x1="0" y1="310" x2="640" y2="310" stroke="var(--tx-dim)" strokeDasharray="4 4" strokeWidth="1" opacity="0.3" />
          <line x1="0" y1="360" x2="640" y2="360" stroke="var(--tx-dim)" strokeDasharray="4 4" strokeWidth="1" opacity="0.3" />
          <motion.path variants={drawVariant} d={PATHS.storyRsi} fill="none" stroke="var(--color-indigo-val)" strokeWidth="1.5" />
          
          <text x="16" y="300" fill="var(--tx-dim)" fontSize="10" className="font-mono">RSI</text>
          <text x="16" y="190" fill="var(--color-indigo-val)" fontSize="10" className="font-mono">SMA 9</text>
          <text x="16" y="175" fill="var(--tx-dim)" fontSize="10" className="font-mono">SMA 20</text>
        </motion.g>

        {/* Round 2 Order Flow & Pulse */}
        <motion.g style={{ opacity: round2Opacity }}>
          <line x1="360" y1="150" x2="360" y2="180" stroke="var(--color-red-val)" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <line x1="380" y1="130" x2="380" y2="150" stroke="var(--color-green-val)" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <line x1="400" y1="110" x2="400" y2="160" stroke="var(--color-green-val)" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <line x1="420" y1="120" x2="420" y2="170" stroke="var(--color-green-val)" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <line x1="440" y1="130" x2="440" y2="190" stroke="var(--color-red-val)" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <line x1="460" y1="110" x2="460" y2="150" stroke="var(--color-green-val)" strokeWidth="3" strokeLinecap="round" opacity="0.8" />

          <text x="40" y="335" fill="var(--tx-dim)" fontSize="10" className="font-mono">ORDER IMBALANCE</text>
          <line x1="40" y1="350" x2="220" y2="350" stroke="var(--bd-strong)" strokeWidth="3" strokeLinecap="round" />
          <line x1="130" y1="345" x2="130" y2="355" stroke="var(--tx-dim)" strokeWidth="1" />
          <motion.circle cx={gaugeX} cy="350" r="5" fill="var(--color-green-val)" />
          
          <motion.circle cx="480" cy="90" r={pulseRadius} fill="none" stroke="var(--color-green-val)" strokeWidth="2" style={{ opacity: pulseOpacity }} />
        </motion.g>

        {/* Crossfading Price Paths */}
        <motion.path variants={drawVariant} d={PATHS.storyPrice} fill="none" stroke="var(--color-gold-val)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: goldOpacity }} />
        <motion.path variants={drawVariant} d={PATHS.storyPrice} fill="none" stroke="var(--color-green-val)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: greenOpacity }} />
      </motion.svg>
    </div>
  );
}

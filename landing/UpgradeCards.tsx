"use client";

import { useRef } from "react";
import { m, useScroll, useTransform, LazyMotion, domAnimation } from "motion/react";
import { LANDING_COPY } from "@/lib/landing-content";
import { BookOpen, Zap, Wallet, LockOpen } from "lucide-react";

export default function UpgradeCards() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const drift = useTransform(scrollYProgress, [0, 1], ["3%", "-3%"]);
  const icons = [BookOpen, Zap, Wallet, LockOpen];

  return (
    <div ref={containerRef} className="py-24 sm:py-32 overflow-hidden relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16 sm:mb-24">
         <h2 className="text-chapter text-tx-primary">{LANDING_COPY.upgrades.h2}</h2>
         <p className="text-body text-tx-dim mt-4 mx-auto">{LANDING_COPY.upgrades.body}</p>
      </div>

      <LazyMotion features={domAnimation}>
        <m.div 
          className="hidden md:flex justify-center gap-6"
          style={{ perspective: "1400px", x: drift }}
        >
           {LANDING_COPY.upgrades.cards.map((card, i) => {
             const Icon = icons[i];
             const isLast = i === 3;
             const rotateY = -14 + i * (28 / 3); 
             return (
               <div
                 key={i}
                 className="group relative flex-1 max-w-[280px] p-6 rounded-[20px] bg-card border border-bd-subtle transition-transform duration-150 ease-out hover:border-indigo [transform:rotateY(var(--base-ry))] hover:[transform:rotateY(0deg)] hover:z-10"
                 style={{ 
                   transformStyle: "preserve-3d",
                   "--base-ry": `${rotateY}deg`,
                 } as any}
               >
                  <div className="absolute inset-0 bg-base/40 rounded-[20px] transition-opacity duration-150 opacity-100 group-hover:opacity-0 pointer-events-none" />
                  <Icon className="w-8 h-8 text-indigo mb-6" strokeWidth={1.75} />
                  <h3 className="text-card text-tx-primary mb-2">{card.title}</h3>
                  <p className="text-small text-tx-dim mb-8 min-h-[40px]">{card.desc}</p>
                  
                  <div className="flex items-center justify-between border-t border-bd-subtle pt-4 mt-auto">
                     <span className="text-[10px] font-bold text-tx-dim uppercase tracking-widest">{card.tag}</span>
                     {isLast ? (
                       <div className="w-2.5 h-2.5 rounded border border-indigo bg-indigo/30" />
                     ) : (
                       <div className="flex gap-1.5">
                         {[...Array(5)].map((_, j) => (
                           <div key={j} className="w-1.5 h-1.5 rounded-full border border-tx-dim" />
                         ))}
                       </div>
                     )}
                  </div>
               </div>
             )
           })}
        </m.div>

        {/* Mobile Horizontal scroll snap */}
        <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
           {LANDING_COPY.upgrades.cards.map((card, i) => {
             const Icon = icons[i];
             const isLast = i === 3;
             return (
               <div key={i} className="snap-center shrink-0 w-[78vw] p-6 rounded-[20px] bg-card border border-bd-subtle flex flex-col">
                  <Icon className="w-8 h-8 text-indigo mb-6" strokeWidth={1.75} />
                  <h3 className="text-card text-tx-primary mb-2">{card.title}</h3>
                  <p className="text-small text-tx-dim mb-8">{card.desc}</p>
                  <div className="flex items-center justify-between border-t border-bd-subtle pt-4 mt-auto">
                     <span className="text-[10px] font-bold text-tx-dim uppercase tracking-widest">{card.tag}</span>
                     {isLast ? (
                       <div className="w-2.5 h-2.5 rounded border border-indigo bg-indigo/30" />
                     ) : (
                       <div className="flex gap-1.5">
                         {[...Array(5)].map((_, j) => (
                           <div key={j} className="w-1.5 h-1.5 rounded-full border border-tx-dim" />
                         ))}
                       </div>
                     )}
                  </div>
               </div>
             )
           })}
        </div>
      </LazyMotion>
    </div>
  )
}

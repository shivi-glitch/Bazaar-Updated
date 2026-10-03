"use client";

import { useReveal } from "./useReveal";
import { LANDING_COPY } from "@/lib/landing-content";
import { m, LazyMotion, domAnimation } from "motion/react";

export default function NewsRace() {
  const { ref, isInView } = useReveal(true, 0.4);

  const priceLate = "M 0 100 L 100 100 L 200 95 L 300 90 L 350 90 L 400 95 L 450 40 L 500 20 L 600 30";
  const priceEarly = "M 0 100 L 100 100 L 200 95 L 250 90 L 300 40 L 400 20 L 500 25 L 600 30";

  return (
    <div className="py-24 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
       <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="text-chapter text-tx-primary mb-6">{LANDING_COPY.news.h2}</h2>
            <p className="text-body text-tx-dim">{LANDING_COPY.news.body}</p>
          </div>

          <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-elevated rounded-[20px] border border-bd-subtle overflow-hidden p-6 shadow-2xl">
             <LazyMotion features={domAnimation}>
                {/* Headline Banner slides in */}
                <m.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={isInView ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                  className="absolute top-6 left-6 right-6 bg-red/10 border border-red/30 rounded-lg p-3 z-10 backdrop-blur-sm"
                >
                   <span className="text-[10px] sm:text-xs font-bold text-red uppercase tracking-widest block mb-1">Breaking News</span>
                   <span className="text-xs sm:text-sm font-semibold text-tx-primary">{LANDING_COPY.news.bannerText}</span>
                </m.div>

                <svg viewBox="0 0 600 200" className="absolute bottom-0 left-0 w-full h-[70%]" preserveAspectRatio="none">
                  {/* Late reaction (dim) */}
                  <m.path 
                    d={priceLate} 
                    fill="none" stroke="var(--tx-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                  />
                  {/* Early reaction (gold) */}
                  <m.path 
                    d={priceEarly} 
                    fill="none" stroke="var(--color-gold-val)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                  />
                  
                  {isInView && (
                    <m.g 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 }}
                    >
                      <circle cx="280" cy="90" r="4" fill="var(--color-gold-val)" />
                      <text x="270" y="75" fill="var(--color-gold-val)" fontSize="12" textAnchor="end" className="font-mono">{LANDING_COPY.news.timelineLabels[0]}</text>
                      
                      <circle cx="430" cy="95" r="4" fill="var(--tx-dim)" />
                      <text x="440" y="115" fill="var(--tx-dim)" fontSize="12" className="font-mono">{LANDING_COPY.news.timelineLabels[1]}</text>
                    </m.g>
                  )}
                </svg>
             </LazyMotion>
          </div>
       </div>
    </div>
  )
}

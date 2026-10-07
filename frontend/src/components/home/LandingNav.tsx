import { motion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";

export function LandingNav() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <>
      <nav className="fixed top-0 w-full border-b border-white/5 border-bd-subtle bg-[#070B14]/70 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-black tracking-tighter text-white">MERX</div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="bg-[#111827] border border-white/5 text-white px-5 py-2 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-[#161D2E] hover:border-white/10 transition-colors">
              Participant Login
            </Link>
          </div>
        </div>
      </nav>
      <motion.div 
        className="fixed top-16 left-0 right-0 h-[2px] bg-blue-500 origin-left z-50"
        style={{ scaleX }}
      />
    </>
  );
}

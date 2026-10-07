import { motion, useTransform, MotionValue } from "framer-motion";
import { ChartLine } from "./ChartLine";
import { PATHS } from "./chart-paths";

export function StoryChart({ progress }: { progress: MotionValue<number> }) {
  // progress goes from 0 to 2
  // 0 to 1 -> Round 1
  // 1 to 2 -> Round 2

  const r1Opacity = useTransform(progress, [0, 0.8, 1.2], [1, 1, 0]);
  const r2Opacity = useTransform(progress, [0.8, 1.2, 2], [0, 1, 1]);

  return (
    <div className="w-full h-full relative">
      {/* Grid Lines */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="w-full h-[1px] bg-white/5" />
        ))}
      </div>

      {/* R1 Retail Chart */}
      <motion.div style={{ opacity: r1Opacity }} className="absolute inset-0">
        <ChartLine path={PATHS.storyRetail} color="#F59E0B" strokeWidth={3} />
        {/* Fake indicators */}
        <ChartLine path="M 0,330 L 100,320 L 200,330 L 300,300 L 400,290 L 500,270 L 600,230 L 700,240 L 800,200 L 900,140 L 1000,160" color="#3B82F6" strokeWidth={1} delay={0.5} />
      </motion.div>

      {/* R2 Inst Chart */}
      <motion.div style={{ opacity: r2Opacity }} className="absolute inset-0">
        <ChartLine path={PATHS.storyInst} color="#10B981" strokeWidth={3} />
        
        {/* Fake volume walls */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 flex items-end gap-1 px-4 opacity-30 pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="flex-1 bg-red-500" style={{ height: `${(Math.sin(i * 456.78) * 40 + 50)}%` }} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

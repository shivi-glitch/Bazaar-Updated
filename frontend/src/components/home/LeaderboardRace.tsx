import { motion } from "framer-motion";

export function LeaderboardRace() {
  const teams = [
    { name: "QUANTUM", score: "₹1,24,50,000", width: "95%", color: "bg-blue-500" },
    { name: "APEX", score: "₹1,18,20,000", width: "85%", color: "bg-emerald-500" },
    { name: "NOVA", score: "₹1,05,00,000", width: "70%", color: "bg-amber-500" },
    { name: "ECHO", score: "₹98,00,000", width: "60%", color: "bg-purple-500" },
  ];

  return (
    <div className="bg-[#070B14] py-32 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-6">Real-Time Competition</h2>
        <p className="text-slate-400 font-medium mb-16 text-lg">
          Climb the ranks. The leaderboard updates tick by tick.
        </p>

        <div className="space-y-6 text-left">
          {teams.map((team, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-8 font-mono tabular-nums font-bold text-slate-500 text-right">0{i+1}</div>
              <div className="flex-1 bg-[#111827] h-12 rounded-sm border border-white/5 relative overflow-hidden flex items-center">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: team.width }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
                  className={`absolute left-0 top-0 bottom-0 ${team.color} opacity-20`}
                />
                <div className="relative z-10 flex justify-between w-full px-4">
                  <span className="font-bold text-white tracking-wider">{team.name}</span>
                  <span className="font-mono tabular-nums font-bold text-slate-300">{team.score}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

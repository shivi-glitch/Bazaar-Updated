"use client";

import { LineChart, Briefcase, Newspaper, Zap } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Market", path: "/market", icon: LineChart },
    { name: "Portfolio", path: "/portfolio", icon: Briefcase },
    { name: "News", path: "/news", icon: Newspaper },
    { name: "Stats", path: "/stats", icon: Zap }
  ];

  return (
    <div className="absolute bottom-0 w-full bg-bg-raised border-t border-bd-subtle flex justify-around items-center h-16 pb-safe z-50">
      {navItems.map((item) => (
        <button 
          key={item.name}
          onClick={() => router.push(item.path)}
          className={clsx(
            "flex flex-col items-center flex-1 py-2 font-mono transition-colors", 
            pathname === item.path ? "text-accent" : "text-tx-muted hover:text-tx-primary"
          )}
        >
          <item.icon className="w-4 h-4 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
        </button>
      ))}
    </div>
  );
}

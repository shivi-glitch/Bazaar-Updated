"use client";

import { LineChart, Briefcase, Newspaper, Zap, Lock } from "lucide-react";
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
    <div className="absolute bottom-0 w-full bg-white border-t border-slate-200 flex justify-around items-center h-16 pb-safe z-50">
      {navItems.map((item) => (
        <button 
          key={item.name}
          onClick={() => router.push(item.path)}
          className={clsx(
            "flex flex-col items-center flex-1 py-2", 
            pathname === item.path ? "text-meridian-brand" : "text-meridian-muted"
          )}
        >
          <item.icon className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">{item.name}</span>
        </button>
      ))}
    </div>
  );
}

import React from "react";

export function MobileWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center">
      <main className="w-full h-screen sm:h-[850px] max-w-[400px] bg-slate-50 sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col relative">
        {children}
      </main>
    </div>
  );
}

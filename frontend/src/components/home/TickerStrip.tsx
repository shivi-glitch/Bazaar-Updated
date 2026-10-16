"use client";

export function TickerStrip() {
  const tickers = [
    { symbol: "RLNT", change: "+2.4%" },
    { symbol: "INFN", change: "-1.2%" },
    { symbol: "HRZN", change: "+0.8%" },
    { symbol: "TYRL", change: "+4.1%" },
    { symbol: "GOLDCORE", change: "+0.2%" },
    { symbol: "PULSE",   change: "-5.5%" },
    { symbol: "BZR-V",   change: "+8.9%" },
    { symbol: "ZENITH",  change: "-2.1%" },
    { symbol: "APEX-M",  change: "+1.7%" },
  ];

  const items = [...tickers, ...tickers, ...tickers, ...tickers];

  return (
    <div
      className="relative z-10 w-full overflow-hidden border-y border-bd-subtle bg-bg-base py-2.5"
      aria-label="Live simulated market prices"
    >
      <div className="sr-only">Live simulated market prices</div>

      {/* Fade masks — use bg-bg-void to match page bg */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-bg-void to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-bg-void to-transparent z-20 pointer-events-none" />

      <div
        className="flex whitespace-nowrap animate-marquee"
        aria-hidden="true"
        style={{ width: "200%" }}
      >
        {items.map((t, i) => {
          const isUp = t.change.startsWith("+");
          return (
            <div
              key={i}
              className="flex-none flex items-center gap-2 px-5"
            >
              <span className="font-mono text-[12px] font-semibold text-tx-secondary tracking-wide">
                {t.symbol}
              </span>
              <span className={`font-mono text-[12px] font-bold tabular-nums ${isUp ? "text-gain" : "text-loss"}`}>
                {isUp ? "▲" : "▼"} {t.change}
              </span>
              <span className="text-bd-strong text-[10px] ml-1">·</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

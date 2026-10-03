import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const TICKER_ITEMS = [
  { ticker: "NXGEN",  price: "₹4,210.50", delta: "+3.82%", up: true  },
  { ticker: "VRTEX",  price: "₹1,088.20", delta: "-1.44%", up: false },
  { ticker: "SOLARA", price: "₹2,674.75", delta: "+6.21%", up: true  },
  { ticker: "KRONO",  price: "₹890.40",   delta: "-0.93%", up: false },
  { ticker: "AXIOM",  price: "₹3,342.00", delta: "+2.05%", up: true  },
  { ticker: "PYLON",  price: "₹712.30",   delta: "+4.17%", up: true  },
];

export default function TickerStrip() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS]; // Extra copies to fill wide screens
  return (
    <div className="relative overflow-hidden border-y border-bd-subtle py-4 bg-elevated/40 backdrop-blur-md">
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10"
        style={{ background: "linear-gradient(to right, var(--color-base), transparent)" }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10"
        style={{ background: "linear-gradient(to left, var(--color-base), transparent)" }}
      />

      <div className="flex gap-10 w-max animate-ticker [prefers-reduced-motion:reduce]:animation-paused">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 shrink-0 px-2 group">
            <span className="font-mono text-sm font-semibold tracking-wider text-tx-primary">
              {item.ticker}
            </span>
            <span className="font-mono text-sm tabular-nums text-tx-dim">
              {item.price}
            </span>
            <span
              className={`flex items-center gap-0.5 font-mono text-sm tabular-nums font-semibold ${
                item.up ? "text-green" : "text-red"
              }`}
            >
              {item.up ? (
                <ArrowUpRight size={14} strokeWidth={2.5} />
              ) : (
                <ArrowDownRight size={14} strokeWidth={2.5} />
              )}
              {item.delta}
            </span>
            <span className="text-bd-subtle text-xs mx-1">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}

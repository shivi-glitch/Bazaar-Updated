"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useMarketStore } from "@/store/marketStore";

interface TradeModalProps {
  ticker: string;
  currentPricePaise: number;
  onClose: () => void;
}

const EMPTY_HISTORY: { time: number; value: number }[] = [];

export function TradeModal({ ticker, currentPricePaise, onClose }: TradeModalProps) {
  const [qty, setQty] = useState<number | string>(1);
  const [currentPos, setCurrentPos] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const history = useMarketStore(s => s.priceHistory[ticker]);
  const priceHistory = history || EMPTY_HISTORY;

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        const token = localStorage.getItem("merx_token");
        const data = await api.get("/portfolio", token || "");
        const pos = data.positions.find((p: any) => p.ticker === ticker);
        if (pos) setCurrentPos(pos.qty);
      } catch (err) {}
    };
    fetchPosition();
  }, [ticker]);

  const numericQty = typeof qty === "number" ? qty : parseInt(qty) || 0;
  const currentPrice = currentPricePaise / 100;
  const notional = numericQty * currentPrice;
  const fee = Math.round(notional * 0.001 * 100) / 100; 
  const total = notional + fee;

  let leftLabel = "SELL";
  let rightLabel = "BUY";
  if (currentPos > 0) {
     leftLabel = numericQty > currentPos ? "SELL & SHORT" : "SELL";
     rightLabel = "BUY";
  } else if (currentPos < 0) {
     leftLabel = "SHORT";
     rightLabel = numericQty > Math.abs(currentPos) ? "COVER & BUY" : "COVER";
  } else {
     leftLabel = "SHORT";
     rightLabel = "BUY";
  }

  const executeTrade = async (side: "BUY" | "SELL") => {
    if (numericQty < 1) {
      setError("Quantity must be at least 1"); return;
    }
    setLoading(true); setError("");
    try {
      const token = localStorage.getItem("merx_token");
      await api.post("/orders", {
        client_key: crypto.randomUUID(), ticker, side, qty: numericQty, type: "MARKET"
      }, token || undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || "Trade failed");
    } finally {
      setLoading(false);
    }
  };

  const renderSparkline = () => {
    if (priceHistory.length < 2) return <div className="h-[50px] w-full flex items-center justify-center text-xs text-slate-400">Gathering data...</div>;
    
    const values = priceHistory.map(p => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const width = 300;
    const height = 50;
    
    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    }).join(" ");

    const isUp = values[values.length - 1] >= values[0];
    const color = isUp ? "#10b981" : "#ef4444"; 

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="my-4 overflow-visible px-2">
        <polyline fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
      </svg>
    );
  };

  return (
    <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
        <div className="flex justify-between items-center mb-2">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{ticker}</h2>
            {currentPos !== 0 && (
              <span className={`text-xs font-bold ${currentPos > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                Holding: {Math.abs(currentPos)} {currentPos > 0 ? "LONG" : "SHORT"}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold text-xl px-2 mb-4">×</button>
        </div>

        <div className="text-center">
          <div className="text-3xl font-mono font-bold tracking-tight text-slate-900 dark:text-white">₹{currentPrice.toFixed(2)}</div>
        </div>

        {renderSparkline()}

        {error && <div className="mb-4 text-center text-sm font-bold text-red-500 bg-red-50 dark:bg-red-500/10 py-2 rounded-lg">{error}</div>}

        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 p-2 rounded-xl mb-6">
          <button onClick={() => setQty(Math.max(1, numericQty - 1))} className="touch-target bg-white dark:bg-slate-700 shadow-sm rounded-lg font-bold text-xl text-blue-600 dark:text-blue-400 w-12">-</button>
          <input
            type="number" min="1" value={qty}
            onChange={(e) => setQty(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
            className="w-24 text-center font-bold text-xl text-slate-900 dark:text-white bg-transparent outline-none font-mono"
          />
          <button onClick={() => setQty(numericQty + 1)} className="touch-target bg-white dark:bg-slate-700 shadow-sm rounded-lg font-bold text-xl text-blue-600 dark:text-blue-400 w-12">+</button>
        </div>

        <div className="space-y-2 mb-6 text-sm text-slate-500 dark:text-slate-400 px-2">
          <div className="flex justify-between"><span>Value</span> <span className="font-mono text-slate-900 dark:text-slate-200">₹{notional.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Est. Fee (0.10%)</span> <span className="font-mono text-slate-900 dark:text-slate-200">₹{fee.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
            <span>Total Cost</span> <span className="font-mono">₹{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button disabled={loading} onClick={() => executeTrade("SELL")} className="flex-1 py-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50 flex flex-col items-center justify-center leading-tight">
            {leftLabel}
          </button>
          <button disabled={loading} onClick={() => executeTrade("BUY")} className="flex-1 py-4 bg-emerald-500 dark:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform disabled:opacity-50 flex flex-col items-center justify-center leading-tight">
            {rightLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

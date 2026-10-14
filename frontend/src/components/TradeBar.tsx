"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useMarketStore } from "@/store/marketStore";
import { Button } from "./ui/Button";
import clsx from "clsx";

interface TradeBarProps {
  ticker: string;
  currentPricePaise: number;
}

export function TradeBar({ ticker, currentPricePaise }: TradeBarProps) {
  const [qty, setQty] = useState<number | string>(1);
  const [currentPos, setCurrentPos] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState<"buy" | "sell" | null>(null);

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
    setFlash(side.toLowerCase() as "buy" | "sell");
    setTimeout(() => setFlash(null), 300);

    try {
      const token = localStorage.getItem("merx_token");
      await api.post("/orders", {
        client_key: crypto.randomUUID(), ticker, side, qty: numericQty, type: "MARKET"
      }, token || undefined);
    } catch (err: any) {
      setError(err.message || "Trade failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed bottom-0 left-0 w-full bg-bg-raised border-t border-bd-subtle shadow-modal z-30"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {error && (
        <div className="absolute bottom-full left-0 w-full bg-loss-dim border-t border-loss-border text-loss text-center py-1 text-[11px] font-bold">
          {error}
        </div>
      )}
      <div className={clsx(
        "absolute inset-0 transition-opacity duration-300 pointer-events-none opacity-0 z-0",
        flash === "buy" ? "bg-gain-dim opacity-100" : "",
        flash === "sell" ? "bg-loss-dim opacity-100" : ""
      )} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[80px] flex items-center justify-between gap-4 relative z-10">
        
        {/* Ticker & Price */}
        <div className="flex flex-col min-w-0 shrink">
          <div className="flex items-center gap-2 truncate">
            <span className="text-[14px] sm:text-[16px] font-bold text-tx-primary truncate">{ticker}</span>
            {currentPos !== 0 && (
              <span className={clsx(
                "hidden sm:inline text-[10px] uppercase font-bold tracking-[0.06em] px-1.5 py-0.5 rounded-xs border",
                currentPos > 0 ? "text-gain bg-gain-dim border-gain-border" : "text-loss bg-loss-dim border-loss-border"
              )}>
                {Math.abs(currentPos)} {currentPos > 0 ? "LONG" : "SHORT"}
              </span>
            )}
          </div>
          <span className="text-[14px] sm:text-[18px] font-mono font-bold text-tx-secondary tabular-nums">
            ₹{currentPrice.toFixed(2)}
          </span>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center bg-bg-void border border-bd-subtle rounded-md h-[44px] shrink-0">
          <button 
            onClick={() => setQty(Math.max(1, numericQty - 1))}
            className="touch-target w-[44px] text-tx-secondary hover:text-tx-primary active:bg-bg-raised transition-colors"
            aria-label="Decrease quantity"
          >-</button>
          <input
            type="number" min="1" value={qty}
            onChange={(e) => setQty(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
            className="w-12 sm:w-16 h-full text-center font-mono font-bold text-[14px] sm:text-[16px] bg-transparent text-tx-primary outline-none focus:bg-bg-raised transition-colors"
            aria-label="Trade quantity"
          />
          <button 
            onClick={() => setQty(numericQty + 1)}
            className="touch-target w-[44px] text-tx-secondary hover:text-tx-primary active:bg-bg-raised transition-colors"
            aria-label="Increase quantity"
          >+</button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <Button 
            variant="sell" size="md" 
            isLoading={loading} onClick={() => executeTrade("SELL")}
            className="w-[80px] sm:w-[100px]"
          >
            {leftLabel}
          </Button>
          <Button 
            variant="buy" size="md" 
            isLoading={loading} onClick={() => executeTrade("BUY")}
            className="w-[80px] sm:w-[100px]"
          >
            {rightLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

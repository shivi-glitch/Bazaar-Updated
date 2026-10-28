"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useMarketStore } from "@/store/marketStore";
import { Button } from "./ui/Button";
import clsx from "clsx";

interface TradeBarProps {
  ticker: string;
  currentPricePaise: number;
  variant?: "bar" | "card" | "fullscreen";
  className?: string;
}

export function TradeBar({ ticker, currentPricePaise, variant = "bar", className }: TradeBarProps) {
  const [qty, setQty] = useState<number | string>(1);
  const [currentPos, setCurrentPos] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState<"buy" | "sell" | null>(null);

  const portfolioData = useMarketStore((s) => s.portfolioData);
  const setPortfolioData = useMarketStore((s) => s.setPortfolioData);

  const refreshPosition = async () => {
    try {
      const token = localStorage.getItem("merx_token");
      if (!token) return;
      const data = await api.get("/portfolio", token);
      setPortfolioData(data);
      const pos = data.positions?.find((p: any) => p.ticker === ticker);
      setCurrentPos(pos ? pos.qty : 0);
    } catch (err) {}
  };

  useEffect(() => {
    refreshPosition();
  }, [ticker]);

  useEffect(() => {
    if (portfolioData?.positions) {
      const pos = portfolioData.positions.find((p: any) => p.ticker === ticker);
      setCurrentPos(pos ? pos.qty : 0);
    } else if (portfolioData && !portfolioData.positions?.length) {
      setCurrentPos(0);
    }
  }, [portfolioData, ticker]);

  const numericQty = typeof qty === "number" ? qty : parseInt(qty) || 0;

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
      
      // Auto-update position immediately without requiring page refresh
      await refreshPosition();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("merx_portfolio_refresh"));
      }
    } catch (err: any) {
      setError(err.message || "Trade failed");
    } finally {
      setLoading(false);
    }
  };

  // FULLSCREEN DOCK VARIANT (Dedicated for Fullscreen Chart)
  if (variant === "fullscreen") {
    const notionalValue = ((numericQty * currentPricePaise) / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return (
      <div className={clsx(
        "w-full bg-[#0B1120]/95 border-t border-white/10 backdrop-blur-xl px-3 sm:px-6 py-2 sm:py-2.5 shadow-2xl relative shrink-0 z-20",
        className
      )}>
        {/* Flash background */}
        <div className={clsx(
          "absolute inset-0 transition-opacity duration-300 pointer-events-none opacity-0 z-0",
          flash === "buy" ? "bg-gain-dim opacity-100" : "",
          flash === "sell" ? "bg-loss-dim opacity-100" : ""
        )} />

        {/* Error notification banner if error occurs */}
        {error && (
          <div className="absolute bottom-full left-0 w-full bg-loss-dim/95 border-t border-loss-border text-loss text-center py-1 text-[11px] font-mono font-bold z-30">
            {error}
          </div>
        )}

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 relative z-10">
          {/* Left: Position & Lots Stepper (Presets removed for clean UI) */}
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4 w-full sm:w-auto">
            {/* Position Chip */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-mono uppercase text-tx-muted font-bold">Position</span>
              {currentPos > 0 ? (
                <span className="font-mono font-bold text-[11px] sm:text-[12px] text-gain bg-gain-dim border border-gain-border px-2 py-0.5 rounded inline-flex items-center gap-1 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
                  LONG {currentPos}
                </span>
              ) : currentPos < 0 ? (
                <span className="font-mono font-bold text-[11px] sm:text-[12px] text-loss bg-loss-dim border border-loss-border px-2 py-0.5 rounded inline-flex items-center gap-1 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-loss animate-pulse" />
                  SHORT {Math.abs(currentPos)}
                </span>
              ) : (
                <span className="font-mono font-bold text-[11px] text-tx-muted bg-bg-raised border border-bd-subtle px-2 py-0.5 rounded">
                  FLAT 0
                </span>
              )}
            </div>

            {/* Lots Stepper */}
            <div className="flex items-center bg-bg-void border border-bd-subtle rounded-lg h-[36px] overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, numericQty - 1))}
                className="w-8 sm:w-9 h-full text-tx-secondary hover:text-tx-primary hover:bg-bg-raised active:bg-bg-overlay font-bold text-[16px] transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Decrease quantity"
              >-</button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={qty}
                onFocus={(e) => {
                  setTimeout(() => {
                    e.target.scrollIntoView({ block: "center", behavior: "smooth" });
                  }, 200);
                }}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setQty(val === "" ? "" : Math.max(1, parseInt(val, 10)));
                }}
                className="w-12 sm:w-16 h-full text-center font-mono font-bold text-[14px] bg-transparent text-tx-primary outline-none focus:bg-bg-raised transition-colors"
                aria-label="Trade quantity"
              />
              <button
                type="button"
                onClick={() => setQty(numericQty + 1)}
                className="w-8 sm:w-9 h-full text-tx-secondary hover:text-tx-primary hover:bg-bg-raised active:bg-bg-overlay font-bold text-[16px] transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Increase quantity"
              >+</button>
            </div>

            {/* Estimated Outlay Value */}
            <div className="flex items-center gap-1 text-[11px] font-mono text-tx-muted">
              <span className="hidden xs:inline">Est:</span>
              <span className="font-bold text-tx-primary">₹{notionalValue}</span>
            </div>
          </div>

          {/* Right: Buy & Sell Action Buttons */}
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
            <Button
              variant="sell"
              size="sm"
              isLoading={loading}
              onClick={() => executeTrade("SELL")}
              className="font-mono font-bold tracking-wider py-2.5 sm:py-2 sm:min-w-[105px] cursor-pointer shadow-sm text-[13px] rounded-lg"
            >
              {leftLabel}
            </Button>
            <Button
              variant="buy"
              size="sm"
              isLoading={loading}
              onClick={() => executeTrade("BUY")}
              className="font-mono font-bold tracking-wider py-2.5 sm:py-2 sm:min-w-[105px] cursor-pointer shadow-sm text-[13px] rounded-lg"
            >
              {rightLabel}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // DESKTOP CARD VARIANT
  if (variant === "card") {
    const notionalValue = ((numericQty * currentPricePaise) / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return (
      <div className={clsx(
        "bg-bg-raised/75 border border-bd-subtle rounded-xl p-5 shadow-card relative overflow-hidden flex flex-col gap-4",
        className
      )}>
        {/* Flash indicator */}
        <div className={clsx(
          "absolute inset-0 transition-opacity duration-300 pointer-events-none opacity-0 z-0",
          flash === "buy" ? "bg-gain-dim opacity-100" : "",
          flash === "sell" ? "bg-loss-dim opacity-100" : ""
        )} />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-bd-hairline pb-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-tx-muted">
              Order Ticket
            </span>
          </div>
          <span className="text-sm font-semibold text-tx-primary tabular-nums">
            ₹{(currentPricePaise / 100).toFixed(2)}
          </span>
        </div>

        {/* Current Position Status */}
        <div className="bg-bg-void border border-bd-subtle rounded-lg p-3 flex items-center justify-between relative z-10">
          <span className="text-xs font-medium text-tx-secondary">Position</span>
          <div>
            {currentPos > 0 ? (
              <span className="font-semibold text-xs text-gain bg-gain-dim border border-gain-border px-2.5 py-0.5 rounded-md inline-flex items-center gap-1.5 tabular-nums">
                <span className="w-1.5 h-1.5 rounded-full bg-gain" />
                LONG: {currentPos}
              </span>
            ) : currentPos < 0 ? (
              <span className="font-semibold text-xs text-loss bg-loss-dim border border-loss-border px-2.5 py-0.5 rounded-md inline-flex items-center gap-1.5 tabular-nums">
                <span className="w-1.5 h-1.5 rounded-full bg-loss" />
                SHORT: {Math.abs(currentPos)}
              </span>
            ) : (
              <span className="font-medium text-xs text-tx-muted bg-bg-raised border border-bd-subtle px-2.5 py-0.5 rounded-md tabular-nums">
                FLAT: 0
              </span>
            )}
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="space-y-2 relative z-10">
          <div className="flex justify-between items-center text-[11px] font-mono text-tx-secondary">
            <span className="uppercase tracking-wider font-medium">Lots</span>
            <span className="text-tx-muted font-bold">1 Lot = 1 Share</span>
          </div>
          <div className="flex items-center bg-bg-void border border-bd-subtle rounded-lg h-[44px] w-full overflow-hidden">
            <button 
              onClick={() => setQty(Math.max(1, numericQty - 1))}
              className="w-12 h-full text-tx-secondary hover:text-tx-primary hover:bg-bg-raised active:bg-bg-overlay font-bold text-[18px] transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Decrease quantity"
            >-</button>
            <input
              type="number" min="1" value={qty}
              onChange={(e) => setQty(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
              className="flex-1 h-full text-center font-mono font-bold text-[15px] bg-transparent text-tx-primary outline-none focus:bg-bg-raised transition-colors"
              aria-label="Trade quantity"
            />
            <button 
              onClick={() => setQty(numericQty + 1)}
              className="w-12 h-full text-tx-secondary hover:text-tx-primary hover:bg-bg-raised active:bg-bg-overlay font-bold text-[18px] transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Increase quantity"
            >+</button>
          </div>
          
          {/* Quick Presets */}
          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            {[1, 5, 10, 25].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setQty(preset)}
                className={clsx(
                  "py-1 text-[11px] font-mono font-bold rounded border transition-colors cursor-pointer",
                  numericQty === preset 
                    ? "bg-accent-dim border-accent-border text-accent" 
                    : "bg-bg-void border-bd-subtle text-tx-muted hover:text-tx-primary hover:border-bd-strong"
                )}
              >
                +{preset}
              </button>
            ))}
          </div>
        </div>

        {/* Estimated Outlay */}
        <div className="flex items-center justify-between text-[11px] font-mono text-tx-muted pt-1 border-t border-bd-hairline relative z-10">
          <span>Est. Value</span>
          <span className="font-bold text-tx-primary">₹{notionalValue}</span>
        </div>

        {/* Inline Error */}
        {error && (
          <div className="bg-loss-dim border border-loss-border text-loss text-center py-1.5 px-2 rounded-md text-[11px] font-mono font-bold relative z-10">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2.5 pt-1 relative z-10">
          <Button 
            variant="sell" size="md" 
            isLoading={loading} onClick={() => executeTrade("SELL")}
            className="w-full font-mono font-bold tracking-wider py-2.5 cursor-pointer"
          >
            {leftLabel}
          </Button>
          <Button 
            variant="buy" size="md" 
            isLoading={loading} onClick={() => executeTrade("BUY")}
            className="w-full font-mono font-bold tracking-wider py-2.5 cursor-pointer"
          >
            {rightLabel}
          </Button>
        </div>
      </div>
    );
  }

  // MOBILE BOTTOM BAR VARIANT
  return (
    <div 
      className={clsx(
        "fixed bottom-0 left-0 w-full bg-bg-raised border-t border-bd-subtle shadow-modal z-30",
        className
      )}
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[76px] flex items-center justify-between gap-4 relative z-10">
        
        {/* Position Display Only */}
        <div className="flex flex-col justify-center min-w-0 shrink">
          <div className="text-[10px] font-mono font-bold text-tx-muted uppercase tracking-wider mb-0.5">
            Position
          </div>
          <div>
            {currentPos > 0 ? (
              <span className="font-mono font-bold text-[12px] sm:text-[14px] text-gain bg-gain-dim border border-gain-border px-2 py-0.5 rounded-md inline-flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
                LONG: {currentPos}
              </span>
            ) : currentPos < 0 ? (
              <span className="font-mono font-bold text-[12px] sm:text-[14px] text-loss bg-loss-dim border border-loss-border px-2 py-0.5 rounded-md inline-flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-loss animate-pulse" />
                SHORT: {Math.abs(currentPos)}
              </span>
            ) : (
              <span className="font-mono font-bold text-[11px] sm:text-[12px] text-tx-secondary bg-bg-void border border-bd-subtle px-2 py-0.5 rounded-md inline-block">
                FLAT: 0
              </span>
            )}
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center bg-bg-void border border-bd-subtle rounded-md h-[40px] shrink-0">
          <button 
            onClick={() => setQty(Math.max(1, numericQty - 1))}
            className="touch-target w-[40px] text-tx-secondary hover:text-tx-primary active:bg-bg-raised transition-colors flex items-center justify-center font-bold text-[16px] cursor-pointer"
            aria-label="Decrease quantity"
          >-</button>
          <input
            type="number" min="1" value={qty}
            onChange={(e) => setQty(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
            className="w-12 sm:w-16 h-full text-center font-mono font-bold text-[14px] sm:text-[15px] bg-transparent text-tx-primary outline-none focus:bg-bg-raised transition-colors"
            aria-label="Trade quantity"
          />
          <button 
            onClick={() => setQty(numericQty + 1)}
            className="touch-target w-[40px] text-tx-secondary hover:text-tx-primary active:bg-bg-raised transition-colors flex items-center justify-center font-bold text-[16px] cursor-pointer"
            aria-label="Increase quantity"
          >+</button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <Button 
            variant="sell" size="md" 
            isLoading={loading} onClick={() => executeTrade("SELL")}
            className="w-[80px] sm:w-[95px] cursor-pointer"
          >
            {leftLabel}
          </Button>
          <Button 
            variant="buy" size="md" 
            isLoading={loading} onClick={() => executeTrade("BUY")}
            className="w-[80px] sm:w-[95px] cursor-pointer"
          >
            {rightLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

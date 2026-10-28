"use client";

import { useMarketStore } from "@/store/marketStore";
import { Briefcase, TrendingUp, TrendingDown, Wallet } from "lucide-react";

export function PortfolioTab() {
  const portfolio = useMarketStore((s) => s.portfolioData);

  const formatMoney = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (!portfolio) {
    return (
      <div className="p-8 sm:p-12 text-center text-tx-muted font-mono text-[13px] mt-10 animate-pulse">
        Connecting to clearinghouse & computing real-time portfolio...
      </div>
    );
  }

  const positions = portfolio.positions || [];

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6">
      
      {/* ─── Fluid Overview Panel: Just Total Size & Available Cash ─── */}
      <div className="w-full bg-bg-raised/80 border border-bd-subtle rounded-2xl p-5 sm:p-7 md:p-8 relative overflow-hidden shadow-card backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 relative z-10">
          
          {/* Total Size: Sum of Cash and Portfolio Value */}
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-accent-dim border border-accent-border flex items-center justify-center text-accent">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-tx-secondary">
                Total Portfolio Value (Cash + Holdings)
              </span>
            </div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-tx-primary leading-tight tabular-nums">
              {formatMoney(portfolio.equity_paise)}
            </div>
          </div>

          {/* Available Cash */}
          <div className="space-y-1 sm:space-y-2 md:border-l md:border-bd-hairline md:pl-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gain-dim border border-gain-border flex items-center justify-center text-gain">
                <span className="text-xs font-bold">₹</span>
              </div>
              <span className="text-xs font-medium text-tx-secondary">
                Available Cash
              </span>
            </div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-emerald-400 leading-tight tabular-nums">
              {formatMoney(portfolio.cash_paise)}
            </div>
          </div>

        </div>
      </div>

      {/* ─── Active Positions ─── */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold text-tx-secondary flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-accent" />
            <span>Active Positions</span>
          </h3>
          <span className="text-xs text-tx-muted tabular-nums">
            {positions.length} Open Position{positions.length === 1 ? "" : "s"}
          </span>
        </div>

        {positions.length === 0 ? (
          <div className="w-full text-center py-12 sm:py-16 px-4 bg-bg-raised/40 rounded-xl border border-dashed border-bd-subtle text-tx-muted space-y-2">
            <Briefcase className="w-8 h-8 mx-auto opacity-25" />
            <div className="text-xs font-semibold text-tx-secondary">
              No open market positions
            </div>
            <p className="text-xs text-tx-muted max-w-sm mx-auto">
              Select an asset from the Markets tab to enter buy or sell orders.
            </p>
          </div>
        ) : (
          <div className="w-full space-y-2.5">
            {positions.map((pos: any) => {
              const isShort = pos.qty < 0;
              const displayQty = Math.abs(pos.qty);
              const posType = isShort ? "SHORT" : "LONG";
              const pl = (pos.current_price_paise - pos.average_cost_paise) * pos.qty;
              const isProfit = pl >= 0;

              return (
                <div 
                  key={pos.ticker} 
                  className="w-full bg-bg-raised/75 hover:bg-bg-raised border border-bd-subtle hover:border-bd-strong rounded-xl p-4 sm:p-5 flex flex-col xs:flex-row xs:items-center justify-between gap-3 sm:gap-4 transition-all shadow-card"
                >
                  {/* Position details */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-lg text-tx-primary tracking-tight font-sans">
                        {pos.ticker}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                        isShort ? "bg-loss-dim border-loss-border text-loss" : "bg-gain-dim border-gain-border text-gain"
                      }`}>
                        {posType}
                      </span>
                    </div>
                    <div className="text-xs text-tx-secondary mt-1 flex items-center gap-2 tabular-nums">
                      <span><strong className="text-tx-primary font-semibold">{displayQty}</strong> units</span>
                      <span className="text-bd-strong">•</span>
                      <span>Avg: {formatMoney(pos.average_cost_paise)}</span>
                    </div>
                  </div>

                  {/* Prices & PnL */}
                  <div className="flex items-center justify-between xs:justify-end gap-5 sm:gap-8 text-right pt-2 xs:pt-0 border-t xs:border-t-0 border-bd-hairline">
                    <div>
                      <div className="text-[11px] text-tx-muted font-medium">Mark Price</div>
                      <div className="font-semibold text-sm sm:text-base text-tx-primary tabular-nums">
                        {formatMoney(pos.current_price_paise)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] text-tx-muted font-medium">Unrealized P&amp;L</div>
                      <div className={`font-semibold text-sm sm:text-base flex items-center justify-end gap-1 tabular-nums ${
                        isProfit ? "text-gain" : "text-loss"
                      }`}>
                        {isProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span>{isProfit ? "+" : ""}{formatMoney(pl)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default PortfolioTab;

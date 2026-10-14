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
        {/* Subtle ambient glow */}
        <div
          className="absolute -top-16 -right-16 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 relative z-10">
          
          {/* Total Size: Sum of Cash and Portfolio Value */}
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-accent-dim border border-accent-border flex items-center justify-center text-accent">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold text-tx-muted uppercase tracking-wider">
                Total Size (Cash + Portfolio Value)
              </span>
            </div>
            <div className="text-[clamp(26px,5vw,46px)] font-mono font-bold tracking-tight text-tx-primary leading-tight">
              {formatMoney(portfolio.equity_paise)}
            </div>
          </div>

          {/* Available Cash */}
          <div className="space-y-1 sm:space-y-2 md:border-l md:border-bd-hairline md:pl-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gain-dim border border-gain-border flex items-center justify-center text-gain">
                <span className="font-mono text-[11px] font-bold">₹</span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold text-tx-muted uppercase tracking-wider">
                Available Cash
              </span>
            </div>
            <div className="text-[clamp(24px,4.5vw,40px)] font-mono font-bold tracking-tight text-accent leading-tight">
              {formatMoney(portfolio.cash_paise)}
            </div>
          </div>

        </div>
      </div>

      {/* ─── Active Positions ─── */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[11px] font-mono font-bold text-tx-secondary uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-accent" />
            <span>Active Trading Desk</span>
          </h3>
          <span className="text-[10px] sm:text-[11px] font-mono text-tx-muted">
            {positions.length} Open Position{positions.length === 1 ? "" : "s"}
          </span>
        </div>

        {positions.length === 0 ? (
          <div className="w-full text-center py-12 sm:py-16 px-4 bg-bg-raised/40 rounded-xl border border-dashed border-bd-subtle text-tx-muted space-y-2">
            <Briefcase className="w-8 h-8 mx-auto opacity-25" />
            <div className="text-[12px] font-mono uppercase tracking-wider font-semibold">
              No open market positions
            </div>
            <p className="text-[12px] text-tx-secondary max-w-sm mx-auto">
              Select an asset from the Markets tab to enter long or short positions.
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
                  className="w-full bg-bg-raised/75 hover:bg-bg-raised border border-bd-subtle hover:border-accent-border/60 rounded-xl p-4 sm:p-5 flex flex-col xs:flex-row xs:items-center justify-between gap-3 sm:gap-4 transition-all shadow-card"
                >
                  {/* Position details */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[clamp(17px,2vw,20px)] text-tx-primary tracking-tight font-sans">
                        {pos.ticker}
                      </span>
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        isShort ? "bg-loss-dim border-loss-border text-loss" : "bg-gain-dim border-gain-border text-gain"
                      }`}>
                        {posType}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-tx-secondary mt-1 flex items-center gap-1.5 sm:gap-2">
                      <span><strong className="text-tx-primary">{displayQty}</strong> units</span>
                      <span className="text-bd-strong">•</span>
                      <span>Avg: {formatMoney(pos.average_cost_paise)}</span>
                    </div>
                  </div>

                  {/* Prices & PnL */}
                  <div className="flex items-center justify-between xs:justify-end gap-4 sm:gap-6 text-right pt-2 xs:pt-0 border-t xs:border-t-0 border-bd-hairline">
                    <div>
                      <div className="text-[9px] sm:text-[10px] font-mono text-tx-muted uppercase">Mark Price</div>
                      <div className="font-mono font-bold text-[14px] sm:text-[16px] text-tx-primary">
                        {formatMoney(pos.current_price_paise)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] sm:text-[10px] font-mono text-tx-muted uppercase">Unrealized PnL</div>
                      <div className={`font-mono font-bold text-[14px] sm:text-[16px] flex items-center justify-end gap-1 ${
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

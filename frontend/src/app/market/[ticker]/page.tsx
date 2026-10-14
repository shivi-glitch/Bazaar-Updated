"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useMarketStore } from "@/store/marketStore";
import { api } from "@/lib/api";
import LiveChart, { PricePoint } from "@/components/LiveChart";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Briefcase } from "lucide-react";
import clsx from "clsx";
import { OrderDepth } from "@/components/OrderDepth";
import { TradeBar } from "@/components/TradeBar";

export interface AssetFundamental {
  name: string;
  sector: string;
  archetype: "Mean-Reverting" | "Trending" | "High-Beta Volatile" | "Safe Haven";
  dossier: string;
  deskNote: string;
  metrics: {
    beta: string;
    freeFloat: string;
    instHolding: string;
    supportRange: string;
    peRatio: string;
    divYield: string;
    pbRatio: string;
    marketCap: string;
  };
}

export const ASSET_META: Record<string, AssetFundamental> = {
  "RELI-X": {
    name: "Reliant Energy Corp",
    sector: "Infrastructure & Energy",
    archetype: "Mean-Reverting",
    dossier:
      "A sovereign-backed industrial conglomerate anchored to long-term national power concessions. While headline contract wins generate immediate retail euphoria, massive domestic pension funds operate institutional liquidity grids, consistently unloading inventory during overbought rallies and absorbing liquidity during sharp panics.",
    deskNote:
      "Heavy institutional absorption prevents sustained breakouts. Fade impulsive swings outside the 20-tick envelope; take profit as price gravitates toward VWAP/SMA 20.",
    metrics: {
      beta: "0.68",
      freeFloat: "18% (Constrained)",
      instHolding: "72.4%",
      supportRange: "₹380 – ₹450",
      peRatio: "14.2",
      divYield: "4.8%",
      pbRatio: "1.15",
      marketCap: "₹30,000 Cr",
    },
  },
  "INFY-Z": {
    name: "Infinity Systems",
    sector: "Enterprise Cloud & IT",
    archetype: "Trending",
    dossier:
      "A multi-national enterprise technology exporter with multi-year dollar-denominated contracts. Foreign institutional investors (FIIs) execute multi-day programmatic accumulation blocks. Order books do not snap back; price impulses build persistent directional momentum as trailing stops follow trend channels.",
    deskNote:
      "High autocorrelation profile. Fading momentum here is costly. Respect SMA 9 / SMA 20 golden crosses and trail positions until trend slope flattens.",
    metrics: {
      beta: "1.05",
      freeFloat: "64% (Liquid)",
      instHolding: "58.1%",
      supportRange: "₹190 – ₹240",
      peRatio: "22.5",
      divYield: "1.2%",
      pbRatio: "4.80",
      marketCap: "₹20,000 Cr",
    },
  },
  "HDFC-W": {
    name: "Horizon Commercial Bank",
    sector: "Commercial Banking & Credit",
    archetype: "Trending",
    dossier:
      "The benchmark liquidity pipeline for domestic corporate credit. Highly sensitive to central bank reserve mandates and interbank spreads. When policy headlines break, liquidity reprices in distinct multi-session directional waves rather than random intraday noise.",
    deskNote:
      "Directional macro bellwether. Catalysts trigger multi-session drift. Do not counter-trend trade breaking regulatory alerts.",
    metrics: {
      beta: "1.18",
      freeFloat: "82% (High Float)",
      instHolding: "68.9%",
      supportRange: "₹490 – ₹580",
      peRatio: "18.1",
      divYield: "1.6%",
      pbRatio: "2.40",
      marketCap: "₹25,000 Cr",
    },
  },
  "BZR-V": {
    name: "Bazaar Ventures Media",
    sector: "Digital Media & Consumer Tech",
    archetype: "High-Beta Volatile",
    dossier:
      "A fast-growing consumer internet platform led by an erratic, vocal founder. With aggressive retail speculation, elevated short interest, and thin market-maker depth, any unexpected rumor triggers violent short squeezes or liquidation cascades.",
    deskNote:
      "Asymmetric risk engine. Highly vulnerable to margin liquidations and rumor spikes. Scalp with tight risk or use news speed upgrades to front-run headline order flow.",
    metrics: {
      beta: "2.45",
      freeFloat: "28% (Tight Float)",
      instHolding: "14.2% (Retail Float)",
      supportRange: "₹90 – ₹180",
      peRatio: "45.0",
      divYield: "0.0%",
      pbRatio: "8.90",
      marketCap: "₹1,500 Cr",
    },
  },
  "PULSE": {
    name: "Pulsechain Token",
    sector: "Digital Assets & DeFi",
    archetype: "High-Beta Volatile",
    dossier:
      "A decentralized synthetic liquidity token without physical collateral or sovereign oversight. Price is driven entirely by algorithmic liquidity pools, retail leverage ratios, and cross-market speculative risk sentiment. Technical support levels fail instantly during automated unwind events.",
    deskNote:
      "Zero structural support floor. Moves strictly with market-wide liquidity appetite and leverage flushes. Avoid holding overnight if margin rates spike.",
    metrics: {
      beta: "3.20",
      freeFloat: "95% (Fully Circulating)",
      instHolding: "4.8%",
      supportRange: "₹60 – ₹120",
      peRatio: "N/A",
      divYield: "N/A",
      pbRatio: "N/A",
      marketCap: "₹1,000 Cr",
    },
  },
  "GOLDCORE": {
    name: "Goldcore Reserve Trust",
    sector: "Physical Commodities & Safe Haven",
    archetype: "Safe Haven",
    dossier:
      "An allocated physical bullion depository trust designed for capital preservation. Trades with ultra-low volatility and compressed bid-ask spreads during baseline sessions. Acts as the primary flight-to-safety liquidity sink when equities, media names, or banking stocks experience systemic stress.",
    deskNote:
      "Negative beta asset. Dormant during retail bull runs, but surges when macro shocks or activist short attacks hit the broader board.",
    metrics: {
      beta: "-0.42",
      freeFloat: "45%",
      instHolding: "81.0%",
      supportRange: "₹310 – ₹330",
      peRatio: "12.0",
      divYield: "0.5%",
      pbRatio: "1.00",
      marketCap: "₹40,000 Cr",
    },
  },
  "TATA-Y": {
    name: "Tyrell Autoworks",
    sector: "Heavy Industrial & Mobility",
    archetype: "Mean-Reverting",
    dossier:
      "An infrastructure heavy-machinery manufacturer exposed to raw input commodity cycles. Earnings volatility creates wide price swings, but domestic industrial consortiums enforce a hard valuation corridor around production replacement costs.",
    deskNote:
      "Cyclical bound. Sells off heavily on raw material cost reports, providing repeatable accumulation entries near historical cycle floors.",
    metrics: {
      beta: "0.85",
      freeFloat: "35%",
      instHolding: "61.3%",
      supportRange: "₹75 – ₹105",
      peRatio: "16.4",
      divYield: "3.2%",
      pbRatio: "1.65",
      marketCap: "₹8,800 Cr",
    },
  },
  "NIMBUS": {
    name: "Nimbus Cloud Datacenters",
    sector: "AI & Server Infrastructure",
    archetype: "Trending",
    dossier: "Hyperscale compute real estate provider powering machine learning clusters. Sustained high institutional cap-ex cycle creates continuous trend extensions.",
    deskNote: "Momentum driver. Follow directional news breaks and volume expansion blocks.",
    metrics: {
      beta: "1.40",
      freeFloat: "50%",
      instHolding: "65.0%",
      supportRange: "₹380 – ₹440",
      peRatio: "32.0",
      divYield: "0.4%",
      pbRatio: "6.20",
      marketCap: "₹18,000 Cr",
    },
  },
  "STAPLE": {
    name: "Staple Agro Foods",
    sector: "FMCG & Agritech",
    archetype: "Safe Haven",
    dossier: "Essential consumer staples producer with non-elastic consumer demand across economic cycles.",
    deskNote: "Low-beta defensive pivot. Use for capital parking during high-volatility macro dislocations.",
    metrics: {
      beta: "0.35",
      freeFloat: "40%",
      instHolding: "70.5%",
      supportRange: "₹1,120 – ₹1,240",
      peRatio: "24.5",
      divYield: "2.1%",
      pbRatio: "3.80",
      marketCap: "₹35,000 Cr",
    },
  },
  "VOLTAGE": {
    name: "Voltage Power Matrix",
    sector: "Renewable Energy & Battery Storage",
    archetype: "High-Beta Volatile",
    dossier: "High-growth grid storage provider. Sensitive to raw lithium pricing and sovereign renewable subsidies.",
    deskNote: "High intraday beta. Scalp key momentum breakouts with strict stop losses.",
    metrics: {
      beta: "2.10",
      freeFloat: "48%",
      instHolding: "34.0%",
      supportRange: "₹280 – ₹340",
      peRatio: "55.0",
      divYield: "0.0%",
      pbRatio: "7.10",
      marketCap: "₹6,500 Cr",
    },
  },
  "CRANE": {
    name: "Crane Maritime Logistics",
    sector: "Global Shipping & Freight",
    archetype: "Mean-Reverting",
    dossier: "Deepwater container carrier fleet tied to Baltic freight index swings and spot container tariffs.",
    deskNote: "Range-bound cyclical. Buy oversold support tests and unload near resistance bands.",
    metrics: {
      beta: "0.92",
      freeFloat: "55%",
      instHolding: "52.0%",
      supportRange: "₹480 – ₹560",
      peRatio: "8.5",
      divYield: "5.5%",
      pbRatio: "0.95",
      marketCap: "₹12,000 Cr",
    },
  }
};

const EMPTY_HISTORY: { time: number; value: number }[] = [];

export function AssetDetailTab({ ticker, onBack }: { ticker: string, onBack: () => void }) {
  const prices = useMarketStore(s => s.prices);
  const tickerHistory = useMarketStore(s => s.priceHistory[ticker]);
  const rawHistory = tickerHistory || EMPTY_HISTORY;
  const sessionState = useMarketStore(s => s.sessionState);
  
  const currentSession = useMarketStore(s => s.currentSession);
  const orderBook = useMarketStore(s => s.orderBooks[ticker]);
  const isRound2 = currentSession >= 7;
  
  const [showSma9, setShowSma9] = useState(true);
  const [showSma20, setShowSma20] = useState(true);

  const meta = ASSET_META[ticker] || { name: "Unknown", sector: "General", cap: "-", pe: "-", high: "-", low: "-" };
  const currentPricePaise = prices[ticker]?.[0] || 0;
  const currentPrice = currentPricePaise / 100;

  const chartData: PricePoint[] = useMemo(() => {
    return rawHistory.map((p: any, idx: number) => {
      const val = typeof p === 'number' ? p / 100 : (p?.value ? p.value / 100 : 0);
      const t = p?.time !== undefined ? p.time : idx;
      return { time: t, value: val };
    });
  }, [rawHistory]);

  const volumeData: PricePoint[] = useMemo(() => {
    return rawHistory.map((p: any, idx: number) => {
      const vol = p?.volume !== undefined ? p.volume : Math.floor(Math.random() * 500) + 100;
      const t = p?.time !== undefined ? p.time : idx;
      return { time: t, value: vol };
    });
  }, [rawHistory]);

  const calculateSMA = (period: number): Array<{time: number | string, value: number} | null> => {
    return chartData.map((point, idx) => {
      if (idx < period - 1) return null;
      const slice = chartData.slice(idx - period + 1, idx + 1);
      const sum = slice.reduce((a, b) => a + b.value, 0);
      return { time: point.time, value: sum / period };
    });
  };

  const sma9Data = useMemo(() => calculateSMA(9), [chartData]);
  const sma20Data = useMemo(() => calculateSMA(20), [chartData]);

  return (
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 pb-[120px]">
        
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 px-3 py-1.5 bg-bg-raised hover:bg-bg-overlay border border-bd-subtle hover:border-bd-strong rounded-md text-tx-secondary hover:text-tx-primary transition-colors text-[12px] font-mono font-bold uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Markets
          </button>
          <div className="text-[10px] font-mono font-bold text-tx-muted uppercase tracking-widest">ASSET TERMINAL</div>
        </div>

        {/* Ticker Header Card */}
        <div className="bg-bg-raised/75 border border-bd-subtle rounded-xl p-5 sm:p-7 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shadow-card">
          <div>
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h1 className="text-[26px] sm:text-[32px] font-sans font-bold tracking-tight text-tx-primary">{ticker}</h1>
              <span className={clsx(
                "text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-0.5 rounded border",
                meta.archetype === "Trending" ? "bg-accent-dim border-accent-border text-accent" :
                meta.archetype === "Mean-Reverting" ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" :
                meta.archetype === "Safe Haven" ? "bg-warn-dim border-warn-border text-warn" :
                "bg-loss-dim border-loss-border text-loss"
              )}>{meta.archetype}</span>
            </div>
            <p className="text-tx-secondary text-[13px] sm:text-[14px] mt-1 font-medium">{meta.name} · <span className="text-tx-muted font-mono">{meta.sector}</span></p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-[28px] sm:text-[34px] font-mono font-bold text-tx-primary tracking-tight">₹{currentPrice.toFixed(2)}</div>
            <div className="text-[11px] font-mono font-bold text-gain mt-0.5 flex items-center sm:justify-end gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
              <span>LIVE STOCHASTIC TICK</span>
            </div>
          </div>
        </div>

        {/* Chart Panel */}
        <div className="bg-bg-raised/70 border border-bd-subtle rounded-xl p-4 sm:p-6 shadow-card">
          <LiveChart 
            stockId={ticker} 
            priceHistory={chartData} 
            volumeHistory={volumeData}
            sma9History={sma9Data} 
            sma20History={sma20Data} 
            showSma9={showSma9} 
            showSma20={showSma20}
            accentColor="#00D4AA"
            height={380}
          />
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-bd-hairline">
            <button 
              onClick={() => setShowSma9(!showSma9)} 
              className={clsx(
                "px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider rounded border transition-colors cursor-pointer", 
                showSma9 
                  ? "bg-accent-dim border-accent-border text-accent" 
                  : "bg-bg-base border-bd-subtle text-tx-muted hover:text-tx-secondary"
              )}
            >
              SMA 9 (Fast)
            </button>
            <button 
              onClick={() => setShowSma20(!showSma20)} 
              className={clsx(
                "px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider rounded border transition-colors cursor-pointer", 
                showSma20 
                  ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400" 
                  : "bg-bg-base border-bd-subtle text-tx-muted hover:text-tx-secondary"
              )}
            >
              SMA 20 (Trend)
            </button>
          </div>
        </div>

        <OrderDepth isActive={isRound2} orderBook={orderBook} />

        <div className="glass-panel p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-bd-subtle pb-4">
              <div>
                <h3 className="text-[11px] font-bold text-tx-muted uppercase tracking-[0.06em]">
                  Company Dossier & Market Profile
                </h3>
                <div className="text-[16px] font-bold text-tx-primary mt-0.5">{meta.name}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-tx-secondary bg-bg-raised px-2.5 py-1 rounded-sm border border-bd-subtle">
                  Sector: {meta.sector}
                </span>
              </div>
            </div>

            <p className="text-[14px] text-tx-secondary leading-relaxed font-medium">
              {meta.dossier}
            </p>

            <div className="bg-bg-void border-l-4 border-l-accent border border-bd-subtle rounded-md p-4 shadow-card">
              <div className="text-[11px] font-bold text-accent uppercase tracking-[0.06em] mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Quantitative Desk Edge (Tactical Playbook)
              </div>
              <div className="text-[13px] font-bold text-tx-primary leading-snug">
                {meta.deskNote}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-tx-muted uppercase tracking-[0.06em] mb-3">
                Key Financial & Microstructure Indicators
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-bg-void border border-bd-subtle p-3 rounded-md">
                  <div className="text-[10px] font-bold text-tx-muted uppercase tracking-[0.06em]">Market Beta</div>
                  <div className="text-[14px] font-mono font-bold text-tx-primary mt-1">{meta.metrics?.beta || "-"}</div>
                  <div className="text-[10px] text-tx-muted mt-0.5">Sensitivity to index</div>
                </div>
                <div className="bg-bg-void border border-bd-subtle p-3 rounded-md">
                  <div className="text-[10px] font-bold text-tx-muted uppercase tracking-[0.06em]">Inst. Holding</div>
                  <div className="text-[14px] font-mono font-bold text-tx-primary mt-1">{meta.metrics?.instHolding || "-"}</div>
                  <div className="text-[10px] text-tx-muted mt-0.5">Order absorption depth</div>
                </div>
                <div className="bg-bg-void border border-bd-subtle p-3 rounded-md">
                  <div className="text-[10px] font-bold text-tx-muted uppercase tracking-[0.06em]">Active Float</div>
                  <div className="text-[14px] font-mono font-bold text-tx-primary mt-1">{meta.metrics?.freeFloat || "-"}</div>
                  <div className="text-[10px] text-tx-muted mt-0.5">Squeeze vulnerability</div>
                </div>
                <div className="bg-bg-void border border-bd-subtle p-3 rounded-md">
                  <div className="text-[10px] font-bold text-tx-muted uppercase tracking-[0.06em]">Equilibrium Band</div>
                  <div className="text-[14px] font-mono font-bold text-gain mt-1">{meta.metrics?.supportRange || "-"}</div>
                  <div className="text-[10px] text-tx-muted mt-0.5">Historical trading corridor</div>
                </div>

                <div className="bg-bg-void/50 border border-bd-hairline p-3 rounded-md opacity-80">
                  <div className="text-[10px] font-bold text-tx-muted uppercase tracking-[0.06em]">P/E Ratio (LTM)</div>
                  <div className="text-[14px] font-mono font-bold text-tx-secondary mt-1">{meta.metrics?.peRatio || "-"}</div>
                  <div className="text-[10px] text-tx-muted mt-0.5">Earnings multiple</div>
                </div>
                <div className="bg-bg-void/50 border border-bd-hairline p-3 rounded-md opacity-80">
                  <div className="text-[10px] font-bold text-tx-muted uppercase tracking-[0.06em]">Dividend Yield</div>
                  <div className="text-[14px] font-mono font-bold text-tx-secondary mt-1">{meta.metrics?.divYield || "-"}</div>
                  <div className="text-[10px] text-tx-muted mt-0.5">Annualized yield</div>
                </div>
                <div className="bg-bg-void/50 border border-bd-hairline p-3 rounded-md opacity-80">
                  <div className="text-[10px] font-bold text-tx-muted uppercase tracking-[0.06em]">Price / Book</div>
                  <div className="text-[14px] font-mono font-bold text-tx-secondary mt-1">{meta.metrics?.pbRatio || "-"}</div>
                  <div className="text-[10px] text-tx-muted mt-0.5">Book value multiple</div>
                </div>
                <div className="bg-bg-void/50 border border-bd-hairline p-3 rounded-md opacity-80">
                  <div className="text-[10px] font-bold text-tx-muted uppercase tracking-[0.06em]">Market Cap</div>
                  <div className="text-[14px] font-mono font-bold text-tx-secondary mt-1">{meta.metrics?.marketCap || "-"}</div>
                  <div className="text-[10px] text-tx-muted mt-0.5">Total valuation</div>
                </div>
              </div>
            </div>
        </div>

        <TradeBar ticker={ticker} currentPricePaise={currentPricePaise} />
      </div>
  );
}

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticker = (params?.ticker as string) || "RELI-X";

  return (
    <DashboardShell activeTab="chart">
      <AssetDetailTab ticker={ticker} onBack={() => router.push("/market")} />
    </DashboardShell>
  );
}

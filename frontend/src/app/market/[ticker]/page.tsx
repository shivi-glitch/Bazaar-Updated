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

export interface AssetFundamental {
  name: string;
  sector: string;
  archetype: "Mean-Reverting" | "Trending" | "High-Beta Volatile" | "Safe Haven";
  dossier: string;
  deskNote: string; // The solvable trading hint
  metrics: {
    // Actionable Structural Metrics (The Real Hints)
    beta: string;
    freeFloat: string;
    instHolding: string;
    supportRange: string;
    // Decoy Metrics (Classic Value Traps)
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
      peRatio: "14.2", // Decoy: Looks cheap, but it's a cyclical utility
      divYield: "4.8%", // Decoy: Lures retail yield hunters
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
      peRatio: "22.5", // Decoy: Looks richly valued, but earnings growth sustains trend
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
      pbRatio: "2.40", // Decoy: Classic book-value anchor that misses policy repricing
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
      peRatio: "45.0", // Decoy: High P/E masks negative operating cash burn
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
      peRatio: "N/A", // Decoy: Traders attempt standard valuation on a token
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
      beta: "-0.42", // The key tell
      freeFloat: "45%",
      instHolding: "81.0%",
      supportRange: "₹310 – ₹330",
      peRatio: "12.0", // Decoy: Low P/E causes traders to confuse it for a value equity
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
  
  // 1. Hook into the new store state
  const currentSession = useMarketStore(s => s.currentSession);
  const orderBook = useMarketStore(s => s.orderBooks[ticker]);
  
  // 2. Define the Round 2 threshold (Sessions 7 to 11)
  const isRound2 = currentSession >= 7;
  
  const [qty, setQty] = useState<number | string>(1);
  const portfolioData = useMarketStore(s => s.portfolioData);
  const cash = portfolioData?.cash_paise || 0;
  const capitalLevel = portfolioData?.stats?.capital || 0;
  const pos = portfolioData?.positions?.find((p: any) => p.ticker === ticker);
  const currentPos = pos ? pos.qty : 0;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSma9, setShowSma9] = useState(true);
  const [showSma20, setShowSma20] = useState(true);

  const meta = ASSET_META[ticker] || { name: "Unknown", sector: "General", cap: "-", pe: "-", high: "-", low: "-" };
  const currentPricePaise = prices[ticker]?.[0] || 0;
  const currentPrice = currentPricePaise / 100;

  // Robust data mapping: handles both {time, value, volume} objects and raw number[] arrays fallback
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

  // Calculate Simple Moving Averages
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

  const numericQty = typeof qty === "number" ? qty : parseInt(qty) || 0;
  const notional = numericQty * currentPrice;
  const fee = Math.round(notional * 0.001 * 100) / 100;
  const total = notional + fee;
  const isTradingActive = sessionState === "RUNNING";

  const handleMaxBuy = () => {
    if (currentPrice > 0) {
      const maxQty = Math.floor((cash / 100) / currentPrice);
      setQty(Math.max(1, maxQty));
    }
  };

  const executeTrade = async (side: "BUY" | "SELL") => {
    if (numericQty < 1) return setError("Invalid quantity");
    setLoading(true); setError("");
    try {
      const token = localStorage.getItem("merx_token");
      await api.post("/orders", { client_key: crypto.randomUUID(), ticker, side, qty: numericQty, type: "MARKET" }, token || "");
      setQty(1);
      if (token) {
        try {
          const res = await api.get("/portfolio", token);
          useMarketStore.getState().setPortfolioData(res);
        } catch (e) {}
      }
    } catch (err: any) {
      setError(err.message || "Trade failed");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold">
            <ArrowLeft className="w-4 h-4" /> Back to Markets
          </button>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ASSET DETAIL</div>
        </div>

        <div className="glass-panel p-6 flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-white tracking-tighter">{ticker}</h1>
              <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-sm border ${
                meta.archetype === "Trending"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : meta.archetype === "Mean-Reverting"
                  ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                  : meta.archetype === "Safe Haven"
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>{meta.archetype}</span>
            </div>
            <p className="text-slate-400 font-medium text-sm mt-1">{meta.name}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">₹{currentPrice.toFixed(2)}</div>
          </div>
        </div>

        {/* TOP ROW: CHART (Left) & EXECUTION PANEL (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. LEFT: LIVE CHART */}
          <div className="lg:col-span-2 glass-panel p-6 bg-white/[0.01]">
            <LiveChart 
              stockId={ticker} 
              priceHistory={chartData} 
              volumeHistory={volumeData}
              sma9History={sma9Data} 
              sma20History={sma20Data} 
              showSma9={showSma9} 
              showSma20={showSma20}
              height={380}
            />
            <div className="flex items-center gap-2 mt-4">
              <button onClick={() => setShowSma9(!showSma9)} className={clsx("px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm border transition-colors", showSma9 ? "bg-blue-500/20 border-blue-500/40 text-blue-400" : "bg-[#111827] border-white/10 text-slate-500")}>SMA 9</button>
              <button onClick={() => setShowSma20(!showSma20)} className={clsx("px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm border transition-colors", showSma20 ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-[#111827] border-white/10 text-slate-500")}>SMA 20</button>
            </div>
          </div>

          {/* 2. RIGHT: BUY & SELL EXECUTION PANEL */}
          <div className="lg:col-span-1 glass-panel p-6 bg-white/[0.01] flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trading & Order Execution</h3>
                <div className="text-base font-bold text-white mt-0.5">Instant Market Fill</div>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <div className="bg-[#070B14] border border-white/5 px-3 py-1.5 rounded-sm flex items-center gap-2 text-slate-400 text-xs w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold uppercase tracking-wider text-[10px]">Pos:</span>
                  </div>
                  <span className="font-mono font-bold text-white">
                    {currentPos === 0 ? "0" : `${Math.abs(currentPos)} ${currentPos > 0 ? '(L)' : '(S)'}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 flex-1 justify-between">
              {/* Quantity Controls */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Order Quantity</span>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">Est: ₹{(currentPrice * numericQty).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between bg-[#070B14] border border-white/5 p-1 rounded-md mb-3">
                  <button onClick={() => setQty(Math.max(1, numericQty - 1))} className="px-4 py-2 bg-[#111827] hover:bg-[#1f2937] text-white rounded-sm font-bold transition-colors text-base">-</button>
                  <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value === "" ? "" : parseInt(e.target.value))} className="w-full text-center bg-transparent text-xl font-bold font-mono text-white outline-none" />
                  <button onClick={() => setQty(numericQty + 1)} className="px-4 py-2 bg-[#111827] hover:bg-[#1f2937] text-white rounded-sm font-bold transition-colors text-base">+</button>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  <button onClick={() => setQty(numericQty + 10)} className="py-2 bg-[#070B14] border border-white/5 hover:bg-[#111827] text-xs font-bold text-slate-400 rounded-sm transition-colors">+10</button>
                  <button onClick={() => setQty(numericQty + 50)} className="py-2 bg-[#070B14] border border-white/5 hover:bg-[#111827] text-xs font-bold text-slate-400 rounded-sm transition-colors">+50</button>
                  <button onClick={() => setQty(numericQty + 100)} className="py-2 bg-[#070B14] border border-white/5 hover:bg-[#111827] text-xs font-bold text-slate-400 rounded-sm transition-colors">+100</button>
                  <button onClick={handleMaxBuy} className="py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors">Max</button>
                </div>
              </div>

              {/* Buy / Sell Buttons */}
              <div className="space-y-3 mt-auto">
                {error && <div className="text-center text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 py-2 rounded-lg">{error}</div>}

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    disabled={loading || !isTradingActive} onClick={() => executeTrade("BUY")}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-3 px-2 rounded-md font-black text-sm md:text-base transition-colors flex flex-col items-center justify-center leading-tight shadow-sm"
                  >
                    <div className="flex items-center gap-1 tracking-tight">BUY <ArrowUpRight className="w-4 h-4" /></div>
                    <span className="text-[9px] font-bold font-mono opacity-80 mt-1 uppercase tracking-widest">₹{total.toFixed(2)}</span>
                  </button>

                  <button 
                    disabled={loading || !isTradingActive || (currentPos <= 0 && capitalLevel < 1)} onClick={() => executeTrade("SELL")}
                    className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 disabled:opacity-50 text-red-500 py-3 px-2 rounded-md font-black text-sm md:text-base transition-colors flex flex-col items-center justify-center leading-tight shadow-sm"
                  >
                    <div className="flex items-center gap-1 tracking-tight">{currentPos > 0 ? "SELL" : "SHORT"} <ArrowDownRight className="w-4 h-4" /></div>
                    {currentPos <= 0 && capitalLevel < 1 ? (
                      <span className="text-[9px] font-bold opacity-80 mt-1 uppercase tracking-widest">Req L1 Cap</span>
                    ) : (
                      <span className="text-[9px] font-bold font-mono opacity-80 mt-1 uppercase tracking-widest">₹{(notional - fee).toFixed(2)}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NEW: Conditional Level 2 Order Book */}
        <OrderDepth isActive={isRound2} orderBook={orderBook} />

        {/* 3. BOTTOM: FUNDAMENTALS & COMPANY DOSSIER */}
        <div className="glass-panel p-6 space-y-6 bg-white/[0.01]">
            {/* Dossier Header & Archetype Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Company Dossier & Market Profile
                </h3>
                <div className="text-base font-bold text-white mt-0.5">{meta.name}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-white/5">
                  Sector: {meta.sector}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                    meta.archetype === "Trending"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : meta.archetype === "Mean-Reverting"
                      ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                      : meta.archetype === "Safe Haven"
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}
                >
                  {meta.archetype}
                </span>
              </div>
            </div>

            {/* Narrative Story */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {meta.dossier}
            </p>

            {/* Quantitative Desk Edge (The Core Actionable Hint) */}
            <div className="bg-[#0B1120] border-l-4 border-l-blue-500 border border-white/5 rounded-xl p-4">
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Quantitative Desk Edge (Tactical Playbook)
              </div>
              <div className="text-xs font-medium text-slate-200 leading-snug">
                {meta.deskNote}
              </div>
            </div>

            {/* Key Metrics Grid: Real Hints vs Decoys */}
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                Key Financial & Microstructure Indicators
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Real Structural Clue: Beta */}
                <div className="bg-[#0B1120] border border-white/5 p-3 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Market Beta
                  </div>
                  <div className="text-sm font-mono font-bold text-white mt-1">
                    {meta.metrics?.beta || "-"}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Sensitivity to index</div>
                </div>

                {/* Real Structural Clue: Institutional Holding */}
                <div className="bg-[#0B1120] border border-white/5 p-3 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Inst. Holding
                  </div>
                  <div className="text-sm font-mono font-bold text-white mt-1">
                    {meta.metrics?.instHolding || "-"}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Order absorption depth</div>
                </div>

                {/* Real Structural Clue: Free Float */}
                <div className="bg-[#0B1120] border border-white/5 p-3 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Active Float
                  </div>
                  <div className="text-sm font-mono font-bold text-white mt-1">
                    {meta.metrics?.freeFloat || "-"}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Squeeze vulnerability</div>
                </div>

                {/* Real Structural Clue: Channel Band */}
                <div className="bg-[#0B1120] border border-white/5 p-3 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Equilibrium Band
                  </div>
                  <div className="text-sm font-mono font-bold text-emerald-400 mt-1">
                    {meta.metrics?.supportRange || "-"}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Historical trading corridor</div>
                </div>

                {/* Decoy 1: P/E */}
                <div className="bg-[#0B1120]/60 border border-white/5 p-3 rounded-xl opacity-80">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    P/E Ratio (LTM)
                  </div>
                  <div className="text-sm font-mono font-bold text-slate-300 mt-1">
                    {meta.metrics?.peRatio || "-"}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Earnings multiple</div>
                </div>

                {/* Decoy 2: Dividend Yield */}
                <div className="bg-[#0B1120]/60 border border-white/5 p-3 rounded-xl opacity-80">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Dividend Yield
                  </div>
                  <div className="text-sm font-mono font-bold text-slate-300 mt-1">
                    {meta.metrics?.divYield || "-"}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Annualized yield</div>
                </div>

                {/* Decoy 3: P/B */}
                <div className="bg-[#0B1120]/60 border border-white/5 p-3 rounded-xl opacity-80">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Price / Book
                  </div>
                  <div className="text-sm font-mono font-bold text-slate-300 mt-1">
                    {meta.metrics?.pbRatio || "-"}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Book value multiple</div>
                </div>

                {/* Decoy 4: Cap */}
                <div className="bg-[#0B1120]/60 border border-white/5 p-3 rounded-xl opacity-80">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Market Cap
                  </div>
                  <div className="text-sm font-mono font-bold text-slate-300 mt-1">
                    {meta.metrics?.marketCap || "-"}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Total valuation</div>
                </div>
              </div>
            </div>
          </div>

      </div>
  );
}

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticker = (params?.ticker as string) || "RELI-X";

  return (
    <DashboardShell activeTab="explore">
      <AssetDetailTab ticker={ticker} onBack={() => router.push("/market")} />
    </DashboardShell>
  );
}

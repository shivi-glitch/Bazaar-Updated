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
  category: string;
  dossier: string;
  deskNote: string;
  metrics: {
    beta: string;
    marketCap: string;
    peRatio: string;
    freeFloat: string;
    supportRange: string;
    instHolding: string;
  };
}

export const ASSET_META: Record<string, AssetFundamental> = {
  "RLNT": {
    name: "Reliant Energy Corp",
    sector: "Energy & Infrastructure",
    category: "Large Cap",
    dossier:
      "Meridian's state-linked energy giant and sovereign infrastructure anchor. Backed by long-term power concessions and sovereign guarantees, it is the cornerstone holding of domestic pension funds. While expansion contracts cause short rallies, institutional supply walls routinely absorb euphoria and pull price back to historical fair value.",
    deskNote:
      "Proprietary Flow Memo: Sovereign pension mandates enforce strict 2.5σ Bollinger rebalancing. Notice that while expansion headlines generate sudden retail impulse spikes, institutional block desks use these surges as exit liquidity to replenish inventory, pulling price back to the volume-weighted baseline within 15–20 ticks. Quantitative rule of thumb: never chase the initial expansion candle; fade the second-sigma excursion.",
    metrics: {
      beta: "0.72",
      marketCap: "₹3,20,000 Cr",
      peRatio: "15.0x",
      freeFloat: "18% (Constrained)",
      supportRange: "₹2,350 – ₹2,560",
      instHolding: "72.4%",
    },
  },
  "INFN": {
    name: "Infinity Systems",
    sector: "IT & Enterprise Cloud",
    category: "Large Cap",
    dossier:
      "A software exporter and technology pioneer riding persistent multi-year enterprise digital transformation cycles. Foreign institutional investors (FIIs) accumulate in large programmatic blocks, generating strong directional momentum that sustains across consecutive trading sessions.",
    deskNote:
      "Quant Strategy Memo: Exhibits textbook Post-Announcement Drift (PEAD). When foreign programmatic block orders trigger above the SMA 20, supply walls evaporate rather than absorb. Desks attempting to mean-revert contract rallies face severe gamma bleed—trend persistence here typically spans 2 to 3 consecutive trading sessions before volume exhaustion occurs.",
    metrics: {
      beta: "1.15",
      marketCap: "₹2,10,000 Cr",
      peRatio: "30.0x",
      freeFloat: "64% (Liquid)",
      supportRange: "₹1,480 – ₹1,680",
      instHolding: "58.1%",
    },
  },
  "HRZN": {
    name: "Horizon Commercial Bank",
    sector: "Commercial Banking & Credit",
    category: "Large Cap",
    dossier:
      "The primary credit bellwether of the economy whose expansive loan portfolio fueled the multi-year domestic lending cycle. Extremely sensitive to interest rate policy shifts and macro liquidity headlines, repricing in pronounced multi-session trend waves rather than choppy intraday noise.",
    deskNote:
      "Credit Risk Committee: Highly levered to the sovereign yield curve. In easing regimes, net interest expansion fuels multi-day trend waves. However, watch the 50+ bps repo rate threshold: once borrowing costs jump, loan-loss provisioning acts as an accelerating drag. Most critically, watch interbank counterparty disclosures—if regional private lenders show mounting delinquency, contagion shorting on HRZN offers asymmetric downside.",
    metrics: {
      beta: "1.25",
      marketCap: "₹2,40,000 Cr",
      peRatio: "18.0x",
      freeFloat: "82% (High Float)",
      supportRange: "₹1,450 – ₹1,800",
      instHolding: "68.9%",
    },
  },
  "BZR-V": {
    name: "Bazaar Ventures Media",
    sector: "Digital Media & Consumer Tech",
    category: "Micro Cap",
    dossier:
      "A fast-scaling digital media and consumer marketplace platform with elevated retail enthusiasm and vocal leadership. Operates with tight market-maker depth, making it prone to sudden liquidity gaps and violent price swings upon unexpected rumors or earnings surprises.",
    deskNote:
      "Special Situations Desk: A classic 'gamma-trap' asset with a thin 28% commercial float. Retail forum chatter frequently engineers artificial short squeezes, but scrutinize the debt-to-operating-cash ratio. When macro rates tighten, cash burn forces aggressive liquidity dumping by early seed holders into every retail spike. Trade setup: wait for the retail squeeze volume to peak, then initiate short exposure as Bid absorption drops below 35%.",
    metrics: {
      beta: "1.95",
      marketCap: "₹30,000 Cr",
      peRatio: "42.0x",
      freeFloat: "28% (Tight Float)",
      supportRange: "₹550 – ₹680",
      instHolding: "14.2%",
    },
  },
  "GOLDCORE": {
    name: "Goldcore Reserve Trust",
    sector: "Physical Commodities & Safe Haven",
    category: "Sovereign Reserve",
    dossier:
      "An allocated physical bullion depository trust designed for baseline capital preservation. Exhibits minimal day-to-day volatility during baseline market conditions, but serves as the emergency safe haven whenever broad equity or banking stress arises.",
    deskNote:
      "Macro Allocation Desk: Displays zero yield and negligible baseline drift during calm risk-on sessions. However, its correlation matrix with MERX50 is deeply negative (-0.35). When geopolitical chokepoints close or systemic banking defaults trigger margin liquidation cascades, institutional capital allocates convex flight-to-safety flow here. Treat this not as a trading stock, but as an underpriced disaster call option.",
    metrics: {
      beta: "-0.35",
      marketCap: "N/A (Bullion Reserve)",
      peRatio: "N/A",
      freeFloat: "45% (Reserve Stored)",
      supportRange: "₹6,180 – ₹6,800",
      instHolding: "81.0%",
    },
  },
  "PULSE": {
    name: "Pulsechain Token",
    sector: "Digital Assets & DeFi",
    category: "Digital Asset",
    dossier:
      "A speculative decentralized liquidity token trading purely on community sentiment, retail leverage, and algorithmic pool rebalancing. Lacks physical collateral or institutional floor support, producing explosive rallies and precipitous sell-offs.",
    deskNote:
      "Digital Asset Desk: Liquidity depth is paper-thin (₹10 Lakhs moves price 1%). Tokenomics are hyper-reflexive: social sentiment waves trigger exponential upward feedback loops, but order books suffer severe asymmetric downside slippage. Critical risk factor: smart contracts lacking timelock multi-sigs carry binary liquidation risk. Scalp the momentum with trailing stops, but never hold through an unverified on-chain exploit headline.",
    metrics: {
      beta: "2.80",
      marketCap: "N/A (Synthetic Asset)",
      peRatio: "N/A",
      freeFloat: "95% (Circulating)",
      supportRange: "₹830 – ₹1,020",
      instHolding: "4.8%",
    },
  },
  "TYRL": {
    name: "Tyrell Autoworks",
    sector: "Heavy Infrastructure & Mobility",
    category: "Mid Cap",
    dossier:
      "A mid-cap industrial mobility manufacturer that consistently returns to its historical production cost baseline. While raw material cost pressures create periodic earnings dips, strong industrial consortium buying forms a predictable valuation floor.",
    deskNote:
      "Industrial Cyclicals Note: Trades strictly within an input-cost valuation corridor. Raw material scrap price surges compress quarterly margins, driving price into a reliable institutional accumulation band near ₹815–₹840 where consortium buying absorbs all float. Watch the federal procurement calendar: heavy logistics defense and transport awards trigger sharp Wyckoff re-accumulation breakouts.",
    metrics: {
      beta: "0.85",
      marketCap: "₹60,000 Cr",
      peRatio: "17.0x",
      freeFloat: "35% (Industrial Float)",
      supportRange: "₹815 – ₹890",
      instHolding: "61.3%",
    },
  },
  "NIMBUS": {
    name: "Nimbus Cloud Datacenters",
    sector: "IT & Server Infrastructure",
    category: "Mid Cap",
    dossier:
      "A high-growth cloud compute and AI server infrastructure provider. Competing aggressively with legacy IT leaders, continuous corporate cap-ex commitments drive prolonged directional trend expansions.",
    deskNote:
      "Tech Infrastructure Desk: Software switching inertia and 40%+ ARR growth give Nimbus massive operating leverage. Unlike consumer apps, enterprise compute contracts don't cancel when macro sneezes. Institutional algos deploy VWAP accumulation algorithms on pullbacks to the SMA 9. If an earnings surprise prints above consensus, expect multi-session upward drift without retracing to previous lows.",
    metrics: {
      beta: "1.45",
      marketCap: "₹22,000 Cr",
      peRatio: "38.0x",
      freeFloat: "50% (Liquid)",
      supportRange: "₹345 – ₹455",
      instHolding: "65.0%",
    },
  },
  "STAPLE": {
    name: "Staple & Co. Provisions",
    sector: "Consumer Staples & FMCG",
    category: "Defensive Mid Cap",
    dossier:
      "Everyday household goods and essential consumer consumables producer. Characterized by predictable revenue and steady profit margins regardless of macroeconomic cycles.",
    deskNote:
      "Defensive Portfolio Memo: Inelastic consumer demand guarantees near-instantaneous margin pass-through during input cost inflation. With a beta of 0.32, institutions treat this equity as a synthetic bond proxy. During monetary rate hikes and equity liquidations, capital allocators execute systematic defensive rotation into this book. It will not make you 50%, but it shields capital when everything else bleeds.",
    metrics: {
      beta: "0.32",
      marketCap: "₹45,000 Cr",
      peRatio: "26.0x",
      freeFloat: "40% (Institutional)",
      supportRange: "₹1,180 – ₹1,215",
      instHolding: "70.5%",
    },
  },
  "VOLTAGE": {
    name: "Voltage Power Matrix",
    sector: "Energy & Battery Storage",
    category: "Small Cap",
    dossier:
      "A small-cap electrical grid operator and battery storage manufacturer highly geared to national power tariffs and lithium supply costs. Highly sensitive to energy subsidy announcements.",
    deskNote:
      "Utilities & Energy Desk: High debt-geared small cap whose cash flows are binary to state fuel subsidies and maritime LNG supply. Sudden supply-chain shocks cause steep gap-down panics. However, because electrical grid blackouts are politically unacceptable, severe drawdowns are almost inevitably countered by state tariff relief packages. The asymmetric trade is buying deep despair candles when the market prices in permanent insolvency.",
    metrics: {
      beta: "1.85",
      marketCap: "₹18,000 Cr",
      peRatio: "12.0x",
      freeFloat: "48% (Tradeable)",
      supportRange: "₹260 – ₹310",
      instHolding: "34.0%",
    },
  },
  "CRANE": {
    name: "Crane Maritime Logistics",
    sector: "Infrastructure & Freight",
    category: "Small Cap",
    dossier:
      "Deepwater container carrier fleet and port logistics operator whose revenues mirror Baltic freight tariffs and national trade volumes. Swings predictably between supply gluts and shipping demand surges.",
    deskNote:
      "Maritime Trade Desk: Revenue velocity lags Baltic container freight tariffs by approximately 2 trading sessions. Look at the book-to-bill ratio: when federal port and railway modernization allocations unlock, backlog visibility provides prolonged trend stability. When Level 2 depth displays persistent Bid absorption walls during a consolidation squeeze, commercial float is being locked up for a multi-session leg.",
    metrics: {
      beta: "0.90",
      marketCap: "₹26,000 Cr",
      peRatio: "20.0x",
      freeFloat: "55% (Commercial)",
      supportRange: "₹475 – ₹560",
      instHolding: "52.0%",
    },
  },
  "APEX": {
    name: "Apex Capital Bank",
    sector: "Commercial Banking & Credit",
    category: "Mid Cap",
    dossier:
      "A fast-growing regional lender that expanded aggressively during the credit boom. Underneath its optimistic headline returns lies elevated balance sheet leverage and mounting credit exposure.",
    deskNote:
      "Forensic Credit Desk: Explosive retail loan book growth concealed aggressive underwriting concessions during the boom. Balance sheet leverage exceeds 8x equity, meaning a mere 3% spike in gross non-performing assets wipes out entire annual net earnings. Watch for midnight board meetings or sudden CEO exits—when auditor disclosures reveal delinquency contagion, short positions capture violent, un-hedged downward re-ratings.",
    metrics: {
      beta: "2.10",
      marketCap: "₹28,000 Cr",
      peRatio: "12.0x",
      freeFloat: "42% (Leveraged)",
      supportRange: "₹530 – ₹740",
      instHolding: "44.0%",
    },
  },
  "LEDGER": {
    name: "Ledger Data Systems",
    sector: "IT & Enterprise Data",
    category: "Mid Cap",
    dossier:
      "A mature, cash-rich enterprise database and financial software vendor with sticky multi-year government and banking contracts. Trades within well-defined valuation bands.",
    deskNote:
      "Enterprise Quality Factor: The antithesis of speculative tech. Operates with zero net long-term debt, 90%+ contract renewal rates, and sovereign banking database monopolies. When interbank credit contagion freezes private lenders, macro allocators dump leveraged cyclicals and park liquidity into 'fortress balance sheet' software vendors with positive free cash flow yields.",
    metrics: {
      beta: "0.80",
      marketCap: "₹40,000 Cr",
      peRatio: "22.0x",
      freeFloat: "46% (Stable)",
      supportRange: "₹1,900 – ₹2,030",
      instHolding: "67.0%",
    },
  },
  "FORGE": {
    name: "Forge Industrial Holdings",
    sector: "Heavy Infrastructure & Engineering",
    category: "Mid Cap",
    dossier:
      "An industrial engineering contractor strategically positioned for sovereign infrastructure and defense procurement allocations. Strong order backlog powers persistent upward momentum.",
    deskNote:
      "Capital Goods Desk: Sits directly at the beneficiary apex of counter-cyclical fiscal stimulus. When monetary policy reaches peak tightness and private credit freezes, sovereign economic planners historically deploy massive turnkey infrastructure corridor packages to reignite industrial employment. Announcements of sovereign corridor contracts mark the absolute cycle trough and trigger explosive institutional accumulation.",
    metrics: {
      beta: "1.30",
      marketCap: "₹38,000 Cr",
      peRatio: "17.0x",
      freeFloat: "38% (High Demand)",
      supportRange: "₹1,260 – ₹1,480",
      instHolding: "62.0%",
    },
  },
  "MERX50": {
    name: "MERX 50 Index",
    sector: "Composite Macro Benchmark",
    category: "Market Index",
    dossier:
      "The comprehensive benchmark index aggregating the top corporate equities across Energy, Banking, Technology, and Infrastructure. Reflects the aggregate economic pulse and system liquidity.",
    deskNote:
      "Macro Strategy Desk: Tracks aggregate systemic liquidity across the 50 largest capitalizations. Watch internal market breadth: when High-Beta consumer equities diverge negatively while Sovereign Reserve assets print new highs, the index is entering a systemic regime shift. Never trade the index in isolation—use the spread between leading cyclicals and defensive shelters to confirm directional authenticity.",
    metrics: {
      beta: "1.00",
      marketCap: "₹10,49,000 Cr",
      peRatio: "24.2x",
      freeFloat: "58% (Broad Index)",
      supportRange: "₹855 – ₹1,020",
      instHolding: "65.0%",
    },
  },
};

const EMPTY_HISTORY: { time: number; value: number }[] = [];

export function AssetDetailTab({ ticker, onBack }: { ticker: string, onBack: () => void }) {
  const prices = useMarketStore(s => s.prices);
  const tickerHistory = useMarketStore(s => s.priceHistory[ticker]);
  const rawHistory = tickerHistory || EMPTY_HISTORY;
  const sessionState = useMarketStore(s => s.sessionState);
  
  const currentSession = useMarketStore(s => s.currentSession);
  const orderBook = useMarketStore(s => s.orderBooks[ticker]);
  const isChartFullscreen = useMarketStore(s => s.isChartFullscreen);
  const isRound2 = currentSession >= 7;
  
  const [showSma9, setShowSma9] = useState(true);
  const [showSma20, setShowSma20] = useState(true);

  // Clean up fullscreen state on unmount
  useEffect(() => {
    return () => {
      useMarketStore.getState().setChartFullscreen(false);
    };
  }, []);

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
      <div className="p-3 sm:p-5 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-5 pb-28 lg:pb-12">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 px-3 py-1.5 bg-bg-raised hover:bg-bg-overlay border border-bd-subtle hover:border-bd-strong rounded-md text-tx-secondary hover:text-tx-primary transition-colors text-[12px] font-mono font-bold uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Markets
          </button>
          <div className="text-[10px] font-mono font-bold text-tx-muted uppercase tracking-widest">ASSET TERMINAL</div>
        </div>

        {/* 2-Column Responsive Layout: 8 cols Left (Chart & Company), 4 cols Right (Execution & Metrics) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          
          {/* ─── LEFT COLUMN (lg:col-span-8) ─── */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Ticker Header Card */}
            <div className="bg-bg-raised/75 border border-bd-subtle rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 shadow-card">
              <div>
                <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                  <h1 className="text-[24px] sm:text-[30px] font-sans font-bold tracking-tight text-tx-primary">{ticker}</h1>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-0.5 rounded border bg-bg-void/80 border-bd-subtle text-accent">
                    {meta.category}
                  </span>
                </div>
                <p className="text-tx-secondary text-[12px] sm:text-[13px] mt-0.5 font-medium">{meta.name} · <span className="text-tx-muted font-mono">{meta.sector}</span></p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-[26px] sm:text-[32px] font-mono font-bold text-tx-primary tracking-tight">₹{currentPrice.toFixed(2)}</div>
              </div>
            </div>

            {/* Chart Panel */}
            <div className="bg-bg-raised/70 border border-bd-subtle rounded-xl p-3 sm:p-5 shadow-card">
              <LiveChart 
                stockId={ticker} 
                currentPricePaise={currentPricePaise}
                priceHistory={chartData} 
                volumeHistory={volumeData}
                sma9History={sma9Data} 
                sma20History={sma20Data} 
                showSma9={showSma9} 
                showSma20={showSma20}
                onToggleSma9={() => setShowSma9(!showSma9)}
                onToggleSma20={() => setShowSma20(!showSma20)}
                accentColor="#00D4AA"
                className="h-[290px] xs:h-[320px] sm:h-[360px] lg:h-[410px]"
              />
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-bd-hairline">
                <button 
                  onClick={() => setShowSma9(!showSma9)} 
                  className={clsx(
                    "px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider rounded border transition-colors cursor-pointer", 
                    showSma9 
                      ? "bg-amber-500/15 border-amber-500/30 text-amber-400" 
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
                      ? "bg-purple-500/15 border-purple-500/30 text-purple-400" 
                      : "bg-bg-base border-bd-subtle text-tx-muted hover:text-tx-secondary"
                  )}
                >
                  SMA 20 (Trend)
                </button>
              </div>
            </div>

            {/* Order Depth in R2 */}
            <OrderDepth isActive={isRound2} orderBook={orderBook} />

            {/* Company Dossier & Profile */}
            <div className="glass-panel p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-bd-subtle pb-3">
                <div>
                  <h3 className="text-[11px] font-bold text-tx-muted uppercase tracking-[0.06em]">
                    Company Dossier & Market Profile
                  </h3>
                  <div className="text-[15px] font-bold text-tx-primary mt-0.5">{meta.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-tx-secondary bg-bg-raised px-2.5 py-1 rounded-sm border border-bd-subtle">
                    Sector: {meta.sector}
                  </span>
                </div>
              </div>

              <p className="text-[13px] sm:text-[14px] text-tx-secondary leading-relaxed font-medium">
                {meta.dossier}
              </p>
            </div>
          </div>

          {/* ─── RIGHT COLUMN (lg:col-span-4) ─── */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Desktop-Only Order Execution Ticket */}
            <div className="hidden lg:block">
              <TradeBar ticker={ticker} currentPricePaise={currentPricePaise} variant="card" />
            </div>

            {/* Institutional Equity Research Note */}
            <div className="bg-bg-void border-l-4 border-l-accent border border-bd-subtle rounded-xl p-4 sm:p-5 shadow-card space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] font-bold text-accent uppercase tracking-[0.06em] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Institutional Desk Memo
                </div>
                <span className="text-[9px] font-mono text-tx-muted uppercase tracking-wider bg-bg-raised px-2 py-0.5 rounded border border-bd-subtle">
                  Tactical Flow Clue
                </span>
              </div>
              <p className="text-[12px] sm:text-[13px] text-tx-secondary leading-relaxed font-medium">
                {meta.deskNote}
              </p>
            </div>

            {/* Key Fundamental & Valuation Metrics */}
            <div className="glass-panel p-5 space-y-4">
              <div className="text-[11px] font-bold text-tx-muted uppercase tracking-[0.06em] border-b border-bd-subtle pb-2.5">
                Fundamental & Valuation Metrics
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-bg-void border border-bd-subtle p-3 rounded-md hover:border-accent-border/40 transition-colors">
                  <div className="text-[10px] font-bold text-tx-muted uppercase tracking-[0.06em]">Market Beta</div>
                  <div className="text-[15px] font-mono font-bold text-accent mt-0.5">{meta.metrics?.beta || "-"}</div>
                  <div className="text-[9px] text-tx-muted mt-0.5">Sensitivity to MERX50</div>
                </div>

                <div className="bg-bg-void border border-bd-subtle p-3 rounded-md hover:border-accent-border/40 transition-colors">
                  <div className="text-[10px] font-bold text-tx-muted uppercase tracking-[0.06em]">Market Cap</div>
                  <div className="text-[15px] font-mono font-bold text-tx-primary mt-0.5 truncate">{meta.metrics?.marketCap || "-"}</div>
                  <div className="text-[9px] text-tx-muted mt-0.5">Total valuation</div>
                </div>

                <div className="bg-bg-void border border-bd-subtle p-3 rounded-md hover:border-accent-border/40 transition-colors">
                  <div className="text-[10px] font-bold text-tx-muted uppercase tracking-[0.06em]">P/E Ratio</div>
                  <div className="text-[15px] font-mono font-bold text-tx-primary mt-0.5">{meta.metrics?.peRatio || "-"}</div>
                  <div className="text-[9px] text-tx-muted mt-0.5">Valuation multiple</div>
                </div>

                <div className="bg-bg-void border border-bd-subtle p-3 rounded-md hover:border-accent-border/40 transition-colors">
                  <div className="text-[10px] font-bold text-tx-muted uppercase tracking-[0.06em]">Equilibrium</div>
                  <div className="text-[13px] font-mono font-bold text-gain mt-0.5 truncate">{meta.metrics?.supportRange || "-"}</div>
                  <div className="text-[9px] text-tx-muted mt-0.5">Trading corridor</div>
                </div>

                <div className="bg-bg-void border border-bd-subtle p-3 rounded-md hover:border-accent-border/40 transition-colors">
                  <div className="text-[10px] font-bold text-tx-muted uppercase tracking-[0.06em]">Active Float</div>
                  <div className="text-[13px] font-mono font-bold text-tx-secondary mt-0.5 truncate">{meta.metrics?.freeFloat || "-"}</div>
                  <div className="text-[9px] text-tx-muted mt-0.5">Tradeable liquidity</div>
                </div>

                <div className="bg-bg-void border border-bd-subtle p-3 rounded-md hover:border-accent-border/40 transition-colors">
                  <div className="text-[10px] font-bold text-tx-muted uppercase tracking-[0.06em]">Inst. Holding</div>
                  <div className="text-[13px] font-mono font-bold text-tx-secondary mt-0.5">{meta.metrics?.instHolding || "-"}</div>
                  <div className="text-[9px] text-tx-muted mt-0.5">Absorption depth</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Only Bottom Fixed Bar (hidden on desktop or when chart is in fullscreen) */}
        <TradeBar ticker={ticker} currentPricePaise={currentPricePaise} variant="bar" className={clsx("lg:hidden", isChartFullscreen && "!hidden")} />
      </div>
  );
}

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticker = (params?.ticker as string) || "RLNT";

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/market");
    }
  };

  return (
    <DashboardShell activeTab="chart" isViewingStock={true}>
      <AssetDetailTab ticker={ticker} onBack={handleBack} />
    </DashboardShell>
  );
}

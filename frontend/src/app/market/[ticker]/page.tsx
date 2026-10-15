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
  archetype: "Mean-Reverting" | "Trending" | "High-Beta Volatile" | "Safe Haven" | "Macro Benchmark";
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
  "RELI-X": {
    name: "Reliant Energy Corp",
    sector: "Energy & Infrastructure",
    archetype: "Mean-Reverting",
    dossier:
      "Meridian's state-linked energy giant and sovereign infrastructure anchor. Backed by long-term power concessions and sovereign guarantees, it is the cornerstone holding of domestic pension funds. While expansion contracts cause short rallies, institutional supply walls routinely absorb euphoria and pull price back to historical fair value.",
    deskNote:
      "Heavy institutional absorption profile. Fade impulsive extensions outside the 20-tick band; accumulate when price dips below equilibrium support and take profit as it mean-reverts toward VWAP.",
    metrics: {
      beta: "0.72",
      marketCap: "₹3,20,000 Cr",
      peRatio: "15.0x",
      freeFloat: "18% (Constrained)",
      supportRange: "₹2,350 – ₹2,560",
      instHolding: "72.4%",
    },
  },
  "INFY-Z": {
    name: "Infinity Systems",
    sector: "IT & Enterprise Cloud",
    archetype: "Trending",
    dossier:
      "A software exporter and technology pioneer riding persistent multi-year enterprise digital transformation cycles. Foreign institutional investors (FIIs) accumulate in large programmatic blocks, generating strong directional momentum that sustains across consecutive trading sessions.",
    deskNote:
      "High directional autocorrelation. Counter-trend trading here leads to severe drawdown. Respect fast SMA 9 / SMA 20 momentum crosses and ride multi-tick breakout runs.",
    metrics: {
      beta: "1.15",
      marketCap: "₹2,10,000 Cr",
      peRatio: "30.0x",
      freeFloat: "64% (Liquid)",
      supportRange: "₹1,480 – ₹1,680",
      instHolding: "58.1%",
    },
  },
  "HDFC-W": {
    name: "Horizon Commercial Bank",
    sector: "Commercial Banking & Credit",
    archetype: "Trending",
    dossier:
      "The primary credit bellwether of the economy whose expansive loan portfolio fueled the multi-year domestic lending cycle. Extremely sensitive to interest rate policy shifts and macro liquidity headlines, repricing in pronounced multi-session trend waves rather than choppy intraday noise.",
    deskNote:
      "Macro trend transmitter. Catalysts provoke persistent directional waves. Monitor regulatory disclosures and gross NPA shifts closely before positioning against trend impulses.",
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
    archetype: "High-Beta Volatile",
    dossier:
      "A fast-scaling digital media and consumer marketplace platform with elevated retail enthusiasm and vocal leadership. Operates with tight market-maker depth, making it prone to sudden liquidity gaps and violent price swings upon unexpected rumors or earnings surprises.",
    deskNote:
      "High-beta asymmetric risk engine. Vulnerable to fast margin liquidations and rumor spikes. Scalp with tight risk or exploit fast news speed upgrades to front-run headline order flow.",
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
    archetype: "Safe Haven",
    dossier:
      "An allocated physical bullion depository trust designed for baseline capital preservation. Exhibits minimal day-to-day volatility during baseline market conditions, but serves as the emergency safe haven whenever broad equity or banking stress arises.",
    deskNote:
      "Negative beta asset with positive macro drift. Dormant during retail speculative runs, but delivers sharp defensive upside when panic headlines shock risk assets.",
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
    archetype: "High-Beta Volatile",
    dossier:
      "A speculative decentralized liquidity token trading purely on community sentiment, retail leverage, and algorithmic pool rebalancing. Lacks physical collateral or institutional floor support, producing explosive rallies and precipitous sell-offs.",
    deskNote:
      "Zero structural valuation floor. Highly reactive to broad market liquidity sentiment. Avoid holding long positions when market-wide momentum indicators roll over.",
    metrics: {
      beta: "2.80",
      marketCap: "N/A (Synthetic Asset)",
      peRatio: "N/A",
      freeFloat: "95% (Circulating)",
      supportRange: "₹830 – ₹1,020",
      instHolding: "4.8%",
    },
  },
  "TATA-Y": {
    name: "Tyrell Autoworks",
    sector: "Heavy Infrastructure & Mobility",
    archetype: "Mean-Reverting",
    dossier:
      "A mid-cap industrial mobility manufacturer that consistently returns to its historical production cost baseline. While raw material cost pressures create periodic earnings dips, strong industrial consortium buying forms a predictable valuation floor.",
    deskNote:
      "Reliable cyclical corridor asset. Sells off on commodity headline spikes, providing high-probability entry points near established cyclical support levels.",
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
    archetype: "Trending",
    dossier:
      "A high-growth cloud compute and AI server infrastructure provider. Competing aggressively with legacy IT leaders, continuous corporate cap-ex commitments drive prolonged directional trend expansions.",
    deskNote:
      "Growth momentum engine. Follow directional breakout alerts and volume expansion; avoid counter-trend shorting during active trend phases.",
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
    archetype: "Safe Haven",
    dossier:
      "Everyday household goods and essential consumer consumables producer. Characterized by predictable revenue and steady profit margins regardless of macroeconomic cycles.",
    deskNote:
      "Low-beta defensive sanctuary. Uncorrelated with speculative retail hype; ideal for capital preservation during high-volatility sessions.",
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
    archetype: "High-Beta Volatile",
    dossier:
      "A small-cap electrical grid operator and battery storage manufacturer highly geared to national power tariffs and lithium supply costs. Highly sensitive to energy subsidy announcements.",
    deskNote:
      "High intraday elasticity. Prone to wide percentage moves on sector policy bulletins. Execute disciplined entries with defined risk boundaries.",
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
    archetype: "Mean-Reverting",
    dossier:
      "Deepwater container carrier fleet and port logistics operator whose revenues mirror Baltic freight tariffs and national trade volumes. Swings predictably between supply gluts and shipping demand surges.",
    deskNote:
      "Corridor-bound cyclical name. Accumulate near lower channel bounds and offload inventory near channel tops.",
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
    archetype: "High-Beta Volatile",
    dossier:
      "A fast-growing regional lender that expanded aggressively during the credit boom. Underneath its optimistic headline returns lies elevated balance sheet leverage and mounting credit exposure.",
    deskNote:
      "High-volatility risk play. Watch credit quality and NPA disclosures carefully. Rallies can be shorted aggressively upon regulatory scrutiny.",
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
    archetype: "Mean-Reverting",
    dossier:
      "A mature, cash-rich enterprise database and financial software vendor with sticky multi-year government and banking contracts. Trades within well-defined valuation bands.",
    deskNote:
      "Mean-reverting quality holding. Sells off rarely and rebounds swiftly toward fundamental value corridor.",
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
    archetype: "Trending",
    dossier:
      "An industrial engineering contractor strategically positioned for sovereign infrastructure and defense procurement allocations. Strong order backlog powers persistent upward momentum.",
    deskNote:
      "Late-round trending momentum leader. Catalyzed by capital expansion tenders; ride breakout channels.",
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
    archetype: "Macro Benchmark",
    dossier:
      "The comprehensive benchmark index aggregating the top corporate equities across Energy, Banking, Technology, and Infrastructure. Reflects the aggregate economic pulse and system liquidity.",
    deskNote:
      "Broad market gauge. Use as systemic risk benchmark; index shifts dictate macro direction for individual equities.",
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
                Key Fundamental & Valuation Metrics
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-bg-void border border-bd-subtle p-3.5 rounded-md hover:border-accent-border/40 transition-colors">
                  <div className="text-[10px] font-bold text-tx-muted uppercase tracking-[0.06em]">Market Beta</div>
                  <div className="text-[16px] font-mono font-bold text-accent mt-1">{meta.metrics?.beta || "-"}</div>
                  <div className="text-[10px] text-tx-muted mt-0.5">Sensitivity to MERX50</div>
                </div>

                <div className="bg-bg-void border border-bd-subtle p-3.5 rounded-md hover:border-accent-border/40 transition-colors">
                  <div className="text-[10px] font-bold text-tx-muted uppercase tracking-[0.06em]">Market Cap</div>
                  <div className="text-[16px] font-mono font-bold text-tx-primary mt-1">{meta.metrics?.marketCap || "-"}</div>
                  <div className="text-[10px] text-tx-muted mt-0.5">Total market valuation</div>
                </div>

                <div className="bg-bg-void border border-bd-subtle p-3.5 rounded-md hover:border-accent-border/40 transition-colors">
                  <div className="text-[10px] font-bold text-tx-muted uppercase tracking-[0.06em]">P/E Ratio</div>
                  <div className="text-[16px] font-mono font-bold text-tx-primary mt-1">{meta.metrics?.peRatio || "-"}</div>
                  <div className="text-[10px] text-tx-muted mt-0.5">Valuation multiple</div>
                </div>

                <div className="bg-bg-void border border-bd-subtle p-3.5 rounded-md hover:border-accent-border/40 transition-colors">
                  <div className="text-[10px] font-bold text-tx-muted uppercase tracking-[0.06em]">Equilibrium Band</div>
                  <div className="text-[15px] font-mono font-bold text-gain mt-1">{meta.metrics?.supportRange || "-"}</div>
                  <div className="text-[10px] text-tx-muted mt-0.5">Historical trading corridor</div>
                </div>

                <div className="bg-bg-void border border-bd-subtle p-3.5 rounded-md hover:border-accent-border/40 transition-colors">
                  <div className="text-[10px] font-bold text-tx-muted uppercase tracking-[0.06em]">Active Float</div>
                  <div className="text-[15px] font-mono font-bold text-tx-secondary mt-1">{meta.metrics?.freeFloat || "-"}</div>
                  <div className="text-[10px] text-tx-muted mt-0.5">Tradeable market liquidity</div>
                </div>

                <div className="bg-bg-void border border-bd-subtle p-3.5 rounded-md hover:border-accent-border/40 transition-colors">
                  <div className="text-[10px] font-bold text-tx-muted uppercase tracking-[0.06em]">Inst. Holding</div>
                  <div className="text-[15px] font-mono font-bold text-tx-secondary mt-1">{meta.metrics?.instHolding || "-"}</div>
                  <div className="text-[10px] text-tx-muted mt-0.5">Order absorption depth</div>
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

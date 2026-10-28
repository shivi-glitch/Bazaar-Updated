// frontend/src/lib/institutionalMemos.ts
// Session-Wise Institutional Desk Memos for Bazaar Trading Simulation (Round 1 Session 1 to Round 2 Session 5)
// Contains puzzle-solving tactical flow clues, subtle decoys, and structural market mechanics in balanced, engaging trader prose.

export interface SessionDeskMemo {
  memo: string;
  classification: "TACTICAL_CLUE" | "DECOY_TRAP" | "CORE_FLOW";
  tag: string;
}

export const SESSION_DESK_MEMOS: Record<string, Record<number, SessionDeskMemo>> = {
  // ─────────────────────────────────────────────────────────────
  // RLNT: Reliant Energy Corp
  // ─────────────────────────────────────────────────────────────
  "RLNT": {
    0: {
      tag: "Tactical Flow Clue",
      classification: "TACTICAL_CLUE",
      memo: "Public utility tariff approvals typically inject steady cash flow visibility into sovereign infrastructure equities. Large institutional funds generally avoid chasing market-order spikes right at the open, choosing instead to accumulate inventory once early volatility stabilizes around the session's volume-weighted baseline.",
    },
    1: { // R1S1
      tag: "Order Flow Memo",
      classification: "TACTICAL_CLUE",
      memo: "Major government modernization grants reliably generate an aggressive opening bid, but domestic pension funds operate with disciplined valuation limits. Historical order books indicate that large funds use initial retail enthusiasm to satisfy early supply, letting the momentum impulse exhaust before stepping in to support prices on pullbacks toward the session average.",
    },
    2: { // R1S2
      tag: "Capital Allocation Note",
      classification: "CORE_FLOW",
      memo: "Low borrowing costs and stable domestic power demand provide a consistent valuation anchor for heavy utilities. While fast retail liquidity rotates toward speculative growth equities, institutional block holders maintain steady resting bids, keeping trading activity bound to predictable support levels.",
    },
    4: { // R1S4
      tag: "Commodity Flow Note",
      classification: "TACTICAL_CLUE",
      memo: "Geopolitical disruption across international shipping lanes significantly widens refining margins for domestic energy producers with sovereign crude access. While unexpected leadership health rumors may cause knee-jerk retail selling, terminal cash flow expansion from physical fuel crack spreads historically dominates the final price trend.",
    },
    5: { // R1S5
      tag: "Project Advisory Note",
      classification: "TACTICAL_CLUE",
      memo: "While domestic refining and power operations generate solid operational cash, speculative renewable export partnerships account for a notable share of market multiple expansion. Any sudden withdrawal by foreign sovereign co-investors forces desks to strip out future project premiums and re-price the equity back toward core baseline value.",
    },
    7: { // R2S1
      tag: "Interest Rate Telemetry",
      classification: "TACTICAL_CLUE",
      memo: "Capital-intensive utility operators with large floating-rate debt loads face significant earnings compression during unexpected interest rate hikes. When primary sovereign investment funds pause their planned equity block purchases following a rate shock, institutional bid depth thins out rapidly across the book.",
    },
    11: { // R2S5
      tag: "Index Rebalancing Memo",
      classification: "TACTICAL_CLUE",
      memo: "The conclusion of the tournament settlement cycle brings substantial programmatic index rebalancing. Heavily weighted sovereign anchor equities experience mandatory mechanical buy-side matching from passive tracking funds, driving price action steadily toward fundamental equilibrium values.",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // BZR-V: Bazaar Ventures Media
  // ─────────────────────────────────────────────────────────────
  "BZR-V": {
    1: { // R1S1
      tag: "High-Beta Telemetry",
      classification: "DECOY_TRAP",
      memo: "Order book depth reveals extremely thin ask volume above the opening range. Retail trading syndicates are attempting an aggressive breakout squeeze on unconfirmed commercial partnership chatter; intraday historical telemetry suggests early short sellers risk severe momentum overrun before afternoon volume normalizes.",
    },
    2: { // R1S2
      tag: "Regulatory Risk Alert",
      classification: "TACTICAL_CLUE",
      memo: "Regulatory compliance inquiries and anti-profiteering audits are rarely isolated intraday events. When formal government investigation reports circulate, primary institutional market makers immediately widen quoted spreads and step back from the bid side to insulate portfolios against prolonged downward repricing.",
    },
    3: { // R1S3
      tag: "Contrarian Flow Memo",
      classification: "TACTICAL_CLUE",
      memo: "Micro-cap equities that have endured continuous multi-session regulatory selling accumulate intense short interest. In these conditions, any verified corporate press release or official board denial of market rumors triggers an aggressive short-covering squeeze, producing sharp counter-trend reflexivity.",
    },
    4: { // R1S4
      tag: "Sector Rotation Note",
      classification: "DECOY_TRAP",
      memo: "Digital consumer marketplace platforms carry minimal operational exposure to physical maritime trade routes or industrial commodity shocks. Analysts project that capital fleeing heavy industrial sectors will rotate into high-beta domestic tech as an insulated growth sanctuary.",
    },
    6: { // R1S6
      tag: "Balance Sheet Telemetry",
      classification: "TACTICAL_CLUE",
      memo: "Heavily shorted companies with vocal executive leadership often utilize strategic corporate cash reserves to launch unexpected open-market share buybacks. These surprise repurchases are calculated to force rapid short liquidation and establish an artificial price floor before session settlement.",
    },
    7: { // R2S1
      tag: "Technical Setup Note",
      classification: "DECOY_TRAP",
      memo: "Technical momentum indicators show Bazaar Ventures flashing an extreme 99% short-float metric. Proprietary retail algorithms project an imminent gamma squeeze that overrides broad macro interest rate headwinds, signaling outsized returns for dip buyers.",
    },
    9: { // R2S3
      tag: "Forensic Audit Alert",
      classification: "TACTICAL_CLUE",
      memo: "Independent forensic reports alleging circular revenue recognition, coupled with the abrupt resignation of a statutory auditor, represent existential balance sheet impairment. Institutional prime brokers typically enforce immediate liquidation calls, causing resting bids to evaporate across the order book.",
    },
    10: { // R2S4
      tag: "Corporate Event Note",
      classification: "DECOY_TRAP",
      memo: "Management's public commitment to host an emergency investor livestream and initiate multi-billion dollar damage litigation against short sellers signals aggressive defense. Historically, aggressive retail front-running of executive public addresses has produced dramatic intraday turnaround spikes.",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // INFN: Infinity Systems
  // ─────────────────────────────────────────────────────────────
  "INFN": {
    0: {
      tag: "Tactical Flow Clue",
      classification: "TACTICAL_CLUE",
      memo: "Major multi-cloud enterprise contract awards typically produce consistent directional drift rather than sudden one-tick spikes. When institutional buying clears overhead resistance, momentum tends to hold steady across the trading session.",
    },
    1: { // R1S1
      tag: "Enterprise Quality Note",
      classification: "TACTICAL_CLUE",
      memo: "Substantial cross-border enterprise software migration contracts exhibit high institutional follow-through. When global institutions accumulate large-cap technology following verified commercial deals, overhead supply is steadily absorbed rather than pushed back, allowing directional momentum to persist across consecutive volume waves.",
    },
    2: { // R1S2
      tag: "Talent Flow Alert",
      classification: "DECOY_TRAP",
      memo: "Reports of senior enterprise delivery personnel defecting to competitor ventures frequently signal operational delivery delays and client friction. Risk desks are advised to trim exposure and seek hedging until management formally verifies leadership retention.",
    },
    3: { // R1S3
      tag: "Valuation Metric Alert",
      classification: "DECOY_TRAP",
      memo: "Technology earnings multiples currently trade at historically stretched valuation premiums over traditional industrial earnings. Institutional flow models anticipate immediate capital rotation out of high-multiple software exporters and into defensive cyclical manufacturing.",
    },
    5: { // R1S5
      tag: "Defensive Growth Memo",
      classification: "TACTICAL_CLUE",
      memo: "Enterprise cloud optimization services demonstrate strong pricing power and zero cancellation risk during macroeconomic turbulence. Institutional allocators routinely treat cash-rich IT exporters as high-grade defensive assets when cyclical sectors experience supply chain friction.",
    },
    8: { // R2S2
      tag: "Sovereign Contract Note",
      classification: "TACTICAL_CLUE",
      memo: "Multi-year sovereign defense and AI infrastructure alliances represent highly sticky, high-margin revenue streams that operate independently of commercial IT budget cycles. Contracts with sovereign defense backing provide significant valuation expansion and resilient price support.",
    },
    9: { // R2S3
      tag: "Macro Capex Advisory",
      classification: "TACTICAL_CLUE",
      memo: "When systemic banking stress and credit contagion trigger widespread liquidity freezes, global corporate clients systematically pause uncommitted discretionary technology expenditures. Even premier software exporters face short-term revenue deferrals when enterprise clients defer contract renewals.",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // HRZN: Horizon Commercial Bank
  // ─────────────────────────────────────────────────────────────
  "HRZN": {
    0: {
      tag: "Credit Desk Note",
      classification: "TACTICAL_CLUE",
      memo: "Tightening interbank money market rates put pressure on commercial lenders with high consumer lending exposure. When wholesale borrowing costs climb, equity markets begin to discount compressed net interest margins.",
    },
    1: { // R1S1
      tag: "Credit Cycle Advisory",
      classification: "DECOY_TRAP",
      memo: "Commercial banking expansions typically plateau quickly after initial policy rate adjustments. Desks anticipate rapid profit-taking across commercial lending shares as interbank lending desk liquidity begins to tighten.",
    },
    2: { // R1S2
      tag: "Money Market Telemetry",
      classification: "CORE_FLOW",
      memo: "Short-term interbank commercial paper rates experience temporary volatility during seasonal corporate tax settlement windows. Desks should distinguish between transitory money market liquidity frictions and structural loan book distress.",
    },
    3: { // R1S3
      tag: "Asset Quality Note",
      classification: "TACTICAL_CLUE",
      memo: "While retail banking sentiment can be influenced by macroeconomic headlines, verified contractions in gross non-performing assets toward multi-year lows provide genuine balance sheet strength. Stable credit provisioning acts as a durable cushion for bank equity.",
    },
    4: { // R1S4
      tag: "Regulatory Capital Note",
      classification: "TACTICAL_CLUE",
      memo: "Central bank directives that raise statutory risk weights on unsecured consumer loans compel commercial banks to park additional capital against their retail loan portfolios. This statutory requirement limits active loan expansion and exerts downward pressure on return on equity.",
    },
    6: { // R1S6
      tag: "Interbank Rumor Note",
      classification: "DECOY_TRAP",
      memo: "Whispers regarding a specialized central bank liquidity refinance facility indicate unconditional backstop support for commercial bank balance sheets, insulating lenders against retail delinquency risks into the session close.",
    },
    7: { // R2S1
      tag: "Credit Impairment Alert",
      classification: "TACTICAL_CLUE",
      memo: "Aggressive 75 bps monetary policy rate shocks severely pressure indebted retail borrowers. When regulatory inspectors mandate the formal reclassification of stressed consumer loans into non-performing categories, institutional allocators execute rapid balance sheet derisking.",
    },
    8: { // R2S2
      tag: "M&A Intelligence Memo",
      classification: "DECOY_TRAP",
      memo: "Reports that an international banking conglomerate is entering final negotiations to acquire Horizon provide a substantial valuation floor. Institutional merger arbitrage models suggest positioning long to capture the impending acquisition premium.",
    },
    9: { // R2S3
      tag: "Valuation Metric Alert",
      classification: "DECOY_TRAP",
      memo: "The systemic sell-off across financial shares has reached deeply oversold technical levels. Historical bank distress cycles suggest that established commercial franchise networks offer exceptional counter-trend recovery value for aggressive dip buyers.",
    },
    10: { // R2S4
      tag: "Central Bank Backstop",
      classification: "TACTICAL_CLUE",
      memo: "The activation of emergency central bank liquidity swap facilities, coupled with sovereign deposit guarantees, completely neutralizes terminal insolvency concerns. Once systemic bankruptcy risk is removed, severely discounted banking paper undergoes a rapid liquidity-driven recovery.",
    },
    11: { // R2S5
      tag: "Balance Sheet Reset",
      classification: "TACTICAL_CLUE",
      memo: "With non-performing loan books fully recognized and wholesale funding spreads returning to normal, commercial lending operations experience an inflection in net interest margins into the final tournament settlement.",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // PULSE: Pulsechain
  // ─────────────────────────────────────────────────────────────
  "PULSE": {
    0: {
      tag: "On-Chain Alert",
      classification: "DECOY_TRAP",
      memo: "Promotional social channels are projecting an explosive liquidity run across digital asset pools. Desks must monitor on-chain contract telemetry; when promotional intensity peaks, early founder wallets often exploit the volume to distribute holdings.",
    },
    1: { // R1S1
      tag: "Liquidity Flow Alert",
      classification: "DECOY_TRAP",
      memo: "Decentralized order book accumulation indicates that institutional liquidity providers are establishing a solid floor under the token. Chasing upward impulse momentum offers favorable asymmetric return potential.",
    },
    2: { // R1S2
      tag: "Market Access Note",
      classification: "TACTICAL_CLUE",
      memo: "When digital asset volumes break major liquidity thresholds driven by confirmed tier-1 international exchange listings, buying momentum becomes self-reinforcing. Early attempts to fade or short this volume velocity carry severe execution risk.",
    },
    3: { // R1S3
      tag: "On-Chain Surveillance",
      classification: "TACTICAL_CLUE",
      memo: "Telemetry tracking on-chain multi-sig wallets reveals significant token transfers toward active decentralized exchange liquidity pools. When high-volume promotional headlines coincide with large insider wallet outflows, retail buying is primarily serving as exit liquidity.",
    },
    6: { // R1S6
      tag: "Market Dynamics Memo",
      classification: "TACTICAL_CLUE",
      memo: "Late-stage trading sessions in speculative digital tokens frequently feature manufactured exploit rumors designed to trigger stop-loss cascades among leveraged traders, allowing core project treasuries to execute scheduled buybacks at deeply discounted prices.",
    },
    7: { // R2S1
      tag: "Algorithmic Leverage Note",
      classification: "TACTICAL_CLUE",
      memo: "Speculative digital asset valuations rely heavily on cheap systemic liquidity. When fiat policy rates rise sharply, decentralized borrowing costs spike, triggering automated liquidation cascades across automated lending protocols.",
    },
    8: { // R2S2
      tag: "Exchange Telemetry",
      classification: "DECOY_TRAP",
      memo: "Anticipation surrounding major evening exchange listings suggests an influx of secondary liquidity. Traders holding long exposure through the announcement window stand to capture substantial post-listing revaluation.",
    },
    9: { // R2S3
      tag: "Protocol Security Alert",
      classification: "TACTICAL_CLUE",
      memo: "Verified smart contract exploits that drain backing collateral from cross-chain liquidity bridges represent catastrophic and irreversible losses. The resulting loss of reserves produces a rapid liquidity drain that halts normal trading.",
    },
    10: { // R2S4
      tag: "Recovery Flow Note",
      classification: "TACTICAL_CLUE",
      memo: "Heavily shorted, distressed digital assets display extreme upside reflexivity when white-hat recovery teams secure exploited collateral. A protocol restart coupled with record short interest triggers intense forced short covering.",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // TYRL: Tyrell Autoworks
  // ─────────────────────────────────────────────────────────────
  "TYRL": {
    1: { // R1S1
      tag: "Industrial Cycle Note",
      classification: "TACTICAL_CLUE",
      memo: "Seasonal component stockpiling and working capital accumulation typically create temporary softening in manufacturing bids. However, institutional block desks routinely utilize technical pullbacks below the 20-period moving average to accumulate shares ahead of quarterly delivery cycles.",
    },
    2: { // R1S2
      tag: "Cost Inflation Advisory",
      classification: "DECOY_TRAP",
      memo: "Escalating raw material costs will severely compress operating margins across industrial manufacturing. Desks are urged to liquidate cyclical automotive holdings ahead of widespread earnings downgrades.",
    },
    4: { // R1S4
      tag: "Commercial Fleet Note",
      classification: "TACTICAL_CLUE",
      memo: "Sharp increases in commercial diesel prices directly compress operating cash flows for freight logistics operators. When transportation fuel costs spike, commercial fleet managers immediately postpone new vehicle procurement orders.",
    },
    5: { // R1S5
      tag: "Supply Chain Alert",
      classification: "DECOY_TRAP",
      memo: "Reports of a major warehouse supplier fire will disrupt vehicle assembly schedules for multiple quarters. Traders should avoid industrial equities until physical supply chain inspections are completed.",
    },
    8: { // R2S2
      tag: "Government Procurement Note",
      classification: "TACTICAL_CLUE",
      memo: "National defense procurement tenders provide guaranteed cost-plus margins and multi-year order backlogs that operate entirely outside civilian consumer auto cycles. Winning major military vehicle tenders successfully decouples specialized manufacturers from macro downturns.",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // GOLDCORE: Goldcore Reserve Trust
  // ─────────────────────────────────────────────────────────────
  "GOLDCORE": {
    0: {
      tag: "Sovereign Reserves Note",
      classification: "TACTICAL_CLUE",
      memo: "Sovereign treasury desks park excess liquidity in physical bullion custody during periods of macro policy ambiguity. Bullion functions as a stable ballast against general market volatility.",
    },
    1: { // R1S1
      tag: "Depository Flow Note",
      classification: "CORE_FLOW",
      memo: "Central clearing depositories maintain a passive, steady allocation to physical bullion. Price action remains tightly range-bound in the absence of major macroeconomic risk premiums.",
    },
    4: { // R1S4
      tag: "Flight-to-Safety Note",
      classification: "TACTICAL_CLUE",
      memo: "When international geopolitical tensions disrupt strategic shipping corridors, sovereign reserve desks systematically reallocate liquid reserves into physical bullion custody. These safe-haven inflows are sustained, persistent, and largely price-insensitive.",
    },
    6: { // R1S6
      tag: "Reserve Allocation Note",
      classification: "TACTICAL_CLUE",
      memo: "Institutional risk managers systematically lock in physical gold positions as an unencumbered hedge ahead of major central bank policy meetings. Bullion establishes an unbroken floor under these conditions.",
    },
    7: { // R2S1
      tag: "Macro Haven Flow",
      classification: "TACTICAL_CLUE",
      memo: "Severe monetary rate shocks that disrupt broader financial stability trigger capital rotation into unencumbered physical assets. Sovereign bullion vaults become a primary recipient of capital exiting distressed equity markets.",
    },
    9: { // R2S3
      tag: "Liquidity Crisis Playbook",
      classification: "TACTICAL_CLUE",
      memo: "When institutional prime brokers raise margin requirements and broader equities face forced liquidations, physical bullion remains the premier eligible collateral. Gold experiences surging safe-haven demand during systemic stress.",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // NIMBUS: Nimbus Cloud Datacenters (Listed S2)
  // ─────────────────────────────────────────────────────────────
  "NIMBUS": {
    2: { // R1S2
      tag: "IPO SaaS Telemetry",
      classification: "TACTICAL_CLUE",
      memo: "Newly listed cloud infrastructure providers with strong recurring software revenues trade with constrained public float. Large institutional allocators steadily absorb available supply on minor consolidation pullbacks.",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // STAPLE: Staple & Co. Provisions (Listed S3)
  // ─────────────────────────────────────────────────────────────
  "STAPLE": {
    3: { // R1S3
      tag: "Defensive Cash Flow",
      classification: "TACTICAL_CLUE",
      memo: "Essential consumer goods producers benefit from inelastic consumer demand. When broader market sentiment turns cautious, institutional allocators treat staple equities as reliable cash proxies capable of passing through input inflation.",
    },
    4: { // R1S4
      tag: "Pricing Power Note",
      classification: "TACTICAL_CLUE",
      memo: "Essential consumer food producers easily pass higher grain and transportation surcharges directly onto wholesale retail distributors without consumer pushback, protecting gross operating margins.",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // VOLTAGE: Voltage Power Matrix (Listed S4)
  // ─────────────────────────────────────────────────────────────
  "VOLTAGE": {
    4: { // R1S4
      tag: "Supply Disruption Alert",
      classification: "TACTICAL_CLUE",
      memo: "Independent power utilities that depend on imported seaborne fuel shipments have zero hedging when maritime trade corridors close. The resulting input disruption leads to severe operational margin drops.",
    },
    5: { // R1S5
      tag: "Regulated Utility Telemetry",
      classification: "TACTICAL_CLUE",
      memo: "Heavily punished public utilities frequently receive government compensation mechanisms once power grid reliability is threatened. When statutory tariff adjustments are introduced, distressed valuation discounts reverse rapidly.",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // CRANE: Crane Maritime Logistics (Listed S5)
  // ─────────────────────────────────────────────────────────────
  "CRANE": {
    5: { // R1S5
      tag: "Infrastructure Capex Note",
      classification: "TACTICAL_CLUE",
      memo: "Federal logistics and railway expansion awards provide multi-year revenue visibility backed by sovereign expenditure. High book-to-bill order ratios represent reliable institutional accumulation conditions.",
    },
    10: { // R2S4
      tag: "Transit Recovery Note",
      classification: "TACTICAL_CLUE",
      memo: "Heavy transport and municipal shipping networks confirm a broad economic turnaround as government stimulus funds flow into regional infrastructure backbones.",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // APEX: Apex Capital Bank (Round 2)
  // ─────────────────────────────────────────────────────────────
  "APEX": {
    8: { // R2S2
      tag: "Forensic Banking Alert",
      classification: "TACTICAL_CLUE",
      memo: "When aggressive private commercial lenders conceal non-performing loans, sudden internal audit leaks reveal massive asset quality deterioration. The abrupt resignation of executive leadership signals severe balance sheet distress.",
    },
    11: { // R2S5
      tag: "Restructuring Note",
      classification: "TACTICAL_CLUE",
      memo: "Once bad loans are formally cordoned off and government-backed recapitalization funds arrive, surviving restructured bank equity can recover as credit write-downs finally cease.",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // LEDGER: Ledger Data Systems (Round 2)
  // ─────────────────────────────────────────────────────────────
  "LEDGER": {
    9: { // R2S3
      tag: "Quality Factor Shelter",
      classification: "TACTICAL_CLUE",
      memo: "During systemic banking panics and credit contagion, institutional money rotates out of debt-laden cyclicals and into zero-debt enterprise software providers backed by recurring government and corporate database contracts.",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // FORGE: Forge Industrial Holdings (Round 2)
  // ─────────────────────────────────────────────────────────────
  "FORGE": {
    10: { // R2S4
      tag: "Stimulus Catalyst Note",
      classification: "TACTICAL_CLUE",
      memo: "When restrictive interest rates freeze private sector borrowing, the government deploys massive emergency turnkey infrastructure programs to re-employ capital. Selected lead contractors mark the structural inflection point for the broader market.",
    },
    11: { // R2S5
      tag: "Backlog Visibility Note",
      classification: "TACTICAL_CLUE",
      memo: "Heavy engineering companies enter the closing session with record multi-year government order backlogs, keeping their institutional valuation multiples firmly supported.",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // MERX50: Composite Macro Benchmark
  // ─────────────────────────────────────────────────────────────
  "MERX50": {
    11: { // R2S5
      tag: "Index Settlement Telemetry",
      classification: "TACTICAL_CLUE",
      memo: "Final-session quad-witching settlement flows narrow the valuation gap between cyclical leaders and defensive shelters, guiding benchmark market breadth toward orderly closing equilibrium.",
    },
  },
};

/**
 * Returns the session-specific institutional desk memo for a given ticker and session.
 * If no session-specific note exists for that session, gracefully falls back to the default desk note.
 */
export function getInstitutionalMemo(
  ticker: string,
  session: number,
  fallbackDefault: string
): { memo: string; tag: string; isDecoy: boolean } {
  const assetMemos = SESSION_DESK_MEMOS[ticker];
  if (assetMemos && assetMemos[session]) {
    const item = assetMemos[session];
    return {
      memo: item.memo,
      tag: item.tag,
      isDecoy: item.classification === "DECOY_TRAP",
    };
  }

  return {
    memo: fallbackDefault,
    tag: "Tactical Flow Note",
    isDecoy: false,
  };
}

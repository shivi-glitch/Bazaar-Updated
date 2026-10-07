export interface ScriptedNewsItem {
  g: number;
  public_tick: number;
  ticker: string;
  source: "FF" | "AN" | "NP" | "IN" | string;
  text: string;
  impact: number;
  is_fake: boolean;
}

export const SCRIPTED_NEWS_DATABASE: ScriptedNewsItem[] = [
  // SESSION 1
  {"g": 1, "public_tick": 30, "ticker": "BZR-V", "source": "FF", "text": "Unconfirmed rumors of mega-partnership between BZR-V and quick-commerce giant 🚀", "impact": 0.02, "is_fake": true},
  {"g": 1, "public_tick": 80, "ticker": "RELI-X", "source": "AN", "text": "Morgan Alpha initiates RELI-X with Overweight; highlights sovereign green hydrogen subsidy", "impact": 0.07, "is_fake": false},
  {"g": 1, "public_tick": 130, "ticker": "INFY-Z", "source": "NP", "text": "Infinity Systems closes $450M enterprise cloud migration deal with Nordic banking group", "impact": 0.05, "is_fake": false},
  {"g": 1, "public_tick": 180, "ticker": "GOLDCORE", "source": "FF", "text": "Auditor warning: Central depository missing physical bars?! Liquidating safe havens!", "impact": 0.0, "is_fake": true},

  // SESSION 2
  {"g": 2, "public_tick": 40, "ticker": "BZR-V", "source": "IN", "text": "Leaked MCA memo: Anti-profiteering bureau preparing unannounced audit at BZR headquarters", "impact": -0.11, "is_fake": false},
  {"g": 2, "public_tick": 90, "ticker": "INFY-Z", "source": "FF", "text": "Rumor: Key enterprise delivery heads at INFY resigning to launch competitor startup", "impact": -0.015, "is_fake": true},
  {"g": 2, "public_tick": 140, "ticker": "HDFC-W", "source": "NP", "text": "Liquidity tightens across domestic money market; short-term corporate paper yields climb", "impact": -0.04, "is_fake": false},
  {"g": 2, "public_tick": 170, "ticker": "TATA-Y", "source": "AN", "text": "Sector Downgrade: Auto sector input costs rising; recommend trimming industrial cyclicals", "impact": 0.04, "is_fake": true},

  // SESSION 3
  {"g": 3, "public_tick": 30, "ticker": "INFY-Z", "source": "NP", "text": "Infosys Z beats Q3 operating margin estimates by 180 bps; full-year guidance raised", "impact": 0.06, "is_fake": false},
  {"g": 3, "public_tick": 80, "ticker": "PULSE", "source": "FF", "text": "Whale wallet just loaded 50M PULSE on DEX! Next 50x run starts right now 🔥", "impact": 0.07, "is_fake": true},
  {"g": 3, "public_tick": 130, "ticker": "HDFC-W", "source": "AN", "text": "Credit Bureau Data: Gross NPAs for top-tier private lenders contract to multi-year lows", "impact": 0.05, "is_fake": false},
  {"g": 3, "public_tick": 180, "ticker": "BZR-V", "source": "IN", "text": "Board emergency call: Management preparing to issue formal statement denying MCA probe", "impact": 0.08, "is_fake": false},

  // SESSION 4
  {"g": 4, "public_tick": 40, "ticker": "GLOBAL", "source": "NP", "text": "RBI Monetary Policy Committee minutes indicate prolonged hawkish pause", "impact": -0.02, "is_fake": false},
  {"g": 4, "public_tick": 90, "ticker": "HDFC-W", "source": "AN", "text": "RBI Circular mandates 125% risk-weight on unsecured retail loans; HDFC capital ratio pressured", "impact": -0.07, "is_fake": false},
  {"g": 4, "public_tick": 140, "ticker": "RELI-X", "source": "FF", "text": "Breaking: Reliant Energy executive chairman stepping down unexpectedly due to health reasons!", "impact": -0.03, "is_fake": true},
  {"g": 4, "public_tick": 180, "ticker": "GOLDCORE", "source": "IN", "text": "Sovereign treasury desk directive: RBI expanding bullion allocation by ₹1,200 Cr this week", "impact": 0.05, "is_fake": false},

  // SESSION 5
  {"g": 5, "public_tick": 30, "ticker": "BZR-V", "source": "FF", "text": "Hearing European strategic partner is terminating integration contract with BZR-V", "impact": -0.05, "is_fake": false},
  {"g": 5, "public_tick": 80, "ticker": "RELI-X", "source": "IN", "text": "Confidential draft: Gulf strategic partner walks away from green ammonia JV", "impact": -0.09, "is_fake": false},
  {"g": 5, "public_tick": 130, "ticker": "INFY-Z", "source": "AN", "text": "Global IT spend forecast revised upward by Gartner; enterprise software resilience highlighted", "impact": 0.04, "is_fake": false},
  {"g": 5, "public_tick": 180, "ticker": "TATA-Y", "source": "NP", "text": "Fire reported at primary auto parts supplier warehouse outside Pune; delivery delays expected", "impact": -0.035, "is_fake": true},

  // SESSION 6
  {"g": 6, "public_tick": 40, "ticker": "PULSE", "source": "FF", "text": "Major bridge hack alert: Devs supposedly moving treasury to private addresses!", "impact": -0.05, "is_fake": true},
  {"g": 6, "public_tick": 90, "ticker": "BZR-V", "source": "NP", "text": "Exchange Regulatory Filing: Bazaar Ventures approves surprise ₹250 Cr open-market share buyback", "impact": 0.14, "is_fake": false},
  {"g": 6, "public_tick": 140, "ticker": "HDFC-W", "source": "IN", "text": "Insider rumor: RBI discussing special liquidity refinance window for tier-1 commercial lenders", "impact": 0.0, "is_fake": true},
  {"g": 6, "public_tick": 190, "ticker": "GLOBAL", "source": "AN", "text": "Closing session note: Proprietary desks squaring books ahead of institutional reset", "impact": 0.0, "is_fake": false},

  // SESSION 7
  {"g": 7, "public_tick": 30, "ticker": "RELI-X", "source": "AN", "text": "Global investment bank initiates institutional coverage with Overweight; target price ₹520", "impact": 0.04, "is_fake": false},
  {"g": 7, "public_tick": 80, "ticker": "RELI-X", "source": "IN", "text": "SEBI disclosure: Gulf Sovereign Wealth Fund files for 6.5% strategic equity block in Reliance X", "impact": 0.12, "is_fake": false},
  {"g": 7, "public_tick": 130, "ticker": "BZR-V", "source": "FF", "text": "Activist short seller was just forced to cover entire BZR-V position! We are going to ₹250!", "impact": -0.06, "is_fake": true},
  {"g": 7, "public_tick": 180, "ticker": "GOLDCORE", "source": "NP", "text": "World Gold Council reports record sovereign net buying in quarterly reserves review", "impact": 0.03, "is_fake": false},

  // SESSION 8
  {"g": 8, "public_tick": 40, "ticker": "INFY-Z", "source": "NP", "text": "Infinity Systems signs landmark 7-year multi-cloud AI infrastructure alliance with US defense supplier", "impact": 0.06, "is_fake": false},
  {"g": 8, "public_tick": 90, "ticker": "HDFC-W", "source": "AN", "text": "Institutional Wire: HDFC-W entering final negotiations for cross-border merger with Global Trust Corp", "impact": 0.13, "is_fake": false},
  {"g": 8, "public_tick": 140, "ticker": "PULSE", "source": "FF", "text": "Tier-1 exchange listing officially confirmed for PULSE tonight at 8 PM UTC! 🚀", "impact": 0.08, "is_fake": true},
  {"g": 8, "public_tick": 180, "ticker": "TATA-Y", "source": "IN", "text": "Ministry of Defense tender: Tyrell Autoworks selected as L1 bidder for heavy logistics fleet", "impact": 0.08, "is_fake": false},

  // SESSION 9
  {"g": 9, "public_tick": 30, "ticker": "HDFC-W", "source": "FF", "text": "Merger is dead! Antitrust regulators about to reject the HDFC-W deal! Sell everything!", "impact": -0.03, "is_fake": true},
  {"g": 9, "public_tick": 80, "ticker": "BZR-V", "source": "AN", "text": "Activist hedge fund publishes 80-page forensic report alleging circular revenue booking at Bazaar Ventures", "impact": -0.18, "is_fake": false},
  {"g": 9, "public_tick": 130, "ticker": "BZR-V", "source": "IN", "text": "BZR statutory auditor tenders resignation with immediate effect, citing documentation discrepancies", "impact": -0.09, "is_fake": false},
  {"g": 9, "public_tick": 170, "ticker": "GOLDCORE", "source": "NP", "text": "Systemic risk alert: Prime brokers hike margin requirements across high-beta equities; flight to bullion", "impact": 0.07, "is_fake": false},

  // SESSION 10
  {"g": 10, "public_tick": 40, "ticker": "INFY-Z", "source": "AN", "text": "Analyst downgrade: Enterprise software spend facing structural delay due to overseas macro freezes", "impact": -0.005, "is_fake": true},
  {"g": 10, "public_tick": 80, "ticker": "PULSE", "source": "NP", "text": "Critical zero-day protocol vulnerability exploits cross-chain bridge; $180M liquidated; PULSE pools frozen", "impact": -0.24, "is_fake": false},
  {"g": 10, "public_tick": 130, "ticker": "BZR-V", "source": "FF", "text": "BZR CEO going live on YouTube to sue short sellers for $2 Billion in damages! Buying back!", "impact": 0.03, "is_fake": true},
  {"g": 10, "public_tick": 170, "ticker": "GOLDCORE", "source": "IN", "text": "Prime broker memo: Tier-1 hedge funds deploying emergency liquidity into physical bullion deposits", "impact": 0.08, "is_fake": false},

  // SESSION 11
  {"g": 11, "public_tick": 40, "ticker": "GLOBAL", "source": "FF", "text": "Emergency domestic market closure rumored for tomorrow due to settlement volatility!", "impact": 0.0, "is_fake": true},
  {"g": 11, "public_tick": 90, "ticker": "GLOBAL", "source": "NP", "text": "Coordinated central bank stabilization facility activated ahead of final quad-witching expiry", "impact": 0.0, "is_fake": false},
  {"g": 11, "public_tick": 140, "ticker": "RELI-X", "source": "AN", "text": "Passive index rebalancing flows force RELI-X toward baseline equilibrium", "impact": 0.0, "is_fake": false},
  {"g": 11, "public_tick": 180, "ticker": "GLOBAL", "source": "IN", "text": "Institutional settlement protocol active: Market maker order books switching to liquidation matching mode", "impact": 0.0, "is_fake": false},
];

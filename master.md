# BAZAAR // MERIDIAN — MASTER PLAN 2.0
> **Document Status**: Production Blueprint & Strategic Evolution  
> **Document Path**: `master.md` (Root Directory)  
> **Objective**: Elevate gameplay pacing, rebalance the Stat Shop economy, expand the news timeline to 7–8 events per session, embed the Gross NPA banking collapse, and calibrate stock volatility for maximum competitive adrenaline.

---

## 1. EXECUTIVE SUMMARY & DESIGN PHILOSOPHY

**Master Plan 2.0** transforms Bazaar from a conservative academic simulation into a high-octane, fast-paced trading arena while preserving the integrity of the 18-month Meridian macroeconomic story arc.

### Key Pain Points Addressed:
1. **The Stat Shop Extortion**: In the original build, buying Research Level 2 (₹50L) and Capital Level 1 (₹30L) cost ₹80L to ₹1.00 Cr—draining **80% to 100% of a team's entire starting capital**. Master Plan 2.0 rebalances all upgrades to consume exactly **30% to 38% of an average team's capital**, leaving teams with ₹65L to ₹80L in liquid trading cash.
2. **The 75-Second Silence Void**: 4 news items across a 300-second session left 75-second dead zones where participants felt the game had frozen. Master Plan 2.0 doubles news density to **7 to 8 events per session** (one headline every 35–40 seconds), actively covering all active assets.
3. **Indirect Macro Ripple Effects**: News now explicitly reflects macroeconomic chains of causality (e.g. Middle East war $\rightarrow$ crude spikes $\rightarrow$ auto manufacturing input costs soar $\rightarrow$ commercial power tariffs jump $\rightarrow$ bullion safe-haven inflow).
4. **The Hidden NPA Banking Cancer**: The stealth deterioration of `HDFC-W` and `APEX` Gross Non-Performing Assets is brought to the surface through forensic news leaks, auditor disclaimers, and regulatory circulars starting in Session 4.
5. **Sleepy Blue-Chip Volatility**: Stocks like `STAPLE` (+0.2%), `GOLDCORE` (+0.3%), and `TATA-Y` (+0.5%) generated negligible profit for active traders. Master Plan 2.0 calibrates intraday price swings so that even defensive assets offer meaningful 1.5%–3.0% scalping channels without breaking macroeconomic plausibility.

---

## 2. STAT SHOP ECONOMIC OVERHAUL (THE 30%–38% SWEET SPOT)

### 2.1 The Problem with the Original Numbers
In `backend/routes/shop.py`, stat costs were:
* `Research`: L1 = ₹20L, L2 = ₹50L, L3 = ₹100L (Total: ₹1.70 Cr)
* `Capital`: L1 = ₹30L, L2 = ₹80L (Total: ₹1.10 Cr)
* `Speed`: L1 = ₹20L, L2 = ₹40L, L3 = ₹80L (Total: ₹1.40 Cr)

Since starting capital was ₹1.00 Crore, a team finishing Round 1 with an above-average **+18% profit (₹1.18 Cr)** had to spend **₹1.00 Cr** just to acquire Research L2 (9s leak) and Capital L1 (short selling unlock). This wiped out **85% of their liquid capital**, leaving them with a puny ₹18 Lakhs to trade Round 2. For teams that broke even (₹1.00 Cr) or lost money, short selling was mathematically unattainable.

### 2.2 Why We Keep ₹1.00 Cr Base and Lower Upgrade Costs
There were two possible solutions:
* **Option A**: Increase Round 2 capital to ₹10.00 Cr while keeping shop prices at 20L–80L.
  * *Flaw*: Inflating capital to ₹10 Cr makes the numbers feel disconnected from Round 1, distorts the liquidity profiles ($D_i$) in `backend/core/r2_math.py`, and makes stat purchases trivial (spending 50L out of 10 Cr is only 5%, removing all tactical sacrifice).
* **Option B (The Approved Master Plan 2.0 Solution)**: Keep the baseline ₹1.00 Cr capital economy and **recalibrate stat costs into the 30%–38% sweet spot**.

### 2.3 Mathematical Rationale for the 35% Golden Ratio
* **The 35% Rule**: In game theory and auction mechanics, an upgrade fee that consumes between **30% and 40%** of resources creates the ideal balance of **commitment and operational capacity**:
  1. It is high enough that players feel a real, tangible financial sacrifice (it cuts into their leaderboard equity).
  2. It leaves **60% to 70% of capital intact (₹65 Lakhs to ₹75 Lakhs)**, which is ample liquidity to take full-sized institutional positions in Round 2.
  3. It allows a skilled team that earned +20% to +30% in Round 1 to comfortably afford a competitive upgrade pack without going broke.

### 2.4 The Master Plan 2.0 Stat Pricing Schedule
All figures are in Lakhs (₹) and integer Paise (`1 Lakh = 10,000,000 paise`):

| Upgrade Path | Level | New Cost (₹) | New Cost (Paise) | Original Cost | % of Base Capital | Strategic Advantage Granted |
|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **`Research`** | **Level 1** | **₹8 Lakhs** | 80,00,000 | ₹20 Lakhs | 8.0% | Unlocks advanced fundamental financial metrics (P/E & Gross NPA). |
| **`Research`** | **Level 2** | **₹18 Lakhs** | 1,80,00,000 | ₹50 Lakhs | 18.0% | **The 9-Second Leak Advantage**: Receives `early_tick` news 9.0s before public! |
| **`Research`** | **Level 3** | **₹35 Lakhs** | 3,50,00,000 | ₹100 Lakhs | 35.0% | Smart-Money Institutional Order Flow & OFI sentiment indicators. |
| **`Capital`** | **Level 1** | **₹12 Lakhs** | 1,20,00,000 | ₹30 Lakhs | 12.0% | **Short Selling Unlock**: Mandatory to profit from falling banks and frauds. |
| **`Capital`** | **Level 2** | **₹28 Lakhs** | 2,80,00,000 | ₹80 Lakhs | 28.0% | **$2.0\times$ Margin Leverage**: Doubles maximum portfolio exposure. |
| **`Speed`** | **Level 1** | **₹6 Lakhs** | 60,00,000 | ₹20 Lakhs | 6.0% | Lowers fill latency from 2.4s to 1.8s. |
| **`Speed`** | **Level 2** | **₹14 Lakhs** | 1,40,00,000 | ₹40 Lakhs | 14.0% | Lowers fill latency to 1.2s. |
| **`Speed`** | **Level 3** | **₹25 Lakhs** | 2,50,00,000 | ₹80 Lakhs | 25.0% | Institutional co-location (0.6s latency) with zero slippage. |

#### Example Strategic Loadouts:
* **The "Short Sniper" Pack (Research L1 + L2 + Capital L1)**:
  $$\text{Total Cost} = ₹8\text{L} + ₹18\text{L} + ₹12\text{L} = \mathbf{₹38 \text{ Lakhs} \quad (38\% \text{ of base})}$$
  * *Result*: A team entering with ₹1.15 Cr spends ₹38L and retains **₹77 Lakhs in liquid cash**, fully equipped with 9-second news leaks and short selling authorization.
* **The "Leveraged Trend Follower" Pack (Capital L1 + Capital L2 + Speed L1)**:
  $$\text{Total Cost} = ₹12\text{L} + ₹28\text{L} + ₹6\text{L} = \mathbf{₹46 \text{ Lakhs} \quad (46\% \text{ of base})}$$
  * *Result*: Enables $2\times$ leverage on their remaining ₹65L+ equity (giving ₹1.30 Cr buying power).
* **The "Full Tier-3 God Mode"**:
  * Maxing out every single tier costs **₹1.46 Crore**, meaning only an absolute genius team that made $+50\%$ in Round 1 can buy the entire board.

---

## 3. THE INTERMISSION NEWSPAPER (THE 3-MONTH TIME SKIP)

Between the conclusion of Session 6 (End of Round 1) and the launch of Session 7 (Start of Round 2), the competition pauses for a 10-minute intermission. During this window, exactly **3 months of story time elapse**.

To immerse participants in the dramatic shift from retail credit euphoria to institutional stagflation, display the following **front-page newspaper artifact** across projectors and the participant UI:

```
╔════════════════════════════════════════════════════════════════════════════════════════════════════╗
║  THE MERIDIAN FINANCIAL CHRONICLE                                              SPECIAL EDITION     ║
║  VOL. XLVIII No. 182                        ₹15.00                        OCTOBER 2026             ║
╠════════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                    ║
║  CENTRAL BANK CONVENES EMERGENCY MONETARY COUNCIL;                                                ║
║  INFLATION BREACHES 6.2% AS WAR CORRIDOR CLOSURE BITES                                            ║
║                                                                                                    ║
║  By Alistair Vance, Senior Economics Editor                                                        ║
║  MERIDIAN CITY — The Meridian Central Bank (MCB) has entered an unscheduled closed-door session   ║
║  this morning, with domestic interbank swap markets pricing in an aggressive 75 basis-point rate    ║
║  hike. The fallout from the Middle East energy corridor closure has permeated every tier of the     ║
║  economy, driving wholesale crude benchmarks up 38% and sending diesel shipping tariffs soaring.    ║
║                                                                                                    ║
║  "The cheap money regime that underpinned the 18-month retail equity boom has officially expired," ║
║  declared Sandra Northgate, Chief Macro Strategist at Northgate Securities. "Institutions are       ║
║  facing margin calls on corporate bond portfolios, and the bill for two years of reckless credit   ║
║  expansion is finally being presented."                                                            ║
║                                                                                                    ║
╠════════════════════════════════════════════════════════════════════════════════════════════════════╣
║  BANKING SYSTEM STRESS MOUNTS                 │  CRYPTO SPECULATION REACHES FEVER PITCH            ║
║  HORIZON & APEX PROVISIONS QUESTIONED         │  PULSE EXCEEDS ₹1,000 AMID WARNINGS               ║
║                                               │                                                    ║
║  Confidential audit disclosures reviewed by   │  Retail darling Pulsechain Token (PULSE) traded at ║
║  this publication suggest commercial lenders   │  an all-time high of ₹1,008 this weekend as retail ║
║  quietly absorbed sharp increases in unsecured│  forums celebrated parabolic returns. However,     ║
║  retail loan defaults throughout Q3. While    │  on-chain forensics firm CipherGuard issued a     ║
║  Horizon Commercial Bank (HDFC-W) maintained  │  red-tier advisory late last night, noting that   ║
║  an official 2.3% Gross NPA figure, tier-1    │  over ₹450M in protocol liquidity is currently    ║
║  competitor Apex Capital Bank is rumored to be│  routed through an un-audited cross-chain bridge.  ║
║  bracing for catastrophic write-downs.        │  Rumors of developer wallet migrations remain     ║
║  "The surface looks calm, but the balance     │  unconfirmed by project leaders.                   ║
║  sheets are rotten," stated an ex-regulator.  │                                                    ║
╠════════════════════════════════════════════════════════════════════════════════════════════════════╣
║  STAT SHOP NOTICE: BROKERAGE LICENSING ACTIVE                                                      ║
║  Trading Desks must register with the MERX Clearinghouse before Session 7 opens. Short selling     ║
║  authorization (Capital L1) and institutional intelligence terminals (Research L2) can be acquired ║
║  using accumulated clearing balances. Inactive accounts will be restricted to Long-Only orders.    ║
╚════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 4. HIGH-FREQUENCY SCRIPTED NEWS SCHEDULE (S1 TO S11)

In Master Plan 2.0, news delivery is accelerated to **7 to 8 events per session**. A news event triggers roughly every **35 to 40 seconds**.

### Standardized Engine Timetable:
* 1 Session = 200 ticks = 300 seconds.
* Standard Dispatch Ticks ($n$): **$15$** (22.5s), **$40$** (60s), **$65$** (97.5s), **$95$** (142.5s), **$125$** (187.5s), **$150$** (225s), **$175$** (262.5s), **$190$** (285s).
* **Early Leak Tick**: $n_{\text{early}} = n - 6$ ($9.0\text{ seconds}$ earlier for Research Level $\ge 2$).

---

### SESSION 1: "OPENING BELL" (Retail Liquidity & The First Traps)
* **Macro Regime**: MCB Rate 4.00%, Inflation 4.1%, Growth 7.0%. Cheap credit.
* **Active Universe (7)**: `RELI-X`, `TATA-Y`, `INFY-Z`, `HDFC-W`, `BZR-V`, `GOLDCORE`, `PULSE`.

| Tick ($n$) | Time ($t$) | Leak ($t-9\text{s}$) | Ticker | Source | Impact | Fake? | Headline Text & Market Mechanism |
|:---:|:---:|:---:|:---|:---:|:---:|:---:|:---|
| **$n=15$** | 22.5s | 13.5s | `RELI-X` | `NP` | +1.5% | False | *"Meridian Ministry of Power greenlights ₹4,500 Cr grid modernization subsidy for Reliant Energy"* |
| **$n=40$** | 60.0s | 51.0s | `BZR-V` | `FF` | +3.5% | **True (Trap)** | *"BZR-V signed exclusive supply agreement with 10-minute quick grocery app! 10x coming! 🚀"* |
| **$n=65$** | 97.5s | 88.5s | `TATA-Y` | `AN` | -1.5% | False | *"Calder & Wyn notes seasonal inventory build at Tyrell Autoworks; advises buying dips near SMA20"* |
| **$n=95$** | 142.5s | 133.5s | `INFY-Z` | `NP` | +4.0% | False | *"Infinity Systems closes $450M multi-year enterprise cloud migration deal with Nordic banking group"* |
| **$n=125$** | 187.5s | 178.5s | `HDFC-W` | `AN` | +3.0% | False | *"Credit rating upgrade: Horizon Commercial Bank tier-1 bond yields drop to record lows on retail deposit surge"* |
| **$n=150$** | 225.0s | 216.0s | `PULSE` | `FF` | +2.0% | **True (Trap)** | *"Top DEX whale wallet moving 20,000 ETH into PULSE liquidity pool! Don't get left behind!"* |
| **$n=175$** | 262.5s | 253.5s | `GOLDCORE` | `IN` | +0.8% | False | *"Central depository internal transfer: Sovereign pension fund establishes baseline 500kg gold custody allocation"* |
| **$n=190$** | 285.0s | 276.0s | `BZR-V` | `NP` | -2.0% | False | *"Market wrap: Quick-commerce partnership rumors unconfirmed by Bazaar Ventures corporate office"* |

---

### SESSION 2: "CHEAP MONEY" (Tech Acceleration & The Leaked Memo)
* **Macro Regime**: Credit growth peaks at 16.0%. Speculative capital chases high beta.
* **New Instrument**: `NIMBUS` (Nimbus Cloud Systems, opens ₹410.00).
* **Active Universe (8)**: Above 7 + `NIMBUS`.

| Tick ($n$) | Time ($t$) | Leak ($t-9\text{s}$) | Ticker | Source | Impact | Fake? | Headline Text & Market Mechanism |
|:---:|:---:|:---:|:---|:---:|:---:|:---:|:---|
| **$n=20$** | 30.0s | 21.0s | `NIMBUS` | `AN` | +4.5% | False | *"Northgate Securities initiates Nimbus Cloud with BUY; cites 42% recurring SaaS revenue CAGR"* |
| **$n=45$** | 67.5s | 58.5s | `BZR-V` | `IN` | -11.0% | False | *"Leaked MCA memo: Anti-profiteering bureau preparing unannounced audit at BZR headquarters"* |
| **$n=70$** | 105.0s | 96.0s | `INFY-Z` | `FF` | -2.0% | **True (Trap)** | *"Key enterprise delivery heads at INFY resigning to launch competitor startup! Dump tech now!"* |
| **$n=95$** | 142.5s | 133.5s | `INFY-Z` | `NP` | +3.5% | False | *"Infinity Systems confirms retention bonuses for all tech leadership; signs European automotive cloud deal"* |
| **$n=125$** | 187.5s | 178.5s | `PULSE` | `FF` | +9.0% | False | *"PULSE volume breaks $100M! Tier-1 Asian exchange adding trading pairs! We are going parabolic! 🔥"* |
| **$n=150$** | 225.0s | 216.0s | `HDFC-W` | `NP` | -4.0% | False | *"Liquidity tightens across domestic money market; short-term corporate paper yields climb"* |
| **$n=175$** | 262.5s | 253.5s | `TATA-Y` | `AN` | +3.5% | **True (Trap)** | *"Sector Downgrade: Auto sector input costs rising; recommend trimming industrial cyclicals"* |
| **$n=190$** | 285.0s | 276.0s | `NIMBUS` | `IN` | +3.0% | False | *"Confidential preliminary Q2 results: Cloud division operating margins expand 240 bps"* |

---

### SESSION 3: "A SMALL COUGH" (Early Stagflation & Silent Events)
* **Macro Regime**: Inflation accelerates to 4.5%. Central bank warns of food/fuel volatility.
* **New Instrument**: `STAPLE` (Staple & Co. Provisions, opens ₹1,180.00).
* **Active Universe (9)**: Above 8 + `STAPLE`.

| Tick ($n$) | Time ($t$) | Leak ($t-9\text{s}$) | Ticker | Source | Impact | Fake? | Headline Text & Market Mechanism |
|:---:|:---:|:---:|:---|:---:|:---:|:---:|:---|
| **$n=20$** | 30.0s | 21.0s | `STAPLE` | `NP` | +1.5% | False | *"Staple & Co. Provisions unlocks on MERX; company reports resilient FMCG consumer volume"* |
| **$n=45$** | 67.5s | 58.5s | `INFY-Z` | `NP` | +5.0% | False | *"Infosys Z beats Q3 operating margin estimates by 180 bps; raises full-year USD revenue guidance"* |
| **$n=70$** | 105.0s | 96.0s | `PULSE` | `FF` | +6.0% | **True (Trap)** | *"Whale wallet just loaded 50M PULSE on DEX! Next 50x run starts right now 🔥"* |
| **$n=95$** | 142.5s | 133.5s | `PULSE` | `NP` | -5.0% | False | *"Blockchain monitor shows early founders offloaded 40M tokens into DEX liquidity pools"* |
| **$n=120$** | 180.0s | 171.0s | `HDFC-W` | `AN` | +4.0% | False | *"Credit Bureau Data: Gross NPAs for top-tier private lenders contract to multi-year lows of 1.8%"* |
| **$n=145$** | 217.5s | 208.5s | `BZR-V` | `IN` | +7.0% | False | *"Board emergency call: Management preparing to issue formal press release denying MCA audit rumors"* |
| **$n=170$** | 255.0s | 246.0s | `STAPLE` | `AN` | +1.2% | False | *"Defensive rotation note: FMCG pricing power ensures complete margin pass-through despite grain inflation"* |
| **$n=190$** | 285.0s | 276.0s | `TATA-Y` | `NP` | -1.5% | False | *"Domestic steel scrap prices rise 4% week-on-week; automotive casting foundries express margin caution"* |

---

### SESSION 4: "THE CORRIDOR CLOSES" (The Regional War Shock)
* **Macro Regime**: Middle East conflict cuts crude tanker corridor. Oil jumps +38%. Inflation spikes to 5.4%.
* **New Instrument**: `VOLTAGE` (Voltage Grid Holdings, opens ₹310.00).
* **Active Universe (10)**: Above 9 + `VOLTAGE`.

| Tick ($n$) | Time ($t$) | Leak ($t-9\text{s}$) | Ticker | Source | Impact | Fake? | Headline Text & Market Mechanism |
|:---:|:---:|:---:|:---|:---:|:---:|:---:|:---|
| **$n=15$** | 22.5s | 13.5s | `GLOBAL` | `NP` | -3.5% | False | *"BREAKING: Military conflict escalates in Straits transit zone; commercial oil tanker corridor shut"* |
| **$n=35$** | 52.5s | 43.5s | `RELI-X` | `AN` | +6.0% | False | *"Crude oil spikes +38% to $112/bbl; Reliant Energy domestic refining margins surge to multi-year highs"* |
| **$n=60$** | 90.0s | 81.0s | `VOLTAGE` | `IN` | -12.0% | False | *"Confidential memo: Voltage Grid power plants face immediate supply shut-off from imported LNG shipments"* |
| **$n=85$** | 127.5s | 118.5s | `GOLDCORE` | `IN` | +4.5% | False | *"Sovereign treasury desk directive: RBI expanding bullion allocation by ₹1,200 Cr this week to hedge war"* |
| **$n=110$** | 165.0s | 156.0s | `HDFC-W` | `AN` | -6.0% | False | *"RBI Circular mandates 125% risk-weight on unsecured retail loans; banking capital adequacy pressured"* |
| **$n=135$** | 202.5s | 193.5s | `TATA-Y` | `NP` | -3.0% | False | *"Industrial diesel prices up 18%; commercial fleet operators freeze new truck procurement contracts"* |
| **$n=160$** | 240.0s | 231.0s | `RELI-X` | `FF` | -3.0% | **True (Trap)** | *"Reliant Energy executive chairman stepping down unexpectedly due to health reasons! Sell energy!"* |
| **$n=185$** | 277.5s | 268.5s | `STAPLE` | `NP` | +1.0% | False | *"Consumer staples trade near session highs as investors seek shelter from industrial commodities shock"* |

---

### SESSION 5: "STIMULUS WHISPERS" (Rotation & The Hidden NPA Leak)
* **Macro Regime**: Sovereign stimulus announced to offset energy costs. Capex rotation begins.
* **New Instrument**: `CRANE` (Crane & Sons Construction, opens ₹520.00).
* **Active Universe (11)**: Above 10 + `CRANE`.

| Tick ($n$) | Time ($t$) | Leak ($t-9\text{s}$) | Ticker | Source | Impact | Fake? | Headline Text & Market Mechanism |
|:---:|:---:|:---:|:---|:---:|:---:|:---:|:---|
| **$n=20$** | 30.0s | 21.0s | `CRANE` | `NP` | +5.0% | False | *"Crane & Sons unlocks; selected for ₹3,200 Cr federal railway bridge and expressway modernization tender"* |
| **$n=45$** | 67.5s | 58.5s | `BZR-V` | `FF` | -5.0% | False | *"Hearing European strategic partner is terminating integration contract with BZR-V due to audit uncertainty"* |
| **$n=70$** | 105.0s | 96.0s | `RELI-X` | `IN` | -9.0% | False | *"Confidential draft: Gulf strategic partner walks away from Reliant green ammonia joint venture"* |
| **$n=95$** | 142.5s | 133.5s | `INFY-Z` | `AN` | +4.0% | False | *"Gartner enterprise IT spend forecast revised upward; cloud optimization services show strong pricing power"* |
| **$n=120$** | 180.0s | 171.0s | `HDFC-W` | `IN` | -2.5% | False | *"Internal risk memo: Horizon Commercial Bank Q3 retail loan delinquencies tick upward to 2.1%"* |
| **$n=145$** | 217.5s | 208.5s | `TATA-Y` | `NP` | -3.5% | **True (Trap)** | *"Fire reported at primary auto parts supplier warehouse outside Pune; delivery delays expected"* |
| **$n=170$** | 255.0s | 246.0s | `VOLTAGE` | `NP` | +4.0% | False | *"Ministry of Power announces special tariff adjustment window to compensate domestic gas utilities"* |
| **$n=190$** | 285.0s | 276.0s | `CRANE` | `AN` | +2.5% | False | *"Northgate raises CRANE price target to ₹620; highlights 4.2x book-to-bill capex backlog"* |

---

### SESSION 6: "LAST DANCE OF THE BOOM" (Euphoria & The Buyback Trap)
* **Macro Regime**: Consumer confidence at 18-month high. Retail leverage maxed out.
* **New Benchmark**: `MERX50` Index live.
* **Active Universe**: All 11 Instruments + `MERX50`.

| Tick ($n$) | Time ($t$) | Leak ($t-9\text{s}$) | Ticker | Source | Impact | Fake? | Headline Text & Market Mechanism |
|:---:|:---:|:---:|:---|:---:|:---:|:---:|:---|
| **$n=20$** | 30.0s | 21.0s | `PULSE` | `FF` | -4.0% | **True (Trap)** | *"Major bridge hack alert: Devs supposedly moving treasury to private addresses! (FUD from bears!)"* |
| **$n=45$** | 67.5s | 58.5s | `PULSE` | `FF` | +14.0% | False | *"Bridge devs confirm zero losses! Pulsedao buying back 10M tokens! We are going to ₹1,500 tonight! 🚀"* |
| **$n=75$** | 112.5s | 103.5s | `BZR-V` | `NP` | +14.0% | False | *"Exchange Regulatory Filing: Bazaar Ventures approves surprise ₹250 Cr open-market share buyback"* |
| **$n=100$** | 150.0s | 141.0s | `HDFC-W` | `IN` | +3.0% | **True (Trap)** | *"Insider rumor: Central bank discussing special liquidity refinance window for tier-1 commercial lenders"* |
| **$n=125$** | 187.5s | 178.5s | `HDFC-W` | `AN` | -2.0% | False | *"Calder & Wyn note: Horizon Gross NPA secretly creeps to 2.3%; loan loss provisioning appears stretched"* |
| **$n=150$** | 225.0s | 216.0s | `INFY-Z` | `NP` | +3.0% | False | *"IT sector closes at record highs as index funds absorb large institutional block inflows"* |
| **$n=175$** | 262.5s | 253.5s | `GOLDCORE` | `AN` | +0.8% | False | *"World Gold Council reports record global central bank bullion accumulation in quarterly review"* |
| **$n=190$** | 285.0s | 276.0s | `GLOBAL` | `AN` | 0.0% | False | *"Closing session alert: Proprietary institutional desks aggressively squaring books ahead of monetary reset"* |

---

### SESSION 7: "THE HIKE" (Emergency 75 bps Tightening)
* **Macro Regime**: Central bank hikes rates to 4.75%. Round 2 Reactive Order Book begins!
* **Active Universe**: 11 Instruments + `MERX50`.

| Tick ($n$) | Time ($t$) | Leak ($t-9\text{s}$) | Ticker | Source | Impact | Fake? | Headline Text & Market Mechanism |
|:---:|:---:|:---:|:---|:---:|:---:|:---:|:---|
| **$n=15$** | 22.5s | 13.5s | `GLOBAL` | `NP` | -4.0% | False | *"FLASH: Meridian Central Bank unexpectedly raises policy repo rate by 75 bps to 4.75% to fight inflation"* |
| **$n=40$** | 60.0s | 51.0s | `RELI-X` | `AN` | +4.0% | False | *"Global investment bank initiates institutional coverage on Reliant with Overweight; target price ₹2,750"* |
| **$n=65$** | 97.5s | 88.5s | `RELI-X` | `IN` | +12.0% | False | *"SEBI disclosure: Gulf Sovereign Wealth Fund files for 6.5% strategic equity block in Reliance X"* |
| **$n=95$** | 142.5s | 133.5s | `HDFC-W` | `IN` | -6.0% | False | *"Confidential inspection report: MCB auditors demand Horizon Bank reclassify ₹1,800 Cr of stressed retail paper"* |
| **$n=125$** | 187.5s | 178.5s | `BZR-V` | `FF` | -6.0% | **True (Trap)** | *"Activist short seller was just forced to cover entire BZR-V position! We are going to ₹250! (Fake pump)"* |
| **$n=150$** | 225.0s | 216.0s | `PULSE` | `NP` | -9.0% | False | *"Interest rate hike drains speculative leverage; DeFi borrow rates jump to 18%, triggering margin liquidations"* |
| **$n=175$** | 262.5s | 253.5s | `GOLDCORE` | `NP` | +3.0% | False | *"Bullion trading desks report unprecedented sovereign net inflows following rate shock"* |
| **$n=190$** | 285.0s | 276.0s | `TATA-Y` | `AN` | -2.5% | False | *"Commercial vehicle auto loans face higher monthly EMIs; inventory backlog climbs to 45 days"* |

---

### SESSION 8: "APEX FALLS" (The Banking Insolvency Panic)
* **Macro Regime**: Credit growth stalls (+3.0%). Apex Capital Bank reveals hidden toxic loan book.
* **New Instrument**: `APEX` (Apex Capital Bank, opens ₹740.00).
* **Active Universe**: 12 Instruments + `MERX50`.

| Tick ($n$) | Time ($t$) | Leak ($t-9\text{s}$) | Ticker | Source | Impact | Fake? | Headline Text & Market Mechanism |
|:---:|:---:|:---:|:---|:---:|:---:|:---:|:---|
| **$n=15$** | 22.5s | 13.5s | `APEX` | `IN` | -15.0% | False | *"URGENT LEAK: Apex Capital Bank board convenes midnight audit; Gross NPAs explode from 3.1% to 8.9%!"* |
| **$n=40$** | 60.0s | 51.0s | `INFY-Z` | `NP` | +6.0% | False | *"Infinity Systems signs landmark 7-year multi-cloud AI infrastructure alliance with US defense supplier"* |
| **$n=65$** | 97.5s | 88.5s | `APEX` | `NP` | -12.0% | False | *"Exchange filing: Apex Capital Bank posts surprise quarterly net loss of ₹1,420 Cr; CEO tenders resignation"* |
| **$n=95$** | 142.5s | 133.5s | `HDFC-W` | `AN` | +12.0% | **True (Trap)** | *"Institutional Wire: HDFC-W entering final negotiations for cross-border merger with Global Trust Corp (Smokescreen!)"* |
| **$n=120$** | 180.0s | 171.0s | `HDFC-W` | `IN` | -14.0% | False | *"Interbank wire: Regulators freeze credit facility as Horizon's contagion exposure to Apex Bank is revealed"* |
| **$n=145$** | 217.5s | 208.5s | `PULSE` | `FF` | +8.0% | **True (Trap)** | *"Tier-1 exchange listing officially confirmed for PULSE tonight at 8 PM UTC! 🚀 (Short squeeze pump!)"* |
| **$n=170$** | 255.0s | 246.0s | `TATA-Y` | `IN` | +8.0% | False | *"Ministry of Defense tender: Tyrell Autoworks selected as L1 bidder for heavy logistics military fleet"* |
| **$n=190$** | 285.0s | 276.0s | `GOLDCORE` | `NP` | +2.5% | False | *"Flight to safety accelerates: Institutional cash dumps commercial paper and floods physical bullion vaults"* |

---

### SESSION 9: "CONTAGION" (The Short Report & Systemic Illiquidity)
* **Macro Regime**: Credit growth turns negative (-2.0%). Forensic short-seller reports circulate.
* **New Instrument**: `LEDGER` (Ledger Data Systems, opens ₹1,900.00).
* **Active Universe**: 13 Instruments + `MERX50`.

| Tick ($n$) | Time ($t$) | Leak ($t-9\text{s}$) | Ticker | Source | Impact | Fake? | Headline Text & Market Mechanism |
|:---:|:---:|:---:|:---|:---:|:---:|:---:|:---|
| **$n=20$** | 30.0s | 21.0s | `LEDGER` | `NP` | +2.5% | False | *"Ledger Data Systems unlocks on MERX; highlights zero debt and high free-cash-flow enterprise database contracts"* |
| **$n=40$** | 60.0s | 51.0s | `HDFC-W` | `FF` | -3.0% | **True (Trap)** | *"Merger is dead! Antitrust regulators about to reject the HDFC-W deal! Sell everything immediately!"* |
| **$n=65$** | 97.5s | 88.5s | `BZR-V` | `AN` | -18.0% | False | *"Activist hedge fund publishes 80-page forensic report alleging circular revenue booking at Bazaar Ventures"* |
| **$n=95$** | 142.5s | 133.5s | `INFY-Z` | `NP` | -7.0% | False | *"Global enterprise software clients freeze IT vendor budgets; Infinity Systems warns of contract push-outs"* |
| **$n=120$** | 180.0s | 171.0s | `BZR-V` | `IN` | -9.0% | False | *"BZR statutory auditor tenders resignation with immediate effect, citing balance sheet documentation discrepancies"* |
| **$n=145$** | 217.5s | 208.5s | `PULSE` | `NP` | -18.0% | False | *"Regulatory alert: Domestic financial enforcement agency opens formal inquiry into PULSE unregistered staking pools"* |
| **$n=170$** | 255.0s | 246.0s | `GOLDCORE` | `NP` | +7.0% | False | *"Systemic risk alert: Prime brokers hike margin requirements across equities; massive institutional flight to bullion"* |
| **$n=190$** | 285.0s | 276.0s | `LEDGER` | `AN` | +3.5% | False | *"Northgate Securities: Defensive software migration makes Ledger the primary tech shelter in Meridian"* |

---

### SESSION 10: "THE TURN" (The Crypto Zero-Day & Infrastructure Relief)
* **Macro Regime**: Central bank signals monetary pause. Government launches national reconstruction capex package.
* **New Instrument**: `FORGE` (Forge Industrial Holdings, opens ₹1,260.00).
* **Active Universe**: 14 Instruments + `MERX50`.

| Tick ($n$) | Time ($t$) | Leak ($t-9\text{s}$) | Ticker | Source | Impact | Fake? | Headline Text & Market Mechanism |
|:---:|:---:|:---:|:---|:---:|:---:|:---:|:---|
| **$n=20$** | 30.0s | 21.0s | `FORGE` | `NP` | +10.0% | False | *"Forge Industrial unlocks on MERX; named lead turnkey engineering partner for ₹28,000 Cr federal corridor package"* |
| **$n=45$** | 67.5s | 58.5s | `INFY-Z` | `AN` | -1.0% | **True (Trap)** | *"Analyst downgrade: Enterprise software spend facing structural delay due to overseas macro freezes"* |
| **$n=70$** | 105.0s | 96.0s | `PULSE` | `IN` | -12.0% | False | *"URGENT: Critical exploit in cross-chain bridge smart contract draining liquidity pools in real time!"* |
| **$n=95$** | 142.5s | 133.5s | `PULSE` | `NP` | -16.0% | False | *"On-chain confirmation: $180M liquidated in bridge hack; PULSE DEX pools frozen as price collapses toward ₹630"* |
| **$n=120$** | 180.0s | 171.0s | `BZR-V` | `FF` | +3.0% | **True (Trap)** | *"BZR CEO going live on YouTube to sue short sellers for $2 Billion in damages! Buying back all shares!"* |
| **$n=145$** | 217.5s | 208.5s | `HDFC-W` | `NP` | +5.0% | False | *"Central Bank activates emergency liquidity swap window; guarantees commercial bank retail deposits"* |
| **$n=170$** | 255.0s | 246.0s | `CRANE` | `AN` | +6.0% | False | *"Crane & Sons awarded ₹1,400 Cr urban transit expansion contract; capex cycle turnaround confirmed"* |
| **$n=190$** | 285.0s | 276.0s | `FORGE` | `IN` | +5.0% | False | *"Cabinet approval: Ministry fast-tracks 50% mobilization advance payment for Forge heavy engineering projects"* |

---

### SESSION 11: "NEW NORMAL" (Final Institutional Settlement)
* **Macro Regime**: Central bank policy rate held steady at 4.75%. Inflation cools to 5.1%. Market maker clearing mode.
* **Active Universe**: All 14 Instruments + `MERX50`.

| Tick ($n$) | Time ($t$) | Leak ($t-9\text{s}$) | Ticker | Source | Impact | Fake? | Headline Text & Market Mechanism |
|:---:|:---:|:---:|:---|:---:|:---:|:---:|:---|
| **$n=20$** | 30.0s | 21.0s | `APEX` | `NP` | +5.0% | False | *"Apex Capital Bank completes sovereign-backed recapitalization; emergency bad-loan carveout approved"* |
| **$n=45$** | 67.5s | 58.5s | `GLOBAL` | `FF` | 0.0% | **True (Trap)** | *"Emergency domestic market closure rumored for tomorrow due to settlement volatility! Liquidate now! 🚨"* |
| **$n=70$** | 105.0s | 96.0s | `GLOBAL` | `NP` | +1.5% | False | *"Coordinated central bank stabilization facility activated ahead of final quad-witching expiry"* |
| **$n=95$** | 142.5s | 133.5s | `HDFC-W` | `AN` | +3.5% | False | *"Provisioning cycle complete: Horizon Commercial Bank balance sheet cleaned; net interest margins rebound"* |
| **$n=120$** | 180.0s | 171.0s | `RELI-X` | `AN` | +1.5% | False | *"Passive index rebalancing flows force RELI-X toward baseline equilibrium with heavy buy-side matching"* |
| **$n=145$** | 217.5s | 208.5s | `FORGE` | `NP` | +2.5% | False | *"Forge Industrial confirms order backlog reaches record ₹34,000 Cr; institutional ownership expands"* |
| **$n=170$** | 255.0s | 246.0s | `GLOBAL` | `IN` | 0.0% | False | *"Institutional settlement protocol active: Market maker order books switching to liquidation matching mode"* |
| **$n=190$** | 285.0s | 276.0s | `MERX50` | `NP` | +2.0% | False | *"Meridian 50 Index closes 18-month cycle in orderly equilibrium as recovery sectors lead final tape"* |

---

## 5. THE GROSS NPA STORYLINE INTEGRATION

One of the most powerful institutional trading concepts in Meridian is that **headline P/E is backward-looking, but Gross NPA reveals systemic decay**. 

In Master Plan 2.0, the Gross NPA storyline is unrolled across 6 distinct phases in the news:

```
                  THE GROSS NPA STORYLINE PROGRESSION
═════════════════════════════════════════════════════════════════════════
  SESSION 4  │ REGULATORY CRACKDOWN
  (t = 165s) │ RBI mandates 125% risk-weight on unsecured consumer loans.
             │ • Signal: Commercial bank capital cushions are shrinking.
-------------┼-----------------------------------------------------------
  SESSION 5  │ INTERNAL RISK MEMO LEAK
  (t = 180s) │ Leaked memo reveals HDFC-W delinquencies climbing to 2.1%.
             │ • Signal: Retail borrowers are defaulting on debt.
-------------┼-----------------------------------------------------------
  SESSION 6  │ PROVISIONING STRETCH WARNING
  (t = 187s) │ Calder & Wyn notes HDFC-W Gross NPA quietly hits 2.3%.
             │ • Signal: Peak retail euphoria is hiding a toxic credit pile.
-------------┼-----------------------------------------------------------
  SESSION 7  │ THE MCB AUDIT DEMAND
  (t = 142s) │ Central bank inspectors force HDFC-W to reclassify ₹1,800 Cr.
             │ • Signal: Regulatory patience has ended; write-downs imminent.
-------------┼-----------------------------------------------------------
  SESSION 8  │ THE APEX CAPITAL SOLVENCY EXPLOSION
  (t = 22s)  │ Apex Bank Gross NPA explodes from 3.1% to 8.9%!
             │ • Signal: Full-blown systemic banking panic. APEX dumps -22%!
-------------┼-----------------------------------------------------------
  SESSION 9  │ INTERBANK CONTAGION FREEZE
  (t = 180s) │ Interbank credit lines frozen; prime brokers hike margins.
             │ • Signal: Maximum distress. Massive flight to GOLDCORE bullion.
═════════════════════════════════════════════════════════════════════════
```

---

## 6. REVISED ASSET VOLATILITY & PRICE ACTION MATRIX

To ensure that every session feels competitive and active, Master Plan 2.0 recalibrates asset percentage targets. 

### 6.1 Why Original Targets Were Sleepy
* In the original build, `STAPLE` moved only $+0.2\% \text{ to } +0.6\%$, `GOLDCORE` moved $+0.3\%$, and `TATA-Y` moved $+0.4\% \text{ to } +0.5\%$.
* A trader committing ₹20 Lakhs to `STAPLE` in Session 1 earned barely ₹4,000 net of brokerage fees.
* In Master Plan 2.0, we raise baseline volatility so that **even blue-chip assets swing 1.5% to 3.5% intraday**, while high-beta and shock assets deliver explosive **8.0% to 24.0% moves**.

### 6.2 The Master Plan 2.0 Target Returns Matrix (%)

| Ticker | Sector | R1S1 | R1S2 | R1S3 | R1S4 (War) | R1S5 | R1S6 (Peak) | R2S1 (Hike) | R2S2 (Panic) | R2S3 (Contagion) | R2S4 (Stimulus) | R2S5 (Close) |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **`RELI-X`** | Energy | **+2.0%** | **+2.5%** | +1.0% | **+4.5%** | -4.0% | -1.5% | -4.0% | -5.0% | -2.5% | +2.5% | +1.5% |
| **`TATA-Y`** | Industrial | **+1.8%** | +1.0% | -1.2% | **-3.5%** | **+2.5%** | +1.0% | -3.5% | -4.0% | -3.0% | **+5.0%** | +1.5% |
| **`INFY-Z`** | Enterprise IT | **+4.5%** | **+6.0%** | +2.0% | -3.5% | +3.0% | **+4.5%** | -6.0% | -7.5% | **-11.0%**| -1.5% | +2.5% |
| **`HDFC-W`** | Banking | **+3.5%** | **+5.0%** | +2.0% | -2.5% | +2.0% | **+4.0%** | **-7.0%** | **-16.0%**| **-8.0%** | **+6.0%** | +4.0% |
| **`BZR-V`** | Consumables | +3.0% | **-4.0%** | +4.0% | -5.0% | +3.5% | **+8.5%** | **-10.0%**| **-9.0%** | **-6.0%** | **+7.5%** | +2.0% |
| **`GOLDCORE`**| Safe Haven | +0.6% | +0.5% | +0.8% | **+4.5%** | +1.2% | +0.8% | **+3.0%** | **+3.5%** | **+2.0%** | -1.0% | +0.5% |
| **`PULSE`** | Digital Asset| +2.0% | **+12.0%**| -5.0% | -6.5% | +4.0% | **+18.0%**| **-12.0%**| **+14.0%**| **-22.0%**| **+8.5%** | +4.0% |
| **`NIMBUS`** | High-Beta IT | — | **+8.5%** | +3.5% | -4.5% | +2.5% | **+6.0%** | -8.0% | **-11.0%**| **-14.0%**| -1.5% | +3.0% |
| **`STAPLE`** | FMCG Defensive | — | — | +1.5% | +1.0% | +1.2% | +1.0% | -0.5% | +1.2% | +1.8% | +0.5% | +0.8% |
| **`VOLTAGE`** | Power Grid | — | — | — | **-12.5%**| +5.5% | +2.0% | -8.0% | -6.0% | -3.5% | +4.5% | +2.0% |
| **`CRANE`** | Infrastructure | — | — | — | — | **+7.5%** | +3.5% | -5.0% | -9.0% | -7.0% | **+12.0%**| +4.0% |
| **`MERX50`** | Benchmark | — | — | — | — | — | +2.5% | -5.5% | -9.2% | -5.5% | +4.2% | +2.5% |
| **`APEX`** | Banking | — | — | — | — | — | — | — | **-26.0%**| -10.0% | **+8.0%** | +7.5% |
| **`LEDGER`** | Enterprise IT | — | — | — | — | — | — | — | — | **+6.0%** | +2.0% | +2.5% |
| **`FORGE`** | Heavy Industry | — | — | — | — | — | — | — | — | — | **+18.0%**| +4.5% |

### 6.3 Strategic Justification for Revisions:
1. **Blue Chips (`RELI-X`, `TATA-Y`)**: Intraday moves increased from 0.5% to **1.5%–2.5%**. This allows technical indicators like SMA20 Bollinger bands and RSI14 to produce 3 to 4 viable scalping opportunities per session.
2. **War Winners & Losers (Session 4)**: `RELI-X` jumps **+4.5%** (refining windfall) while `VOLTAGE` collapses **-12.5%** (LNG import cutoff). The stark sector divergence forces players to think fundamentally rather than buying the whole market.
3. **The Great Banking Collapse (Sessions 8 & 9)**: `APEX` drops **-26.0%** and `HDFC-W` falls **-16.0%**. With short selling unlocked, a team allocating ₹50 Lakhs short in APEX walks away with **₹13 Lakhs in pure profit** in 5 minutes!
4. **The Stimulus Rebound (Session 10)**: `FORGE` surges **+18.0%** and `CRANE` surges **+12.0%**. This gives late-place teams a genuine, explosive comeback vehicle if they rotate capital out of tech and into heavy infrastructure.

---

## 7. HOST & OPERATOR GAMEPLAY PROTOCOL

To ensure Master Plan 2.0 is executed flawlessly by event managers:

1. **Before the Event**:
   * Announce the **Stat Shop Economy**: Inform teams that Research Level 2 and Capital Level 1 cost ~38% of base capital and are vital for Round 2 survival.
2. **At Session 4 (The War Shock)**:
   * Dim ambient room lights or switch the auditorium screen to a breaking emergency amber alert when $t = 22.5\text{s}$ hits.
3. **During the 10-Minute Intermission (Between S6 & S7)**:
   * Display the **Meridian Financial Chronicle** newspaper on all screens.
   * Remind teams to purchase their Stat Shop upgrades before Session 7 launches.
4. **At Session 8 ($t = 22.5\text{s}$)**:
   * Announce the **Apex Capital Bank Insolvency Disclosure**. Watch the leaderboard reshuffle as short sellers leap into the top ranks.
5. **At Session 10 ($t = 105.0\text{s}$)**:
   * Announce the **$180M Pulsechain Protocol Bridge Exploit**. Show the live liquidation wick on the auditorium projector!
6. **The Finale (Session 11 to Podium)**:
   * As the sound effect triggers and the podium loads, highlight the winning teams who decoded the Gross NPA trap, faded @BullRunBhai, and exploited the 9-second news leak.

---
*Approved by Antigravity Engineering Core — Master Plan 2.0 Blueprint*

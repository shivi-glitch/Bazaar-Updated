# BAZAAR // MERIDIAN — THE MASTER ARCHITECTURAL & PRICE MECHANICS REFERENCE
> **Document Status**: Production Master Reference ("The God View")  
> **Verification**: 100% Verified Against Backend Source Code (`backend/core/engine.py`, `backend/core/r2_math.py`, `backend/core/news_ledger.py`, `backend/core/liquidity.py`, and `data/prices_r1.parquet`)  
> **Scope**: 11 Sessions across Round 1 (Retail Era, S1–S6) and Round 2 (Institutional Era, S7–S11)

---

## 1. EXECUTIVE ENGINE ARCHITECTURE & MATHEMATICAL SPECIFICATION

Bazaar operates on a **dual-engine simulation system** that transitions from a deterministic macroeconomic narrative in Round 1 to an interactive, reactive, order-driven microstructure in Round 2.

```
       ROUND 1: DETERMINISTIC ENGINE (Sessions 1 – 6)
 ┌──────────────────────────────────────────────────────────────┐
 │ Baseline Spline (data/prices_r1.parquet)                     │
 │   + Multi-Tick Fractional News Shocks (2 to 8 ticks)         │
 │   + Stochastic Heartbeat Drift (Beta-weighted Uniform Noise) │
 │   + Automated Level-2 Liquidity Order Book Generation        │
 └──────────────────────────────┬───────────────────────────────┘
                                │
                 [ INTERMISSION: STAT SHOP UNLOCKS ]
                 [  Research L1-L3 | Capital L1-L2 ]
                                │
                                ▼
       ROUND 2: REACTIVE AGENTIC ENGINE (Sessions 7 – 11)
 ┌──────────────────────────────────────────────────────────────┐
 │ Story Anchor F(t) (Brownian drift + Fundamental Path)       │
 │   + Live Player Order Flow (A_net_notional / Depth_Rupees)   │
 │   + Market Maker Bot Pull-Back (Mean Reversion tau, L)       │
 │   + Level-2 Dynamic DOM Depth & Institutional Snipers        │
 └──────────────────────────────┘───────────────────────────────┘
```

### 1.1 The Engine Clock & Tick Grid
* **Tick Length ($n$)**: Exactly $1.5\text{ seconds}$ in real time (`await asyncio.sleep(1.5)` in `backend/core/engine.py`).
* **Session Duration**: Exactly $200\text{ ticks} = 300\text{ seconds} = 5.0\text{ minutes}$ per session.
* **Clock Conversion**: $t(\text{seconds}) = n \times 1.5$.
* **Session Lifecycle**: `LOCKED` $\rightarrow$ `READY` $\rightarrow$ `STARTING` (3s countdown) $\rightarrow$ `RUNNING` (ticks 0 to 200) $\rightarrow$ `FINISHED`.

---

### 1.2 Information Asymmetry & The 4-Tier News Pipeline
News delivery is governed by **source credibility ratings** and **Research Level upgrades** (`backend/core/news_ledger.py` and `backend/core/engine.py`):

| Source Code | Source Name | Truth Rate | Inverted / Contrarian Bias | Voice & Characteristics |
|:---:|:---|:---:|:---:|:---|
| **`IN`** | **Desk Source (Anonymous)** | **90%** | 10% (Rare disinformation) | Terse, institutional, leak tone, highly accurate |
| **`AN`** | **Calder & Wyn / Northgate** | **75%** | 25% (Hedged or lagging) | Professional equity research, measured target horizons |
| **`NP`** | **The Meridian Standard** | **55%** | 45% (Essentially a coin-flip) | Factual, backward-looking headlines; often arrives after move |
| **`FF`** | **@BullRunBhai** | **35%** | **65% (Strong Contrarian Alpha)** | Hyperbolic, urgent ("NOW 🚀"), retail exit liquidity traps |

#### The 9-Second Early Leak Rule
* **Standard Public Broadcast**: Delivered to all connected clients at `public_tick` ($n$).
* **Institutional Early Leak**: Delivered at `early_tick = public_tick - 6` ($6\text{ ticks} = 9.0\text{ seconds}$ before the public).
* **Eligibility Filter**: Restricted strictly to teams with **Research Level $\ge 2$** via targeted WebSocket packet injection (`broadcast_to_specific_teams`).

---

### 1.3 News Shock Smoothing Mechanics
When a genuine or deceptive news item hits the engine at `public_tick`, prices **never jump instantaneously**. The engine queues an active shock that spreads smoothly over multiple ticks:

$$\text{duration\_ticks} = \text{random.randint}(2, 8) \quad (3.0\text{s to } 12.0\text{s})$$

$$\text{impact\_per\_tick} = \frac{\text{raw\_impact}}{\text{duration\_ticks}}$$

* **Volume Multiplier**: During active shock application, trading volume spikes by $3.5\times$ base volume (`volume_boost = 3.5`).
* **Per-Tick Execution**:
  $$P_{n} = \max\left(100, \left\lfloor P_{n-1} \times (1.0 + \text{impact\_per\_tick}) \right\rfloor\right)$$

---

### 1.4 Continuous Stochastic Drift ("The Heartbeat")
To prevent artificial flatlining between news events, the engine applies an autonomous random walk on every tick:

$$P_{n} = \left\lfloor P_{n} \times (1.0 + \text{drift\_percent}) \right\rfloor, \quad \text{where } \text{drift\_percent} \sim \mathcal{U}(-\text{noise\_limit}, +\text{noise\_limit})$$

| Asset Classification | Ticker Symbols | Noise Limit ($\pm\%$) | Behavioral Manifestation |
|:---|:---|:---:|:---|
| **High-Beta Speculative** | `BZR-V`, `PULSE` | $\pm 0.35\%$ | Jagged, violent micro-oscillations; prone to false breakouts |
| **Trending Momentum** | `INFY-Z`, `HDFC-W` | $\pm 0.15\%$ | Clean trend continuation with moderate micro-volatility |
| **Blue-Chip / Industrial** | `RELI-X`, `TATA-Y`, `NIMBUS`, `STAPLE`, `VOLTAGE`, `CRANE` | $\pm 0.10\%$ | Smooth organic breathing; stable order book |
| **Ultra-Safe Haven** | `GOLDCORE` | $\pm 0.04\%$ | Rock-solid tight spread; minimal drift |

---

### 1.5 Round 2 Reactive Mathematics (`backend/core/r2_math.py`)
In Round 2 (Sessions 7 to 11), trades placed by human teams dynamically move the market price. The engine runs a continuous institutional simulation:

```
            +───────────────────────────────────────+
            │     Net Player Flow (A_net_notional)   │
            +──────────────────┬────────────────────+
                               │
                               ▼
        +───────────────────────────────────────────────+
        │   flow_impact = 0.01 * (A_net / Depth_Rupees) │
        +──────────────────────┬────────────────────────+
                               │
                               ▼
+──────────────────────────+   │   +──────────────────────────+
│ Story Anchor Drift F(t)  ├───┴───┤ Bot Mean-Reversion Pull  │
│   (Micro-Brownian Walk)  │       │   pull = -alpha * dev_s  │
+──────────────────────────+       +──────────────────────────+
                               │
                               ▼
            +───────────────────────────────────────+
            │ Net Return: r_i = clip(pull + flow, 5%)│
            │ Price Update: P = P * exp(r_i)        │
            │ Rounding: round(P / 0.05) * 0.05      │
            +───────────────────────────────────────+
```

#### 1. Liquidity Profiles (Market Depth $D_i$)
The exact Rupee notional required to shift the price by $1.0\%$:
* `GOLDCORE`: ₹4,00,00,000 (₹4.00 Cr) — Deepest market depth in Meridian
* `RELI-X`: ₹3,00,00,000 (₹3.00 Cr) — Heavyweight energy blue chip
* `HDFC-W`: ₹2,50,00,000 (₹2.50 Cr) — Tier-1 commercial banking pillar
* `INFY-Z`: ₹2,00,00,000 (₹2.00 Cr) — Blue-chip enterprise IT
* `TATA-Y`: ₹1,50,00,000 (₹1.50 Cr) — Infrastructure cyclical
* `STAPLE`: ₹1,00,00,000 (₹1.00 Cr) — FMCG defensive
* `NIMBUS`: ₹75,00,000 (₹75 Lakhs) — Mid-cap high-beta cloud
* `LEDGER`: ₹60,00,000 (₹60 Lakhs) — Enterprise database (R2S3 unlock)
* `APEX`: ₹50,00,000 (₹50 Lakhs) — Stressed investment bank (R2S2 unlock)
* `VOLTAGE`: ₹40,00,000 (₹40 Lakhs) — High-beta green energy
* `FORGE`: ₹35,00,000 (₹35 Lakhs) — Heavy engineering (R2S4 unlock)
* `CRANE`: ₹25,00,000 (₹25 Lakhs) — Small-cap construction
* `BZR-V`: ₹15,00,000 (₹15 Lakhs) — Micro-cap volatile media
* `PULSE`: ₹10,00,000 (₹10 Lakhs) — Ultra-thin speculative token (10 Lakhs moves it 1%)

#### 2. The Mean-Reversion Pull-Back Formula
$$\text{dev}(n) = \ln(P_n) - \ln\left(F_{t - L}\right)$$

$$\text{dev}_s(n) = \text{dev}_s(n-1) + 0.221 \cdot \left(\text{dev}(n) - \text{dev}_s(n-1)\right) \quad (\text{2-second exponential moving average})$$

$$\alpha = 1 - e^{-0.5 / \tau}$$

$$\text{pull}(n) = -\alpha \cdot \text{dev}_s(n)$$

#### 3. Market Mood Profiles (`backend/core/r2_math.py`)
| Mood State | $\tau$ (Pull-Back Time Constant) | $L$ (Anchor Reaction Lag) | Behavioral Meaning |
|:---|:---:|:---:|:---|
| **`calm`** | $8\text{ seconds}$ | $2.5\text{ seconds}$ | Slow, orderly mean-reversion; easy to push temporarily |
| **`tense`** | $6\text{ seconds}$ | $2.0\text{ seconds}$ | Rapid liquidity withdrawal; tighter bot defense |
| **`panic`** | $4\text{ seconds}$ | $1.5\text{ seconds}$ | Violent mean-reversion; bots aggressively punish deviations |
| **`recovery`** | $6\text{ seconds}$ | $2.0\text{ seconds}$ | Orderly institutional accumulation |

#### 4. Total Return & Execution
$$r_i(n) = \text{clip}\left(\text{pull}(n) + 0.01 \cdot \frac{A_{\text{net}}}{D_i}, \; -0.05, \; +0.05\right)$$

$$P_{n+1} = \text{round}\left(\frac{P_n \cdot e^{r_i(n)}}{0.05}\right) \times 0.05$$

---

### 1.6 Level-2 Dynamic Order Book Generation (`backend/core/liquidity.py`)
On every tick, 5 bot classes reconstruct the Level-2 Depth of Market (top 4 bids and asks):
1. **Market Makers (Anchor)**: Quote spreads of $0.10\% \text{ to } 0.25\%$ around current price with $1,500\text{ to } 3,500$ share depth.
2. **Noise Traders (Retail)**: Seed random orders $2\text{ to } 3$ levels deep ($300\text{ to } 1,200$ shares).
3. **Mean-Reversion Faders**: If volatility $> 1.2\times$, stack $4,000\text{ to } 7,000$ shares against the trend.
4. **Spoofers (Manipulators)**: With $40\%$ probability, flash fake $15,000\text{ to } 25,000$ share walls $3$ levels deep to distort the DOM gauge.
5. **Directional Snipers (News Reactants)**: When a news shock is active, instantly stack massive walls ($18,000\text{ to } 35,000$ shares) on the bid (bullish shock) or ask (bearish shock).

---

## 2. THE 18-MONTH MERIDIAN MACROECONOMIC STORYLINE

The entire 11-session competition mirrors an 18-month macroeconomic business cycle across the Meridian Exchange (MERX):

```
       MERIDIAN MACROECONOMIC TIMELINE (18 MONTHS)
═════════════════════════════════════════════════════════════════
  [MONTHS 1 - 6]   CREDIT EXPANSION & EUPHORIC BOOM (R1S1 - R1S3)
                   • MCB holds rates at 4.0%. Cheap capital fuels enterprise IT.
                   • PULSE and BZR-V experience speculative retail mania.
-----------------------------------------------------------------
  [MONTHS 7 - 9]   THE WAR SHOCK & INFLATION IMPLOSION (R1S4 - R1S6)
                   • Regional conflict shuts the Middle East crude corridor.
                   • Oil surges +38%. Inflation spikes from 4.1% to 5.6%.
                   • HDFC-W loan books deteriorate secretly (Gross NPA 1.8% -> 2.3%).
-----------------------------------------------------------------
  [MONTH 10]       THE RECKONING: EMERGENCY RATE HIKE (R2S1)
                   • MCB hikes rates unexpectedly by 75 bps (4.0% -> 4.75%).
                   • Institutional desks dump high-beta equities; flight to GOLDCORE.
-----------------------------------------------------------------
  [MONTHS 11 - 13] BANKING CRISIS & SYSTEMIC CONTAGION (R2S2 - R2S3)
                   • Apex Capital Bank reveals hidden NPA catastrophe (3.1% -> 8.9%).
                   • APEX crashes -22%; HDFC-W plummets -14%.
                   • Liquidity evaporates; $180M crypto bridge exploit decimates PULSE.
-----------------------------------------------------------------
  [MONTHS 14 - 18] SOVEREIGN STIMULUS & NEW NORMAL RECOVERY (R2S4 - R2S5)
                   • Meridian Ministry announces emergency infrastructure stimulus.
                   • FORGE and CRANE rally aggressively; banks stabilize.
═════════════════════════════════════════════════════════════════
```

### Macroeconomic Dashboard by Session
| Metric | R1S1 | R1S2 | R1S3 | R1S4 | R1S5 | R1S6 | R2S1 | R2S2 | R2S3 | R2S4 | R2S5 |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **MCB Policy Rate** | 4.00% | 4.00% | 4.00% | 4.00% | 4.00% | 4.00% | 4.75% | 4.75% | 4.75% | 4.75% | 4.75% |
| **CPI Inflation** | 4.1% | 4.2% | 4.5% | 5.4% | 5.6% | 5.5% | 6.2% | 6.4% | 6.1% | 5.6% | 5.1% |
| **GDP Growth** | 7.0% | 7.2% | 7.1% | 6.2% | 6.3% | 6.4% | 5.4% | 4.1% | 3.0% | 3.4% | 4.0% |
| **Credit Growth** | 14.0% | 16.0% | 17.0% | 17.0% | 16.0% | 15.0% | 11.0% | 3.0% | -2.0% | 0.0% | 2.0% |
| **Crude Oil Index** | 100 | 101 | 102 | 138 | 134 | 131 | 129 | 124 | 120 | 114 | 108 |

---

## 3. ROUND 1: RETAIL BOOM SESSIONS (S1 TO S6)

In Round 1, prices follow the deterministic master spline generated from `data/prices_r1.parquet`, overlaid with dynamic active shocks and stochastic drift.

---

### SESSION 1: "OPENING BELL" (Quiet Liquidity & First Planted Edges)
* **Macro Backdrop**: Central bank holds rates at 4.00%. Liquidity is abundant.
* **Active Universe (7 Stocks)**: `RELI-X`, `TATA-Y`, `INFY-Z`, `HDFC-W`, `BZR-V`, `GOLDCORE`, `PULSE`.
* **Regime Multiplier**: $m_1 = 0.8$ (Tightly controlled volatility).

#### Session 1 News Dispatch Schedule
| Trigger Tick ($n$) | Clock ($t$) | Early Leak ($n-6$) | Source | Target | Raw Impact | Fake? | Verbatim News Headline |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **$n=30$** | 45.0s | 36.0s ($n=24$) | `FF` | `BZR-V` | **+2.0%** | **TRUE (FAKE)** | *"Unconfirmed rumors of mega-partnership between BZR-V and quick-commerce giant 🚀"* |
| **$n=80$** | 120.0s | 111.0s ($n=74$) | `AN` | `RELI-X` | **+7.0%** | **FALSE (REAL)** | *"Morgan Alpha initiates RELI-X with Overweight; highlights sovereign green hydrogen subsidy"* |
| **$n=130$** | 195.0s | 186.0s ($n=124$) | `NP` | `INFY-Z` | **+5.0%** | **FALSE (REAL)** | *"Infinity Systems closes $450M enterprise cloud migration deal with Nordic banking group"* |
| **$n=180$** | 270.0s | 261.0s ($n=174$) | `FF` | `GOLDCORE` | **0.0%** | **TRUE (FAKE)** | *"Auditor warning: Central depository missing physical bars?! Liquidating safe havens!"* |

#### Session 1 Asset Performance & Range Table
| Ticker | Full Name | Sector | Start (₹) | End (₹) | Min (₹) | Max (₹) | Net Chg | Session Behavioral Story & Alpha Play |
|:---|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **`RELI-X`** | Reliant Energy | Energy | 2,450.00 | 2,469.60 | 2,446.50 | 2,471.70 | **+0.80%** | Anchored blue chip. Absorbs green hydrogen analyst report at $t=120\text{s}$ cleanly. Buy and hold. |
| **`TATA-Y`** | Tyrell Autoworks | Industrial | 880.00 | 884.40 | 877.30 | 890.35 | **+0.50%** | **Planted Cycle Edge (EDGE-A)**: Sinusoidal swing ($\pm 1.8\%$, 70s period). Buy dips below SMA20, exit at top. |
| **`INFY-Z`** | Infinity Systems | Enterprise IT | 1,520.00 | 1,565.60 | 1,514.95 | 1,567.20 | **+3.00%** | **Momentum Trend**: Cloud deal news at $t=195\text{s}$ drives sustained breakout. Ride the trend. |
| **`HDFC-W`** | Horizon Commercial Bank | Banking | 1,640.00 | 1,681.00 | 1,638.80 | 1,681.00 | **+2.50%** | Clean upward trend propelled by cheap retail lending growth. Closed at highs. |
| **`BZR-V`** | Bazaar Ventures | Consumables | 640.00 | 649.60 | 637.95 | 651.55 | **+1.50%** | **Finfluencer Trap (EDGE-C)**: Pumps +2% at $t=45\text{s}$ on fake rumor, then immediately retraces. Fade the pump. |
| **`GOLDCORE`**| Goldcore Trust | Safe Haven | 6,200.00 | 6,218.60 | 6,184.35 | 6,238.35 | **+0.30%** | Completely unaffected by retail noise. Serves as baseline cash park. |
| **`PULSE`** | Pulsechain Token | Digital Asset| 850.00 | 854.25 | 849.10 | 860.40 | **+0.50%** | Dormant accumulator. Tight consolidation before the upcoming expansion. |

---

### SESSION 2: "CHEAP MONEY" (The Tech Expansion & Post-News Drift)
* **Macro Backdrop**: Credit expansion peaks (+16%). Loan books swell.
* **New Instrument Unlocked**: `NIMBUS` (Nimbus Cloud Systems, opens at ₹410.00).
* **Active Universe (8 Stocks)**: Above 7 + `NIMBUS`.

#### Session 2 News Dispatch Schedule
| Trigger Tick ($n$) | Clock ($t$) | Early Leak ($n-6$) | Source | Target | Raw Impact | Fake? | Verbatim News Headline |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **$n=40$** | 60.0s | 51.0s ($n=34$) | `IN` | `BZR-V` | **-11.0%** | **FALSE (REAL)** | *"Leaked MCA memo: Anti-profiteering bureau preparing unannounced audit at BZR headquarters"* |
| **$n=90$** | 135.0s | 126.0s ($n=84$) | `FF` | `INFY-Z` | **-1.5%** | **TRUE (FAKE)** | *"Rumor: Key enterprise delivery heads at INFY resigning to launch competitor startup"* |
| **$n=140$** | 210.0s | 201.0s ($n=134$) | `NP` | `HDFC-W` | **-4.0%** | **FALSE (REAL)** | *"Liquidity tightens across domestic money market; short-term corporate paper yields climb"* |
| **$n=170$** | 255.0s | 246.0s ($n=164$) | `AN` | `TATA-Y` | **+4.0%** | **TRUE (FAKE)** | *"Sector Downgrade: Auto sector input costs rising; recommend trimming industrial cyclicals"* |

#### Session 2 Asset Performance & Range Table
| Ticker | Sector | Start (₹) | End (₹) | Min (₹) | Max (₹) | Net Chg | Session Behavioral Story & Alpha Play |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **`RELI-X`** | Energy | 2,469.60 | 2,494.30 | 2,469.60 | 2,500.95 | **+1.00%** | Stable compounder. Slow upward drift without resistance. |
| **`TATA-Y`** | Industrial | 884.40 | 887.95 | 878.65 | 887.95 | **+0.40%** | The analyst downgrade at $t=255\text{s}$ is a false bear trap. Stock rebounds to close green. |
| **`INFY-Z`** | Enterprise IT | 1,565.60 | 1,636.05 | 1,564.90 | 1,636.05 | **+4.50%** | **PEAD Edge (EDGE-B)**: False executive resignation rumor at $t=135\text{s}$ is instantly bought up. Massive momentum. |
| **`HDFC-W`** | Banking | 1,681.00 | 1,739.85 | 1,679.20 | 1,740.85 | **+3.50%** | Money market tightening headline causes brief dip, followed by strong institutional dip-buying. |
| **`BZR-V`** | Consumables | 649.60 | 636.60 | 636.60 | 649.70 | **-2.00%** | **Insider Leaked Audit**: MCA unannounced audit headline at $t=60\text{s}$ drops stock directly to session lows. |
| **`GOLDCORE`**| Safe Haven | 6,218.60 | 6,237.25 | 6,215.25 | 6,292.20 | **+0.30%** | Rock-solid stability; brief intraday spike to 6,292.20 retraces. |
| **`PULSE`** | Digital Asset| 854.25 | 931.15 | 854.25 | 931.15 | **+9.00%** | **First Speculative Breakout**: Massive retail momentum run. Crosses ₹930 with zero pullback. |
| **`NIMBUS`** | High-Beta IT | 410.00 | 434.60 | 410.00 | 434.60 | **+6.00%** | **Debut Breakout**: High correlation with INFY-Z. Post-earnings drift propels it +6%. |

---

### SESSION 3: "A SMALL COUGH" (Silent Events & Valuation Stretch)
* **Macro Backdrop**: Inflation begins ticking upward to 4.5%. First signs of margin compression.
* **New Instrument Unlocked**: `STAPLE` (Staple & Co. Provisions, opens at ₹1,180.00).
* **Active Universe (9 Stocks)**: Above 8 + `STAPLE`.

#### Session 3 News Dispatch Schedule
| Trigger Tick ($n$) | Clock ($t$) | Early Leak ($n-6$) | Source | Target | Raw Impact | Fake? | Verbatim News Headline |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **$n=30$** | 45.0s | 36.0s ($n=24$) | `NP` | `INFY-Z` | **+6.0%** | **FALSE (REAL)** | *"Infosys Z beats Q3 operating margin estimates by 180 bps; full-year guidance raised"* |
| **$n=80$** | 120.0s | 111.0s ($n=74$) | `FF` | `PULSE` | **+7.0%** | **TRUE (FAKE)** | *"Whale wallet just loaded 50M PULSE on DEX! Next 50x run starts right now 🔥"* |
| **$n=130$** | 195.0s | 186.0s ($n=124$) | `AN` | `HDFC-W` | **+5.0%** | **FALSE (REAL)** | *"Credit Bureau Data: Gross NPAs for top-tier private lenders contract to multi-year lows"* |
| **$n=180$** | 270.0s | 261.0s ($n=174$) | `IN` | `BZR-V` | **+8.0%** | **FALSE (REAL)** | *"Board emergency call: Management preparing to issue formal statement denying MCA probe"* |

#### Session 3 Asset Performance & Range Table
| Ticker | Sector | Start (₹) | End (₹) | Min (₹) | Max (₹) | Net Chg | Session Behavioral Story & Alpha Play |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **`RELI-X`** | Energy | 2,494.30 | 2,506.75 | 2,494.30 | 2,524.00 | **+0.50%** | Creeps over ₹2,500 psychological barrier; intraday high of ₹2,524.00. |
| **`TATA-Y`** | Industrial | 887.95 | 883.50 | 880.45 | 894.35 | **-0.50%** | Mean reversion in play. Swings between 880 and 894. Scalp edges using SMA20. |
| **`INFY-Z`** | Enterprise IT | 1,636.05 | 1,652.40 | 1,635.40 | 1,655.00 | **+1.00%** | Margin expansion beat at $t=45\text{s}$ keeps sentiment strong. Steady drift. |
| **`HDFC-W`** | Banking | 1,739.85 | 1,757.25 | 1,733.50 | 1,767.35 | **+1.00%** | Clean NPA headline at $t=195\text{s}$ keeps stock buoyant despite macro warnings. |
| **`BZR-V`** | Consumables | 636.60 | 652.50 | 633.80 | 652.50 | **+2.50%** | **Management Denial Spike**: Rebounds from audit fear at $t=270\text{s}$ to close up +2.5%. |
| **`GOLDCORE`**| Safe Haven | 6,237.25 | 6,255.95 | 6,190.15 | 6,260.85 | **+0.30%** | Unmoved by market chatter; safe yield. |
| **`PULSE`** | Digital Asset| 931.15 | 903.20 | 903.20 | 931.15 | **-3.00%** | **Finfluencer Whale Trap**: @BullRunBhai shouts "50M whale buy" at $t=120\text{s}$; PULSE dumps -3.0%. |
| **`NIMBUS`** | High-Beta IT | 434.60 | 443.30 | 434.60 | 443.35 | **+2.00%** | Follows INFY-Z higher; solid institutional accumulation. |
| **`STAPLE`** | FMCG Defensive | 1,180.00 | 1,187.10 | 1,179.35 | 1,197.35 | **+0.60%** | Defensive debut. In-line earnings, zero beta drama. |

---

### SESSION 4: "THE CORRIDOR CLOSES" (The Regional War Shock)
* **Macro Backdrop**: Regional military escalation shuts the Middle East oil transit corridor. Crude spikes +38%. Inflation breaches 5.4%.
* **New Instrument Unlocked**: `VOLTAGE` (Voltage Grid Holdings, opens at ₹310.00).
* **Active Universe (10 Stocks)**: Above 9 + `VOLTAGE`.
* **Regime Multiplier**: $m_4 = 1.3$ (Stress volatility regime).

#### Session 4 News Dispatch Schedule
| Trigger Tick ($n$) | Clock ($t$) | Early Leak ($n-6$) | Source | Target | Raw Impact | Fake? | Verbatim News Headline |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **$n=40$** | 60.0s | 51.0s ($n=34$) | `NP` | `GLOBAL` | **-2.0%** | **FALSE (REAL)** | *"RBI Monetary Policy Committee minutes indicate prolonged hawkish pause"* |
| **$n=90$** | 135.0s | 126.0s ($n=84$) | `AN` | `HDFC-W` | **-7.0%** | **FALSE (REAL)** | *"RBI Circular mandates 125% risk-weight on unsecured retail loans; HDFC capital ratio pressured"* |
| **$n=140$** | 210.0s | 201.0s ($n=134$) | `FF` | `RELI-X` | **-3.0%** | **TRUE (FAKE)** | *"Breaking: Reliant Energy executive chairman stepping down unexpectedly due to health reasons!"* |
| **$n=180$** | 270.0s | 261.0s ($n=174$) | `IN` | `GOLDCORE` | **+5.0%** | **FALSE (REAL)** | *"Sovereign treasury desk directive: RBI expanding bullion allocation by ₹1,200 Cr this week"* |

#### Session 4 Asset Performance & Range Table
| Ticker | Sector | Start (₹) | End (₹) | Min (₹) | Max (₹) | Net Chg | Session Behavioral Story & Alpha Play |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **`RELI-X`** | Energy | 2,506.75 | 2,556.90 | 2,500.95 | 2,556.90 | **+2.00%** | **War Winner**: Upstream oil reserves expand refining margins. Fake chairman rumor at $t=210\text{s}$ is ignored. |
| **`TATA-Y`** | Industrial | 883.50 | 870.25 | 869.00 | 885.40 | **-1.50%** | Input cost shock: Fuel and steel inflation batter heavy industrials. |
| **`INFY-Z`** | Enterprise IT | 1,652.40 | 1,611.10 | 1,608.25 | 1,654.90 | **-2.50%** | Risk-off rotation: High-multiple tech gets trimmed as interest rate fears emerge. |
| **`HDFC-W`** | Banking | 1,757.25 | 1,739.70 | 1,734.70 | 1,761.55 | **-1.00%** | Regulatory tightening: 125% risk-weight circular at $t=135\text{s}$ hits capital buffers. |
| **`BZR-V`** | Consumables | 652.50 | 632.90 | 632.50 | 653.20 | **-3.00%** | Consumer discretionary spending contracts on surging fuel prices. Dumps to 632.90. |
| **`GOLDCORE`**| Safe Haven | 6,255.95 | 6,431.10 | 6,249.40 | 6,437.00 | **+2.80%** | **The Safe Haven Flight (EDGE-D)**: Central bank bullion directive at $t=270\text{s}$ sends Gold parabolic. |
| **`PULSE`** | Digital Asset| 903.20 | 867.05 | 867.05 | 910.25 | **-4.00%** | Speculative liquidity evaporates. Proves it is not an inflation hedge. Dumps -4.0%. |
| **`NIMBUS`** | High-Beta IT | 443.30 | 430.00 | 429.65 | 443.40 | **-3.00%** | High-beta multiple compression leads to heavy institutional selling. |
| **`STAPLE`** | FMCG Defensive | 1,187.10 | 1,189.45 | 1,186.25 | 1,200.90 | **+0.20%** | Rock-solid defensive armor. Essential consumer staples absorb the shock. |
| **`VOLTAGE`** | Power Grid | 310.00 | 282.10 | 281.85 | 310.00 | **-9.00%** | **The Debut Disaster**: Severe fuel import dependency exposed. Crashes -9.0% on unlock day. |

---

### SESSION 5: "STIMULUS WHISPERS" (Rotation & Buy-The-Dip)
* **Macro Backdrop**: Sovereign stimulus package announced to offset energy costs.
* **New Instrument Unlocked**: `CRANE` (Crane & Sons Construction, opens at ₹520.00).
* **Active Universe (11 Stocks)**: Above 10 + `CRANE`.
* **Regime Multiplier**: $m_5 = 1.1$ (Sector rotation).

#### Session 5 News Dispatch Schedule
| Trigger Tick ($n$) | Clock ($t$) | Early Leak ($n-6$) | Source | Target | Raw Impact | Fake? | Verbatim News Headline |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **$n=30$** | 45.0s | 36.0s ($n=24$) | `FF` | `BZR-V` | **-5.0%** | **FALSE (REAL)** | *"Hearing European strategic partner is terminating integration contract with BZR-V"* |
| **$n=80$** | 120.0s | 111.0s ($n=74$) | `IN` | `RELI-X` | **-9.0%** | **FALSE (REAL)** | *"Confidential draft: Gulf strategic partner walks away from green ammonia JV"* |
| **$n=130$** | 195.0s | 186.0s ($n=124$) | `AN` | `INFY-Z` | **+4.0%** | **FALSE (REAL)** | *"Global IT spend forecast revised upward by Gartner; enterprise software resilience highlighted"* |
| **$n=180$** | 270.0s | 261.0s ($n=174$) | `NP` | `TATA-Y` | **-3.5%** | **TRUE (FAKE)** | *"Fire reported at primary auto parts supplier warehouse outside Pune; delivery delays expected"* |

#### Session 5 Asset Performance & Range Table
| Ticker | Sector | Start (₹) | End (₹) | Min (₹) | Max (₹) | Net Chg | Session Behavioral Story & Alpha Play |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **`RELI-X`** | Energy | 2,556.90 | 2,480.20 | 2,479.00 | 2,569.30 | **-3.00%** | **Green Ammonia Collapse**: Confidential JV collapse leak at $t=120\text{s}$ triggers aggressive profit-taking. |
| **`TATA-Y`** | Industrial | 870.25 | 878.95 | 867.40 | 880.55 | **+1.00%** | **Buy-The-Dip Edge (EDGE-H)**: Fake Pune warehouse fire at $t=270\text{s}$ dips stock to ₹867.40; buy immediately for V-shape recovery. |
| **`INFY-Z`** | Enterprise IT | 1,611.10 | 1,635.25 | 1,610.35 | 1,637.85 | **+1.50%** | Gartner IT spend forecast at $t=195\text{s}$ triggers healthy bounce. |
| **`HDFC-W`** | Banking | 1,739.70 | 1,757.10 | 1,736.25 | 1,760.00 | **+1.00%** | Quiet consolidation. Retail deposits hold steady despite macro headwinds. |
| **`BZR-V`** | Consumables | 632.90 | 645.55 | 629.30 | 645.85 | **+2.00%** | European contract termination rumor at $t=45\text{s}$ causes opening drop, followed by relief bounce. |
| **`GOLDCORE`**| Safe Haven | 6,431.10 | 6,463.25 | 6,416.95 | 6,474.20 | **+0.50%** | Consolidates gains above ₹6,450. |
| **`PULSE`** | Digital Asset| 867.05 | 884.40 | 865.75 | 886.45 | **+2.00%** | Small speculative relief bounce. |
| **`NIMBUS`** | High-Beta IT | 430.00 | 436.45 | 429.65 | 437.15 | **+1.50%** | Rebounds in sympathy with INFY-Z. |
| **`STAPLE`** | FMCG Defensive | 1,189.45 | 1,194.20 | 1,181.95 | 1,194.90 | **+0.40%** | Low volatility capital preserver. |
| **`VOLTAGE`** | Power Grid | 282.10 | 293.40 | 281.60 | 293.40 | **+4.01%** | State energy grid subsidy allocation stabilizes utility operations. |
| **`CRANE`** | Infrastructure | 520.00 | 546.00 | 518.90 | 546.10 | **+5.00%** | **Debut Champion**: Direct beneficiary of government construction stimulus. Surges +5.0%. |

---

### SESSION 6: "LAST DANCE OF THE BOOM" (Euphoric Climax & The Hidden Trap)
* **Macro Backdrop**: Consumer confidence at 18-month high. Retail participation reaches fever pitch.
* **New Benchmark Unlocked**: `MERX50` Index (Live baseline: 1,000.00).
* **The Hidden Fundamental Clue**: HDFC-W's Gross NPA climbs from 2.1% to 2.3% on rich P/E (19.3). APEX Bank preparing provisioning shock.
* **Active Universe**: All 11 Instruments + `MERX50`.

#### Session 6 News Dispatch Schedule
| Trigger Tick ($n$) | Clock ($t$) | Early Leak ($n-6$) | Source | Target | Raw Impact | Fake? | Verbatim News Headline |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **$n=40$** | 60.0s | 51.0s ($n=34$) | `FF` | `PULSE` | **-5.0%** | **TRUE (FAKE)** | *"Major bridge hack alert: Devs supposedly moving treasury to private addresses!"* |
| **$n=90$** | 135.0s | 126.0s ($n=84$) | `NP` | `BZR-V` | **+14.0%** | **FALSE (REAL)** | *"Exchange Regulatory Filing: Bazaar Ventures approves surprise ₹250 Cr open-market share buyback"* |
| **$n=140$** | 210.0s | 201.0s ($n=134$) | `IN` | `HDFC-W` | **0.0%** | **TRUE (FAKE)** | *"Insider rumor: RBI discussing special liquidity refinance window for tier-1 commercial lenders"* |
| **$n=190$** | 285.0s | 276.0s ($n=184$) | `AN` | `GLOBAL` | **0.0%** | **FALSE (REAL)** | *"Closing session note: Proprietary desks squaring books ahead of institutional reset"* |

#### Session 6 Asset Performance & Range Table
| Ticker | Sector | Start (₹) | End (₹) | Min (₹) | Max (₹) | Net Chg | Session Behavioral Story & Alpha Play |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **`RELI-X`** | Energy | 2,480.20 | 2,455.40 | 2,452.35 | 2,486.85 | **-1.00%** | Drifts lower into the close as institutions square cash ahead of Round 2. |
| **`TATA-Y`** | Industrial | 878.95 | 883.35 | 877.75 | 885.55 | **+0.50%** | Closes flat. Planted cycles continue to offer tight scalping channels. |
| **`INFY-Z`** | Enterprise IT | 1,635.25 | 1,684.30 | 1,634.45 | 1,684.30 | **+3.00%** | Finishes Round 1 at all-time highs. Peak retail optimism. |
| **`HDFC-W`** | Banking | 1,757.10 | 1,801.05 | 1,757.10 | 1,803.05 | **+2.50%** | **The Institutional Value Trap**: Closes over ₹1,800 on fake liquidity rumor at $t=210\text{s}$, hiding toxic bad loans. |
| **`BZR-V`** | Consumables | 645.55 | 677.85 | 645.25 | 678.75 | **+5.00%** | **Buyback Fireworks**: Surprise ₹250 Cr share buyback filing at $t=135\text{s}$ drives euphoric surge to ₹677.85. |
| **`GOLDCORE`**| Safe Haven | 6,463.25 | 6,482.65 | 6,427.30 | 6,500.10 | **+0.30%** | Solid anchor. Prepared for the upcoming institutional monetary storm. |
| **`PULSE`** | Digital Asset| 884.40 | 1,008.20 | 884.40 | 1,008.20 | **+14.00%**| **The Final Mania Blow-Off**: False bridge hack at $t=60\text{s}$ is dismissed; explodes past ₹1,000 for peak retail exit. |
| **`NIMBUS`** | High-Beta IT | 436.45 | 453.90 | 435.90 | 454.35 | **+4.00%** | Closes at highs in lockstep with INFY-Z. |
| **`STAPLE`** | FMCG Defensive | 1,194.20 | 1,199.00 | 1,190.80 | 1,202.40 | **+0.40%** | Steady as a rock. Zero drawdowns across entire Round 1. |
| **`VOLTAGE`** | Power Grid | 293.40 | 296.35 | 292.55 | 296.35 | **+1.01%** | Gradual healing; establishes base near ₹296. |
| **`CRANE`** | Infrastructure | 546.00 | 559.65 | 545.50 | 559.65 | **+2.50%** | Infrastructure order backlog carries price to ₹559.65. |

---

## 4. THE INTERMISSION: STAT SHOP ECONOMICS & ROUND 2 PREPARATION

Between Sessions 6 and 7, the **Stat Shop** unlocks (`backend/routes/shop.py`). Teams use trading profits earned in Round 1 to purchase critical market upgrades:

| Stat Category | Level | Cost (Paise) | Cost (₹) | Microstructure Advantage Granted | Priority Rank |
|:---|:---:|:---:|:---:|:---|:---:|
| **`Research`** | **Level 1** | 20,00,000 | ₹2,00,000 | Basic fundamental screen access. | Low |
| **`Research`** | **Level 2** | 50,00,000 | ₹50,00,000 | **The 9-Second Alpha Edge**: Receives `early_tick` news 9.0s before public broadcast! | **MANDATORY #1** |
| **`Research`** | **Level 3** | 1,00,00,000 | ₹1,00,00,000 | Institutional smart-money order flow tracker (OFI indicators). | High |
| **`Capital`** | **Level 1** | 30,00,000 | ₹30,00,000 | **Unlocks Short Selling**: Essential for profiting off bank collapses in R2! | **MANDATORY #2** |
| **`Capital`** | **Level 2** | 80,00,000 | ₹80,00,000 | Unlocks $2.0\times$ portfolio buying power / margin leverage. | High |
| **`Speed`** | **Level 1** | 20,00,000 | ₹2,00,000 | Reduces execution latency to 1.8s. | Medium |
| **`Speed`** | **Level 2** | 40,00,000 | ₹40,00,000 | Reduces execution latency to 1.2s. | Medium |
| **`Speed`** | **Level 3** | 80,00,000 | ₹80,00,000 | Ultra-low execution latency (0.6s) with front-running priority. | Situational |

> **Critical Rule**: You cannot short sell or survive the Round 2 banking collapse without **Capital Level 1**. Research Level 2 is the single highest ROI purchase in the game, providing an insurmountable 9.0-second head-start on every major catalyst.

---

## 5. ROUND 2: INSTITUTIONAL RECKONING SESSIONS (S7 TO S11)

In Round 2, the **reactive engine takes control**. Prices move according to live order flow, mean-reverting market-maker bots, and asymmetric headline delivery.

---

### SESSION 7: "THE HIKE" (Monetary Tightening Shock)
* **Macro Backdrop**: Central bank unexpectedly hikes policy rates by 75 bps (4.00% $\rightarrow$ 4.75%) to curb war-induced inflation.
* **Market Mood**: `tense` ($\tau = 6\text{s}$, $L = 2.0\text{s}$, fast mean-reverting bots).
* **Active Universe**: 11 Instruments + `MERX50`.

#### Session 7 News Dispatch Schedule
| Trigger Tick ($n$) | Clock ($t$) | Early Leak ($n-6$) | Source | Target | Raw Impact | Fake? | Verbatim News Headline |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **$n=30$** | 45.0s | 36.0s ($n=24$) | `AN` | `RELI-X` | **+4.0%** | **FALSE (REAL)** | *"Global investment bank initiates institutional coverage with Overweight; target price ₹520"* |
| **$n=80$** | 120.0s | 111.0s ($n=74$) | `IN` | `RELI-X` | **+12.0%** | **FALSE (REAL)** | *"SEBI disclosure: Gulf Sovereign Wealth Fund files for 6.5% strategic equity block in Reliance X"* |
| **$n=130$** | 195.0s | 186.0s ($n=124$) | `FF` | `BZR-V` | **-6.0%** | **TRUE (FAKE)** | *"Activist short seller was just forced to cover entire BZR-V position! We are going to ₹250!"* |
| **$n=180$** | 270.0s | 261.0s ($n=174$) | `NP` | `GOLDCORE` | **+3.0%** | **FALSE (REAL)** | *"World Gold Council reports record sovereign net buying in quarterly reserves review"* |

#### Session 7 Asset Performance & Dynamic Behavior
| Ticker | Sector | Depth ($D_i$) | Open (₹) | Target Close (₹) | Net Chg | Range [Min – Max] | Behavioral Role & Optimal Strategy |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **`RELI-X`** | Energy | ₹3.0 Cr | 2,455.39 | 2,357.18 | **-4.0%** | [2,345 – 2,485] | High liquidity anchor. Sovereign wealth fund 6.5% block filing at $t=120\text{s}$ generates aggressive spike, but macro tightening forces it down. |
| **`TATA-Y`** | Industrial | ₹1.5 Cr | 883.34 | 861.26 | **-2.5%** | [855 – 885] | Cyclical rate pressure. Borrowing costs hike trims industrial capex expectations. |
| **`INFY-Z`** | Enterprise IT | ₹2.0 Cr | 1,684.33 | 1,600.11 | **-5.0%** | [1,590 – 1,685] | Tech multiple contraction. Rate hike triggers aggressive rotation out of rich IT valuations. |
| **`HDFC-W`** | Banking | ₹2.5 Cr | 1,800.98 | 1,710.93 | **-5.0%** | [1,700 – 1,805] | **The Unwind Begins**: Higher policy rate squeezes net interest margins (NIM) and exposes asset-liability mismatch. |
| **`BZR-V`** | Consumables | ₹15 L | 677.89 | 623.66 | **-8.0%** | [615 – 680] | Thin depth ($15\text{L}$). Fake short squeeze claim by finfluencer at $t=195\text{s}$ creates exit pump; fades violently. Short aggressively. |
| **`GOLDCORE`**| Safe Haven | ₹4.0 Cr | 6,482.68 | 6,599.37 | **+1.8%** | [6,480 – 6,615] | Sovereign central bank net reserve buying at $t=270\text{s}$. Unstoppable flight to safety. |
| **`PULSE`** | Digital Asset| ₹10 L | 1,008.23 | 917.49 | **-9.0%** | [900 – 1,010] | Liquidity drain. Rate shock sucks retail leverage out of crypto. Falls below ₹920. |
| **`NIMBUS`** | High-Beta IT | ₹75 L | 453.90 | 426.67 | **-6.0%** | [420 – 455] | Follows INFY-Z downward with high beta amplifier. |
| **`STAPLE`** | FMCG Defensive | ₹1.0 Cr | 1,198.99 | 1,192.99 | **-0.5%** | [1,190 – 1,200] | Defensive buffer; barely flinches under rate hike pressure. |
| **`VOLTAGE`** | Power Grid | ₹40 L | 296.32 | 278.54 | **-6.0%** | [275 – 298] | Debt-heavy utility hurt by higher interest financing costs. |
| **`CRANE`** | Infrastructure | ₹35 L | 559.65 | 540.06 | **-3.5%** | [535 – 560] | Commercial building tenders delayed following rate hike. |

---

### SESSION 8: "APEX FALLS" (The Banking Panic & Solvency Crisis)
* **Macro Backdrop**: Commercial bank credit growth stalls (+3.0%). Apex Capital Bank discloses catastrophic Gross NPA surge from 3.1% to 8.9%.
* **New Instrument Unlocked**: `APEX` (Apex Capital Bank, opens at ₹740.00).
* **Market Mood**: `panic` on banks (`APEX`, `HDFC-W`: $\tau = 4\text{s}$, $L = 1.5\text{s}$, rapid, violent liquidation).
* **Active Universe**: 12 Instruments + `MERX50`.

#### Session 8 News Dispatch Schedule
| Trigger Tick ($n$) | Clock ($t$) | Early Leak ($n-6$) | Source | Target | Raw Impact | Fake? | Verbatim News Headline |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **$n=40$** | 60.0s | 51.0s ($n=34$) | `NP` | `INFY-Z` | **+6.0%** | **FALSE (REAL)** | *"Infinity Systems signs landmark 7-year multi-cloud AI infrastructure alliance with US defense supplier"* |
| **$n=90$** | 135.0s | 126.0s ($n=84$) | `AN` | `HDFC-W` | **+13.0%** | **FALSE (REAL)** | *"Institutional Wire: HDFC-W entering final negotiations for cross-border merger with Global Trust Corp"* |
| **$n=140$** | 210.0s | 201.0s ($n=134$) | `FF` | `PULSE` | **+8.0%** | **TRUE (FAKE)** | *"Tier-1 exchange listing officially confirmed for PULSE tonight at 8 PM UTC! 🚀"* |
| **$n=180$** | 270.0s | 261.0s ($n=174$) | `IN` | `TATA-Y` | **+8.0%** | **FALSE (REAL)** | *"Ministry of Defense tender: Tyrell Autoworks selected as L1 bidder for heavy logistics fleet"* |

#### Session 8 Asset Performance & Dynamic Behavior
| Ticker | Sector | Depth ($D_i$) | Open (₹) | Target Close (₹) | Net Chg | Range [Min – Max] | Behavioral Role & Optimal Strategy |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **`APEX`** | Banking Pillar | ₹50 L | 740.00 | 577.20 | **-22.0%** | [560 – 745] | **The Solvency Crash**: Massive unannounced bad loan write-down. Plummets -22%. Short aggressively with Capital L1. |
| **`HDFC-W`** | Commercial Bank| ₹2.5 Cr | 1,710.93 | 1,471.40 | **-14.0%** | [1,450 – 1,720] | **Contagion Trap**: Global Trust merger rumor at $t=135\text{s}$ is a desperate smokescreen. NPA contagion crashes stock -14%. |
| **`RELI-X`** | Energy | ₹3.0 Cr | 2,357.18 | 2,239.32 | **-5.0%** | [2,225 – 2,360] | Prime brokers liquidate blue-chip energy positions to cover banking margin deficits. |
| **`TATA-Y`** | Industrial | ₹1.5 Cr | 861.26 | 835.42 | **-3.0%** | [825 – 885] | Defense logistics tender win at $t=270\text{s}$ sparks solid intraday spike, but overall liquidity drag limits close. |
| **`INFY-Z`** | Enterprise IT | ₹2.0 Cr | 1,600.11 | 1,504.10 | **-6.0%** | [1,490 – 1,620] | Landmark 7-year US defense deal at $t=60\text{s}$ spikes price; fast traders must sell into the news. |
| **`BZR-V`** | Consumables | ₹15 L | 623.66 | 580.00 | **-7.0%** | [570 – 625] | High beta retail casualty of the credit contraction. Cracks ₹600 support. |
| **`GOLDCORE`**| Safe Haven | ₹4.0 Cr | 6,599.37 | 6,731.36 | **+2.0%** | [6,590 – 6,750] | Prime brokers and hedge funds rush to park capital in physical bullion. |
| **`PULSE`** | Digital Asset| ₹10 L | 917.49 | 1,018.41 | **+11.0%**| **The Speculative Squeeze**: Tier-1 exchange listing rumor at $t=210\text{s}$ traps short sellers in a massive +11% squeeze. |
| **`NIMBUS`** | High-Beta IT | ₹75 L | 426.67 | 392.53 | **-8.0%** | [385 – 430] | Breaches ₹400 psychological floor under tech sell-off. |
| **`STAPLE`** | FMCG Defensive | ₹1.0 Cr | 1,192.99 | 1,198.96 | **+0.50%**| [1,190 – 1,205] | Pristine balance sheet. Attracts defensive flight-to-safety capital. |
| **`VOLTAGE`** | Power Grid | ₹40 L | 278.54 | 267.40 | **-4.0%** | [265 – 280] | Sinks on higher refinancing costs. |
| **`CRANE`** | Infrastructure | ₹35 L | 540.06 | 502.26 | **-7.0%** | [495 – 545] | Bank credit freeze halts financing for private construction projects. |

---

### SESSION 9: "CONTAGION" (The Short-Seller Report & The Bridge Exploit)
* **Macro Backdrop**: Credit growth turns negative (-2.0%). Banking contagion spreads to forensic corporate audits.
* **New Instrument Unlocked**: `LEDGER` (Ledger Data Systems, opens at ₹1,900.00).
* **Market Mood**: `panic` on Tech and Consumables (`INFY-Z`, `BZR-V`, `PULSE`: $\tau = 4\text{s}$, $L = 1.5\text{s}$).
* **Active Universe**: 13 Instruments + `MERX50`.

#### Session 9 News Dispatch Schedule
| Trigger Tick ($n$) | Clock ($t$) | Early Leak ($n-6$) | Source | Target | Raw Impact | Fake? | Verbatim News Headline |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **$n=30$** | 45.0s | 36.0s ($n=24$) | `FF` | `HDFC-W` | **-3.0%** | **TRUE (FAKE)** | *"Merger is dead! Antitrust regulators about to reject the HDFC-W deal! Sell everything!"* |
| **$n=80$** | 120.0s | 111.0s ($n=74$) | `AN` | `BZR-V` | **-18.0%** | **FALSE (REAL)** | *"Activist hedge fund publishes 80-page forensic report alleging circular revenue booking at Bazaar Ventures"* |
| **$n=130$** | 195.0s | 186.0s ($n=124$) | `IN` | `BZR-V` | **-9.0%** | **FALSE (REAL)** | *"BZR statutory auditor tenders resignation with immediate effect, citing documentation discrepancies"* |
| **$n=170$** | 255.0s | 246.0s ($n=164$) | `NP` | `GOLDCORE` | **+7.0%** | **FALSE (REAL)** | *"Systemic risk alert: Prime brokers hike margin requirements across high-beta equities; flight to bullion"* |

#### Session 9 Asset Performance & Dynamic Behavior
| Ticker | Sector | Depth ($D_i$) | Open (₹) | Target Close (₹) | Net Chg | Range [Min – Max] | Behavioral Role & Optimal Strategy |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **`BZR-V`** | Consumables | ₹15 L | 580.00 | 556.80 | **-4.0%** | [490 – 585] | **Forensic Catastrophe**: 80-page short seller fraud dossier at $t=120\text{s}$ + Auditor resignation at $t=195\text{s}$. Crashes intraday toward ₹500. Short relentlessly. |
| **`PULSE`** | Digital Asset| ₹10 L | 1,018.41 | 835.10 | **-18.0%**| **The Great Liquidation**: Catastrophic collapse from over ₹1,000 to ₹835. Momentum bots unwind entire retail pool. |
| **`INFY-Z`** | Enterprise IT | ₹2.0 Cr | 1,504.10 | 1,368.73 | **-9.0%** | [1,350 – 1,510] | Enterprise client budget freezes trigger deep multi-quarter guidance cut. |
| **`NIMBUS`** | High-Beta IT | ₹75 L | 392.53 | 349.35 | **-11.0%**| [340 – 395] | Cascades -11% as tech sector contagion reaches fever pitch. |
| **`HDFC-W`** | Banking | ₹2.5 Cr | 1,471.40 | 1,383.12 | **-6.0%** | [1,365 – 1,480] | Continued distress; merger collapse fears compound provision increases. |
| **`APEX`** | Banking | ₹50 L | 577.20 | 531.02 | **-8.0%** | [515 – 580] | Interbank credit lines cut; secondary liquidation wave hits stock. |
| **`GOLDCORE`**| Safe Haven | ₹4.0 Cr | 6,731.36 | 6,798.67 | **+1.0%** | [6,720 – 6,830] | Prime broker margin hike alert at $t=255\text{s}$ drives Gold to all-time highs above ₹6,800. |
| **`LEDGER`** | Enterprise IT | ₹60 L | 1,900.00 | 1,976.00 | **+4.0%** | [1,895 – 1,985] | **Flight to Quality**: High cash flow defensive tech debut. Rallies +4.0% while speculative tech crashes. |
| **`RELI-X`** | Energy | ₹3.0 Cr | 2,239.32 | 2,194.53 | **-2.0%** | [2,180 – 2,245] | Institutional selling pressure keeps energy capped. |
| **`TATA-Y`** | Industrial | ₹1.5 Cr | 835.42 | 818.71 | **-2.0%** | [810 – 840] | Auto parts supply chain slows under general tight liquidity. |
| **`STAPLE`** | FMCG Defensive | ₹1.0 Cr | 1,198.96 | 1,208.55 | **+0.8%** | [1,195 – 1,215] | Demonstrates why FMCG is the ultimate bear market shelter. |
| **`VOLTAGE`** | Power Grid | ₹40 L | 267.40 | 262.05 | **-2.0%** | [258 – 270] | Consolidated near multi-session lows. |
| **`CRANE`** | Infrastructure | ₹35 L | 502.26 | 477.14 | **-5.0%** | [470 – 505] | Capex cancellations drag construction to ₹477.14. |

---

### SESSION 10: "THE TURN" (The Crypto Zero-Day & Infrastructure Relief)
* **Macro Backdrop**: Sovereign authorities prepare massive fiscal stimulus to avert broad recession. Inflation cools to 5.6%.
* **New Instrument Unlocked**: `FORGE` (Forge Industrial Holdings, opens at ₹1,260.00).
* **Market Mood**: `recovery` on Infrastructure (`FORGE`, `CRANE`, `TATA-Y`: $\tau = 6\text{s}$, $L = 2.0\text{s}$).
* **Active Universe**: 14 Instruments + `MERX50`.

#### Session 10 News Dispatch Schedule
| Trigger Tick ($n$) | Clock ($t$) | Early Leak ($n-6$) | Source | Target | Raw Impact | Fake? | Verbatim News Headline |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **$n=40$** | 60.0s | 51.0s ($n=34$) | `AN` | `INFY-Z` | **-0.5%** | **TRUE (FAKE)** | *"Analyst downgrade: Enterprise software spend facing structural delay due to overseas macro freezes"* |
| **$n=80$** | 120.0s | 111.0s ($n=74$) | `NP` | `PULSE` | **-24.0%** | **FALSE (REAL)** | *"Critical zero-day protocol vulnerability exploits cross-chain bridge; $180M liquidated; PULSE pools frozen"* |
| **$n=130$** | 195.0s | 186.0s ($n=124$) | `FF` | `BZR-V` | **+3.0%** | **TRUE (FAKE)** | *"BZR CEO going live on YouTube to sue short sellers for $2 Billion in damages! Buying back!"* |
| **$n=170$** | 255.0s | 246.0s ($n=164$) | `IN` | `GOLDCORE` | **+8.0%** | **FALSE (REAL)** | *"Prime broker memo: Tier-1 hedge funds deploying emergency liquidity into physical bullion deposits"* |

#### Session 10 Asset Performance & Dynamic Behavior
| Ticker | Sector | Depth ($D_i$) | Open (₹) | Target Close (₹) | Net Chg | Range [Min – Max] | Behavioral Role & Optimal Strategy |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **`FORGE`** | Heavy Industry | ₹35 L | 1,260.00 | 1,436.40 | **+14.0%**| [1,250 – 1,450] | **The Stimulus Crown Jewel**: Primary contractor for national railway and bridge revival. Skyrockets +14% on debut! |
| **`CRANE`** | Infrastructure | ₹35 L | 477.14 | 520.09 | **+9.0%** | [470 – 525] | V-shaped recovery. Stimulus infrastructure spending revives order book. |
| **`PULSE`** | Digital Asset| ₹10 L | 835.10 | 885.20 | **+6.0%** | [630 – 890] | **The Zero-Day Carnage**: $180M hack at $t=120\text{s}$ dumps PULSE toward ₹630! Short on early leak ($t=111\text{s}$), cover at bottom for relief bounce. |
| **`BZR-V`** | Consumables | ₹15 L | 556.80 | 584.64 | **+5.0%** | [540 – 590] | Short squeeze relief bounce. Desperate CEO lawsuit claims at $t=195\text{s}$ force brief squeeze. |
| **`HDFC-W`** | Banking | ₹2.5 Cr | 1,383.12 | 1,438.44 | **+4.0%** | [1,375 – 1,445] | Emergency central bank liquidity facility signals the bottom for tier-1 lenders. |
| **`APEX`** | Banking | ₹50 L | 531.02 | 562.89 | **+6.0%** | [520 – 570] | Government recapitalization guarantee rumor sparks short-covering rally. |
| **`TATA-Y`** | Industrial | ₹1.5 Cr | 818.71 | 843.27 | **+3.0%** | [815 – 848] | Industrial vehicle orders revive under federal stimulus package. |
| **`VOLTAGE`** | Power Grid | ₹40 L | 262.05 | 269.91 | **+3.0%** | [260 – 272] | National grid modernisation grant stabilizes capital outlook. |
| **`RELI-X`** | Energy | ₹3.0 Cr | 2,194.53 | 2,227.45 | **+1.5%** | [2,190 – 2,235] | Industrial power demand picks up; energy complexes find support. |
| **`INFY-Z`** | Enterprise IT | ₹2.0 Cr | 1,368.73 | 1,355.05 | **-1.0%** | [1,345 – 1,375] | Sideways consolidation after severe downgrade cycle. |
| **`NIMBUS`** | High-Beta IT | ₹75 L | 349.35 | 345.86 | **-1.0%** | [340 – 355] | Tech remains out of favor; capital rotates into real assets. |
| **`GOLDCORE`**| Safe Haven | ₹4.0 Cr | 6,798.67 | 6,764.68 | **-0.5%** | [6,740 – 6,850] | Hedge fund physical deposit memo at $t=255\text{s}$ drives initial spike; slight softening as equities recover. |
| **`LEDGER`** | Enterprise IT | ₹60 L | 1,976.00 | 1,995.76 | **+1.0%** | [1,965 – 2,005] | Solid, stable performance; crosses ₹2,000 threshold intraday. |
| **`STAPLE`** | FMCG Defensive | ₹1.0 Cr | 1,208.55 | 1,210.97 | **+0.2%** | [1,205 – 1,215] | Boring, reliable, unshakeable. |

---

### SESSION 11: "NEW NORMAL" (Final Settlement & The Grand Finale)
* **Macro Backdrop**: Central bank signals end of hiking cycle. Order books transition to institutional settlement mode.
* **Market Mood**: `calm` ($\tau = 8\text{s}$, $L = 2.5\text{s}$, orderly equilibrium matching).
* **Active Universe**: All 14 Instruments + `MERX50`.

#### Session 11 News Dispatch Schedule
| Trigger Tick ($n$) | Clock ($t$) | Early Leak ($n-6$) | Source | Target | Raw Impact | Fake? | Verbatim News Headline |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **$n=40$** | 60.0s | 51.0s ($n=34$) | `FF` | `GLOBAL` | **0.0%** | **TRUE (FAKE)** | *"Emergency domestic market closure rumored for tomorrow due to settlement volatility!"* |
| **$n=90$** | 135.0s | 126.0s ($n=84$) | `NP` | `GLOBAL` | **0.0%** | **FALSE (REAL)** | *"Coordinated central bank stabilization facility activated ahead of final quad-witching expiry"* |
| **$n=140$** | 210.0s | 201.0s ($n=134$) | `AN` | `RELI-X` | **0.0%** | **FALSE (REAL)** | *"Passive index rebalancing flows force RELI-X toward baseline equilibrium"* |
| **$n=180$** | 270.0s | 261.0s ($n=174$) | `IN` | `GLOBAL` | **0.0%** | **FALSE (REAL)** | *"Institutional settlement protocol active: Market maker order books switching to liquidation matching mode"* |

#### Session 11 Asset Performance & Dynamic Behavior
| Ticker | Sector | Depth ($D_i$) | Open (₹) | Target Close (₹) | Net Chg | Range [Min – Max] | Behavioral Role & Optimal Strategy |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **`APEX`** | Banking | ₹50 L | 562.89 | 596.66 | **+6.0%** | [555 – 605] | Recapitalization success brings final relief rally. Closes at ₹596.66. |
| **`HDFC-W`** | Banking | ₹2.5 Cr | 1,438.44 | 1,481.60 | **+3.0%** | [1,430 – 1,490] | Reclaims ₹1,480. Survivors of the banking crisis emerge lean and provisioned. |
| **`FORGE`** | Heavy Industry | ₹35 L | 1,436.40 | 1,479.49 | **+3.0%** | [1,430 – 1,490] | Institutional funds lock in infrastructure leaders into the final settlement. |
| **`CRANE`** | Infrastructure | ₹35 L | 520.09 | 535.69 | **+3.0%** | [515 – 540] | Closes strong, completing its impressive recovery from the credit crunch. |
| **`PULSE`** | Digital Asset| ₹10 L | 885.20 | 911.76 | **+3.0%** | [875 – 920] | Settles near ₹911. Final short covering ahead of market freeze. |
| **`INFY-Z`** | Enterprise IT | ₹2.0 Cr | 1,355.05 | 1,382.15 | **+2.0%** | [1,350 – 1,390] | Tech multiples stabilize at new, realistic interest rate regime. |
| **`NIMBUS`** | High-Beta IT | ₹75 L | 345.86 | 352.78 | **+2.0%** | [342 – 355] | Gentle drift into expiry. |
| **`LEDGER`** | Enterprise IT | ₹60 L | 1,995.76 | 2,025.70 | **+1.5%** | [1,990 – 2,035] | Breakout past ₹2,025 confirms its status as the premier safe enterprise tech asset. |
| **`RELI-X`** | Energy | ₹3.0 Cr | 2,227.45 | 2,249.73 | **+1.0%** | [2,220 – 2,255] | Passive index fund rebalancing forces RELI-X into final institutional equilibrium. |
| **`TATA-Y`** | Industrial | ₹1.5 Cr | 843.27 | 851.71 | **+1.0%** | [840 – 855] | Orderly close. Completes full 18-month cycle. |
| **`BZR-V`** | Consumables | ₹15 L | 584.64 | 590.49 | **+1.0%** | [580 – 595] | Fades into low-volume close; remains far below its boom peak of ₹677. |
| **`VOLTAGE`** | Power Grid | ₹40 L | 269.91 | 272.61 | **+1.0%** | [267 – 275] | Stabilized around ₹272. |
| **`STAPLE`** | FMCG Defensive | ₹1.0 Cr | 1,210.97 | 1,214.60 | **+0.3%** | [1,208 – 1,218] | Finished the entire competition without experiencing a single draw-down session. |
| **`GOLDCORE`**| Safe Haven | ₹4.0 Cr | 6,764.68 | 6,778.21 | **+0.2%** | [6,760 – 6,790] | Finishes at ₹6,778.21, preserving wealth across the entire 18-month war and crisis arc. |

---

## 6. THE MASTER WINNING ALPHA PLAYBOOK

### 6.1 The 5 Sacred Trading Rules of Meridian
1. **Never Trade Market Orders in Panic**: Slippage during news shocks is brutal. Use resting Limit Orders placed at key support/resistance levels.
2. **Fade @BullRunBhai (`FF`) 65% of the Time**: Finfluencer posts with fire emojis and urgency words are deliberate exit liquidity traps. When @BullRunBhai screams "BUY NOW", prepare to short or take profits.
3. **Respect Market Depth ($D_i$)**: A ₹10 Lakh order will move `PULSE` by $1.0\%$, but it takes ₹3.0 Crore to move `RELI-X` by $1.0\%$. Don't try to pump heavyweight blue chips.
4. **Exploit the 9-Second Leak Advantage**: If you own **Research Level 2**, you see news at `n - 6` ($9.0\text{ seconds}$ early). Execute your full allocation before the public ticker receives the broadcast!
5. **Watch the Gross NPA Ratio**: While headline P/E ratios look enticing, the hidden Gross NPA metric warned of the `HDFC-W` and `APEX` collapses 3 sessions in advance.

### 6.2 The Optimal Progression Path to 1st Place
* **Round 1 (S1–S3)**: Long `INFY-Z` and `NIMBUS`. Scalp `TATA-Y` swings around its 70-second sine wave using SMA20. Ignore `BZR-V` hype.
* **The War Shock (S4)**: Dump tech and industrials. Rotate 100% of capital into `RELI-X` and `GOLDCORE`. Never touch `VOLTAGE`.
* **The Intermission**: Buy **Research Level 2** (₹50L) first, then **Capital Level 1** (₹30L). This unlocks 9s news leaks and short selling.
* **The Banking Crash (S7–S9)**: On early leak, aggressively short `APEX`, `HDFC-W`, and `BZR-V`. Move safe cash into `GOLDCORE` and `LEDGER`.
* **The Zero-Day Exploit (S10)**: Short `PULSE` 9 seconds before the zero-day hack headline breaks. Cover at ₹640 and immediately long `FORGE` and `CRANE` for the +14% stimulus breakout!
* **The Settlement (S11)**: Lock in profits, close margin exposure, and let passive market maker settlement push your portfolio to the top of the leaderboard!

---
*End of Master Document — Antigravity Engineering Core*

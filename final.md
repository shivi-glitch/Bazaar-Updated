# BAZAAR // MERIDIAN — THE MASTER ARCHITECTURAL & PRICE MECHANICS REFERENCE
> **Document Status**: Production Master Reference ("The God View")  
> **Verification**: 100% Verified Against Backend Source Code (`backend/core/engine.py`, `backend/core/r2_math.py`, `backend/core/news_ledger.py`, `backend/core/liquidity.py`, `backend/core/trading.py`, `backend/core/scoring.py`, `backend/core/security.py`, `backend/models.py`, `backend/routes/trading.py`, `backend/routes/shop.py`, `backend/routes/admin_sessions.py`, `backend/routes/admin_leaderboard.py`, `backend/routes/ws.py`, and `data/prices_r1.parquet`)  
> **Scope**: 11 Sessions across Round 1 (Retail Momentum Era, S1–S6) and Round 2 (Institutional Reactive Era, S7–S11)

---

## 1. EXECUTIVE ENGINE ARCHITECTURE & MATHEMATICAL SPECIFICATION

Bazaar operates on a **dual-engine simulation system** that transitions from a deterministic macroeconomic narrative in Round 1 to an interactive, reactive, order-driven microstructure in Round 2.

```
       ROUND 1: DETERMINISTIC ENGINE (Sessions 1 – 6)
 ┌──────────────────────────────────────────────────────────────┐
 │ Baseline Spline (data/prices_r1.parquet)                     │
 │   + High-Frequency Scripted News Shocks (84 Events, 2-8 ticks)│
 │   + Continuous Stochastic Heartbeat Drift (Beta Random Walk) │
 │   + Automated Level-2 Liquidity Order Book Generation (5 Bots)│
 └──────────────────────────────┬───────────────────────────────┘
                                │
                 [ INTERMISSION: STAT SHOP UNLOCKS ]
                 [  Research L1-L3 | Capital L1-L2 | Speed L1-L3 ]
                 [  Ledger Reset: Exactly ₹1.00 Crore Cash       ]
                                │
                                ▼
       ROUND 2: REACTIVE AGENTIC ENGINE (Sessions 7 – 11)
 ┌──────────────────────────────────────────────────────────────┐
 │ Story Anchor F(t) (Micro-Brownian drift + Fundamental Path)  │
 │   + Live Player Order Flow (A_net_notional / Depth_Rupees)   │
 │   + Dynamic Bot Mean Reversion (tau, L per Market Mood)      │
 │   + Dynamic Instrument Unlocks (APEX, LEDGER, FORGE)         │
 │   + Level-2 DOM Depth Walls & Directional News Snipers       │
 └──────────────────────────────┴───────────────────────────────┘
```

---

### 1.1 The Engine Clock & Tick Grid
* **Tick Length ($n$)**: Exactly $1.5\text{ seconds}$ in real time (`await asyncio.sleep(max(0.0, next_time - now))` with `1.5` interval in `backend/core/engine.py`).
* **Session Duration**: Exactly $200\text{ ticks} = 300\text{ seconds} = 5.0\text{ minutes}$ per session (ticks 0 to 200, 201 ticks total).
* **Clock Conversion**: $t(\text{seconds}) = n \times 1.5$.
* **Session Lifecycle**: `LOCKED` $\rightarrow$ `READY` $\rightarrow$ `STARTING` (3.0s countdown) $\rightarrow$ `RUNNING` (ticks 0 to 200) $\rightarrow$ `FINISHED`.

---

### 1.2 Information Asymmetry & The 4-Tier News Pipeline
News delivery is governed by **source credibility ratings**, **targeted WebSocket early leaks**, and **tier-based arrival delays** (`backend/core/news_ledger.py`, `backend/core/engine.py`, and `backend/routes/ws.py`):

| Source Code | Source Name | Truth Rate | Inverted / Contrarian Bias | Voice & Characteristics |
|:---:|:---|:---:|:---:|:---|
| **`IN`** | **Desk Source (Anonymous)** | **90%** | 10% (Rare disinformation) | Terse, institutional, leak tone, highly accurate. **Blocked for Research Level < 2**. |
| **`AN`** | **Calder & Wyn / Northgate** | **75%** | 25% (Hedged or lagging) | Professional equity research, measured target horizons. |
| **`NP`** | **The Meridian Standard** | **55%** | 45% (Coin-flip) | Factual, backward-looking headlines; often arrives after the initial move. |
| **`FF`** | **@BullRunBhai** | **35%** | **65% (Strong Contrarian Alpha)** | Hyperbolic, urgent ("NOW 🚀"), rocket emojis, retail exit liquidity traps. |

#### The 9-Second Early Leak Rule
* **Standard Public Broadcast**: Delivered to all connected clients at `public_tick` ($n$).
* **Institutional Early Leak**: Delivered at `early_tick = public_tick - 6` ($6\text{ ticks} = 9.0\text{ seconds}$ before public broadcast).
* **Eligibility Filter**: Restricted strictly to teams with **Research Level $\ge 2$** via targeted WebSocket packet injection (`broadcast_to_specific_teams`).

#### The Research Level Delay Matrix (`backend/routes/ws.py`)
At `public_tick`, incoming headlines are routed through `dispatch_targeted_news`, applying intentional processing latency based on a team's Research Level:
* **Research Level 0**: **+15 seconds delay** after public tick.
* **Research Level 1**: **+10 seconds delay** after public tick.
* **Research Level 2**: **+7 seconds delay** (plus received the news 9.0s early at `early_tick`!).
* **Research Level 3**: **+3 seconds delay** (near-instant execution capability).
* **Insider (`IN`) Blocker**: If `source == "IN"` and a team has `research_level < 2`, the news packet is **dropped completely** and omitted from `/news` REST endpoint queries.

---

### 1.3 News Shock Smoothing Mechanics
When a genuine or deceptive news item hits the engine at `public_tick`, prices **never jump instantaneously**. The engine queues an active shock that spreads smoothly over multiple ticks (`backend/core/engine.py`):

$$\text{duration\_ticks} = \text{random.randint}(2, 8) \quad (3.0\text{s to } 12.0\text{s})$$

$$\text{impact\_per\_tick} = \frac{\text{raw\_impact}}{\text{duration\_ticks}}$$

* **Volume Multiplier**: During active shock application, trading volume spikes by $3.5\times$ base volume (`volume_boost = 3.5`), or $3.0\times$ for broad `GLOBAL` shocks.
* **Per-Tick Execution**:
  $$P_{n} = \max\left(100, \left\lfloor P_{n-1} \times (1.0 + \text{impact\_per\_tick}) \right\rfloor\right)$$
* **Global Shocks (`GLOBAL`)**: Broad macroeconomic shocks propagate smoothly across all active equity instruments simultaneously, while **`GOLDCORE` is explicitly exempt** from negative global equity shocks.
* **Round 2 Price & Anchor Persistence**: In Round 2, fractional news shock updates permanently update both `state.P` and `r2_f_values` inside `R2InstrumentState`, ensuring fundamental news shifts stick permanently in the reactive simulation.

---

### 1.4 Continuous Stochastic Drift ("The Heartbeat")
To prevent artificial flatlining between news events, the engine applies an autonomous random walk on every single tick (`backend/core/engine.py`):

$$P_{n} = \left\lfloor P_{n} \times (1.0 + \text{drift\_percent}) \right\rfloor, \quad \text{where } \text{drift\_percent} \sim \mathcal{U}(-\text{noise\_limit}, +\text{noise\_limit})$$

| Asset Classification | Ticker Symbols | Noise Limit ($\pm\%$) | Behavioral Manifestation |
|:---|:---|:---:|:---|
| **High-Beta Speculative** | `BZR-V`, `PULSE` | $\pm 0.35\%$ | Jagged, violent micro-oscillations; prone to false breakouts |
| **Trending Momentum** | `INFY-Z`, `HDFC-W` | $\pm 0.15\%$ | Clean trend continuation with moderate micro-volatility |
| **Blue-Chip / Industrial** | `RELI-X`, `TATA-Y`, `NIMBUS`, `STAPLE`, `VOLTAGE`, `CRANE`, `APEX`, `LEDGER`, `FORGE` | $\pm 0.10\%$ | Smooth organic breathing; stable order book |
| **Ultra-Safe Haven** | `GOLDCORE` | $\pm 0.04\%$ | Rock-solid tight spread; minimal drift |

---

### 1.5 Round 2 Reactive Mathematics (`backend/core/r2_math.py`)
In Round 2 (Sessions 7 to 11), human orders dynamically push and pull the market price. The engine runs a continuous institutional simulation:

```
            +───────────────────────────────────────+
            │     Net Player Flow (A_net_notional)  │
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
* `HDFC-W`: ₹2,50,00,000 (₹2.50 Cr) — Commercial banking pillar
* `INFY-Z`: ₹2,00,00,000 (₹2.00 Cr) — Blue-chip enterprise IT
* `TATA-Y`: ₹1,50,00,000 (₹1.50 Cr) — Infrastructure cyclical
* `STAPLE`: ₹1,00,00,000 (₹1.00 Cr) — FMCG defensive
* `NIMBUS`: ₹75,00,000 (₹75 Lakhs) — Mid-cap high-beta cloud
* `LEDGER`: ₹60,00,000 (₹60 Lakhs) — Enterprise database (R2S3 / S9 unlock)
* `APEX`: ₹50,00,000 (₹50 Lakhs) — Distressed commercial bank (R2S2 / S8 unlock)
* `VOLTAGE`: ₹40,00,000 (₹40 Lakhs) — Utility & power grid
* `FORGE`: ₹35,00,000 (₹35 Lakhs) — Heavy engineering (R2S4 / S10 unlock)
* `CRANE`: ₹25,00,000 (₹25 Lakhs) — Small-cap construction
* `BZR-V`: ₹15,00,000 (₹15 Lakhs) — Micro-cap consumables media
* `PULSE`: ₹10,00,000 (₹10 Lakhs) — Speculative digital token (₹10 Lakhs moves it 1%)

#### 2. The Mean-Reversion Pull-Back Formula
$$\text{dev}(n) = \ln(P_n) - \ln\left(F_{t - L}\right)$$

$$\text{dev}_s(n) = \text{dev}_s(n-1) + 0.221 \cdot \left(\text{dev}(n) - \text{dev}_s(n-1)\right) \quad (\text{2-second exponential moving average})$$

$$\alpha = 1 - e^{-0.5 / \tau}$$

$$\text{pull}(n) = -\alpha \cdot \text{dev}_s(n)$$

#### 3. Market Mood Profiles (`backend/core/r2_math.py` & `engine.py`)
| Session | Mood State | $\tau$ (Pull-Back Time Constant) | $L$ (Anchor Reaction Lag) | Behavioral Meaning |
|:---:|:---|:---:|:---:|:---|
| **S7** | **`tense`** | $6\text{ seconds}$ | $2.0\text{ seconds}$ | Rate hike shock; fast liquidity withdrawal; tight defense |
| **S8 – S9** | **`panic`** | $4\text{ seconds}$ | $1.5\text{ seconds}$ | Banking solvency crisis; violent mean-reversion; bots punish deviations |
| **S10** | **`recovery`** | $6\text{ seconds}$ | $2.0\text{ seconds}$ | State bailout & infrastructure stimulus; orderly accumulation |
| **S11** | **`calm`** | $8\text{ seconds}$ | $2.5\text{ seconds}$ | Terminal settlement; slow, orderly equilibrium matching |

#### 4. Total Return & Execution
$$r_i(n) = \text{clip}\left(\text{pull}(n) + 0.01 \cdot \frac{A_{\text{net}}}{D_i}, \; -0.05, \; +0.05\right)$$

$$P_{n+1} = \text{round}\left(\frac{P_n \cdot e^{r_i(n)}}{0.05}\right) \times 0.05$$

---

### 1.6 Level-2 Dynamic Order Book Generation (`backend/core/liquidity.py`)
On every tick, 5 bot archetypes reconstruct the Level-2 Depth of Market (top 4 bids and asks):
1. **Market Makers (Anchor)**: Provide baseline liquidity. Quote spreads of $0.10\% \text{ to } 0.25\%$ around current price with $1,500\text{ to } 3,500$ share depth.
2. **Noise Traders (Retail Flow)**: Scatter random limit orders $2\text{ to } 3$ levels deep ($300\text{ to } 1,200$ shares).
3. **Mean-Reversion Faders**: If volatility $> 1.2\times$, stack $4,000\text{ to } 7,000$ shares against the trend to fade aggressive moves.
4. **Spoofers (Manipulators)**: With $40\%$ probability, flash fake $15,000\text{ to } 25,000$ share walls $3$ levels deep to distort the DOM order-book gauge.
5. **Directional Snipers (News Reactants)**: When an active news shock is firing, instantly stack massive, real walls ($18,000\text{ to } 35,000$ shares) on the bid (bullish shock) or ask (bearish shock).

---

### 1.7 Database Architecture & Relational Schema (`backend/models.py`)
The platform persists all state across 9 core relational tables in PostgreSQL / SQLite:

```
  ┌───────────────┐          ┌──────────────────┐          ┌───────────────┐
  │     teams     │1        *│   team_ledger    │1        *│   positions   │
  │───────────────│──────────│──────────────────│──────────│───────────────│
  │ id (PK)       │          │ team_id (PK, FK) │          │ team_id (PK)  │
  │ name          │          │ cash_paise       │          │ ticker (PK)   │
  │ pin_hash      │          └──────────────────┘          │ qty           │
  │ pin           │                                        │ avg_cost_paise│
  │ research_level│          ┌──────────────────┐          └───────────────┘
  │ capital_level │1        *│      orders      │
  │ speed_level   │──────────│──────────────────│          ┌───────────────┐
  │ locked        │          │ id (PK, UUID)    │          │  instruments  │
  │ eliminated    │          │ client_key (UQ)  │          │───────────────│
  │ created_at    │          │ team_id (FK)     │          │ ticker (PK)   │
  └───────┬───────┘          │ ticker, side     │          │ name, sector  │
          │                  │ qty, order_type  │          │ open_price_p  │
          │                  │ fill_price_paise │          └───────────────┘
          │                  │ fee_paise        │
          │                  └──────────────────┘          ┌───────────────┐
          │1                                               │   sessions    │
          ├─────────────────┐                              │───────────────│
          │*                │*                             │ g (PK, 1..11) │
  ┌───────┴───────┐ ┌───────┴────────┐                     │ round_num     │
  │ stat_purchases│ │equity_snapshots│                     │ state         │
  │───────────────│ │────────────────│                     │ t0, running_s │
  │ id (PK)       │ │ id (PK)        │                     └───────────────┘
  │ team_id (FK)  │ │ team_id (FK)   │
  │ stat, level   │ │ round_num (2)  │                     ┌───────────────┐
  │ cost_paise    │ │ session_g, tick│                     │ lb_snapshots  │
  │ at_state      │ │ equity_paise   │                     │───────────────│
  └───────────────┘ └────────────────┘                     │ id (PK)       │
                                                           │ round_num     │
                                                           │ kind, rows    │
                                                           └───────────────┘
```

1. **`teams`**: Stores team identity, plain/hashed PIN credentials, stat upgrade levels, and elimination flag.
2. **`instruments`**: Metadata for all 14 tradeable instruments (ticker, full corporate name, sector, initial open price in paise).
3. **`sessions`**: Master lifecycle table for the 11 sessions (`g` 1 to 11, `round_num`, `state`: `LOCKED`, `READY`, `STARTING`, `RUNNING`, `PAUSED`, `FINISHED`).
4. **`team_ledger`**: Liquid cash balance in integer paise (`100,000,000` paise = ₹10 Lakhs in R1; reset to `1,000,000,000` paise = ₹1 Crore on R2 unlock).
5. **`positions`**: Live portfolio inventory (`team_id`, `ticker`, `qty`, `average_cost_paise`). Positive `qty` denotes Long, negative denotes Short.
6. **`orders`**: Full execution audit trail with UUIDs, fill prices, fees, and idempotency guarantees via `client_key`.
7. **`leaderboard_snapshots`**: Immutable historical records of live and final standings for Round 1 and Round 2.
8. **`stat_purchases`**: Transaction log of all Stat Shop purchases with timestamped state.
9. **`equity_snapshots`**: High-resolution equity tracking during Round 2 for post-match curve analysis.

---

### 1.8 Trading API & Microstructure Execution Engine (`backend/routes/trading.py`)
* **Order Type**: Exclusively `MARKET` orders executed instantaneously against the live engine price.
* **Exchange / Brokerage Fee**: Exactly **$0.05\%$** of order notional in paise (`backend/core/trading.py`):
  $$\text{fee\_paise} = \left\lfloor \text{qty} \times P_{\text{paise}} \times 0.0005 \right\rfloor$$
* **Rate Limiting**: Enforced via a `TokenBucket` algorithm with `capacity = 3.0` and refill rate = `1.5 tokens/second`. Bursts exceeding 3 orders or sustained flow exceeding 1.5 req/s are rejected with HTTP 429 (`rate_limited`).
* **Buying Power & Margin Leverage**:
  * **Capital Level 0 or 1**: Margin leverage = $1.0\times$. Max allowable portfolio exposure = Current Equity.
  * **Capital Level 2**: Margin leverage = $2.0\times$. Max allowable portfolio exposure = $2 \times \text{Current Equity}$.
  * Enforced strictly:
    $$\sum_{i} \left|\text{qty}_i\right| \times P_{i, \text{live}} \le \text{Equity} \times \text{Leverage}$$
* **Short Selling Enforcement**:
  * Short selling is strictly locked in Round 1 (all teams start at Capital Level 0).
  * In Round 2, attempting to take or increase a short position (`new_qty < 0`) with `capital_level < 1` is blocked with HTTP 400 (`Short selling requires Capital Level 1`).
* **Zero-Crossing Cost Basis Math**:
  * Adding to an existing position (e.g. buying more longs, or shorting more shares):
    $$\text{avg\_cost}_{\text{new}} = \left\lfloor \frac{|\text{old\_qty}| \times \text{avg\_cost}_{\text{old}} + \text{added\_notional}}{|\text{new\_qty}|} \right\rfloor$$
  * Trimming an existing position: Average cost remains unchanged.
  * Crossing the zero threshold (e.g. going from Short to Long, or Long to Short): Cost basis resets to current `fill_price_paise`.
* **Account Liquidation / Elimination Rule**:
  $$\text{Equity} = \text{Cash} + \sum_{i} \left(\text{qty}_i \times P_{i, \text{live}}\right)$$
  If at any point $\text{Equity} \le 0$, the engine marks `team.eliminated = True`. All subsequent trading orders are rejected with HTTP 403 (`Account liquidated`), and the team's standing is locked at -100%.

---

### 1.9 Tournament Scoring & Podium Ranking Mathematics
The overall tournament champion is determined using **multiplicative compounding** across both rounds (`backend/routes/admin_leaderboard.py`):

$$\text{cumulative\_return\_pct} = \left[\left(1 + \frac{R_1}{100}\right) \times \left(1 + \frac{R_2}{100}\right) - 1.0\right] \times 100\%$$

* **Equal Weighting**: Round 1 and Round 2 carry equal geometric weight. A team scoring $+40\%$ in Round 1 and $+60\%$ in Round 2 achieves:
  $$(1.40) \times (1.60) - 1.0 = \mathbf{+124.0\% \text{ Cumulative Return}}$$
* **The Elimination Death Penalty**: If a team gets eliminated in Round 2 ($R_2 = -100\%$), their cumulative return is:
  $$(1 + R_1) \times (0.0) - 1.0 = \mathbf{-100.0\% \text{ (Total Disqualification / Bottom of Table)}}$$
* **Cumulative Net PnL (Secondary Metric)**:
  $$\text{total\_pnl} = \left(E_{\text{R1\_final}} - ₹10,00,000\right) + \left(E_{\text{R2\_final}} - ₹1,00,00,000\right)$$

---

## 2. THE 18-MONTH MERIDIAN MACROECONOMIC STORYLINE

The entire 11-session competition mirrors an 18-month macroeconomic business cycle across the Meridian Exchange (MERX):

```
       MERIDIAN MACROECONOMIC TIMELINE (18 MONTHS)
═════════════════════════════════════════════════════════════════
  [MONTHS 1 - 6]   CREDIT EXPANSION & EUPHORIC BOOM (R1S1 - R1S3)
                   • MCB holds policy rate at 4.0%. Cheap capital fuels enterprise IT.
                   • PULSE and BZR-V experience speculative retail mania.
                   • Gross NPAs across banking system reported at historic low of 1.8%.
-----------------------------------------------------------------
  [MONTHS 7 - 9]   THE WAR SHOCK & INFLATION SURGE (R1S4 - R1S6)
                   • Military escalation shuts Middle East Straits oil transit corridor.
                   • Crude surges +38% to $112/bbl; inflation breaches 5.6%.
                   • HDFC-W loan books deteriorate secretly (Gross NPA 1.8% -> 2.3%).
                   • FMCG (STAPLE) and Gold (GOLDCORE) provide ultimate defensive shelter.
-----------------------------------------------------------------
  [MONTH 10]       THE RECKONING: EMERGENCY RATE HIKE (R2S1 / S7)
                   • MCB unexpectedly hikes repo rate by 75 bps (4.0% -> 4.75%).
                   • Speculative tech and crypto face savage multiple contraction.
                   • Flight to safety accelerates; sovereign capital floods physical bullion.
-----------------------------------------------------------------
  [MONTHS 11 - 13] BANKING CRISIS & SYSTEMIC CONTAGION (R2S2 - R2S3 / S8 - S9)
                   • Apex Capital Bank reveals hidden NPA catastrophe (3.1% -> 8.9%).
                   • APEX crashes -22%; HDFC-W plunges -14% on contagion exposure.
                   • Forensic auditor report exposes circular billing at BZR-V (-18%).
                   • Zero-day exploit drains $180M from PULSE cross-chain bridge.
-----------------------------------------------------------------
  [MONTHS 14 - 18] SOVEREIGN STIMULUS & NEW NORMAL RECOVERY (R2S4 - R2S5 / S10 - S11)
                   • Meridian Ministry announces ₹28,000 Cr emergency infrastructure stimulus.
                   • FORGE and CRANE skyrocket on massive government mobilization advances.
                   • Banks recapitalize with sovereign bad-loan carveouts; market settles.
═════════════════════════════════════════════════════════════════
```

### Macroeconomic Dashboard by Session
| Metric | R1S1 | R1S2 | R1S3 | R1S4 | R1S5 | R1S6 | R2S1 (S7) | R2S2 (S8) | R2S3 (S9) | R2S4 (S10) | R2S5 (S11) |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **MCB Policy Rate** | 4.00% | 4.00% | 4.00% | 4.00% | 4.00% | 4.00% | 4.75% | 4.75% | 4.75% | 4.75% | 4.75% |
| **CPI Inflation** | 4.1% | 4.2% | 4.5% | 5.4% | 5.6% | 5.5% | 6.2% | 6.4% | 6.1% | 5.6% | 5.1% |
| **GDP Growth** | 7.0% | 7.2% | 7.1% | 6.2% | 6.3% | 6.4% | 5.4% | 4.1% | 3.0% | 3.4% | 4.0% |
| **Credit Growth** | 14.0% | 16.0% | 17.0% | 17.0% | 16.0% | 15.0% | 11.0% | 3.0% | -2.0% | 0.0% | 2.0% |
| **Crude Oil Index** | 100 | 101 | 102 | 138 | 134 | 131 | 129 | 124 | 120 | 114 | 108 |

---

### The 14 Instruments Master Roster (`data/instruments.json` & `backend/models.py`)
| Ticker | Full Instrument Name | Sector | Live From | Base Price (Paise) | Base Price (₹) | Market Depth ($D_i$) | Beta Class & Characteristics |
|:---|:---|:---|:---:|:---:|:---:|:---:|:---|
| **`RELI-X`** | Reliant Energy Corp | Energy | R1S1 | 245,000 | ₹2,450.00 | ₹3.00 Cr | Heavyweight sovereign energy blue-chip. War beneficiary. |
| **`TATA-Y`** | Tyrell Autoworks | Industrial | R1S1 | 88,000 | ₹880.00 | ₹1.50 Cr | Cyclical auto manufacturer. Planted 70s sinusoidal scalping edge. |
| **`INFY-Z`** | Infinity Systems | Enterprise IT | R1S1 | 152,000 | ₹1,520.00 | ₹2.00 Cr | Blue-chip tech compounder. High correlation with US software spend. |
| **`HDFC-W`** | Horizon Commercial Bank | Banking | R1S1 | 164,000 | ₹1,640.00 | ₹2.50 Cr | Premier commercial lender. Hides creeping retail loan NPAs. |
| **`BZR-V`** | Bazaar Ventures Media | Consumables | R1S1 | 64,000 | ₹640.00 | ₹15 Lakhs | Volatile retail favorite. Prone to finfluencer traps & forensic audits. |
| **`GOLDCORE`**| Goldcore Reserve Trust | Safe Haven | R1S1 | 620,000 | ₹6,200.00 | ₹4.00 Cr | Bullion safe haven. Deepest book. Unstoppable flight-to-safety asset. |
| **`PULSE`** | Pulsechain Token | Digital Assets | R1S1 | 85,000 | ₹850.00 | ₹10 Lakhs | Ultra-thin speculative token. Massive $\pm 15\%$ to $\pm 25\%$ volatility. |
| **`NIMBUS`** | Nimbus Cloud Systems | Enterprise IT | R1S2 | 41,000 | ₹410.00 | ₹75 Lakhs | High-beta recurring SaaS. Rallies with INFY-Z. |
| **`STAPLE`** | Staple & Co. Provisions | Consumables | R1S3 | 118,000 | ₹1,180.00 | ₹1.00 Cr | Ultimate defensive FMCG armor. Zero drawdowns across entire cycle. |
| **`VOLTAGE`** | Voltage Grid Holdings | Energy / Power | R1S4 | 31,000 | ₹310.00 | ₹40 Lakhs | High-debt gas utility. Plummets on imported LNG transit shock. |
| **`CRANE`** | Crane & Sons Construction | Infrastructure | R1S5 | 52,000 | ₹520.00 | ₹25 Lakhs | Small-cap builder. Beneficiary of state transport tenders. |
| **`APEX`** | Apex Capital Bank | Banking | R2S2 (S8) | 74,000 | ₹740.00 | ₹50 Lakhs | Distressed lender. Solvency crash epicentre (-22%). |
| **`LEDGER`** | Ledger Data Systems | Enterprise IT | R2S3 (S9) | 190,000 | ₹1,900.00 | ₹60 Lakhs | Debt-free enterprise database. Defensive tech shelter asset (+4%). |
| **`FORGE`** | Forge Industrial Holdings | Infrastructure | R2S4 (S10) | 126,000 | ₹1,260.00 | ₹35 Lakhs | Federal infrastructure stimulus leader. Explodes +14% on debut. |

---

## 3. ROUND 1: RETAIL MOMENTUM SESSIONS (S1 TO S6)

In Round 1, prices follow the deterministic master spline generated from `data/prices_r1.parquet`, overlaid with dynamic active shocks and continuous stochastic drift. Short selling is strictly locked.

---

### SESSION 1: "OPENING BELL" (Quiet Liquidity & First Planted Edges)
* **Macro Backdrop**: Central bank holds rates at 4.00%. Liquidity is abundant.
* **Active Universe (7 Stocks)**: `RELI-X`, `TATA-Y`, `INFY-Z`, `HDFC-W`, `BZR-V`, `GOLDCORE`, `PULSE`.

#### Session 1 Complete News Dispatch Schedule (`backend/core/news_ledger.py`)
| Trigger Tick ($n$) | Clock ($t$) | Early Leak ($n-6$) | Source | Target | Raw Impact | Fake? | Headline Text & Alpha Execution |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **$n=15$** | 22.5s | 13.5s ($n=9$) | `NP` | `RELI-X` | **+1.5%** | **FALSE (REAL)** | *"Meridian Ministry of Power greenlights ₹4,500 Cr grid modernization subsidy for Reliant Energy"* $\rightarrow$ Buy RELI-X. |
| **$n=40$** | 60.0s | 51.0s ($n=34$) | `FF` | `BZR-V` | **+3.5%** | **TRUE (FAKE)** | *"BZR-V signed exclusive supply agreement with 10-minute quick grocery app! 10x coming! 🚀"* $\rightarrow$ **Fade pump! Retraces instantly.** |
| **$n=65$** | 97.5s | 88.5s ($n=59$) | `AN` | `TATA-Y` | **-1.5%** | **FALSE (REAL)** | *"Calder & Wyn notes seasonal inventory build at Tyrell Autoworks; advises buying dips near SMA20"* $\rightarrow$ Scalp dip at ₹877. |
| **$n=95$** | 142.5s | 133.5s ($n=89$) | `NP` | `INFY-Z` | **+4.0%** | **FALSE (REAL)** | *"Infinity Systems closes $450M multi-year enterprise cloud migration deal with Nordic banking group"* $\rightarrow$ Buy and ride trend. |
| **$n=125$** | 187.5s | 178.5s ($n=119$) | `AN` | `HDFC-W` | **+3.0%** | **FALSE (REAL)** | *"Credit rating upgrade: Horizon Commercial Bank tier-1 bond yields drop to record lows on retail deposit surge"* $\rightarrow$ Long HDFC-W. |
| **$n=150$** | 225.0s | 216.0s ($n=144$) | `FF` | `PULSE` | **+2.0%** | **TRUE (FAKE)** | *"Top DEX whale wallet moving 20,000 ETH into PULSE liquidity pool! Don't get left behind!"* $\rightarrow$ **Exit liquidity trap! Take profit.** |
| **$n=175$** | 262.5s | 253.5s ($n=169$) | `IN` | `GOLDCORE` | **+0.8%** | **FALSE (REAL)** | *"Central depository internal transfer: Sovereign pension fund establishes baseline 500kg gold custody allocation"* $\rightarrow$ Safe park. |
| **$n=190$** | 285.0s | 276.0s ($n=184$) | `NP` | `BZR-V` | **-2.0%** | **FALSE (REAL)** | *"Market wrap: Quick-commerce partnership rumors unconfirmed by Bazaar Ventures corporate office"* $\rightarrow$ BZR-V dumps to lows. |

#### Session 1 Performance & Range Table
| Ticker | Start (₹) | End (₹) | Min (₹) | Max (₹) | Net Chg | Key Behavioral Story & Alpha Strategy |
|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **`RELI-X`** | 2,450.00 | 2,469.60 | 2,446.50 | 2,471.70 | **+0.80%** | Anchored blue-chip. Absorbs green modernization news smoothly. Long and hold. |
| **`TATA-Y`** | 880.00 | 884.40 | 877.30 | 890.35 | **+0.50%** | **Planted Sine Wave Edge**: Oscillates in a clean 70s period ($\pm 1.8\%$). Scalp SMA20 dips. |
| **`INFY-Z`** | 1,520.00 | 1,565.60 | 1,514.95 | 1,567.20 | **+3.00%** | **Premier Momentum**: Cloud deal news at $t=142.5\text{s}$ drives steady breakout to highs. |
| **`HDFC-W`** | 1,640.00 | 1,681.00 | 1,638.80 | 1,681.00 | **+2.50%** | Clean upward trend propelled by record low bond yields. Closes at the highs. |
| **`BZR-V`** | 640.00 | 649.60 | 637.95 | 651.55 | **+1.50%** | **Finfluencer Trap**: Pumps on fake grocery rumors at $t=60\text{s}$, drops hard on corporate denial. |
| **`GOLDCORE`**| 6,200.00 | 6,218.60 | 6,184.35 | 6,238.35 | **+0.30%** | Rock-solid anchor. Zero drawdown. Safe capital preservation. |
| **`PULSE`** | 850.00 | 854.25 | 849.10 | 860.40 | **+0.50%** | Tight consolidation before upcoming explosive speculative expansion. |

---

### SESSION 2: "CHEAP MONEY" (The Tech Expansion & Post-News Drift)
* **Macro Backdrop**: Credit expansion peaks (+16%). Loan books swell.
* **New Instrument Unlocked**: `NIMBUS` (Nimbus Cloud Systems, opens at ₹410.00).
* **Active Universe (8 Stocks)**: Above 7 + `NIMBUS`.

#### Session 2 Complete News Dispatch Schedule (`backend/core/news_ledger.py`)
| Trigger Tick ($n$) | Clock ($t$) | Early Leak ($n-6$) | Source | Target | Raw Impact | Fake? | Headline Text & Alpha Execution |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **$n=20$** | 30.0s | 21.0s ($n=14$) | `AN` | `NIMBUS` | **+4.5%** | **FALSE (REAL)** | *"Northgate Securities initiates Nimbus Cloud with BUY; cites 42% recurring SaaS revenue CAGR"* $\rightarrow$ Buy debut breakout! |
| **$n=45$** | 67.5s | 58.5s ($n=39$) | `IN` | `BZR-V` | **-11.0%** | **FALSE (REAL)** | *"Leaked MCA memo: Anti-profiteering bureau preparing unannounced audit at BZR headquarters"* $\rightarrow$ **Sell BZR-V immediately!** |
| **$n=70$** | 105.0s | 96.0s ($n=64$) | `FF` | `INFY-Z` | **-2.0%** | **TRUE (FAKE)** | *"Key enterprise delivery heads at INFY resigning to launch competitor startup! Dump tech now!"* $\rightarrow$ **Fake bear trap! Buy dip.** |
| **$n=95$** | 142.5s | 133.5s ($n=89$) | `NP` | `INFY-Z` | **+3.5%** | **FALSE (REAL)** | *"Infinity Systems confirms retention bonuses for all tech leadership; signs European automotive cloud deal"* $\rightarrow$ INFY-Z rallies. |
| **$n=125$** | 187.5s | 178.5s ($n=119$) | `FF` | `PULSE` | **+9.0%** | **FALSE (REAL)** | *"PULSE volume breaks $100M! Tier-1 Asian exchange adding trading pairs! We are going parabolic! 🔥"* $\rightarrow$ **Genuine pump! Ride momentum.** |
| **$n=150$** | 225.0s | 216.0s ($n=144$) | `NP` | `HDFC-W` | **-4.0%** | **FALSE (REAL)** | *"Liquidity tightens across domestic money market; short-term corporate paper yields climb"* $\rightarrow$ Brief pullback in banking. |
| **$n=175$** | 262.5s | 253.5s ($n=169$) | `AN` | `TATA-Y` | **+3.5%** | **TRUE (FAKE)** | *"Sector Downgrade: Auto sector input costs rising; recommend trimming industrial cyclicals"* $\rightarrow$ Bear trap. Stock rebounds. |
| **$n=190$** | 285.0s | 276.0s ($n=184$) | `IN` | `NIMBUS` | **+3.0%** | **FALSE (REAL)** | *"Confidential preliminary Q2 results: Cloud division operating margins expand 240 bps"* $\rightarrow$ NIMBUS finishes session at highs. |

#### Session 2 Performance & Range Table
| Ticker | Start (₹) | End (₹) | Min (₹) | Max (₹) | Net Chg | Key Behavioral Story & Alpha Strategy |
|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **`RELI-X`** | 2,469.60 | 2,494.30 | 2,469.60 | 2,500.95 | **+1.00%** | Stable compounder. Slow upward drift without resistance. |
| **`TATA-Y`** | 884.40 | 887.95 | 878.65 | 887.95 | **+0.40%** | Analyst downgrade headline at $t=262.5\text{s}$ is a fake trap. Rebounds to close green. |
| **`INFY-Z`** | 1,565.60 | 1,636.05 | 1,564.90 | 1,636.05 | **+4.50%** | **PEAD Edge**: False resignation rumor bought up instantly; closes up +4.5%. |
| **`HDFC-W`** | 1,681.00 | 1,739.85 | 1,679.20 | 1,740.85 | **+3.50%** | Money market headline causes mild dip, followed by institutional dip-buying. |
| **`BZR-V`** | 649.60 | 636.60 | 636.60 | 649.70 | **-2.00%** | **Insider Leaked Audit**: Leaked MCA memo drops stock straight to session lows. |
| **`GOLDCORE`**| 6,218.60 | 6,237.25 | 6,215.25 | 6,292.20 | **+0.30%** | Baseline wealth preserver; intraday high of ₹6,292.20. |
| **`PULSE`** | 854.25 | 931.15 | 854.25 | 931.15 | **+9.00%** | **Massive Retail Breakout**: Crosses ₹930 without looking back on Asian exchange listing. |
| **`NIMBUS`** | 410.00 | 434.60 | 410.00 | 434.60 | **+6.00%** | **Debut Champion**: 42% SaaS growth initiation + margin expansion leak. Rallies +6%. |

---

### SESSION 3: "A SMALL COUGH" (Valuation Stretch & Subtle Cracks)
* **Macro Backdrop**: Inflation begins ticking upward to 4.5%. First signs of margin compression.
* **New Instrument Unlocked**: `STAPLE` (Staple & Co. Provisions, opens at ₹1,180.00).
* **Active Universe (9 Stocks)**: Above 8 + `STAPLE`.

#### Session 3 Complete News Dispatch Schedule (`backend/core/news_ledger.py`)
| Trigger Tick ($n$) | Clock ($t$) | Early Leak ($n-6$) | Source | Target | Raw Impact | Fake? | Headline Text & Alpha Execution |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **$n=20$** | 30.0s | 21.0s ($n=14$) | `NP` | `STAPLE` | **+1.5%** | **FALSE (REAL)** | *"Staple & Co. Provisions unlocks on MERX; company reports resilient FMCG consumer volume"* $\rightarrow$ Safe buy. |
| **$n=45$** | 67.5s | 58.5s ($n=39$) | `NP` | `INFY-Z` | **+5.0%** | **FALSE (REAL)** | *"Infosys Z beats Q3 operating margin estimates by 180 bps; raises full-year USD revenue guidance"* $\rightarrow$ Tech rally continues. |
| **$n=70$** | 105.0s | 96.0s ($n=64$) | `FF` | `PULSE` | **+6.0%** | **TRUE (FAKE)** | *"Whale wallet just loaded 50M PULSE on DEX! Next 50x run starts right now 🔥"* $\rightarrow$ **Exit liquidity trap! Dump PULSE!** |
| **$n=95$** | 142.5s | 133.5s ($n=89$) | `NP` | `PULSE` | **-5.0%** | **FALSE (REAL)** | *"Blockchain monitor shows early founders offloaded 40M tokens into DEX liquidity pools"* $\rightarrow$ PULSE collapses -5%. |
| **$n=120$** | 180.0s | 171.0s ($n=114$) | `AN` | `HDFC-W` | **+4.0%** | **FALSE (REAL)** | *"Credit Bureau Data: Gross NPAs for top-tier private lenders contract to multi-year lows of 1.8%"* $\rightarrow$ Peak banking sentiment. |
| **$n=145$** | 217.5s | 208.5s ($n=139$) | `IN` | `BZR-V` | **+7.0%** | **FALSE (REAL)** | *"Board emergency call: Management preparing to issue formal press release denying MCA audit rumors"* $\rightarrow$ Sharp relief bounce. |
| **$n=170$** | 255.0s | 246.0s ($n=164$) | `AN` | `STAPLE` | **+1.2%** | **FALSE (REAL)** | *"Defensive rotation note: FMCG pricing power ensures complete margin pass-through despite grain inflation"* $\rightarrow$ Defensive bid. |
| **$n=190$** | 285.0s | 276.0s ($n=184$) | `NP` | `TATA-Y` | **-1.5%** | **FALSE (REAL)** | *"Domestic steel scrap prices rise 4% week-on-week; automotive casting foundries express margin caution"* $\rightarrow$ TATA-Y drifts lower. |

#### Session 3 Performance & Range Table
| Ticker | Start (₹) | End (₹) | Min (₹) | Max (₹) | Net Chg | Key Behavioral Story & Alpha Strategy |
|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **`RELI-X`** | 2,494.30 | 2,506.75 | 2,494.30 | 2,524.00 | **+0.50%** | Breaks over ₹2,500 psychological barrier; intraday high of ₹2,524.00. |
| **`TATA-Y`** | 887.95 | 883.50 | 880.45 | 894.35 | **-0.50%** | Input cost inflation headline pushes stock toward bottom of its trading range. |
| **`INFY-Z`** | 1,636.05 | 1,652.40 | 1,635.40 | 1,655.00 | **+1.00%** | Margin guidance beat keeps sentiment buoyant. |
| **`HDFC-W`** | 1,739.85 | 1,757.25 | 1,733.50 | 1,767.35 | **+1.00%** | **The Euphoric NPA Peak**: Multi-year low NPA headline (1.8%) marks the cycle top. |
| **`BZR-V`** | 636.60 | 652.50 | 633.80 | 652.50 | **+2.50%** | Management audit denial leak at $t=217.5\text{s}$ drives +2.5% recovery. |
| **`GOLDCORE`**| 6,237.25 | 6,255.95 | 6,190.15 | 6,260.85 | **+0.30%** | Completely insulated from equity noise. |
| **`PULSE`** | 931.15 | 903.20 | 903.20 | 931.15 | **-3.00%** | **The Founder Dump Trap**: @BullRunBhai whale pump followed by 40M founder token dump. |
| **`NIMBUS`** | 434.60 | 443.30 | 434.60 | 443.35 | **+2.00%** | Follows INFY-Z higher; solid institutional accumulation. |
| **`STAPLE`** | 1,180.00 | 1,187.10 | 1,179.35 | 1,197.35 | **+0.60%** | Solid defensive debut; absorbs grain inflation cleanly. |

---

### SESSION 4: "THE CORRIDOR CLOSES" (The Regional War Shock)
* **Macro Backdrop**: Regional military escalation shuts Middle East oil transit corridor. Crude spikes +38%. Inflation breaches 5.4%.
* **New Instrument Unlocked**: `VOLTAGE` (Voltage Grid Holdings, opens at ₹310.00).
* **Active Universe (10 Stocks)**: Above 9 + `VOLTAGE`.
* **Regime Multiplier**: $m_4 = 1.3$ (Macroeconomic stress regime).

#### Session 4 Complete News Dispatch Schedule (`backend/core/news_ledger.py`)
| Trigger Tick ($n$) | Clock ($t$) | Early Leak ($n-6$) | Source | Target | Raw Impact | Fake? | Headline Text & Alpha Execution |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **$n=15$** | 22.5s | 13.5s ($n=9$) | `NP` | `GLOBAL` | **-3.5%** | **FALSE (REAL)** | *"BREAKING: Military conflict escalates in Straits transit zone; commercial oil tanker corridor shut"* $\rightarrow$ **Sell broad equities! Rotate to Gold & Oil.** |
| **$n=35$** | 52.5s | 43.5s ($n=29$) | `AN` | `RELI-X` | **+6.0%** | **FALSE (REAL)** | *"Crude oil spikes +38% to $112/bbl; Reliant Energy domestic refining margins surge to multi-year highs"* $\rightarrow$ **Buy RELI-X aggressively!** |
| **$n=60$** | 90.0s | 81.0s ($n=54$) | `IN` | `VOLTAGE` | **-12.0%** | **FALSE (REAL)** | *"Confidential memo: Voltage Grid power plants face immediate supply shut-off from imported LNG shipments"* $\rightarrow$ **Avoid/dump VOLTAGE! Crashes -9%.** |
| **$n=85$** | 127.5s | 118.5s ($n=79$) | `IN` | `GOLDCORE` | **+4.5%** | **FALSE (REAL)** | *"Sovereign treasury desk directive: RBI expanding bullion allocation by ₹1,200 Cr this week to hedge war"* $\rightarrow$ **Massive Gold surge! Buy GOLDCORE.** |
| **$n=110$** | 165.0s | 156.0s ($n=104$) | `AN` | `HDFC-W` | **-6.0%** | **FALSE (REAL)** | *"RBI Circular mandates 125% risk-weight on unsecured retail loans; banking capital adequacy pressured"* $\rightarrow$ Dump banking. |
| **$n=135$** | 202.5s | 133.5s ($n=89$) | `NP` | `TATA-Y` | **-3.0%** | **FALSE (REAL)** | *"Industrial diesel prices up 18%; commercial fleet operators freeze new truck procurement contracts"* $\rightarrow$ Commercial vehicles stall. |
| **$n=160$** | 240.0s | 231.0s ($n=154$) | `FF` | `RELI-X` | **-3.0%** | **TRUE (FAKE)** | *"Reliant Energy executive chairman stepping down unexpectedly due to health reasons! Sell energy!"* $\rightarrow$ **Fake bear trap! Hold RELI-X.** |
| **$n=185$** | 277.5s | 268.5s ($n=179$) | `NP` | `STAPLE` | **+1.0%** | **FALSE (REAL)** | *"Consumer staples trade near session highs as investors seek shelter from industrial commodities shock"* $\rightarrow$ FMCG shields capital. |

#### Session 4 Performance & Range Table
| Ticker | Start (₹) | End (₹) | Min (₹) | Max (₹) | Net Chg | Key Behavioral Story & Alpha Strategy |
|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **`RELI-X`** | 2,506.75 | 2,556.90 | 2,500.95 | 2,556.90 | **+2.00%** | **War Winner**: Upstream reserves expand refining margins. Fake chairman rumor dismissed. |
| **`TATA-Y`** | 883.50 | 870.25 | 869.00 | 885.40 | **-1.50%** | Diesel inflation and truck capex freeze weigh on heavy industrials. |
| **`INFY-Z`** | 1,652.40 | 1,611.10 | 1,608.25 | 1,654.90 | **-2.50%** | Valuation multiple compression as stagflation fears emerge. |
| **`HDFC-W`** | 1,757.25 | 1,739.70 | 1,734.70 | 1,761.55 | **-1.00%** | Regulatory risk: 125% risk-weight circular squeezes capital adequacy. |
| **`BZR-V`** | 652.50 | 632.90 | 632.50 | 653.20 | **-3.00%** | Discretionary retail spending falls under soaring fuel bills. |
| **`GOLDCORE`**| 6,255.95 | 6,431.10 | 6,249.40 | 6,437.00 | **+2.80%** | **The Flight to Safety**: Sovereign central bank bullion mandate drives explosive rally. |
| **`PULSE`** | 903.20 | 867.05 | 867.05 | 910.25 | **-4.00%** | Speculative liquidity evaporates. Proves it is not an inflation hedge. Dumps -4.0%. |
| **`NIMBUS`** | 443.30 | 430.00 | 429.65 | 443.40 | **-3.00%** | High-beta multiple compression triggers institutional exit. |
| **`STAPLE`** | 1,187.10 | 1,189.45 | 1,186.25 | 1,200.90 | **+0.20%** | Pure defensive armor. Zero volatility throughout the war shock. |
| **`VOLTAGE`** | 310.00 | 282.10 | 281.85 | 310.00 | **-9.00%** | **The Debut Disaster**: Critical LNG import supply cut exposed. Plummets -9.0%. |

---

### SESSION 5: "STIMULUS WHISPERS" (Rotation & Buy-The-Dip)
* **Macro Backdrop**: Sovereign authorities outline initial transport stimulus to offset war shocks.
* **New Instrument Unlocked**: `CRANE` (Crane & Sons Construction, opens at ₹520.00).
* **Active Universe (11 Stocks)**: Above 10 + `CRANE`.

#### Session 5 Complete News Dispatch Schedule (`backend/core/news_ledger.py`)
| Trigger Tick ($n$) | Clock ($t$) | Early Leak ($n-6$) | Source | Target | Raw Impact | Fake? | Headline Text & Alpha Execution |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **$n=20$** | 30.0s | 21.0s ($n=14$) | `NP` | `CRANE` | **+5.0%** | **FALSE (REAL)** | *"Crane & Sons unlocks; selected for ₹3,200 Cr federal railway bridge and expressway modernization tender"* $\rightarrow$ **Buy CRANE debut!** |
| **$n=45$** | 67.5s | 58.5s ($n=39$) | `FF` | `BZR-V` | **-5.0%** | **FALSE (REAL)** | *"Hearing European strategic partner is terminating integration contract with BZR-V due to audit uncertainty"* $\rightarrow$ BZR-V drops. |
| **$n=70$** | 105.0s | 96.0s ($n=64$) | `IN` | `RELI-X` | **-9.0%** | **FALSE (REAL)** | *"Confidential draft: Gulf strategic partner walks away from Reliant green ammonia joint venture"* $\rightarrow$ **Take profit on RELI-X! -3% retrace.** |
| **$n=95$** | 142.5s | 133.5s ($n=89$) | `AN` | `INFY-Z` | **+4.0%** | **FALSE (REAL)** | *"Gartner enterprise IT spend forecast revised upward; cloud optimization services show strong pricing power"* $\rightarrow$ Tech bounce. |
| **$n=120$** | 180.0s | 171.0s ($n=114$) | `IN` | `HDFC-W` | **-2.5%** | **FALSE (REAL)** | *"Internal risk memo: Horizon Commercial Bank Q3 retail loan delinquencies tick upward to 2.1%"* $\rightarrow$ **First warning of banking decay!** |
| **$n=145$** | 217.5s | 208.5s ($n=139$) | `NP` | `TATA-Y` | **-3.5%** | **TRUE (FAKE)** | *"Fire reported at primary auto parts supplier warehouse outside Pune; delivery delays expected"* $\rightarrow$ **Fake trap! Buy dip at ₹867!** |
| **$n=170$** | 255.0s | 246.0s ($n=164$) | `NP` | `VOLTAGE` | **+4.0%** | **FALSE (REAL)** | *"Ministry of Power announces special tariff adjustment window to compensate domestic gas utilities"* $\rightarrow$ VOLTAGE relief rally. |
| **$n=190$** | 285.0s | 276.0s ($n=184$) | `AN` | `CRANE` | **+2.5%** | **FALSE (REAL)** | *"Northgate raises CRANE price target to ₹620; highlights 4.2x book-to-bill capex backlog"* $\rightarrow$ CRANE closes up +5.0%. |

#### Session 5 Performance & Range Table
| Ticker | Start (₹) | End (₹) | Min (₹) | Max (₹) | Net Chg | Key Behavioral Story & Alpha Strategy |
|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **`RELI-X`** | 2,556.90 | 2,480.20 | 2,479.00 | 2,569.30 | **-3.00%** | **Green Ammonia Collapse**: Confidential JV leak triggers aggressive institutional profit-taking. |
| **`TATA-Y`** | 870.25 | 878.95 | 867.40 | 880.55 | **+1.00%** | **Buy-The-Dip Edge**: Fake Pune warehouse fire dips stock to ₹867.40; V-shape rebound. |
| **`INFY-Z`** | 1,611.10 | 1,635.25 | 1,610.35 | 1,637.85 | **+1.50%** | Gartner IT spend forecast at $t=142.5\text{s}$ triggers healthy relief rally. |
| **`HDFC-W`** | 1,739.70 | 1,757.10 | 1,736.25 | 1,760.00 | **+1.00%** | Delinquency leak (2.1%) largely ignored by retail; stock consolidates. |
| **`BZR-V`** | 632.90 | 645.55 | 629.30 | 645.85 | **+2.00%** | European contract termination rumor absorbed, bounces into close. |
| **`GOLDCORE`**| 6,431.10 | 6,463.25 | 6,416.95 | 6,474.20 | **+0.50%** | Consolidates war gains above ₹6,450. |
| **`PULSE`** | 867.05 | 884.40 | 865.75 | 886.45 | **+2.00%** | Quiet accumulation before final Round 1 mania. |
| **`NIMBUS`** | 430.00 | 436.45 | 429.65 | 437.15 | **+1.50%** | Sympathy bounce with INFY-Z. |
| **`STAPLE`** | 1,189.45 | 1,194.20 | 1,181.95 | 1,194.90 | **+0.40%** | Rock-solid defensive hold. |
| **`VOLTAGE`** | 282.10 | 293.40 | 281.60 | 293.40 | **+4.01%** | State tariff subsidy window stabilizes operations; +4% recovery. |
| **`CRANE`** | 520.00 | 546.00 | 518.90 | 546.10 | **+5.00%** | **Debut Leader**: Beneficiary of transport modernization stimulus. Closes at highs. |

---

### SESSION 6: "LAST DANCE OF THE BOOM" (Euphoric Climax & The Hidden Trap)
* **Macro Backdrop**: Peak retail participation. Benchmark index `MERX50` introduced.
* **The Stealth Warning**: HDFC-W Gross NPA creeps secretly to 2.3%; loan loss provisions stretched.
* **Active Universe**: All 11 Instruments + `MERX50` Index.

#### Session 6 Complete News Dispatch Schedule (`backend/core/news_ledger.py`)
| Trigger Tick ($n$) | Clock ($t$) | Early Leak ($n-6$) | Source | Target | Raw Impact | Fake? | Headline Text & Alpha Execution |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **$n=20$** | 30.0s | 21.0s ($n=14$) | `FF` | `PULSE` | **-4.0%** | **TRUE (FAKE)** | *"Major bridge hack alert: Devs supposedly moving treasury to private addresses! (FUD from bears!)"* $\rightarrow$ Fake panic. |
| **$n=45$** | 67.5s | 58.5s ($n=39$) | `FF` | `PULSE` | **+14.0%** | **FALSE (REAL)** | *"Bridge devs confirm zero losses! Pulsedao buying back 10M tokens! We are going to ₹1,500 tonight! 🚀"* $\rightarrow$ **Huge +14% mania run! Sell top.** |
| **$n=75$** | 112.5s | 66.5s ($n=69$) | `NP` | `BZR-V` | **+14.0%** | **FALSE (REAL)** | *"Exchange Regulatory Filing: Bazaar Ventures approves surprise ₹250 Cr open-market share buyback"* $\rightarrow$ **Surprise buyback! Buy BZR-V.** |
| **$n=100$** | 150.0s | 91.0s ($n=94$) | `IN` | `HDFC-W` | **+3.0%** | **TRUE (FAKE)** | *"Insider rumor: Central bank discussing special liquidity refinance window for tier-1 commercial lenders"* $\rightarrow$ Smokescreen! |
| **$n=125$** | 187.5s | 116.5s ($n=119$) | `AN` | `HDFC-W` | **-2.0%** | **FALSE (REAL)** | *"Calder & Wyn note: Horizon Gross NPA secretly creeps to 2.3%; loan loss provisioning appears stretched"* $\rightarrow$ **THE STEALTH TELL.** |
| **$n=150$** | 225.0s | 141.0s ($n=144$) | `NP` | `INFY-Z` | **+3.0%** | **FALSE (REAL)** | *"IT sector closes at record highs as index funds absorb large institutional block inflows"* $\rightarrow$ Tech finishes at peak. |
| **$n=175$** | 262.5s | 253.5s ($n=169$) | `AN` | `GOLDCORE` | **+0.8%** | **FALSE (REAL)** | *"World Gold Council reports record global central bank bullion accumulation in quarterly review"* $\rightarrow$ Solid close. |
| **$n=190$** | 285.0s | 276.0s ($n=184$) | `AN` | `GLOBAL` | **0.0%** | **FALSE (REAL)** | *"Closing session alert: Proprietary institutional desks aggressively squaring books ahead of monetary reset"* $\rightarrow$ Square books! |

#### Session 6 Performance & Range Table
| Ticker | Start (₹) | End (₹) | Min (₹) | Max (₹) | Net Chg | Key Behavioral Story & Alpha Strategy |
|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **`RELI-X`** | 2,480.20 | 2,455.40 | 2,452.35 | 2,486.85 | **-1.00%** | Institutions square cash into the close ahead of the Round 2 reset. |
| **`TATA-Y`** | 878.95 | 883.35 | 877.75 | 885.55 | **+0.50%** | Closes flat. Planted cycles continue to offer tight scalping channels. |
| **`INFY-Z`** | 1,635.25 | 1,684.30 | 1,634.45 | 1,684.30 | **+3.00%** | Finishes Round 1 at all-time highs. Peak retail optimism. |
| **`HDFC-W`** | 1,757.10 | 1,801.05 | 1,757.10 | 1,803.05 | **+2.50%** | **The Institutional Trap**: Crosses ₹1,800 while Gross NPA climbs to 2.3%. Prepare to short! |
| **`BZR-V`** | 645.55 | 677.85 | 645.25 | 678.75 | **+5.00%** | **Buyback Fireworks**: Surprise ₹250 Cr buyback drives euphoric surge to ₹677.85. |
| **`GOLDCORE`**| 6,463.25 | 6,482.65 | 6,427.30 | 6,500.10 | **+0.30%** | Solid anchor. Ready for institutional stagflation in Round 2. |
| **`PULSE`** | 884.40 | 1,008.20 | 884.40 | 1,008.20 | **+14.00%**| **The Final Mania Blow-Off**: Explodes past ₹1,000 on Pulsedao buyback. Sell everything! |
| **`NIMBUS`** | 436.45 | 453.90 | 435.90 | 454.35 | **+4.00%** | Closes at highs in lockstep with INFY-Z. |
| **`STAPLE`** | 1,194.20 | 1,199.00 | 1,190.80 | 1,202.40 | **+0.40%** | Zero drawdowns across entire Round 1. Perfect defensive record. |
| **`VOLTAGE`** | 293.40 | 296.35 | 292.55 | 296.35 | **+1.01%** | Base established near ₹296. |
| **`CRANE`** | 546.00 | 559.65 | 545.50 | 559.65 | **+2.50%** | Infrastructure order backlog carries price to ₹559.65. |

---

## 4. THE INTERMISSION: STAT SHOP ECONOMICS & ROUND 2 RESET

When Round 1 concludes, the system executes an automated administrative transition (`backend/routes/admin_sessions.py`):
1. **Round 1 Standings Snapshot**: Saved to `LeaderboardSnapshot(round_num=1, kind="final")`.
2. **Inventory Cleared**: All existing equity positions are wiped (`delete(Position)`).
3. **Ledger Reset**: Every registered team ledger is reset to **exactly ₹1.00 Crore cash** (`1,000,000,000` paise = 10x Round 1 seed capital).
4. **Stat Shop Unlocks**: Teams purchase institutional upgrades before Session 7 begins.

---

### 4.1 The Calibrated Stat Pricing Schedule (`backend/routes/shop.py`)
Stat costs are calibrated to the **30%–38% sweet spot** of the ₹1.00 Crore base capital:

| Stat Category | Level | Cost (Paise) | Cost (₹) | % of ₹1 Cr Base | Institutional Microstructure Advantage Granted |
|:---|:---:|:---:|:---:|:---:|:---|
| **`Research`** | **Level 1** | `35,000,000` | **₹3.5 Lakhs** | 3.5% | Slashes public news delay from 15s down to 10s. |
| **`Research`** | **Level 2** | `75,000,000` | **₹7.5 Lakhs** | 7.5% | **THE ULTIMATE ALPHA EDGE**: Unlocks 9-second early news leaks (`public_tick - 6`), unblocks Insider (`IN`) news, and cuts public delay to 7s! |
| **`Research`** | **Level 3** | `130,000,000` | **₹13.0 Lakhs** | 13.0% | Cuts public news delay to 3.0s (near-instant execution). |
| **`Capital`** | **Level 1** | `50,00,0000` | **₹5.0 Lakhs** | 5.0% | **SHORT SELLING UNLOCK**: Mandatory authorization to short sell falling assets in Round 2! |
| **`Capital`** | **Level 2** | `110,000,000` | **₹11.0 Lakhs** | 11.0% | **$2.0\times$ MARGIN LEVERAGE**: Doubles maximum allowable portfolio exposure. |
| **`Speed`** | **Level 1** | `30,000,000` | **₹3.0 Lakhs** | 3.0% | Reduces network execution queue latency to 1.8s. |
| **`Speed`** | **Level 2** | `60,000,000` | **₹6.0 Lakhs** | 6.0% | Reduces network execution queue latency to 1.2s. |
| **`Speed`** | **Level 3** | `105,000,000` | **₹10.5 Lakhs** | 10.5% | Institutional co-location priority queue (0.6s latency). |

#### Shop Purchasing Constraints (`backend/routes/shop.py`)
* Upgrades can only be purchased when `engine_app.r2_unlocked == True`.
* Upgrades are locked during active sessions (`STARTING`, `RUNNING`, `PAUSED`). They are open only during Intermission and between Round 2 sessions.
* Tiers must be bought sequentially (Level 1 before Level 2).
* Costs are deducted directly from liquid cash (`team_ledger.cash_paise`).

#### Optimal Strategic Loadouts
* **The "Grand Champion" Pack (Research L1 + L2 + Capital L1 + Capital L2)**:
  $$\text{Total Cost} = ₹3.5\text{L} + ₹7.5\text{L} + ₹5.0\text{L} + ₹11.0\text{L} = \mathbf{₹27.0 \text{ Lakhs} \quad (27\% \text{ of base})}$$
  * *Result*: Retains **₹73.0 Lakhs in liquid trading cash**. With $2.0\times$ leverage, your Buying Power is:
    $$\text{Buying Power} = 2 \times ₹73,00,000 = \mathbf{₹1.46 \text{ Crore!}}$$
  * Equipped with: 9-second early news leaks, Insider (`IN`) unblocked, Short Selling authorized, and $2\times$ leverage!
* **The "Short Sniper" Budget Pack (Research L1 + L2 + Capital L1)**:
  $$\text{Total Cost} = ₹3.5\text{L} + ₹7.5\text{L} + ₹5.0\text{L} = \mathbf{₹16.0 \text{ Lakhs} \quad (16\% \text{ of base})}$$
  * *Result*: Retains **₹84.0 Lakhs in cash**, fully equipped with 9-second early leaks and short selling.

---

## 5. ROUND 2: INSTITUTIONAL RECKONING SESSIONS (S7 TO S11)

In Round 2, the **reactive engine takes control**. Prices move according to live order flow, mean-reverting market-maker bots, and asymmetric headline delivery.

---

### SESSION 7: "THE HIKE" (Monetary Tightening Shock)
* **Macro Backdrop**: Central bank unexpectedly hikes policy rates by 75 bps (4.00% $\rightarrow$ 4.75%) to curb war-induced inflation.
* **Market Mood**: `tense` ($\tau = 6\text{s}$, $L = 2.0\text{s}$, fast mean-reverting bots).
* **Active Universe**: 11 Instruments + `MERX50`.

#### Session 7 Complete News Dispatch Schedule (`backend/core/news_ledger.py`)
| Trigger Tick ($n$) | Clock ($t$) | Early Leak ($n-6$) | Source | Target | Raw Impact | Fake? | Headline Text & Alpha Execution |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **$n=15$** | 22.5s | 13.5s ($n=9$) | `NP` | `GLOBAL` | **-4.0%** | **FALSE (REAL)** | *"FLASH: Meridian Central Bank unexpectedly raises policy repo rate by 75 bps to 4.75% to fight inflation"* $\rightarrow$ **Short speculative tech & retail!** |
| **$n=40$** | 60.0s | 51.0s ($n=34$) | `AN` | `RELI-X` | **+4.0%** | **FALSE (REAL)** | *"Global investment bank initiates institutional coverage on Reliant with Overweight; target price ₹2,750"* $\rightarrow$ Brief spike in energy. |
| **$n=65$** | 97.5s | 88.5s ($n=59$) | `IN` | `RELI-X` | **+12.0%** | **FALSE (REAL)** | *"SEBI disclosure: Gulf Sovereign Wealth Fund files for 6.5% strategic equity block in Reliance X"* $\rightarrow$ **Huge institutional block! Buy RELI-X.** |
| **$n=95$** | 142.5s | 133.5s ($n=89$) | `IN` | `HDFC-W` | **-6.0%** | **FALSE (REAL)** | *"Confidential inspection report: MCB auditors demand Horizon Bank reclassify ₹1,800 Cr of stressed retail paper"* $\rightarrow$ **SHORT HDFC-W!** |
| **$n=125$** | 187.5s | 178.5s ($n=119$) | `FF` | `BZR-V` | **-6.0%** | **TRUE (FAKE)** | *"Activist short seller was just forced to cover entire BZR-V position! We are going to ₹250! (Fake pump)"* $\rightarrow$ **Fade fake squeeze! Short BZR-V.** |
| **$n=150$** | 225.0s | 216.0s ($n=144$) | `NP` | `PULSE` | **-9.0%** | **FALSE (REAL)** | *"Interest rate hike drains speculative leverage; DeFi borrow rates jump to 18%, triggering margin liquidations"* $\rightarrow$ **SHORT PULSE! Dumps -9%.** |
| **$n=175$** | 262.5s | 253.5s ($n=169$) | `NP` | `GOLDCORE` | **+3.0%** | **FALSE (REAL)** | *"Bullion trading desks report unprecedented sovereign net inflows following rate shock"* $\rightarrow$ **Buy GOLDCORE.** |
| **$n=190$** | 285.0s | 276.0s ($n=184$) | `AN` | `TATA-Y` | **-2.5%** | **FALSE (REAL)** | *"Commercial vehicle auto loans face higher monthly EMIs; inventory backlog climbs to 45 days"* $\rightarrow$ Auto cyclicals soften. |

#### Session 7 Dynamic Performance & Strategy
| Ticker | Sector | Depth ($D_i$) | Open (₹) | Target Close (₹) | Net Chg | Key Behavioral Role & Optimal Strategy |
|:---|:---|:---:|:---:|:---:|:---:|:---|
| **`RELI-X`** | Energy | ₹3.0 Cr | 2,455.39 | 2,357.18 | **-4.0%** | Gulf SWF 6.5% block at $t=97.5\text{s}$ sparks sharp spike, but broader rate hike drags it down. |
| **`TATA-Y`** | Industrial | ₹1.5 Cr | 883.34 | 861.26 | **-2.5%** | Higher borrowing costs trim commercial fleet capex expectations. |
| **`INFY-Z`** | Enterprise IT | ₹2.0 Cr | 1,684.33 | 1,600.11 | **-5.0%** | Multiple compression. Rate shock triggers aggressive rotation out of rich IT multiples. |
| **`HDFC-W`** | Banking | ₹2.5 Cr | 1,800.98 | 1,710.93 | **-5.0%** | **The Banking Unwind**: Auditor ₹1,800 Cr reclassification leak at $t=142.5\text{s}$ initiates sell-off. |
| **`BZR-V`** | Consumables | ₹15 L | 677.89 | 623.66 | **-8.0%** | Thin depth ($15\text{L}$). Fake short squeeze claim at $t=187.5\text{s}$ creates perfect short entry. |
| **`GOLDCORE`**| Safe Haven | ₹4.0 Cr | 6,482.68 | 6,599.37 | **+1.8%** | Sovereign net bullion buying at $t=262.5\text{s}$. Steady, powerful flight to safety. |
| **`PULSE`** | Digital Asset| ₹10 L | 1,008.23 | 917.49 | **-9.0%** | Speculative leverage vanishes as DeFi rates jump to 18%. Dumps below ₹920. |
| **`NIMBUS`** | High-Beta IT | ₹75 L | 453.90 | 426.67 | **-6.0%** | Sinks in lockstep with INFY-Z with high-beta amplifier. |
| **`STAPLE`** | FMCG Defensive | ₹1.0 Cr | 1,198.99 | 1,192.99 | **-0.5%** | Defensive buffer; barely flinches under rate hike pressure. |
| **`VOLTAGE`** | Power Grid | ₹40 L | 296.32 | 278.54 | **-6.0%** | Debt-heavy utility hurt by higher financing and refinancing costs. |
| **`CRANE`** | Infrastructure | ₹35 L | 559.65 | 540.06 | **-3.5%** | Commercial building tenders delayed following rate hike. |

---

### SESSION 8: "APEX FALLS" (The Banking Panic & Solvency Crisis)
* **Macro Backdrop**: Commercial bank credit growth stalls (+3.0%). Apex Capital Bank discloses catastrophic Gross NPA surge from 3.1% to 8.9%.
* **New Instrument Unlocked**: `APEX` (Apex Capital Bank, opens at ₹740.00).
* **Market Mood**: `panic` on Banks (`APEX`, `HDFC-W`: $\tau = 4\text{s}$, $L = 1.5\text{s}$, violent liquidation).
* **Active Universe**: 12 Instruments + `MERX50`.

#### Session 8 Complete News Dispatch Schedule (`backend/core/news_ledger.py`)
| Trigger Tick ($n$) | Clock ($t$) | Early Leak ($n-6$) | Source | Target | Raw Impact | Fake? | Headline Text & Alpha Execution |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **$n=15$** | 22.5s | 13.5s ($n=9$) | `IN` | `APEX` | **-15.0%** | **FALSE (REAL)** | *"URGENT LEAK: Apex Capital Bank board convenes midnight audit; Gross NPAs explode from 3.1% to 8.9%!"* $\rightarrow$ **SHORT APEX AGGRESSIVELY! -22% crash.** |
| **$n=40$** | 60.0s | 51.0s ($n=34$) | `NP` | `INFY-Z` | **+6.0%** | **FALSE (REAL)** | *"Infinity Systems signs landmark 7-year multi-cloud AI infrastructure alliance with US defense supplier"* $\rightarrow$ Brief spike in tech; sell into it. |
| **$n=65$** | 97.5s | 88.5s ($n=59$) | `NP` | `APEX` | **-12.0%** | **FALSE (REAL)** | *"Exchange filing: Apex Capital Bank posts surprise quarterly net loss of ₹1,420 Cr; CEO tenders resignation"* $\rightarrow$ Second wave of APEX dumping. |
| **$n=95$** | 142.5s | 133.5s ($n=89$) | `AN` | `HDFC-W` | **+12.0%** | **TRUE (FAKE)** | *"Institutional Wire: HDFC-W entering final negotiations for cross-border merger with Global Trust Corp (Smokescreen!)"* $\rightarrow$ **FAKE MERGER SMOKESCREEN! SHORT HDFC-W!** |
| **$n=120$** | 180.0s | 171.0s ($n=114$) | `IN` | `HDFC-W` | **-14.0%** | **FALSE (REAL)** | *"Interbank wire: Regulators freeze credit facility as Horizon's contagion exposure to Apex Bank is revealed"* $\rightarrow$ **HDFC-W crashes -14%!** |
| **$n=145$** | 217.5s | 208.5s ($n=139$) | `FF` | `PULSE` | **+8.0%** | **TRUE (FAKE)** | *"Tier-1 exchange listing officially confirmed for PULSE tonight at 8 PM UTC! 🚀 (Short squeeze pump!)"* $\rightarrow$ Speculative squeeze; fade near top. |
| **$n=170$** | 255.0s | 246.0s ($n=164$) | `IN` | `TATA-Y` | **+8.0%** | **FALSE (REAL)** | *"Ministry of Defense tender: Tyrell Autoworks selected as L1 bidder for heavy logistics military fleet"* $\rightarrow$ Buy TATA-Y intraday bounce. |
| **$n=190$** | 285.0s | 276.0s ($n=184$) | `NP` | `GOLDCORE` | **+2.5%** | **FALSE (REAL)** | *"Flight to safety accelerates: Institutional cash dumps commercial paper and floods physical bullion vaults"* $\rightarrow$ Gold surges to record highs. |

#### Session 8 Dynamic Performance & Strategy
| Ticker | Sector | Depth ($D_i$) | Open (₹) | Target Close (₹) | Net Chg | Key Behavioral Role & Optimal Strategy |
|:---|:---|:---:|:---:|:---:|:---:|:---|
| **`APEX`** | Banking | ₹50 L | 740.00 | 577.20 | **-22.0%** | **The Solvency Collapse**: Midnight NPA audit leak at $t=22.5\text{s}$. Plummets -22%. Short with full size! |
| **`HDFC-W`** | Commercial Bank| ₹2.5 Cr | 1,710.93 | 1,471.40 | **-14.0%** | **Contagion Trap**: Fake merger rumor at $t=142.5\text{s}$ is a smokescreen; crashes -14% on credit freeze. |
| **`RELI-X`** | Energy | ₹3.0 Cr | 2,357.18 | 2,239.32 | **-5.0%** | Prime brokers liquidate energy blue chips to cover banking margin deficits. |
| **`TATA-Y`** | Industrial | ₹1.5 Cr | 861.26 | 835.42 | **-3.0%** | Defense fleet tender at $t=255\text{s}$ sparks solid spike, but macro contagion limits close. |
| **`INFY-Z`** | Enterprise IT | ₹2.0 Cr | 1,600.11 | 1,504.10 | **-6.0%** | US defense cloud alliance spikes price; sell into the spike as market sells off. |
| **`BZR-V`** | Consumables | ₹15 L | 623.66 | 580.00 | **-7.0%** | High-beta retail victim of credit contraction; cracks ₹600 support. |
| **`GOLDCORE`**| Safe Haven | ₹4.0 Cr | 6,599.37 | 6,731.36 | **+2.0%** | Prime brokers and hedge funds rush to park capital in physical bullion. |
| **`PULSE`** | Digital Asset| ₹10 L | 917.49 | 1,018.41 | **+11.0%**| **The Speculative Squeeze**: Fake tier-1 listing rumor squeezes short sellers up +11%. |
| **`NIMBUS`** | High-Beta IT | ₹75 L | 426.67 | 392.53 | **-8.0%** | Sinks through ₹400 psychological floor. |
| **`STAPLE`** | FMCG Defensive | ₹1.0 Cr | 1,192.99 | 1,198.96 | **+0.50%**| Attracts defensive flight-to-safety capital. |
| **`VOLTAGE`** | Power Grid | ₹40 L | 278.54 | 267.40 | **-4.0%** | Drifts lower on higher debt refinancing costs. |
| **`CRANE`** | Infrastructure | ₹35 L | 540.06 | 502.26 | **-7.0%** | Interbank credit freeze halts financing for private construction. |

---

### SESSION 9: "CONTAGION" (The Short-Seller Report & The Forensic Audits)
* **Macro Backdrop**: Credit growth turns negative (-2.0%). Banking contagion triggers forensic corporate audits.
* **New Instrument Unlocked**: `LEDGER` (Ledger Data Systems, opens at ₹1,900.00).
* **Market Mood**: `panic` on Tech and Consumables (`INFY-Z`, `BZR-V`, `PULSE`: $\tau = 4\text{s}$, $L = 1.5\text{s}$).
* **Active Universe**: 13 Instruments + `MERX50`.

#### Session 9 Complete News Dispatch Schedule (`backend/core/news_ledger.py`)
| Trigger Tick ($n$) | Clock ($t$) | Early Leak ($n-6$) | Source | Target | Raw Impact | Fake? | Headline Text & Alpha Execution |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **$n=20$** | 30.0s | 21.0s ($n=14$) | `NP` | `LEDGER` | **+2.5%** | **FALSE (REAL)** | *"Ledger Data Systems unlocks on MERX; highlights zero debt and high free-cash-flow enterprise database contracts"* $\rightarrow$ **Buy LEDGER safe haven.** |
| **$n=40$** | 60.0s | 51.0s ($n=34$) | `FF` | `HDFC-W` | **-3.0%** | **TRUE (FAKE)** | *"Merger is dead! Antitrust regulators about to reject the HDFC-W deal! Sell everything immediately!"* $\rightarrow$ Fake panic; stock already weak. |
| **$n=65$** | 97.5s | 88.5s ($n=59$) | `AN` | `BZR-V` | **-18.0%** | **FALSE (REAL)** | *"Activist hedge fund publishes 80-page forensic report alleging circular revenue booking at Bazaar Ventures"* $\rightarrow$ **SHORT BZR-V! -18% crash.** |
| **$n=95$** | 142.5s | 133.5s ($n=89$) | `NP` | `INFY-Z` | **-7.0%** | **FALSE (REAL)** | *"Global enterprise software clients freeze IT vendor budgets; Infinity Systems warns of contract push-outs"* $\rightarrow$ Short enterprise IT. |
| **$n=120$** | 180.0s | 171.0s ($n=114$) | `IN` | `BZR-V` | **-9.0%** | **FALSE (REAL)** | *"BZR statutory auditor tenders resignation with immediate effect, citing balance sheet documentation discrepancies"* $\rightarrow$ **Auditor quits! Second wave of BZR-V dumping.** |
| **$n=145$** | 217.5s | 208.5s ($n=139$) | `NP` | `PULSE` | **-18.0%** | **FALSE (REAL)** | *"Regulatory alert: Domestic financial enforcement agency opens formal inquiry into PULSE unregistered staking pools"* $\rightarrow$ **SHORT PULSE! Collapses -18%.** |
| **$n=170$** | 255.0s | 246.0s ($n=164$) | `NP` | `GOLDCORE` | **+7.0%** | **FALSE (REAL)** | *"Systemic risk alert: Prime brokers hike margin requirements across equities; massive institutional flight to bullion"* $\rightarrow$ **GOLDCORE surges to ₹6,800+!** |
| **$n=190$** | 285.0s | 276.0s ($n=184$) | `AN` | `LEDGER` | **+3.5%** | **FALSE (REAL)** | *"Northgate Securities: Defensive software migration makes Ledger the primary tech shelter in Meridian"* $\rightarrow$ LEDGER finishes at highs. |

#### Session 9 Dynamic Performance & Strategy
| Ticker | Sector | Depth ($D_i$) | Open (₹) | Target Close (₹) | Net Chg | Key Behavioral Role & Optimal Strategy |
|:---|:---|:---:|:---:|:---:|:---:|:---|
| **`BZR-V`** | Consumables | ₹15 L | 580.00 | 556.80 | **-4.0%** | **Forensic Catastrophe**: 80-page fraud report at $t=97.5\text{s}$ + Auditor resignation at $t=180\text{s}$. Crashes towards ₹500 intraday. Short relentlessly! |
| **`PULSE`** | Digital Asset| ₹10 L | 1,018.41 | 835.10 | **-18.0%**| **The Great Liquidation**: Catastrophic collapse from over ₹1,000 to ₹835 on regulatory inquiry. |
| **`INFY-Z`** | Enterprise IT | ₹2.0 Cr | 1,504.10 | 1,368.73 | **-9.0%** | Client budget freezes trigger multi-quarter guidance cut. |
| **`NIMBUS`** | High-Beta IT | ₹75 L | 392.53 | 349.35 | **-11.0%**| Tech contagion drives severe liquidation down to ₹349. |
| **`HDFC-W`** | Banking | ₹2.5 Cr | 1,471.40 | 1,383.12 | **-6.0%** | Continued distress as bad loan provisions surge. |
| **`APEX`** | Banking | ₹50 L | 577.20 | 531.02 | **-8.0%** | Secondary liquidation wave hits stock; drops to ₹531. |
| **`GOLDCORE`**| Safe Haven | ₹4.0 Cr | 6,731.36 | 6,798.67 | **+1.0%** | Prime broker margin hike headline drives Gold to all-time highs above ₹6,800. |
| **`LEDGER`** | Enterprise IT | ₹60 L | 1,900.00 | 1,976.00 | **+4.0%** | **Flight to Quality**: Debt-free enterprise tech debut. Rallies +4.0% while speculative tech crashes. |
| **`RELI-X`** | Energy | ₹3.0 Cr | 2,239.32 | 2,194.53 | **-2.0%** | Institutional selling pressure keeps energy subdued. |
| **`TATA-Y`** | Industrial | ₹1.5 Cr | 835.42 | 818.71 | **-2.0%** | Auto parts supply chain slows under tight liquidity. |
| **`STAPLE`** | FMCG Defensive | ₹1.0 Cr | 1,198.96 | 1,208.55 | **+0.8%** | Pure bear market shelter. Closes green again. |
| **`VOLTAGE`** | Power Grid | ₹40 L | 267.40 | 262.05 | **-2.0%** | Consolidates near multi-session lows. |
| **`CRANE`** | Infrastructure | ₹35 L | 502.26 | 477.14 | **-5.0%** | Capex cancellations drag construction to ₹477. |

---

### SESSION 10: "THE TURN" (The Crypto Zero-Day & Infrastructure Relief)
* **Macro Backdrop**: Sovereign authorities prepare massive fiscal stimulus to avert broad recession. Inflation cools to 5.6%.
* **New Instrument Unlocked**: `FORGE` (Forge Industrial Holdings, opens at ₹1,260.00).
* **Market Mood**: `recovery` on Infrastructure (`FORGE`, `CRANE`, `TATA-Y`: $\tau = 6\text{s}$, $L = 2.0\text{s}$).
* **Active Universe**: 14 Instruments + `MERX50`.

#### Session 10 Complete News Dispatch Schedule (`backend/core/news_ledger.py`)
| Trigger Tick ($n$) | Clock ($t$) | Early Leak ($n-6$) | Source | Target | Raw Impact | Fake? | Headline Text & Alpha Execution |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **$n=20$** | 30.0s | 21.0s ($n=14$) | `NP` | `FORGE` | **+10.0%** | **FALSE (REAL)** | *"Forge Industrial unlocks on MERX; named lead turnkey engineering partner for ₹28,000 Cr federal corridor package"* $\rightarrow$ **BUY FORGE DEBUT! Surges +14%!** |
| **$n=45$** | 67.5s | 58.5s ($n=39$) | `AN` | `INFY-Z` | **-1.0%** | **TRUE (FAKE)** | *"Analyst downgrade: Enterprise software spend facing structural delay due to overseas macro freezes"* $\rightarrow$ Minor fake trap. |
| **$n=70$** | 105.0s | 96.0s ($n=64$) | `IN` | `PULSE` | **-12.0%** | **FALSE (REAL)** | *"URGENT: Critical exploit in cross-chain bridge smart contract draining liquidity pools in real time!"* $\rightarrow$ **SHORT PULSE ON EARLY LEAK! ($t=96\text{s}$)** |
| **$n=95$** | 142.5s | 133.5s ($n=89$) | `NP` | `PULSE` | **-16.0%** | **FALSE (REAL)** | *"On-chain confirmation: $180M liquidated in bridge hack; PULSE DEX pools frozen as price collapses toward ₹630"* $\rightarrow$ Cover near ₹630! |
| **$n=120$** | 180.0s | 171.0s ($n=114$) | `FF` | `BZR-V` | **+3.0%** | **TRUE (FAKE)** | *"BZR CEO going live on YouTube to sue short sellers for $2 Billion in damages! Buying back all shares!"* $\rightarrow$ Short-covering bounce. |
| **$n=145$** | 217.5s | 208.5s ($n=139$) | `NP` | `HDFC-W` | **+5.0%** | **FALSE (REAL)** | *"Central Bank activates emergency liquidity swap window; guarantees commercial bank retail deposits"* $\rightarrow$ Banking bottom is in! Long HDFC-W. |
| **$n=170$** | 255.0s | 246.0s ($n=164$) | `AN` | `CRANE` | **+6.0%** | **FALSE (REAL)** | *"Crane & Sons awarded ₹1,400 Cr urban transit expansion contract; capex cycle turnaround confirmed"* $\rightarrow$ **Long CRANE! +9% recovery.** |
| **$n=190$** | 285.0s | 276.0s ($n=184$) | `IN` | `FORGE` | **+5.0%** | **FALSE (REAL)** | *"Cabinet approval: Ministry fast-tracks 50% mobilization advance payment for Forge heavy engineering projects"* $\rightarrow$ FORGE explodes to ₹1,436! |

#### Session 10 Dynamic Performance & Strategy
| Ticker | Sector | Depth ($D_i$) | Open (₹) | Target Close (₹) | Net Chg | Key Behavioral Role & Optimal Strategy |
|:---|:---|:---:|:---:|:---:|:---:|:---|
| **`FORGE`** | Heavy Industry | ₹35 L | 1,260.00 | 1,436.40 | **+14.0%**| **The Stimulus Crown Jewel**: ₹28,000 Cr federal corridor package + 50% mobilization advance. Skyrockets +14%! |
| **`CRANE`** | Infrastructure | ₹35 L | 477.14 | 520.09 | **+9.0%** | **V-Shaped Rebound**: ₹1,400 Cr transit award revives order book. Strong rally. |
| **`PULSE`** | Digital Asset| ₹10 L | 835.10 | 885.20 | **+6.0%** | **The Zero-Day Carnage**: $180M exploit at $t=105\text{s}$ dumps PULSE toward ₹630! Short early leak, cover at bottom, ride relief bounce. |
| **`BZR-V`** | Consumables | ₹15 L | 556.80 | 584.64 | **+5.0%** | Desperate CEO lawsuit claims trigger short-covering bounce. |
| **`HDFC-W`** | Banking | ₹2.5 Cr | 1,383.12 | 1,438.44 | **+4.0%** | Emergency central bank liquidity facility signals the bottom for tier-1 lenders. |
| **`APEX`** | Banking | ₹50 L | 531.02 | 562.89 | **+6.0%** | Recapitalization guarantee rumor sparks aggressive short covering. |
| **`TATA-Y`** | Industrial | ₹1.5 Cr | 818.71 | 843.27 | **+3.0%** | Heavy logistics vehicle orders revive under federal stimulus package. |
| **`VOLTAGE`** | Power Grid | ₹40 L | 262.05 | 269.91 | **+3.0%** | National grid modernization grant stabilizes capital outlook. |
| **`RELI-X`** | Energy | ₹3.0 Cr | 2,194.53 | 2,227.45 | **+1.5%** | Industrial power demand picks up; energy complexes find support. |
| **`INFY-Z`** | Enterprise IT | ₹2.0 Cr | 1,368.73 | 1,355.05 | **-1.0%** | Sideways consolidation after downgrade cycle. |
| **`NIMBUS`** | High-Beta IT | ₹75 L | 349.35 | 345.86 | **-1.0%** | Tech remains out of favor; capital rotates into real economy assets. |
| **`GOLDCORE`**| Safe Haven | ₹4.0 Cr | 6,798.67 | 6,764.68 | **-0.5%** | Slight softening as risk-on capital rotates back into infrastructure. |
| **`LEDGER`** | Enterprise IT | ₹60 L | 1,976.00 | 1,995.76 | **+1.0%** | Stable compounder; crosses ₹2,000 threshold intraday. |
| **`STAPLE`** | FMCG Defensive | ₹1.0 Cr | 1,208.55 | 1,210.97 | **+0.2%** | Unshakeable defensive performance. |

---

### SESSION 11: "NEW NORMAL" (Final Settlement & The Grand Finale)
* **Macro Backdrop**: Central bank signals end of hiking cycle. Order books transition to institutional settlement mode.
* **Market Mood**: `calm` ($\tau = 8\text{s}$, $L = 2.5\text{s}$, orderly equilibrium matching).
* **Active Universe**: All 14 Instruments + `MERX50` Index.

#### Session 11 Complete News Dispatch Schedule (`backend/core/news_ledger.py`)
| Trigger Tick ($n$) | Clock ($t$) | Early Leak ($n-6$) | Source | Target | Raw Impact | Fake? | Headline Text & Alpha Execution |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **$n=20$** | 30.0s | 21.0s ($n=14$) | `NP` | `APEX` | **+5.0%** | **FALSE (REAL)** | *"Apex Capital Bank completes sovereign-backed recapitalization; emergency bad-loan carveout approved"* $\rightarrow$ APEX final rally. |
| **$n=45$** | 67.5s | 58.5s ($n=39$) | `FF` | `GLOBAL` | **0.0%** | **TRUE (FAKE)** | *"Emergency domestic market closure rumored for tomorrow due to settlement volatility! Liquidate now! 🚨"* $\rightarrow$ Ignore fake panic. |
| **$n=70$** | 105.0s | 96.0s ($n=64$) | `NP` | `GLOBAL` | **+1.5%** | **FALSE (REAL)** | *"Coordinated central bank stabilization facility activated ahead of final quad-witching expiry"* $\rightarrow$ Broad market lifts. |
| **$n=95$** | 142.5s | 133.5s ($n=89$) | `AN` | `HDFC-W` | **+3.5%** | **FALSE (REAL)** | *"Provisioning cycle complete: Horizon Commercial Bank balance sheet cleaned; net interest margins rebound"* $\rightarrow$ Banks close green. |
| **$n=120$** | 180.0s | 171.0s ($n=114$) | `AN` | `RELI-X` | **+1.5%** | **FALSE (REAL)** | *"Passive index rebalancing flows force RELI-X toward baseline equilibrium with heavy buy-side matching"* $\rightarrow$ Reliable blue-chip lift. |
| **$n=145$** | 217.5s | 208.5s ($n=139$) | `NP` | `FORGE` | **+2.5%** | **FALSE (REAL)** | *"Forge Industrial confirms order backlog reaches record ₹34,000 Cr; institutional ownership expands"* $\rightarrow$ FORGE finishes strong. |
| **$n=170$** | 255.0s | 246.0s ($n=164$) | `IN` | `GLOBAL` | **0.0%** | **FALSE (REAL)** | *"Institutional settlement protocol active: Market maker order books switching to liquidation matching mode"* $\rightarrow$ Lock in profits! |
| **$n=190$** | 285.0s | 276.0s ($n=184$) | `NP` | `MERX50` | **+2.0%** | **FALSE (REAL)** | *"Meridian 50 Index closes 18-month cycle in orderly equilibrium as recovery sectors lead final tape"* $\rightarrow$ Competition finishes. |

#### Session 11 Dynamic Performance & Strategy
| Ticker | Sector | Depth ($D_i$) | Open (₹) | Target Close (₹) | Net Chg | Key Behavioral Role & Optimal Strategy |
|:---|:---|:---:|:---:|:---:|:---:|:---|
| **`APEX`** | Banking | ₹50 L | 562.89 | 596.66 | **+6.0%** | Recapitalization success brings final relief rally. Closes at ₹596.66. |
| **`HDFC-W`** | Banking | ₹2.5 Cr | 1,438.44 | 1,481.60 | **+3.0%** | Reclaims ₹1,480. Cleaned balance sheet and NIM rebound bring institutional buyers. |
| **`FORGE`** | Heavy Industry | ₹35 L | 1,436.40 | 1,479.49 | **+3.0%** | Order backlog of ₹34,000 Cr locks in infrastructure leadership into final settlement. |
| **`CRANE`** | Infrastructure | ₹35 L | 520.09 | 535.69 | **+3.0%** | Completes impressive recovery from credit crunch; closes at ₹535.69. |
| **`PULSE`** | Digital Asset| ₹10 L | 885.20 | 911.76 | **+3.0%** | Settles near ₹911. Short covering ahead of final freeze. |
| **`INFY-Z`** | Enterprise IT | ₹2.0 Cr | 1,355.05 | 1,382.15 | **+2.0%** | Multiples stabilize at new interest rate reality. |
| **`NIMBUS`** | High-Beta IT | ₹75 L | 345.86 | 352.78 | **+2.0%** | Gentle drift into expiry. |
| **`LEDGER`** | Enterprise IT | ₹60 L | 1,995.76 | 2,025.70 | **+1.5%** | Crosses ₹2,025 to seal status as premier safe enterprise software asset. |
| **`RELI-X`** | Energy | ₹3.0 Cr | 2,227.45 | 2,249.73 | **+1.0%** | Index fund rebalancing forces RELI-X into equilibrium with heavy buy-side matching. |
| **`TATA-Y`** | Industrial | ₹1.5 Cr | 843.27 | 851.71 | **+1.0%** | Orderly close. Completes full 18-month cycle. |
| **`BZR-V`** | Consumables | ₹15 L | 584.64 | 590.49 | **+1.0%** | Fades into low-volume close; remains far below its boom peak of ₹677. |
| **`VOLTAGE`** | Power Grid | ₹40 L | 269.91 | 272.61 | **+1.0%** | Stabilized around ₹272. |
| **`STAPLE`** | FMCG Defensive | ₹1.0 Cr | 1,210.97 | 1,214.60 | **+0.3%** | Finished entire competition without experiencing a single draw-down session. |
| **`GOLDCORE`**| Safe Haven | ₹4.0 Cr | 6,764.68 | 6,778.21 | **+0.2%** | Preserved wealth across the entire 18-month war and crisis arc. Closes at ₹6,778.21. |

---

## 6. THE MASTER WINNING ALPHA PLAYBOOK ("HOW TO WIN AND TRADE THE BEST WAY")

### 6.1 The Mathematical Victory Condition: Why Compounding Dictates Strategy
In Bazaar, the podium leaderboard is not ranked by total raw cash, but by **geometric compound percentage return**:

$$\text{cumulative\_return\_pct} = \left[\left(1 + \frac{R_1}{100}\right) \times \left(1 + \frac{R_2}{100}\right) - 1.0\right] \times 100\%$$

* **The Compound Multiplier Effect**: If you achieve $+35\%$ in Round 1 and $+70\%$ in Round 2, your cumulative score is:
  $$(1.35) \times (1.70) - 1.0 = \mathbf{+129.5\%}$$
  A team that ignores Round 1 and only makes $+10\%$ in R1 needs an impossible $+108\%$ in Round 2 just to match you!
* **The Elimination Death Trap**: If your equity ever drops to zero or below, your team is **permanently eliminated** ($R = -100\%$). A score of -100% multiplies the entire tournament score to -100%, destroying your standing regardless of prior performance. **Capital preservation is paramount.**

---

### 6.2 The 7 Sacred Trading Rules of Meridian
1. **Never Trade Market Orders in the Middle of an Active Shock**: When a news shock fires, direction snipers stack huge walls, but slippage against the trend can cost you 1.5% to 3.0%. Enter on the early leak or wait for the initial shock wave to establish a support/resistance ceiling.
2. **Fade @BullRunBhai (`FF`) 65% of the Time**: Posts with fire emojis ("🔥"), rocket emojis ("🚀"), and all-caps urgency are deliberate exit-liquidity traps. When @BullRunBhai shouts "BUY NOW", prepare to short or take profits.
3. **Respect Market Depth ($D_i$)**: A ₹10 Lakh trade moves `PULSE` by $1.0\%$, but it takes ₹3.00 Crore to move `RELI-X` by $1.0\%$. If you have high conviction and leverage, deploy capital into thin-depth assets (`PULSE`, `BZR-V`, `FORGE`, `CRANE`) to maximize price amplification.
4. **Exploit the 9-Second Leak Advantage**: If you own **Research Level 2**, you receive news at `early_tick = public_tick - 6` ($9.0\text{ seconds}$ early). Because un-upgraded teams face an additional 15-second delay, you possess a **16 to 24-second execution monopoly** before the crowd even sees the headline!
5. **Trade With the Story Anchor ($F_t$), Not Against It**: In Round 2, mean-reversion bots pull prices back toward $F(t)$ with time constants $\tau = 4\text{s}$ to $8\text{s}$. If you pump an asset against its fundamental story, bots will aggressively punish your deviation.
6. **Watch the Stealth Gross NPA Metric**: Long before the public collapses of `HDFC-W` and `APEX`, insider memos and research reports flagged Gross NPAs climbing from 1.8% to 2.1% to 2.3% and finally exploding to 8.9%. When credit quality rots, short the banking sector aggressively.
7. **Always Keep Cash in Reserve for Intermission Upgrades**: You start Round 2 with ₹1.00 Crore cash. Allocate ₹27.0 Lakhs to the **Grand Champion Pack** (Research L2 + Capital L2), leaving ₹73.0 Lakhs in cash. With $2\times$ leverage, your Buying Power becomes **₹1.46 Crore**.

---

### 6.3 Exploiting Information Asymmetry: The 9-Second Leak Arbitrage
The single highest ROI mechanism in the platform is **Research Level 2** (`75,000,000` paise = ₹7.5 Lakhs).

```
TIME ELAPSED (Seconds)
t = 0.0s          t = 9.0s                         t = 24.0s
───┬─────────────────┬────────────────────────────────┬──────────►
   │                 │                                │
   ▼                 ▼                                ▼
[EARLY LEAK]   [PUBLIC TICK]                  [RETAIL PUBLIC]
Research L2    Engine starts shock            Research Level 0
teams receive  smoothing over 2-8             teams finally receive
packet on WS   ticks. Bots stack DOM.         packet (15s delay).
EXECUTE HERE!  RIDE THE WAVE!                 THEY BUY YOUR BAGS!
```

1. **Step 1 ($t = 0.0\text{s}$, `early_tick`)**: Your WebSocket receives a packet:
   ```json
   {
     "type": "news",
     "ticker": "APEX",
     "source": "IN",
     "impact": -0.15,
     "is_fake": false,
     "text": "URGENT LEAK: Apex Capital Bank board convenes midnight audit..."
   }
   ```
2. **Step 2 ($t = 0.5\text{s}$)**: Check `is_fake`. It is `false`, and `impact` is `-0.15` (-15%).
3. **Step 3 ($t = 1.0\text{s}$)**: Immediately place maximum allowable short sell orders on `APEX` at the current un-moved price (₹740.00).
4. **Step 4 ($t = 9.0\text{s}$ to $18.0\text{s}$)**: The public tick triggers. Directional sniper bots stack sell walls. The engine applies the -15% shock over 2 to 8 ticks. Price drops to ₹620 $\rightarrow$ ₹580.
5. **Step 5 ($t = 24.0\text{s}$)**: Research Level 0 retail players finally get the news on their screens and panic-sell at the very bottom.
6. **Step 6**: Buy to cover your short position at ₹570, locking in a **+23% net gain in under 30 seconds**!

---

### 6.4 The Contrarian Finfluencer Filter (@BullRunBhai / `FF`)
Across the entire 11 sessions, @BullRunBhai delivers **65% deceptive traps**:

| Session | Ticker | Headline / Claim | Impact | Ground Truth | Winning Exploitation |
|:---:|:---:|:---|:---:|:---:|:---|
| **S1 ($n=40$)** | `BZR-V` | "Exclusive grocery supply deal! 10x coming! 🚀" | +3.5% | **FAKE** | Fade pump immediately; price collapses back to base. |
| **S1 ($n=150$)**| `PULSE` | "Top DEX whale moving 20k ETH into pool!" | +2.0% | **FAKE** | Exit liquidity trap; dump long positions. |
| **S2 ($n=70$)** | `INFY-Z`| "Key enterprise heads resigning! Dump tech!" | -2.0% | **FAKE** | Bear trap; buy dip for instant rebound to all-time highs. |
| **S3 ($n=70$)** | `PULSE` | "Whale just loaded 50M PULSE on DEX! 50x run!" | +6.0% | **FAKE** | Founders offloaded 40M tokens! Sell/short immediately. |
| **S4 ($n=160$)**| `RELI-X`| "Reliant chairman stepping down unexpectedly!" | -3.0% | **FAKE** | False panic; hold energy long through the war shock. |
| **S6 ($n=20$)** | `PULSE` | "Major bridge hack alert! Devs moving treasury!"| -4.0% | **FAKE** | Fake bear raid; buy dip before the +14% buyback pump! |
| **S7 ($n=125$)**| `BZR-V` | "Activist short seller forced to cover! Going to ₹250!"| -6.0% | **FAKE** | Retail squeeze trap; short into the temporary spike. |
| **S8 ($n=145$)**| `PULSE` | "Tier-1 exchange listing confirmed tonight! 🚀" | +8.0% | **FAKE** | Short squeeze pump; take profits at the peak. |
| **S9 ($n=40$)** | `HDFC-W`| "Merger is dead! Antitrust regulators rejecting deal!"| -3.0% | **FAKE** | Ignore the noise; stock is already crashing on real NPA contagion. |
| **S10 ($n=120$)**| `BZR-V`| "CEO suing short sellers for $2 Billion! Buyback!"| +3.0% | **FAKE** | Desperate PR stunt; use relief bounce to short again. |
| **S11 ($n=45$)**| `GLOBAL`| "Emergency market closure rumored for tomorrow! Liquidate!"| 0.0% | **FAKE** | Pure FUD; do not panic sell into final settlement. |

---

### 6.5 Insider (`IN`) Desk Leak Sniping (The 90% Win-Rate Channel)
Headlines sourced from **`IN` (Desk Anonymous)** are 90% accurate and trigger the most extreme price repricings in the game. Remember: **Teams without Research Level 2 NEVER see `IN` news packets!**

* **S2 ($n=45$)**: `BZR-V` leaked MCA unannounced audit memo $\rightarrow$ **-11.0% drop**.
* **S4 ($n=60$)**: `VOLTAGE` confidential LNG supply shut-off memo $\rightarrow$ **-12.0% crash**.
* **S4 ($n=85$)**: `GOLDCORE` RBI ₹1,200 Cr bullion war-hedge allocation $\rightarrow$ **+4.5% surge**.
* **S5 ($n=70$)**: `RELI-X` confidential Gulf partner green ammonia walkout $\rightarrow$ **-9.0% drop**.
* **S7 ($n=65$)**: `RELI-X` Gulf Sovereign Fund 6.5% equity block filing $\rightarrow$ **+12.0% spike**.
* **S7 ($n=95$)**: `HDFC-W` confidential ₹1,800 Cr loan reclassification audit $\rightarrow$ **-6.0% drop**.
* **S8 ($n=15$)**: `APEX` midnight audit Gross NPA explosion from 3.1% to 8.9% $\rightarrow$ **-15.0% shock (-22% session crash)**.
* **S8 ($n=120$)**: `HDFC-W` interbank credit freeze on Apex contagion $\rightarrow$ **-14.0% collapse**.
* **S8 ($n=170$)**: `TATA-Y` Ministry of Defense heavy logistics tender L1 win $\rightarrow$ **+8.0% rally**.
* **S9 ($n=120$)**: `BZR-V` statutory auditor resigns over balance sheet discrepancies $\rightarrow$ **-9.0% crash**.
* **S10 ($n=70$)**: `PULSE` critical zero-day exploit draining pools in real time $\rightarrow$ **-12.0% early leak, -16% public = -28% crash to ₹630!**
* **S10 ($n=190$)**: `FORGE` Cabinet fast-tracks 50% mobilization advance payment $\rightarrow$ **+5.0% closing surge (+14% session total)**.

---

### 6.6 Market Depth ($D_i$) & Microstructure Pumping / Squeezing
In Round 2, you move the market. Use the formula:

$$\Delta P\% = 0.01 \times \frac{A_{\text{net}}}{D_i}$$

* **Pumping `PULSE` ($D = ₹10\text{ Lakhs}$)**:
  * Deploying ₹20 Lakhs of net buying pushes `PULSE` by $+2.0\%$ in a single tick!
  * Deploying ₹50 Lakhs moves it by $+5.0\%$ (the maximum per-tick cap)!
* **Crushing `BZR-V` ($D = ₹15\text{ Lakhs}$)**:
  * When the forensic short seller report hits in S9, shorting ₹30 Lakhs of notional drives a $-2.0\%$ price drop per tick on top of the news shock!
* **The Blue-Chip Defense**:
  * Never try to pump `GOLDCORE` ($D = ₹4.0\text{ Cr}$) or `RELI-X` ($D = ₹3.0\text{ Cr}$). A ₹30 Lakh order moves `RELI-X` by a negligible $0.1\%$. Use blue chips for capital preservation and dividend stability, not momentum pumping.

---

### 6.7 Zero-Crossing Cost Basis, Leverage & Inventory Risk
* **Never Cross Zero Unintentionally**: When flipping from Long (+500 shares) to Short (-500 shares), your cost basis resets to the exact fill price of that tick. If you sell at the bottom of a wick, your short entry is pinned at the worst possible price!
* **Calculate Maximum Leverage Exposure**:
  $$\text{Exposure} = \sum |\text{qty}_i| \times P_{i, \text{live}} \le \text{Equity} \times 2.0$$
  If your equity is ₹80 Lakhs, your absolute exposure cannot exceed ₹1.60 Crore. If an asset moves against you, your equity shrinks, lowering your max exposure and blocking further trades. Always maintain a 25% cash buffer.
* **Fee Drag Awareness**: Every order costs $0.05\%$. A round-trip trade costs $0.10\%$. Over-trading 50 times in a session bleeds 5.0% of your portfolio in exchange fees. **Trade catalysts, not noise.**

---

### 6.8 Optimal Stat Shop Loadout & Capital Allocation Strategy
During the Intermission (between S6 and S7), your ledger resets to ₹1.00 Crore cash. Purchase the **Grand Champion Pack**:

```
STARTING CASH: ₹1,00,00,000 (₹1.00 Crore)
─────────────────────────────────────────────────────────────────
[-] Research Level 1 (Public news delay: 10s)         :  ₹3,50,000
[-] Research Level 2 (9s EARLY LEAKS + Insider UNBLOCK):  ₹7,50,000
[-] Capital Level 1  (SHORT SELLING UNLOCKED)          :  ₹5,00,000
[-] Capital Level 2  (2.0x MARGIN LEVERAGE)            : ₹11,00,000
─────────────────────────────────────────────────────────────────
TOTAL CAPITAL INVESTED                                : ₹27,00,000 (27.0%)
REMAINING LIQUID CASH TO TRADE                        : ₹73,00,000
EFFECTIVE BUYING POWER WITH 2.0x LEVERAGE             : ₹1,46,00,000 (₹1.46 Cr)
```

---

### 6.9 The Complete Session-by-Session Grand Champion Execution Walkthrough

```
═════════════════════════════════════════════════════════════════════════════
                THE 11-SESSION GRAND CHAMPION PLAYBOOK
═════════════════════════════════════════════════════════════════════════════

[ROUND 1: RETAIL BOOM]
• S1 (Opening Bell):
  - At t=22.5s, buy RELI-X on power grid subsidy news.
  - At t=60s, ignore @BullRunBhai's fake grocery pump on BZR-V.
  - At t=142.5s, go full long INFY-Z on $450M Nordic cloud migration deal. Ride to +3.0%.
  - Scalp TATA-Y dips near ₹877 using its 70-second sine wave cycle.

• S2 (Cheap Money):
  - At t=30s, immediately buy NIMBUS on debut (+6% run).
  - At t=67.5s, sell all BZR-V on leaked MCA unannounced audit memo.
  - At t=105s, buy the dip on INFY-Z when fake resignation rumors drop price.
  - At t=187.5s, buy PULSE on genuine Asian exchange listing; ride +9% surge.

• S3 (A Small Cough):
  - At t=67.5s, buy INFY-Z on margin beat.
  - At t=105s, SELL ALL PULSE as @BullRunBhai pumps "50M whale buy" — founders dump 40M tokens!
  - At t=217.5s, buy BZR-V on board denial leak for quick +2.5% scalp.
  - Note the stealth Gross NPA low of 1.8% on HDFC-W.

• S4 (The Corridor Closes — The War Shock):
  - At t=22.5s, broad market crash headline! Liquidate tech and cyclicals.
  - Rotate 100% of capital into RELI-X (crude +38%) and GOLDCORE (RBI ₹1,200 Cr war allocation).
  - NEVER TOUCH VOLTAGE (plummets -9% on LNG supply shut-off).

• S5 (Stimulus Whispers):
  - At t=30s, buy CRANE on debut (railway bridge tender win).
  - At t=105s, take profits on RELI-X as green ammonia JV collapses.
  - At t=217.5s, buy TATA-Y at ₹867 on fake Pune warehouse fire headline. Sell recovery.

• S6 (Last Dance of the Boom):
  - At t=67.5s, buy PULSE on buyback confirmation; ride +14% blow-off mania past ₹1,000!
  - At t=112.5s, buy BZR-V on surprise ₹250 Cr buyback filing (+5%).
  - At t=187.5s, spot the Gross NPA creep to 2.3% on HDFC-W.
  - Liquidate all holdings before the close. Lock in Round 1 profits!

─────────────────────────────────────────────────────────────────
[INTERMISSION: THE STAT SHOP]
• Ledger resets to ₹1.00 Crore cash.
• Purchase Research L1 (₹3.5L) + Research L2 (₹7.5L).
• Purchase Capital L1 (₹5.0L) + Capital L2 (₹11.0L).
• You now hold ₹73 Lakhs cash, ₹1.46 Cr buying power, 9s early leaks, and short selling.

─────────────────────────────────────────────────────────────────
[ROUND 2: INSTITUTIONAL RECKONING]
• S7 (The Hike):
  - At t=13.5s (early leak), short INFY-Z and BZR-V before public 75 bps rate hike.
  - At t=88.5s (early leak), buy RELI-X on Gulf SWF 6.5% block filing.
  - At t=133.5s (early leak), SHORT HDFC-W on auditor reclassification report.
  - At t=253.5s, long GOLDCORE on sovereign bullion flight.

• S8 (APEX Falls — The Banking Panic):
  - At t=13.5s (early leak), GO MAXIMUM LEVERAGED SHORT ON APEX (-22% crash!).
  - At t=88.5s, ignore fake HDFC-W merger smokescreen.
  - At t=171s (early leak), SHORT HDFC-W on interbank credit freeze (-14% crash!).
  - Move cash profits into GOLDCORE (+2.0%).

• S9 (Contagion):
  - At t=21s, buy LEDGER debut as defensive tech shelter asset (+4%).
  - At t=88.5s (early leak), SHORT BZR-V with full power on 80-page forensic fraud report!
  - At t=133.5s (early leak), SHORT PULSE on regulatory enforcement inquiry (-18%).
  - Ride GOLDCORE to all-time highs above ₹6,800.

• S10 (The Turn — The Masterstroke):
  - At t=21s, buy FORGE debut on ₹28,000 Cr federal corridor package (+14% run!).
  - At t=96s (early leak), SHORT PULSE on zero-day bridge exploit leak!
  - At t=142.5s, as PULSE hits ₹630, BUY TO COVER!
  - Take those short profits and immediately deploy 2x leveraged long into FORGE and CRANE!
  - At t=276s, FORGE gets 50% mobilization advance payment; explodes to ₹1,436!

• S11 (New Normal — The Settlement):
  - Long APEX and HDFC-W recapitalization recovery.
  - Long FORGE into final order backlog reconciliation.
  - At t=246s, institutional settlement protocol activates. Square all positions to cash.
  - Watch your compounded tournament return lock into #1 on the Podium!
═════════════════════════════════════════════════════════════════════════════
```

---
*End of Master Reference — Bazaar / Meridian Antigravity Core*

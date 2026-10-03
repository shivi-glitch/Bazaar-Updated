# 05 — ROUND 2 MARKET ENGINE, BOTS, HERDING, LATENCY (reactive, zero-sum)

Round 2 (g7–g11) uses the **same engine loop** as Round 1 but a different branch. Prices are *computed every tick* (0.5 s) from a pre-generated story anchor **F**, real team order flow and bots. All teams trade one shared book against a bot population.

**Why bots exist:** they take the other side of every team order (liquidity), and they keep the market tied to the story by pulling price back toward value — **gradually**, over roughly 10–25 seconds, never in a single tick (D-20). All parameters are **starting values**; Phase 8 may tune each within ±30% to meet §9, then freezes them in `data/params_r2.json` with a hash.

## 1. State per instrument
`P(n)` traded price · `F(t)` anchor · `D_i` depth · `A(n)` aggressive net flow · smoothed deviation `dev_s` · history buffers · `mood_i(g)` · herd state.

## 2. Tick pipeline (order is a contract; one tick = 0.5 s)

1. `n ← n+1`. Compute `F_i(t)` (§3.2). Fire events whose `t_e` is reached (hidden). Deliver news due now to each team by its Research level (02 §4).
2. **Collect fills due now:** market orders whose fill tick is `n`; limit orders crossed by `P(n)` (§7). Re-validate (cash, exposure, elimination, kill switch). Fill at `P(n)` (limit orders at their limit). Apply fee. Update positions. `Q_real,i(n)` = signed notional of fills (buy +, sell −).
3. **Bot flows** (§4).
4. **Price update** (§3.3) → `P(n+1)`; clamp, round to ₹0.05.
5. Update OFI, smart-money flag, herd detector (§8), MERX50.
6. Mark-to-market all teams (vectorised); **eliminate** any team with equity ≤ 0 (06 §5); update leaderboards.
7. Broadcast tick, persist (batched), checkpoint every 20 ticks.

Execution rule: an order submitted at time `t_s` fills at the first tick `n` with `n/2 ≥ t_s + latency`, at the price `P(n)` — slippage is the cost of latency.

## 3. Anchor and price equations

### 3.1 Depth
`D_i = d_i × N × ₹1 Cr`, `N` = registered teams. **Net aggressive notional of D_i in one tick moves price 1%.**

| Ticker | d_i % | | Ticker | d_i % | | Ticker | d_i % |
|---|---|---|---|---|---|---|---|
| RELI-X | 0.60 | | NIMBUS | 0.30 | | LEDGER | 0.40 |
| HDFC-W | 0.50 | | STAPLE | 0.50 | | FORGE | 0.35 |
| INFY-Z | 0.50 | | VOLTAGE | 0.30 | | GOLDCORE | 0.80 |
| TATA-Y | 0.40 | | CRANE | 0.35 | | PULSE | 0.25 |
| BZR-V | 0.30 | | APEX | 0.30 | | MERX50 | derived |

Example (N=450): RELI-X D = ₹2.7 Cr per 1%. ₹2 Cr of orders in one tick ≈ +0.74% — and then the market makers walk it back over many seconds (§3.3).
MERX50's price is computed from constituents (03 §8); an index trade executes at the index price and is counted as flow into constituents in proportion to weights.

### 3.2 Anchor
`ln F(t) = ln F(0) + D_F·(t/300) + Σ_e J_e·K_e(t) + X_F(n)` — **same events and same kernels as 04 §3** (so the story value itself moves over 8–55 s, never in a jump). `D_F` solves the session target (03 §2); `X_F` is a pinned texture with σ = 0.5× the 04 σ, seeded with scope prefix `F:`. `F(0)` of a session = `F(300)` of the previous; at R2 start `F = P =` R1 closing price. F is identical in every run.

### 3.3 Price update — gradual pull-back
```
dev(n)    = ln P(n) − ln F(t − L_i)                      (price vs. the value market makers believe, L_i seconds late)
dev_s(n)  = dev_s(n−1) + 0.221·( dev(n) − dev_s(n−1) )    (2-second EMA: bots do not react to a single tick)
pull(n)   = − α_i · dev_s(n),   α_i = 1 − exp(−0.5/τ_i)   (τ_i = pull-back time constant in seconds)
r_i(n)    = pull(n)  +  0.01·A_i(n)/D_i  +  0.6·σ_i·v(n)·ε_i(n)
ln P(n+1) = ln P(n) + clip( r_i(n), −1.5 %, +1.5 % )
A_i(n)    = Q_real + Q_noise + Q_mom + Q_inf
```
`σ_i, v, ε` as in 04 §2. Market makers take the other side of `A`. `L_i`, `τ_i` come from the mood table (§4.1).

**What this does to a player push.** If teams push a stock up 5% above value, `dev_s` rises over ~2 s, the pull grows to ≈ α·5% per tick (≈ 0.3% in calm, 0.4% tense) and the displacement decays with time constant `τ` (calm 8 s, tense 6 s, panic 4 s): about **40–60% back within 10 s, 80–90% within 25 s**, in dozens of small steps, and only if players stop pushing. Persistent flow of `a·D` per tick holds price `0.01·a/α` away from value.

## 4. Bots

| Class | Role | Flow |
|---|---|---|
| **Market maker (MM)** | always quotes; pulls price to value | the `pull` term above (not part of `A`) |
| **Noise trader (NT)** | random liquidity | `Q_noise ~ N(0, (s_n·D_i)²)` per tick |
| **Momentum trader (MOM)** | chases the last 10 s | `Q_mom = κ_mo·D_i·tanh( ( lnP(n) − lnP(n−20) ) / 0.008 )` |
| **Institution (INF)** | trades toward value with a lag | `Q_inf = κ_inf·D_i·tanh( ( lnF(t − L_inf) − lnP(n) ) / 0.01 )` |

### 4.1 Mood table (starting values; per-tick flows)

| Mood | τ (s) | L (s) | s_n | κ_mo | κ_inf | L_inf (s) |
|---|---|---|---|---|---|---|
| calm | 8 | 2.5 | 0.11 | 0.05 | 0.075 | 8 |
| tense | 6 | 2.0 | 0.16 | 0.12 | 0.100 | 7 |
| panic | 4 | 1.5 | 0.25 | 0.25 | 0.125 | 6 |
| recovery | 6 | 2.0 | 0.14 | 0.15 (banks 0.075) | 0.100 | 7 |
| **pulse-own** (PULSE always) | 12 | 3.0 | 0.32 | 0.22 | 0 | — |

### 4.2 Mood by session
| Session | Default | Panic | Calm | Recovery |
|---|---|---|---|---|
| R2S1 | tense | — | GOLDCORE, STAPLE | — |
| R2S2 | tense | HDFC-W, APEX | GOLDCORE, STAPLE | — |
| R2S3 | tense | INFY-Z, NIMBUS, CRANE, TATA-Y | GOLDCORE | — |
| R2S4 | tense | — | GOLDCORE | FORGE, CRANE, TATA-Y, VOLTAGE, HDFC-W, APEX |
| R2S5 | calm | — | all but PULSE | — |

Mood, bot parameters, F, event schedule and truth flags are **server-only**.

## 5. Information timing in R2
News reaches a team `15/10/7/3 s` after the event starts moving the market (02 §4). The expected share of the move already in the price at those moments is in `02` §6; Phase 8 verifies it.

## 6. Institutional indicators (all teams in R2)
- **OFI** (public, delayed 2 s = 4 ticks): `OFI_i(n) = Σ_{k=0..19}(A⁺ − A⁻)(n−4−k) / ( Σ|A| + ε )` ∈ [−1,+1]. `A⁺/A⁻` = aggressive buy/sell notional of teams + bots over a 10-s window.
- **Smart-money flag:** `SM_i = sign(Q_inf)` when `|Q_inf,i/D_i| ≥ 0.5·κ_inf(mood)` for 6 consecutive ticks (3 s), else 0. It shows up several seconds after the move starts — later than Research L3, comparable to L2/L1 (O-05).
- R1 indicators remain (SMA9, SMA20, RSI14 on 1-s bars; volume; drawn lines client-side).

## 7. Orders and execution
| Item | Rule |
|---|---|
| Market order | fills at the first tick ≥ `t_s + latency`, at that tick's price; no partial fills |
| Limit order | rests; buy fills when `P ≤ limit`, sell when `P ≥ limit`; fill at limit; expires at session end (FINISHED) or on cancel; max 10 open per team |
| Latency by Speed | L0 **2.4 s** · L1 **1.8 s** · L2 **1.2 s** · L3 **0.6 s**, ±0.3 s jitter (seeded per order id) |
| Short sell | requires Capital ≥ 1 |
| Exposure test (at submission **and** at fill) | `Σ|qty_i·P_i| + |order notional| ≤ Lmax × equity`; `Lmax = 1` (Capital 0–1; Capital 0 is long-only) or `2` (Capital ≥ 2). Rejected if violated. No margin call |
| Elimination | equity ≤ 0 → team ELIMINATED, positions closed at last price, open orders cancelled (06 §5) |
| Rate limit | token bucket 1.5 orders/s, burst 3 |
| Idempotency | client key, DB UNIQUE |

## 8. Herding (player-triggered event)
Window of 30 ticks (15 s):
```
H_i(n) = Σ_{k=0..29} Q_real,i(n−k) / D_i
ρ_i(n) = (# distinct teams trading i in window on the sign(H) side) / (# distinct teams trading i in window)
TRIGGER if |H| ≥ 1.5 and ρ ≥ 0.70 and distinct teams ≥ max(15, 0.04·N) and cooldown(i) = 0
```
On trigger (cooldown 120 ticks per instrument):
1. **Overshoot (40 ticks = 20 s):** `κ_mo ← 2.5·κ_mo` for i.
2. **Correction (50 ticks = 25 s):** `Q_corr = −0.5·κ_mo·D_i·sign(H)` added to `A`, and `α ← 1.5·α` — still smooth, never a single-tick snap.
3. Log `herd_events`; public banner after 6 ticks (3 s) "Heavy one-way flow in <ticker>" (admin toggle, default on).

## 9. Calibration & acceptance (**Phase 8 hard gates**; synthetic teams / bots only)

| # | Test | Threshold |
|---|---|---|
| C1 | **Conservation:** Σ team qty + Σ bot qty = 0 per instrument each tick; Σ(team cash + bot pool cash + fees + stat spend) constant, integer paise | 0 paise error every tick of a 5-session run |
| C2 | Bot-only tracking: median `|ln P − ln F|` per instrument per session | ≤ 1.0% (calm/tense/recovery), ≤ 2.0% (panic) |
| C3 | Bot-only realised σ vs R1 same instrument & regime | 0.8×–1.6× |
| C4 | Signal-capture table (02 §6) reproduced with the real engine | within ±8 pp |
| C5 | **Gradual pull-back:** scripted teams push RELI-X +5% above value (calm), then stop | max single-tick retrace ≤ 0.35%; ≥ 40% retraced within 10 s; ≥ 80% within 25 s; no retrace > 50% in under 4 s |
| C6 | Impact test: one team's ₹2 Cr buy in RELI-X (N=450, calm) | +0.5%…+1.5% within 4 ticks |
| C7 | Latency exploitability: identical scripted strategy at Speed L0 vs L3 on E8.1 | L3 mean fill price better by ≥ 0.4% |
| C8 | Herding: 25 scripted teams buy PULSE for 10 ticks | trigger within 12 ticks; overshoot ≥ 2% over the no-herd path; ≥ 50% retraced after the correction; no single-tick retrace > 0.8% |
| C9 | Price bounds | stays within [0.35×, 3×] of session open |
| C10 | Tick compute p99, N=500, 15 instruments, MTM of all teams | ≤ 100 ms (budget 500 ms) |
| C11 | Determinism with zero human flow: two runs → identical SHA-256 | identical |
| C12 | Information edge: scripted Research-L3 vs L0 on E8.1, E9.4, E10.1 | L3 beats L0 by ≥ 1.0% of capital cumulative |
| C13 | Elimination: a scripted team driven to equity ≤ 0 | eliminated within 1 tick, no further orders accepted, books reconcile (C1 holds) |

## 10. Accounting
The **bot pool** is the counterparty to every team fill, recorded per instrument (`bot_qty`, `bot_cash`). Aggregate team P&L = − bot-pool P&L − fees leaving the system − stat-shop spend. Per-class virtual P&L (NT, MOM, INF) is diagnostic only.

## 11. Admin overrides in R2
`pause`, `kill switch`, `inject_news` (impact vector on F, ≤ ±5% per instrument, kernel `jump`, logged with admin id), `force_mood(ticker, mood, duration)` — all audited. Nothing may directly edit `P`.

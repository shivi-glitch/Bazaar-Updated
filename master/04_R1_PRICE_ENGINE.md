# 04 — ROUND 1 PRICE ENGINE (deterministic, pre-generated, solvable)

Round 1 is a **scripted market**. Trades never move price. A generator builds every price/volume array offline from the master data, the arrays are frozen and hashed, and the live engine only *reads* them tick by tick. Sessions R1S1–R1S6 (g1–g6).

## 1. Time grid
Tick = 0.5 s. `n = 0..600`, `t = n/2` seconds. `P_i(g, 0)` is the opening price (prior close or unlock price, `03`). `P_i(g, 600)` is the closing price = `P_i(g,0) × (1 + r_{i,g}/100)` within ±0.05% (hard gate). Charts show ticks; **indicators use 1-second bars** (the tick at every integer second).

## 2. The master equation (story spline + texture)

For instrument `i`, session `g`, tick `n` (time `t = n/2`):
```
ln P(n) = ln P(0)  +  D·(t/300)  +  Σ_e J_e · K_e(t)  +  C(t)  +  X̃(n)
```
| Term | Meaning |
|---|---|
| `D` | **drift residual** solved so the endpoint hits the target: `D = ln(1+r/100) − Σ_e J_e·K_e(300) − C(300)` |
| `J_e = ln(1 + m_e/100)` | log-size of event `e` on this instrument (net effect, `02` §2) |
| `K_e(t)` | event kernel (§3), 0 before `t_e` |
| `C(t) = A·[sin(2πt/P_c + φ_c) − sin φ_c]` | planted cycle (§7); `A=0` if none |
| `X̃(n) = X(n) − (n/600)·X(600)` | **texture**, an AR/OU path *pinned* so `X̃(0)=X̃(600)=0` |

Texture per tick:
```
x(n+1) = (1 − κ)·x(n) + φ·(x(n) − x(n−1)) + σ·v(n)·ε(n),     x(0)=x(−1)=0
ε(n)   = a·Z_mkt(n) + b·Z_sec(n) + c·Z_idio(n),   c = sqrt(1 − a² − b²)
v(n)   = m_g · (1 + Σ_e A_e · exp(−(t−t_e)/τ_v) · 1[t ≥ t_e])
```
`σ` is per-tick log-return; `m_g` the session regime multiplier; `A_e` the event volatility spike (1.5 default; 2.5 `war_shock`; 3.0 `rate_shock`/`crisis_shock`; 2.0 `stimulus`); `τ_v = 30 s` (45 s for shocks). `Z_mkt` shared by all; `Z_sec` per sector group (ENRG/BANK/TECH/CONS/INFR; DIGI and SAFE separate); `Z_idio` private.

**Correlation under stress:** in a session containing a `war_shock`, `rate_shock` or `crisis_shock`, from `t_e` onward add `+0.15` to `b` (and `+0.20` to `a` for rate/crisis) for affected equities (cap `a²+b² ≤ 0.92`). GOLDCORE's `a` stays negative; PULSE is never uplifted.

### 2.1 Personality parameters (per 0.5-s tick)

| Ticker | σ % | κ | φ | a | b | Cycle A %, period (s) | Notes |
|---|---|---|---|---|---|---|---|
| RELI-X | 0.05 | 0.015 | 0.00 | 0.30 | 0.50 | — | calm blue chip |
| TATA-Y | 0.06 | 0.025 | −0.05 | 0.25 | 0.45 | 1.8, 70 | **planted cycle** |
| INFY-Z | 0.08 | 0.000 | +0.20 | 0.35 | 0.55 | — | momentum |
| HDFC-W | 0.07 | 0.000 | +0.18 | 0.35 | 0.55 | — | momentum |
| BZR-V | 0.14 | 0.005 | 0.00 | 0.25 | 0.30 | — | volatile |
| GOLDCORE | 0.015 | 0.010 | 0.00 | −0.10 | 0.00 | — | stable, positive drift |
| PULSE | 0.21 | 0.000 | +0.15 | 0.10 | 0.00 | — | own DIGI factor |
| NIMBUS | 0.11 | 0.000 | +0.20 | 0.35 | 0.60 | — | high-beta tech |
| STAPLE | 0.03 | 0.015 | 0.00 | 0.20 | 0.40 | 0.5, 90 | stable |
| VOLTAGE | 0.16 | 0.005 | 0.00 | 0.25 | 0.55 | — | volatile energy |
| CRANE | 0.06 | 0.025 | −0.05 | 0.25 | 0.45 | 1.5, 55 | **planted cycle** |
| APEX | 0.13 | 0.000 | +0.10 | 0.35 | 0.60 | — | R2 |
| LEDGER | 0.04 | 0.020 | −0.03 | 0.30 | 0.50 | — | R2 |
| FORGE | 0.085 | 0.000 | +0.18 | 0.30 | 0.50 | — | R2 |

Cycle phase `φ_c` per (ticker, session) = `2π·U(0,1)` from the seeded generator.

### 2.2 Session regime multiplier `m_g`
| g | R1S1 | R1S2 | R1S3 | R1S4 | R1S5 | R1S6 | R2S1 | R2S2 | R2S3 | R2S4 | R2S5 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| m_g | 0.8 | 0.9 | 0.9 | 1.3 | 1.1 | 1.0 | 1.4 | 2.0 | 1.7 | 1.4 | 1.0 |

## 3. Event kernels `K_e(t)` (Δ = t − t_e in **seconds**; `ramp(Δ;ρ)=clip(Δ/ρ,0,1)`)

Every kernel spreads the move over many ticks. The headline appears at `t_e`, when the move *starts*.

| Shape | Contribution (J = net, Jp = peak) |
|---|---|
| `jump` | `J · ramp(Δ; 10)` (20 ticks) |
| `ramp40` | `J · ramp(Δ; 40)` |
| `pead` | `0.55·J·ramp(Δ; 10) + 0.45·J·ramp(Δ−10; 40)` (move, then post-news drift) |
| `spike_fade` | to `Jp` over 6 s, hold until Δ=15, then linear to `J` over Δ∈[15,45] |
| `dip_revert` | as spike_fade with a negative peak |
| `war_shock`, `rate_shock`, `crisis_shock`, `stimulus` | `J · ramp(Δ; 8)` with the volatility/correlation effects above |
| `crash` | linear to `1.19·J` over 15 s, then back to `J` over Δ∈[15,55] |

## 4. Seeding
```
seed(scope) = uint64( SHA256( master_seed || "|" || g || "|" || scope )[0:8] )
scopes: "mkt", "sec:<GROUP>", "idio:<TICKER>", "cycle:<TICKER>", "vol:<TICKER>", "pre:<TICKER>"
PRNG: numpy.random.Generator(PCG64(seed))
```
`master_seed` is chosen once, stored in `data/params.json`, never changes after the Phase 2 freeze. Everybody sees the same arrays.

**Seed acceptance:** for each session try `master_seed + k` (k=0,1,2,…) until **all acceptance tests (§8) pass**; record the winning `k`. A story target is never relaxed to make a seed pass.

## 5. Rounding & tick limits
`P = round(exp(lnP)/0.05)·0.05`. After rounding enforce `|P(n) − P(n−1)| ≤ 1.5 %` per tick (clip on the log path then re-round; log every clip). Because kernels are spread over ≥ 6 s, clips should be rare — **the number of clips is reported in the audit**.

## 6. Volume (display)
```
V(n) = V̄·s_i·v(n)^0.5·(1 + 0.8·|r(n)|/σ_i)·conf(n)·exp(0.2·η(n))·(1 + B_e·exp(−(t−t_e)/20))
conf = 1.5 if |r| ≥ 1.5σ and sign(r) == sign(Σ_{k=1..10} r(n−k)),  0.8 if |r| ≥ 1.5σ and signs differ,  else 1
```
`V̄ = 500` per tick, `η~N(0,1)`, `B_e = 2.0` for the event's tickers when `A_e ≥ 2.5`, else 1.0. Liquidity scale `s_i`: RELI-X 1.5, HDFC-W 1.4, INFY-Z 1.2, TATA-Y 0.9, BZR-V 1.0, GOLDCORE 0.6, PULSE 1.6, NIMBUS 0.8, STAPLE 0.7, VOLTAGE 0.8, CRANE 0.8, APEX 1.0, LEDGER 0.8, FORGE 0.9. MERX50 volume = Σ constituents. Bar volume = sum of its two ticks.

## 7. Planted edges (what a diligent player can learn)

| ID | Edge | Where | Mechanism |
|---|---|---|---|
| EDGE-A | Mean reversion to SMA20 | TATA-Y, CRANE, STAPLE (weak) | planted cycle + κ>0, φ<0 |
| EDGE-B | Move continues after the headline | INFY-Z at E2.2, NIMBUS at E2.5 | `pead` |
| EDGE-C | Fade the unsourced spike | BZR-V at E1.2, E3.3 | `spike_fade` |
| EDGE-D | Safe haven | GOLDCORE | low σ, positive drift, up in the war |
| EDGE-E | Source credibility | all news | truth rates NP55/AN75/FF35 |
| EDGE-F | Sector correlation | INFY-Z↔NIMBUS, RELI-X↔VOLTAGE | shared `Z_sec`; NIMBUS beta higher |
| EDGE-G | Volume confirmation | all | confirmed ≥1.5σ moves continue ≥60% over the next 20 s; unconfirmed revert ≥60% |
| EDGE-H | Buy the dip on a headline | TATA-Y at E5.3 | `dip_revert` |

## 8. Acceptance tests (generator exit criteria — **Phase 2 hard gates**)

| # | Test | Threshold |
|---|---|---|
| T1 | Endpoint accuracy for every (instrument, session) | ≤ 0.05% |
| T2 | Determinism: two independent runs → identical SHA-256 of all arrays | identical |
| T3 | Continuity: open(g+1) = close(g) | exact |
| T4 | Max one-tick move | ≤ 1.5% |
| T5 | Correlation of 1-s-bar returns INFY-Z vs NIMBUS, R1S2–R1S6 | ≥ 0.45 each session |
| T6 | EDGE-A: long when `P < SMA20×0.992`, exit when `P > SMA20×1.008` or after 30 bars; net of 0.2% round-trip fee | mean ≥ +0.5% per trade, win rate ≥ 60%, ≥ 3 trades/session on TATA-Y in every R1 session |
| T7 | EDGE-B: buy 2 s after `t_E` of E2.2 and E2.5, hold 40 s, net of fees | ≥ +1.5% each |
| T8 | EDGE-C: peak minus price 30 s later for E1.2, E3.3 | ≥ 3% drop |
| T9 | EDGE-G hit rates | ≥ 60% / ≥ 60% |
| T10 | Realised session σ of tick returns vs `σ·m_g` | within ±25% |
| T11 | GOLDCORE session range | ≤ 1.5% (R1S4 ≤ 4%) |
| T12 | **Spread check:** for every event, the deterministic component (kernel only) reaches 50% of its largest excursion (net or peak, whichever is larger) no earlier than 3 s after `t_e` and 90% no earlier than 6 s | holds for all R1 events |
| T13 | **Solvability:** Skilled-A vs Random-1000 (below) | see below |

**Skilled-A** (no hindsight): GOLDCORE 25%; trade TATA-Y/CRANE by EDGE-A; trend names when `SMA9 > SMA20`, exit on cross; follow NP/AN items only after checking the move is under way, ignore FF; sell BZR-V spikes; ≤ 60 trades per session. **Gates:** net ≥ **+1.5%** in at least 5 of the 6 sessions and cumulative ≥ **+12%** after 0.1% fees. **Random-1000** (5 random trades/session): median cumulative ≤ **−0.5%** and ≤ **5%** of random bots beat Skilled-A.

## 9. Pre-history
240 ticks (120 bars) before an instrument's first live session: same equations with `D = 0`, no events, `m=0.8`, endpoint pinned to the opening price. Supplies SMA20/RSI warm-up.

## 10. Output artefacts (Phase 2)
`data/prices_r1.parquet` (g, ticker, n, price_paise, volume), `data/prehistory.parquet`, `data/params.json` (`master_seed`, accepted `k` per session), `data/r1_arrays.sha256`, and `tools/gen_r1.py`. **Arrays are frozen after Phase 2.** Any later change needs an organizer-approved change request and a full re-audit.

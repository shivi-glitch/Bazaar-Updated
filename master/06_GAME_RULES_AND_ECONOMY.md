# 06 — GAME RULES & ECONOMY (everything a player or admin feels)

## 1. Scoring
- Round **Return %** = `(Final equity − Start capital)/Start capital × 100` at the end of the round's last session. Stat-shop spend (R2) is inside final equity.
- **Consistency factor** `C = (# sessions with positive equity change)/(# sessions in the round)`, measured open-to-close of each session after fees.
- **Round score** `S_R = Return% + Bonus`, `Bonus = 0.10 × max(Return%,0) × C` (O-02).
- **Overall winner** = highest `(S_R1 + S_R2)/2`. Tie-break: higher S_R2, then higher R2 final amount.
- **Eliminated team:** Return = −100%, score −100 for that round, listed at the bottom with an ELIM tag.
- Overtrading has no separate penalty beyond the fee.
- Rounds are scored independently; inside a round, capital and positions carry from session to session.
- **Leaderboards are admin-only** (§10). R1 top performers get an **offline hint** from organizers (no software).
- **Disclosed to players:** that P&L and consistency matter, overtrading costs money, news sources differ in reliability (qualitatively), general event categories. **Not disclosed:** formula weights, exact timings, truth rates.

## 2. Capital
| | R1 | R2 |
|---|---|---|
| Start capital | ₹10,00,000 | ₹1,00,00,000 (**reset for every team when R2 is unlocked**) |
| Position cap | none | none |
| Idle cash interest | none | none |
| Leverage | none (cash only) | up to 2× gross if Capital ≥ 2 |
| Short selling | no | Capital ≥ 1 |
| Order types | market | market + limit |
| Market impact | none | yes (05) |
| Spread | none | none |

## 3. Fees
`fee = round_half_up(0.001 × qty × fill_price)` in paise on every fill, both sides, both rounds.

## 4. Orders
| Field | Rule |
|---|---|
| Quantity | integer ≥ 1 |
| Side | BUY / SELL (R1: SELL ≤ holdings; R2: SELL beyond holdings creates a short if allowed) |
| Limit price | rounded to ₹0.05 |
| Trading window | only while the instrument's session is **RUNNING** (`0 ≤ t < 300 s`). Not during STARTING, PAUSED, FINISHED, or kill-switch freeze |
| In-flight at session end | cancelled; nothing fills after the freeze |
| Idempotency | `client_key` UNIQUE |
| Rate limit | token bucket 1.5/s, burst 3 |
| Eliminated team | all orders rejected `eliminated` |

## 5. Equity, positions, elimination (integer paise)
```
equity = cash + Σ qty_i × P_i        (qty negative for shorts)
gross  = Σ |qty_i| × P_i
R1: cash ≥ 0 after every fill; qty_i ≥ 0
R2: gross ≤ Lmax × equity at submission and at fill
```
**Elimination (D-18):** at every tick's mark-to-market, a team whose `equity ≤ 0` becomes **ELIMINATED**: positions are closed at the last price, open orders cancelled, the team can no longer trade or buy stats, and it remains on the leaderboards at −100%. The ledger keeps the true (possibly slightly negative) equity so conservation checks stay exact; scoring uses `max(equity, 0)`. An eliminated team is out for the rest of the event (O-10). In Round 1 (cash only, long-only) this cannot realistically happen; the rule exists for R2 leverage and shorts.

## 6. Stat Shop (visible from the start; purchasable only in Round 2)
- The **Stats tab exists in Round 1 but is locked** for participants ("Unlocks in Round 2").
- It becomes **open when the admin unlocks Round 2** (D-16) so teams can see and buy before R2S1.
- **Purchases are allowed only when Round 2 is unlocked and no session is STARTING, RUNNING or PAUSED** — i.e. before R2S1 and in the gaps between sessions, until the admin starts the next session (D-17). There is no countdown for the shop: it stays open as long as the admin keeps the next session unstarted.
- **No budget rule.** Every team has ₹1 Cr cash after the reset and may buy anything it can pay for from **cash**. Levels are bought in order and are permanent. Cost is deducted from cash immediately and counts as an expense in P&L. A purchase that would leave `equity ≤ 0` is rejected.

| Stat | Level | Cost (₹) | Effect |
|---|---|---|---|
| **Research** | 1 | 2,00,000 | news delay **15 s → 10 s** |
| | 2 | 5,00,000 | delay **7 s** and **Insider news unlocks** |
| | 3 | 10,00,000 | delay **3 s** |
| **Capital** | 1 | 3,00,000 | short selling (gross ≤ 1× equity) |
| | 2 | 8,00,000 | gross up to **2× equity** |
| **Speed** | 1 | 2,00,000 | order latency 2.4 → **1.8 s** |
| | 2 | 4,00,000 | **1.2 s** |
| | 3 | 8,00,000 | **0.6 s** |

Maximum total ₹42,00,000 (42% of capital). Buying everything is possible but leaves 58% to trade with — a deliberate trade-off.
News delay applies to events that start **after** the purchase.

## 7. Session control (manual; D-15)

The admin panel shows the 11 sessions as **blocks**. Each block has a state:

```
LOCKED → READY → STARTING(3 s sync lead-in) → RUNNING ⇄ PAUSED → FINISHED
```
- **LOCKED:** not yet available. Block `g` becomes **READY** only when block `g−1` is **FINISHED**. R1S1 is READY once Round 1 is opened. **R2S1 becomes READY only after the admin presses Unlock Round 2**, which itself is offered only after R1S6 is FINISHED.
- **Start** (only on a READY block): moves to STARTING; the server picks `t0 = now + 3 s` and all phones start together. The 3 s is a technical sync, not a break timer.
- **Pause / Resume** (on the RUNNING block): freeze/unfreeze the session clock; the trading clock `t` does not advance while paused; orders are rejected while paused.
- **FINISHED:** reached automatically when `t = 300 s` of RUNNING time has elapsed (prices freeze at the closing price), or via **End early** (admin, with confirmation).
- **There are no timers or auto-starts between sessions.** After FINISHED, teams see "Waiting for organizers…". The next block unlocks, and the admin starts it when ready. In R2 this waiting gap is when the Stat Shop is usable.
- **Kill switch** (global overlay): freezes all trading and the clock; teams see "Market frozen by organizers"; Resume continues from the same tick.
- **Unlock Round 2** (admin, one click, only after R1S6 FINISHED): freezes the R1 final leaderboard snapshot, resets every non-eliminated team to ₹1 Cr with no positions and all stats at 0, sets `round_phase = 2`, plays the reveal animation on clients (no reload), opens the Stat Shop, makes R2S1 READY.

Planned run time (indicative, depends entirely on the admin): R1 ≈ 30 min of trading + gaps; R2 ≈ 25 min of trading + shop gaps.

## 8. Fundamentals visibility
Stock page: company P/E, industry P/E, EPS bars, Gross NPA (banks), 52w range, market cap, blurb (`03`). Released at session start; none changes mid-session.

## 9. Admin powers (all audited in `admin_audit`)
Start / pause / resume / end-early a session block; unlock Round 2; kill switch; generate teams & PINs; reset a PIN; lock/unlock a team; **inject news** (R1: only scripted items or an informational custom headline with no price effect; R2: custom item with anchor impact ≤ ±5% per instrument); force mood (R2); view leaderboards; export CSV; replay a finished session.

## 10. Leaderboards (admin only — D-19)
- **Live leaderboard panel:** shows the **current round** only. Refreshes every **5–10 s** (admin slider, default 5 s). Columns: rank, team, equity, P&L ₹, return %, session P&L, positions count, status (ACTIVE / ELIM). Toggle sort by absolute amount or by percentage.
- **Final leaderboards tab** (separate): **R1 Final** (frozen when R1S6 is FINISHED), **R2 Final** (frozen when R2S5 is FINISHED), **Overall** (per D-09). Each shows both the absolute-amount and the percentage ranking.
- Participants never see any ranking, live or final, unless the organizer reveals it on stage.

## 11. Player-facing rulebook (≤ 2 pages, publish before the event)
Capital, rounds and sessions, what is live when, fee, order types, news sources and how reliability differs (qualitatively), the Round 2 stat shop (when it opens, that it is paid from cash), that Round 2 is zero-sum and shared, elimination at zero equity, no collusion, one device per team, fair-play (no automation against the API), and the kill-switch message.

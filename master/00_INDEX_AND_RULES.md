# BAZAAR — MASTER INDEX & AGENT RULES (v2.0)

**Read this file first, every session, before touching anything.** It tells you what the other files are, which one wins when they disagree, and what you may never do.

Event: E-Summit, PEC · Scale: 400–500 concurrent teams · Platform: mobile-first live trading simulation, run by an admin who controls every session manually.

---

## 1. Reading order

| # | File | What it holds | Authority over |
|---|---|---|---|
| 00 | `00_INDEX_AND_RULES.md` | rules, glossary, decision log, open decisions | precedence, conventions |
| 01 | `01_STORY_BIBLE.md` | world, 11-session arc, per-session narrative, macro data, intended winning play | story intent |
| 02 | `02_NEWS_LEDGER.md` | every news item, source, truth flag, event impact, delivery rules | all news content & timing |
| 03 | `03_INSTRUMENTS_AND_FUNDAMENTALS.md` | roster, session targets, price levels, EPS, P/E, NPA, index weights | all numbers about instruments |
| 04 | `04_R1_PRICE_ENGINE.md` | Round 1 equations, generator algorithm, planted edges, acceptance tests | R1 price behaviour |
| 05 | `05_R2_MARKET_ENGINE_AND_BOTS.md` | Round 2 reactive engine, bots, gradual pull-back, herding, latency, indicators | R2 price behaviour |
| 06 | `06_GAME_RULES_AND_ECONOMY.md` | scoring, fees, orders, leverage, stat shop, elimination, session control, leaderboards | all rules a player or admin feels |
| 07 | `07_PLATFORM_SPEC.md` | features, screens, admin panel, API, WebSocket, DB schema, performance & security | engineering contract |
| 08 | `08_PHASE_PLAN.md` | 11 phases (P1–P11) with entry criteria, deliverables, HARD exit gates | build order |
| — | `simulation.md` | the event told as a story (for the organizer; the agent may read it for intent) | none |
| — | `audit/AUDIT_RULES.md`, `audit/AUDIT_LOG_TEMPLATE.md`, `audit/AUDIT_LOG.md` | evidence rules and the per-phase log | phase completion |
| — | `prompts/PHASE_n_PROMPT.md` | the instruction handed to the agent at the start of each phase | none |

## 2. Precedence (highest wins)

1. `00` §3 hard rules
2. Files 02 and 03 for any number or text they contain
3. Files 04, 05, 06 for behaviour and formulas
4. File 01 for intent when a number is silent
5. Files 07, 08 for engineering
6. The original organizer files (README, game-mechanics-spec, story bible v2) are **not part of this set**; this folder is the only truth.

## 3. Hard rules for the building agent (Antigravity)

1. **Never invent a number, headline, ticker, price or formula.** If this folder is silent, stop and write the question into `OPEN_QUESTIONS.md`.
2. **Never change a master file.** Propose a change in `CHANGE_REQUESTS.md`; the organizer edits master files and bumps the version in §7.
3. **Determinism is sacred.** Round 1 price paths are a pure function of `(master_seed, session, ticker)`; same inputs → bit-identical output. No unseeded randomness anywhere in price generation.
4. **Money is integer paise (BIGINT).** Never floats for cash, cost, fees or equity. Prices are rounded to ₹0.05 before they are stored or sent.
5. **Trades never write prices.** Only the tick loop computes price.
6. **Sessions never start by themselves.** There are no break timers and no auto-start. Only an admin action starts a session; the next session unlocks only after the previous one is FINISHED (06 §7).
7. **No phase starts until the previous phase's audit log is complete and every HARD gate is PASS with real measured numbers** (`audit/AUDIT_RULES.md`).
8. **Never leak** future prices, truth flags, event schedules, bot parameters, anchor F, or leaderboards to a participant client.
9. **Times are server-authoritative.** Clients display; they never decide when anything happens.
10. When something fails, log FAIL with the number. Never reword a threshold to make it pass.

## 4. Conventions & glossary

- **g** = global session index 1..11. `R1S1..R1S6 = g1..g6`, `R2S1..R2S5 = g7..g11`.
- **Tick = 1.0 s (1 tick per second)**. **Session = 300 s of RUNNING time = 300 ticks**; `t` is in seconds (`t = n`), trading allowed for `0 ≤ t < 300`. Paused time does not count.
- **Bar = 1 s** (the last tick of each second). All indicators (SMA9, SMA20, RSI14) are computed on 1-second bars; the chart shows live ticks, the forming bar updates once a second.
- **Pre-history** = 120 bars (240 ticks) shown before `t=0` the first time an instrument is live.
- Percent values are in percent. Price in ₹, tick size ₹0.05. Team capital: R1 ₹10,00,000 · R2 ₹1,00,00,000.
- **Source codes:** `NP` newspaper · `AN` analyst · `IN` insider (**Round 2 only**) · `FF` finfluencer. A *source* has a truth rate; there are no "tiers" that change timing.
- **Event (E-id)** = a real move in the story world; it starts moving price at time `t_E`. **Signal** = a headline about an event, carrying a hidden **truth** flag.
- **F** = story anchor price (R2 only). **P** = traded price.
- **Research / Capital / Speed** = the three Round 2 stats.
- **Session block** = one of the 11 sessions as a card in the admin panel with its own Start/Pause control.

## 5. Decision log (locked)

| ID | Decision |
|---|---|
| D-01 | Source accuracy: **NP 55 · AN 75 · IN 90 · FF 35** (65% inverse). Ledger realises 56.0 / 78.6 / 90.0 / 33.3 (02 §5). |
| D-02 | Universe: 7 live at R1S1 → 12 at R1S6 → 15 at R2S4. |
| D-03 | LEDGER unlocks R2S3, FORGE unlocks R2S4. |
| D-04 | **News timing (organizer rule).** *Round 1:* every team receives every headline at `t_E`, the instant the price move starts. *Round 2:* a headline reaches a team `delay` seconds **after** the move starts: **Research L0 15 s → L1 10 s → L2 7 s → L3 3 s**. Delay is the same for all sources. |
| D-05 | **Insider news does not exist in Round 1.** In Round 2 it is delivered only to teams with **Research ≥ 2**. NP, AN, FF reach everyone. |
| D-06 | R2 opens with the 12 R1 instruments at R1S6 closing prices (no gap). |
| D-07 | R1 long-only, no leverage. R2: shorts need Capital ≥ 1 (gross ≤ 1× equity); 2× gross needs Capital ≥ 2. |
| D-08 | Consistency bonus: `0.10 × max(Return%,0) × positive-session share` (06 §1). |
| D-09 | Overall winner = average of the two percentage-based round scores. |
| D-10 | **Tick = 0.5 s (2/s).** Indicators on 1-s bars. |
| D-11 | R1: pre-generated arrays. R2: pre-generated anchor F + reactive price from team flow and bots. |
| D-12 | Fee 0.10% of trade value per fill, both rounds. Spread 0. |
| D-13 | Money = integer paise. |
| D-14 | Truth of a signal = sign of its event's net move on the implied ticker equals the implied direction (02 §3). |
| D-15 | **Manual session control.** Sessions are blocks. Start/Pause per block. Block k+1 unlocks only when block k is FINISHED. No timers between sessions. A 3-second synchronisation lead-in (STARTING) after the admin presses Start is technical, not a break timer. |
| D-16 | After R1S6 is FINISHED the admin sees **Unlock Round 2**; pressing it resets every team to ₹1 Cr, opens the Stat Shop, and makes R2S1 startable. Stat tab exists in R1 but is locked for participants. |
| D-17 | **Stat purchases are allowed only while Round 2 is unlocked and no session is STARTING/RUNNING/PAUSED** (pre-R2S1 and between sessions). **No budget rule:** any team may buy anything it can pay for from cash (₹1 Cr reset). |
| D-18 | **Elimination:** a team whose equity reaches ₹0 (or below) is eliminated for the rest of the event (06 §5). |
| D-19 | Admin has a **Live leaderboard** (current round, refreshed every 5–10 s) and a **Final leaderboards** tab (R1 final, R2 final, overall). Never visible to participants. |
| D-20 | **Bot pull-back is gradual:** a price displaced by players returns to value over roughly 10–25 s, never in one tick (05 §3). |
| D-21 | Event price moves and news-driven moves are always spread over many ticks (≥ 8 s), never a single-tick jump. |
| D-22 | Phases are numbered **P1–P11**; P1 = Foundation + content pipeline, P2 = Round 1 generator. |

## 6. Open decisions — organizer to confirm (defaults used until you say otherwise)

| ID | Question | Default in this folder |
|---|---|---|
| O-02 | Consistency bonus weight | as D-08 |
| O-03 | Tickers resemble real companies (TATA, HDFC, INFY) | kept; **recommend renaming before public display**. Tickers are only read from `data/instruments.json`, so renaming is a data change |
| O-04 | 15 instruments on a phone | grouped by sector + search; confirm after Phase 6 device tests |
| O-05 | Smart-money flag is free for all in R2 | free, delayed (05 §6) |
| O-07 | Names: "The Meridian Standard", "@BullRunBhai", "Calder & Wyn Research", "Northgate Securities" | as listed |
| O-08 | Admin-injected live news in R2 | allowed, capped ±5% anchor per instrument, logged |
| O-09 | Reading of Research: **3 purchasable levels** (L1 10 s, L2 7 s + insider, L3 3 s) | as D-04/D-05 |
| O-10 | An eliminated team is out of the whole event (cannot rejoin R2). In practice R1 (long-only, cash) cannot reach ₹0 | as D-18 |
| O-11 | Finfluencer has no special timing; same delay as everybody | as D-04 |
| O-12 | Stat costs (06 §6) | as listed |

## 7. Version log
| Version | Date | Change |
|---|---|---|
| 1.0 | 2 Oct 2026 | first set |
| **2.0** | 3 Oct 2026 | manual session blocks; new news timing; insider R2-only; tick 0.5 s; no stat budget rule; elimination; live + final leaderboards; gradual bot pull-back; phases renumbered P1–P11; phase prompts added |

## 8. Folder layout the agent must create
```
bazaar/
  master/            # these files, read-only (chmod 444), SHA-256 manifest master/MANIFEST.sha256
  data/              # instruments.json, session_targets.json, fundamentals.json, events.json, news_ledger.json, params.json …
  backend/  frontend/  engine/  tools/  tests/
  audit/             # AUDIT_LOG.md + evidence/Pxx/*
  OPEN_QUESTIONS.md  CHANGE_REQUESTS.md
```

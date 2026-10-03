# 07 — PLATFORM SPECIFICATION

Stack: Next.js (mobile-first) · `lightweight-charts` · FastAPI (Python 3.12) · PostgreSQL + asyncpg + SQLAlchemy/Alembic · native WebSockets for ticks, REST for trades · **one engine loop** (single asyncio task) in the FastAPI process, R1/R2 as branches.

## 1. Participant app (phone first)
| Screen | Contents |
|---|---|
| Login | team ID + PIN; rate-limited; session token |
| Waiting | between sessions: "Waiting for organizers…", last session P&L, (R2) shortcut to the Stat Shop |
| Market | live instruments grouped by sector, price, session % change, mini sparkline; "unlocking soon" rows; search |
| Stock page | live line chart + pre-history; SMA9/SMA20/RSI14 (1-s bars), volume, user-drawn lines (client-side, persisted); fundamentals panel (03); R2: OFI bar, smart-money badge, herd banner |
| Trade ticket | qty, buy/sell, market (R1) / market + limit (R2), max qty, cost + fee preview, shows latency (R2); disabled unless the session is RUNNING |
| Portfolio | cash, equity, positions, avg cost, realised/unrealised P&L, session and round P&L, ELIM badge if eliminated |
| News | feed with source badge; delivered per team (R2: by Research delay; Insider only if Research ≥ 2) |
| **Stats tab** | visible always. **R1: locked**, text "Unlocks in Round 2". R2: levels, costs, effects, buy button enabled only in a gap (D-17) |
| Header | session label/clock, PAUSED / FROZEN / WAITING banners, connection dot |
| Reveal | Round 2 unlock animation without reload |

Mobile: usable at 360×640, touch targets ≥ 44 px, chart ≥ 60% height, no horizontal scroll, reconnect resync ≤ 3 s.

## 2. Admin panel
1. **Session blocks** (11 cards, grouped Round 1 / Round 2): state chip, Start, Pause/Resume, End early. Block `g` is greyed (LOCKED) until block `g−1` is FINISHED. No timers anywhere.
2. **Round control:** after R1S6 FINISHED shows **Unlock Round 2** (confirmation dialog). Before that it is hidden/disabled.
3. **Kill switch** (always visible) with resume.
4. **Live leaderboard panel:** current round, auto-refresh 5–10 s (slider), sort by amount or %, search, ELIM filter.
5. **Final leaderboards tab:** R1 Final, R2 Final, Overall; CSV export.
6. Teams: bulk generate IDs/PINs, CSV (one-time), reset PIN, lock/unlock, view eliminations.
7. News console: scripted queue (read-only schedule view + manual fire for emergencies), custom injection (guarded, 06 §9).
8. R2 monitors: per-instrument P, F (admin only), OFI, herd state, bot mood, orders/s.
9. System health: connected clients, tick lag, DB latency, memory.
10. Audit trail viewer, session replay, results export.

## 3. REST API (JSON; money in paise; auth required)
| Method | Path | Notes |
|---|---|---|
| POST | `/auth/login` | `{team_id, pin}` → token |
| GET | `/state` | round_phase, per-session block states, current g/t, server time, own stat levels, eliminated flag |
| GET | `/market/snapshot` | last prices + pre-history window |
| GET | `/instruments/{ticker}` | fundamentals as of now |
| POST | `/orders` | `{client_key, ticker, side, qty, type, limit_price?}` |
| DELETE | `/orders/{id}` | cancel open limit |
| GET | `/portfolio` | cash, positions, equity, P&L |
| GET | `/news` | items already delivered to this team |
| POST | `/stats/purchase` | `{stat, level}`; only when R2 unlocked and no session STARTING/RUNNING/PAUSED |
| Admin | `/admin/sessions/{g}/start|pause|resume|end` | state-machine guarded (409 on illegal transition) |
| Admin | `/admin/round2/unlock` | only after block 6 FINISHED |
| Admin | `/admin/freeze`, `/admin/unfreeze` | kill switch |
| Admin | `/admin/leaderboard/live?round=` | snapshot; `/admin/leaderboard/final` |
| Admin | `/admin/teams/generate`, `/news/inject`, `/export`, `/replay` | |

Error codes: `market_frozen`, `session_not_running`, `session_paused`, `insufficient_cash`, `insufficient_position`, `exposure_limit`, `stat_locked`, `shop_closed`, `eliminated`, `rate_limited`, `duplicate_key` (returns original), `invalid_qty`, `illegal_transition`.

## 4. WebSocket protocol (`/ws?token=…`)
Server → client: `hello{server_time,state}` · `tick{g,n,prices:{ticker:[price,vol]},idx}` (one frame per **0.5 s tick**) · `news{id,source,text,ticker}` (never the truth flag, never insider to Research < 2) · `session{g,state,t0}` · `flag{round_phase,kill_switch}` · `portfolio{...}` (own changes + every 10 ticks) · `herd{ticker,dir}` · `stat{levels,shop_open}` · `elim{}` · `error`.
Admin channel `/ws/admin`: live leaderboard frames at the configured 5–10 s cadence, health, monitors.
Client → server: `ping`, `subscribe`. Orders only via REST. Heartbeat 5 s; resync with `last_seq`.

## 5. Database (PostgreSQL; BIGINT paise)
| Table | Key columns |
|---|---|
| `teams` | id, name, pin_hash (bcrypt), research/capital/speed levels, locked, eliminated, created |
| `instruments`, `fundamentals` | per 03 |
| `r1_prices` | g, ticker, n, price_paise, volume — read-only after freeze |
| `r2_anchor` | g, ticker, n, f_paise |
| `events` | e_id, g, t_e, shape, effects JSONB |
| `news_items` | id, source, text, event_id, ticker, dir, truth (server-only), min_research |
| `news_deliveries` | team_id, news_id, delivered_at_n |
| `sessions` | g, round, state, t0, running_seconds, started_at, finished_at |
| `orders`, `fills`, `positions`, `team_ledger` | as before; `orders.client_key` UNIQUE |
| `equity_snapshots` | team_id, g, n, equity_paise (every 10 ticks + session end) |
| `leaderboard_snapshots` | round, kind (live/final), taken_at, rows JSONB |
| `stat_purchases` | team_id, stat, level, cost_paise, at_state |
| `bot_pool`, `herd_events`, `engine_checkpoints`, `flags`, `admin_audit` | |

## 6. Concurrency & integrity
Per-team `asyncio.Lock()` + DB savepoint on every trade; trades read price from memory (read-only); the tick loop is the single price writer; fill + ledger + position in one DB transaction; session state transitions are single-writer and guarded.

## 7. Performance targets (500 concurrent teams)
| Metric | Target |
|---|---|
| Tick interval | 500 ms ± 40 ms (p99) |
| Tick compute (MTM of all teams, 15 instruments) | ≤ 100 ms p99 |
| WebSocket fan-out lag | ≤ 250 ms p99, 2 frames/s/client sustained |
| `POST /orders` | ≤ 150 ms p95, ≤ 400 ms p99 |
| Admin live leaderboard compute | ≤ 500 ms per refresh |
| Reconnect + resync | ≤ 3 s |
| Lost updates / double fills | 0 |
| Process memory | < 1.5 GB |

## 8. Resilience
Checkpoint every 20 ticks. R1 needs only `n` + states; R2 needs P, F history, bot histories, herd state, open limit orders, RNG states. `kill -9` recovery ≤ 10 s with time continuity; session states persist (a crash during RUNNING resumes as PAUSED until the admin resumes — never auto-resumes). Warm standby host acceptable.

## 9. Security
bcrypt PINs; no plaintext PINs anywhere; per-team locks + savepoints; trades never write price; DB idempotency; rate limiting; admin on separate credentials/route; locked CORS; no truth flags/future data/F/leaderboards to participants; admin actions audited; WSS; PIN brute-force lockout (5 fails → 60 s).

## 10. Observability
Structured logs with `g, n, team_id, order_id`; tick-timing histogram; counters for orders/s, rejects by code, WS clients; health page; every audit run saves raw metric output.

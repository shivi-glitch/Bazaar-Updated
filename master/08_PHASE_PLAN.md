# 08 — PHASE PLAN (11 phases, each ends with a hard evidence gate)

A phase is DONE only when `audit/AUDIT_LOG.md` holds a completed section for it in which every HARD gate is PASS with a measured number (`audit/AUDIT_RULES.md`). Every phase also re-runs the earlier phases' **smoke gates** (★); a regression fails the current phase. Gate IDs are `G<phase>.<n>`. All gates are HARD. Thresholds are minimums unless stated.

---

## P1 — Foundation + content pipeline
**Deliver:** repo layout (00 §8), Docker Compose (Postgres, backend, frontend), Alembic baseline, CI script, `/health`, master docs copied read-only with `MANIFEST.sha256`; `tools/ingest.py` building `data/instruments.json`, `session_targets.json`, `fundamentals.json`, `events.json`, `news_ledger.json`; DB seed; validators; `tools/audit_verify.py` + `audit/gates.json`.
| Gate | Requirement | Threshold |
|---|---|---|
| G1.1 ★ | Clean-clone build + `docker compose up` | succeeds, 0 errors |
| G1.2 ★ | Alembic upgrade → downgrade → upgrade | all pass, schema diff 0 |
| G1.3 ★ | Unit tests | 100% pass; ≥ 20 tests |
| G1.4 | `/health` load: 1000 requests, 50 concurrent | p95 ≤ 50 ms, 0 errors |
| G1.5 ★ | `sha256sum -c master/MANIFEST.sha256` | all OK |
| G1.6 | Lint/type (ruff, mypy, eslint, tsc) | 0 errors |
| G1.7 ★ | Instruments: count and live-per-session vs `03` §1 and 01 §3 | 15 instruments; live counts 7,8,9,10,11,12,12,13,14,15,15 |
| G1.8 ★ | Session-target matrix vs `03` §2 (every cell) | 0 diffs |
| G1.9 ★ | Recompute from the rules: closing prices (from returns), P/E (open ÷ EPS), industry P/E (0.8/0.2 rule), index weights (raw ÷ live sum), EPS pre-history (÷1.015^k) and EPS overrides; session EPS values themselves are frozen inputs | max abs diff ≤ 0.01 |
| G1.10 ★ | News ledger: 64 signals + 4 info; per-source counts 25/14/10/15; truth recomputed from events | all equal; accuracies within ±6 pp of 55/75/90/35 |
| G1.11 ★ | Referential integrity: every signal → existing event & ticker live that session; **0 Insider items in Round 1**; every Insider item has `min_research = 2` | 0 violations |
| G1.12 | Truth flag in any API/WS payload (grep + live probe) | 0 occurrences |
| G1.13 | `audit_verify.py` self-test: a fabricated failing evidence JSON must exit non-zero; a passing one exit 0 | both behave |

## P2 — Round 1 price generator & solvability
**Deliver:** `tools/gen_r1.py`, frozen arrays, hashes, report. Implements 04 fully.
| Gate | Requirement | Threshold |
|---|---|---|
| G2.1 | T1 endpoint accuracy, all (instrument, session) | ≤ 0.05% for 100% of pairs |
| G2.2 | T2 determinism, two clean runs | identical SHA-256 |
| G2.3 | T3/T4 continuity and max tick move | exact / ≤ 1.5% |
| G2.4 | T5 INFY-Z↔NIMBUS correlation, R1S2–R1S6 | ≥ 0.45 every session |
| G2.5 | T6 EDGE-A (TATA-Y, CRANE) | mean ≥ +0.5%/trade, win ≥ 60%, ≥ 3 trades/session |
| G2.6 | T7, T8 EDGE-B, EDGE-C | ≥ +1.5% / ≥ 3% |
| G2.7 | T9, T10, T11 | thresholds in 04 §8 |
| G2.8 | T12 spread check: no event moves faster than 50% in 3 s / 90% in 6 s | holds for every R1 event |
| G2.9 | T13 solvability: Skilled-A vs Random-1000 | ≥ +1.5% in ≥ 5/6 sessions; ≥ +12% cumulative; random median ≤ −0.5%; ≤ 5% of random beat Skilled-A |
| G2.10 | Pre-history 240 ticks per instrument, endpoint = open price | max error ≤ ₹0.05 |
| G2.11 | Artefact hashes written to `data/r1_arrays.sha256` and committed | present |
| G2.12 ★ | Smoke P1 | pass |

## P3 — Auth, teams, credentials
| Gate | Requirement | Threshold |
|---|---|---|
| G3.1 | Generate 500 teams, unique IDs and PINs | ≤ 10 s; 0 duplicates |
| G3.2 | PIN storage: bcrypt cost ≥ 10; plaintext search of DB dump and logs | 0 matches |
| G3.3 | `/auth/login` load: 500 users in 30 s | p95 ≤ 400 ms, 0 failures |
| G3.4 | Brute-force lockout (5 fails → 60 s) | enforced |
| G3.5 | Admin routes with a participant token | 100% 403 |
| G3.6 ★ | Smoke P1–P2 | pass |

## P4 — Trading core (Round 1 rules, equity, elimination)
| Gate | Requirement | Threshold |
|---|---|---|
| G4.1 | Fee, fill, average cost, P&L unit tests incl. paise rounding | ≥ 40 cases pass |
| G4.2 | Idempotency: same `client_key` 100× concurrently | exactly 1 fill |
| G4.3 | Concurrency: 500 teams × 20 parallel orders | 0 lost updates; invariants hold for all 500 |
| G4.4 | R1 constraints (no short, no negative cash, RUNNING-only) | 100% of invalid orders rejected with correct codes |
| G4.5 | Rate limit 1.5/s burst 3 | enforced; 429 has `retry_after_ms` |
| G4.6 | Order latency at 500 concurrent | p95 ≤ 150 ms, p99 ≤ 400 ms |
| G4.7 | Trades never alter engine prices (10,000 orders) | array hash identical |
| G4.8 | Elimination rule on synthetic cases (equity ≤ 0 → ELIM, positions closed, orders rejected, ledger exact) | ≥ 10 cases pass |
| G4.9 ★ | Smoke P1–P3 | pass |

## P5 — Engine loop, session control, realtime, news (Round 1 branch)
| Gate | Requirement | Threshold |
|---|---|---|
| G5.1 | Tick cadence over 6 full sessions (3,600 ticks) | p99 interval 500 ± 40 ms |
| G5.2 | WS fan-out to 600 simulated clients at 2 frames/s | p99 lag ≤ 250 ms, 0 dropped frames |
| G5.3 | **State machine:** block g+1 cannot start before block g is FINISHED; illegal transitions return 409; R2S1 cannot start before Unlock Round 2 | ≥ 30 transition tests pass |
| G5.4 | **No auto-start:** after FINISHED, wait 10 minutes (simulated) — no session starts, no timer fires | 0 auto transitions |
| G5.5 | Pause/resume preserves `t`; paused session rejects orders | 100% |
| G5.6 | Start sync: all 600 clients begin within a skew | ≤ 300 ms |
| G5.7 | R1 news released at exactly `t_E` to all teams, every item (R1 signals + info) | within ±1 tick |
| G5.8 | Kill switch freeze effective | ≤ 1 s; `t` preserved |
| G5.9 | Session-end freeze: price unchanged between FINISHED and the next start | 0 ticks of drift |
| G5.10 | Engine reads frozen arrays; hash check at boot | equals `r1_arrays.sha256` |
| G5.11 | Crash during RUNNING restores as PAUSED, never auto-resumes | verified |
| G5.12 ★ | Smoke P1–P4 | pass |

## P6 — Frontend Round 1
| Gate | Requirement | Threshold |
|---|---|---|
| G6.1 | E2E (Playwright): login → wait → live → buy → sell → portfolio → news | 100% pass on Chromium + WebKit |
| G6.2 | Indicator parity (SMA9/20/RSI14 on 1-s bars) vs backend reference vectors | max error ≤ 1e-6 |
| G6.3 | Chart performance on a mid-range Android (≤ 3 yrs old) | ≥ 50 fps streaming 12 series at 2 Hz |
| G6.4 | Fundamentals panel equals `03` for all instruments | 0 diffs |
| G6.5 | 360×640 layout: no horizontal scroll; touch targets ≥ 44 px | audit script passes |
| G6.6 | Lighthouse mobile performance | ≥ 80 |
| G6.7 | Drawing tools persist across reload | pass |
| G6.8 | Reconnect after 10 s drop | resync ≤ 3 s |
| G6.9 | Stats tab visible and **locked** in R1 | verified |
| G6.10 | Manual check on 3 real phones (models, screenshots in evidence) | all pass |

## P7 — Admin panel, scoring, leaderboards
| Gate | Requirement | Threshold |
|---|---|---|
| G7.1 | Every admin feature in 07 §2 has an E2E test | 100% pass |
| G7.2 | Session blocks UI: LOCKED/READY/RUNNING/PAUSED/FINISHED displayed and enforced; Unlock Round 2 appears only after block 6 FINISHED | verified |
| G7.3 | **Live leaderboard** refresh interval measured over 5 minutes at settings 5 s and 10 s | each refresh within ±1 s of setting; compute ≤ 500 ms |
| G7.4 | Leaderboard correctness: recompute from fills for 500 synthetic teams | 0 diffs (paise) |
| G7.5 | **Final leaderboards:** R1 Final snapshot frozen at R1S6 FINISHED and unchanged after; separate tab | verified |
| G7.6 | Scoring formula vs 20 worked examples (06 §1) incl. ELIM | all exact |
| G7.7 | Leaderboards invisible to participants (API + WS probe) | 0 leaks |
| G7.8 | Unlock Round 2 dry run: reset to ₹1 Cr, stats 0, reveal on all 600 sim clients | ≤ 2 s, 0 errors |
| G7.9 | Admin audit trail covers every admin action | 100% |
| G7.10 | CSV export reconciles with DB | 0 diffs |

## P8 — Round 2 engine (offline simulation & calibration)
| Gate | Requirement | Threshold |
|---|---|---|
| G8.1 | C1 conservation, every tick of 5 sessions, 500 synthetic teams | 0 paise error |
| G8.2 | C2 bot-only tracking | ≤ 1.0% / ≤ 2.0% |
| G8.3 | C3 bot-only volatility | 0.8×–1.6× R1 |
| G8.4 | C4 signal-capture table (02 §6) | within ±8 pp |
| G8.5 | **C5 gradual pull-back** after a +5% push | max tick retrace ≤ 0.35%; ≥ 40% in 10 s; ≥ 80% in 25 s |
| G8.6 | C6 impact test | +0.5%…+1.5% within 4 ticks |
| G8.7 | C7 latency exploitability | L3 beats L0 by ≥ 0.4% |
| G8.8 | C8 herding trigger, overshoot, smooth correction | as 05 §9 |
| G8.9 | C9 price bounds | holds all sessions |
| G8.10 | C10 tick compute p99 (N=500) | ≤ 100 ms |
| G8.11 | C11 determinism with zero flow | identical SHA-256 |
| G8.12 | C12 information edge | ≥ 1.0% of capital |
| G8.13 | C13 elimination in R2 | as 05 §9 |
| G8.14 | Limit orders, shorts, 2× rejection rules | ≥ 30 cases pass |
| G8.15 | Final parameters frozen in `data/params_r2.json` with hash | present |
| G8.16 ★ | Smoke P1–P7 | pass |

## P9 — Round 2 integration (stat shop, delayed news, indicators, unlock)
| Gate | Requirement | Threshold |
|---|---|---|
| G9.1 | Stat shop rules: only when R2 unlocked and no session STARTING/RUNNING/PAUSED; sequential levels; cash-funded; no budget rule; shop closed during sessions | ≥ 30 cases pass |
| G9.2 | **News delivery:** for every R2 signal × Research level 0–3, delivery time = `t_E + {15,10,7,3} s` (±1 tick); Insider delivered only at Research ≥ 2 | 100% exact (64-signal ledger) |
| G9.3 | Research purchase applies to events starting after purchase | verified |
| G9.4 | Latency by Speed level end-to-end | within ±0.4 s of the table |
| G9.5 | OFI and smart-money flag vs reference implementation | error ≤ 1e-6 / identical flags |
| G9.6 | R2 frontend E2E (shorts, limit orders, shop in gaps, news delays, herd banner, ELIM state) | 100% pass |
| G9.7 | Full R2 run with 500 scripted teams (5 sessions, manual starts by script) | no crash; C1 holds; tick p99 ≤ 100 ms |
| G9.8 | Unlock Round 2 reset | exact ₹1 Cr for every team, R1 archived, R1 Final leaderboard intact |
| G9.9 | Gradual pull-back observed live under 500 scripted teams (C5 metrics re-measured) | within thresholds |
| G9.10 ★ | Smoke P1–P8 | pass |

## P10 — Load, chaos, security
| Gate | Requirement | Threshold |
|---|---|---|
| G10.1 | Full 11-session run, 600 simulated clients + 500 trading bots | 0 crashes; earlier latency/lag targets hold |
| G10.2 | `kill -9` engine mid-session (3 random ticks) | recovery ≤ 10 s, no duplicate fills, session PAUSED until admin resumes |
| G10.3 | DB restart mid-session | recovery ≤ 15 s; 0 lost fills |
| G10.4 | 30% of clients disconnect 10 s | all resync ≤ 3 s |
| G10.5 | Security scan: PIN, injection, auth bypass, rate limit, truth/F/leaderboard leak | 0 findings |
| G10.6 | Memory growth over full run | ≤ 10% |
| G10.7 | Standby failover drill | ≤ 90 s |

## P11 — Dress rehearsal & freeze
| Gate | Requirement | Threshold |
|---|---|---|
| G11.1 | Two full 11-session rehearsals, ≥ 100 human testers (or ≥ 40 humans + bots), admin starting every session manually | both complete; 0 Sev-1; incidents logged |
| G11.2 | Post-run reconciliation (fills, cash, positions, leaderboards) | 0 diffs |
| G11.3 | Runbook executed by someone who did not write it | success, time recorded |
| G11.4 | Tag `release-event`; master, data and array hashes recorded | present |
| G11.5 | Go/No-go sign-off by organizer | signed |

# BAZAAR — SIMULATION WALKTHROUGH (v2: the event as it will actually run)

A staged story of the whole event, from registration to the final results, following the master docs (event IDs `E4.2`, sessions `R1S4`, numbers from `03`). Team results and fill prices are *illustrative*; real values come from the generator and calibration phases.

Legend: **[World]** hidden truth · **[Server]** what the platform does · **[Admin]** what the organizer sees/does · **[Screen]** what a team's phone shows · **[Teams]** typical reactions.

**Three rules that shape everything below**
1. **The admin starts every session by hand.** No timers, no auto-start. Sessions are blocks; block *k+1* unlocks only after block *k* is FINISHED.
2. **News:** in Round 1 everyone gets a headline the instant its price move begins. In Round 2 it arrives **15 s later** for a basic team, **10 s** with Research 1, **7 s** with Research 2 (plus Insider news), **3 s** with Research 3.
3. **Price moves are never sudden.** Events move prices over 8–55 seconds; in Round 2, bots pull a pushed price back over 10–25 seconds.

## 0. Cast (illustrative)
| Team | Style | Fate |
|---|---|---|
| **Alpha Wolves** | disciplined, reads charts, fundamentals and source reliability | steady winner in R1; Research 2 early in R2 |
| **Bravo Bulls** | follows @BullRunBhai and every headline | burned repeatedly; one lucky PULSE |
| **Charlie Churners** | clicks constantly | eaten by the 0.10% fee |
| **Delta Dozers** | parks in GOLDCORE/STAPLE | safe, small gains |
| **Echo Edge** | patient in R1; in R2 buys Research 3 + Capital 1 + Speed 1 before S1 | R2 winner |

---

## 1. Before the event
1. Antigravity has finished P1–P11; the organizer holds `audit/AUDIT_LOG.md`, every phase signed. R1 arrays and R2 parameters are frozen and hashed.
2. **Registration:** 400–500 teams registered offline. **[Admin]** *Teams → Generate*: IDs `T001…T500` and PINs (bcrypt-hashed), one-time CSV for printing.
3. **Rulebook** published (06 §11): capital, rounds, fee, news sources differ in reliability, Round 2 stat shop (paid from cash), elimination at zero, no collusion. Not published: truth rates, formulas, timings.
4. **Smoke day:** 20 volunteer phones, a 2-minute test run, kill-switch drill.

## 2. Doors open → lobby
- Teams log in with `T0xx + PIN`. **[Screen]** "Welcome, Alpha Wolves. Waiting for organizers…" Stats tab is visible but locked ("Unlocks in Round 2").
- **[Admin]** health page: `connected 463 / 480`. The **session blocks** grid shows R1S1 READY, R1S2–R2S5 LOCKED. Live leaderboard panel is empty (refresh slider at 5 s).
- Host briefing: "Money is cheap. Everyone is a genius."

---

# ROUND 1 — RETAIL (₹10 L, market orders, long-only, trades don't move prices)

Common behaviour: prices come from the frozen arrays at 2 ticks/s; the fee is 0.10% per fill; trading works only while a session is RUNNING; at 300 s of running time the session auto-FINISHES and prices freeze. **Everyone gets every headline at the same instant the move starts.** There are no insiders in Round 1.

## R1S1 — "Opening Bell" (calm)
**[Admin]** presses **Start** on the R1S1 block. **[Server]** STARTING (3 s sync) → RUNNING. **[Screen]** all phones start together; 120 s of pre-history already on each chart. Info banner *"Market open. Welcome to MERX."*

| t (s) | [World] | [Screen] | [Teams] |
|---|---|---|---|
| 0–110 | INFY-Z, HDFC-W drift up; TATA-Y swings ±1.8% around ₹880; BZR-V choppy | SMA9/SMA20 on 1-s bars, RSI | Alpha buys INFY-Z (SMA9 crosses SMA20). Delta puts 60% in GOLDCORE. Charlie flips TATA-Y six times in a minute. |
| 60–110 | TATA-Y dips ~1% under its SMA20 | — | Alpha buys the dip (EDGE-A). |
| **120** | **E1.1** MCB holds rates; HDFC-W −0.4% drifts down over ~10 s | **NP** "Meridian Central Bank holds rates steady…" appears *as the price starts moving* (implied ▲, **false**) | Bravo buys HDFC-W on the headline; it slips. |
| **200** | **E1.2** BZR-V spikes +2.5% (6 s), holds, then fades to −1.5% by ~t=245 | **FF** "BZR-V is the next big thing. Load up…" (false) at the same instant | Bravo and Charlie chase the spike and hold into the fade. Alpha watches. |
| 300 | auto-FINISHED | prices freeze; "Waiting for organizers…" | — |

Targets: INFY-Z +3.0, HDFC-W +2.5, RELI-X +0.8, TATA-Y +0.5, BZR-V +1.5, GOLDCORE +0.3, PULSE +0.5. *Illustrative:* Alpha +2.1%, Bravo −0.4%, Charlie −1.8%, Delta +0.5%, Echo +1.2%.

**The gap (no timer).** **[Admin]** reads the live leaderboard (updates every 5 s, but session is over so it holds the final marks), takes a breath, talks to the crowd. **R1S2 is now READY**; R1S3+ are still LOCKED. **[Admin]** presses Start whenever ready. Nothing happens by itself.

## R1S2 — "Cheap Money" · NIMBUS unlocks
| t | [World] | [Screen] | [Teams] |
|---|---|---|---|
| 60 | E2.1 HDFC-W +2.0% | NP "record quarterly loan growth" (true) | Late buyers pay more; the move is already under way. |
| **110** | **E2.2** INFY-Z +2.5% over ~10 s, then **+2.0% drift** over ~40 s | **AN** (Calder & Wyn) "logistics contract could support revenue growth…" (true) and **FF** "INFY-Z is done growing. Smart money is already out." (false) — together | Alpha buys on the AN and holds through the drift (EDGE-B); Bravo sells on the FF and misses it. |
| 180 | E2.4 PULSE +5% over 40 s | **FF** "PULSE is going to the moon." (true) | Bravo buys, wins, trusts finfluencers. |
| 230 | E2.5 NIMBUS +3.5% then +2.0% drift | **NP** "Nimbus Cloud Systems posts earnings above expectations." (true) | Alpha buys NIMBUS; higher beta than INFY-Z. |

Targets: NIMBUS +6.0, INFY-Z +4.5, HDFC-W +3.5, PULSE +9.0. *Illustrative:* Alpha +4.4%, Bravo +1.9%, Charlie −0.9%, Delta +0.3%, Echo +3.0%.

## R1S3 — "A Small Cough" · STAPLE unlocks
| t | Event | Screen | Teams |
|---|---|---|---|
| 70 | E3.1 HDFC-W −1.5% | **NP** "Inflation ticks up 0.3%; analysts call it 'transitory.'" (false) | Calm-seekers take a small loss. |
| 130 | E3.2 STAPLE: no move | **NP** "steady, unremarkable earnings" (true: flat) | Delta likes it. |
| **200** | **E3.3 silent:** BZR-V +7% then fully retraces | **no headline** | Chasers buy the top; Alpha has learned EDGE-C and sells. |
| 240 | E3.4 PULSE −3% | **AN** (Northgate) "constructive on PULSE" (false) | A few buy and lose. |

*Illustrative:* Alpha +1.4%, Bravo −1.7%, Charlie −1.1%, Delta +0.4%, Echo +0.9%.

## R1S4 — "The Corridor Closes" (WAR) · VOLTAGE unlocks · volatility ×1.3
| t | Event | Screen (all at the instant the move starts) | Teams |
|---|---|---|---|
| **30** | **E4.1** RELI-X +5, VOLTAGE +6, GOLDCORE +1.5, INFY-Z −1, TATA-Y −0.8, BZR-V −1.5, HDFC-W −0.5, PULSE −2 — all spread over ~8 s | **NP** "Conflict disrupts regional oil corridor…" (true) · **FF** "oil is about to go parabolic. Get in NOW" (VOLTAGE ▲, true on direction) · **AN** "diversified producers likelier better insulated than pure plays" (true) | Bravo piles into VOLTAGE on the FF. Alpha reads the AN, takes RELI-X, skips VOLTAGE. |
| **100** | **E4.2** VOLTAGE −12%, RELI-X −2% | **AN** "VOLTAGE carries heavy near-term exposure to the disrupted corridor" (true) — same moment as the drop | Bravo is caught (≈ −12% of that position). The AN warned the *cause*, not the timing. |
| 130 | E4.2b VOLTAGE +2% bounce | **NP** "VOLTAGE confirms exposure…" (false) | Newspaper-sellers sell the low. |
| 170 | E4.3 GOLDCORE +1.2% | **NP** "record inflows" (true) | Delta gains. |
| 240 | E4.4 HDFC-W +1% | **FF** "Dump every bank stock today." (false) | Panic-sellers dump near the low. |

*Illustrative:* Alpha +2.4%, Bravo −5.8%, Charlie −2.2%, Delta +2.1%, Echo +1.5%.

## R1S5 — "Stimulus Whispers" · CRANE unlocks
E5.1 (t=40) NP stimulus signalled: CRANE +4. E5.2 (t=85) AN tender win: CRANE +3. **E5.3 (t=150)** TATA-Y dips −2.5% then reverts; **NP** says "shares dip" (false by net move) — Alpha and Echo buy the dip (EDGE-H). E5.4 (t=220) **FF** "stimulus is a trap" (false); Bravo sells CRANE and misses the rest. *Illustrative:* Alpha +3.6%, Echo +2.8%, Bravo −0.6%, Charlie −1.4%, Delta +0.6%.

## R1S6 — "Last Dance of the Boom" · MERX50 unlocks
HDFC-W's fundamentals tab shows its highest P/E and Gross NPA creeping 2.1 → 2.3% (Alpha reads it; most don't). E6.1 (t=30) NP "consumer confidence at 18-month high" (BZR-V −0.5, false). t=60 info *"MERX 50 Index now live."* E6.3 (t=110) NP "loan book grows again" (false). **t=180 AN foreshadow:** provisioning ratios below sector norms (true, about Round 2). E6.5 (t=230) PULSE blow-off (FF right); PULSE ends +14%. **t=270 NP foreshadow:** Horizon "reported to be preparing higher provisions" (true). Alpha exits HDFC-W and raises GOLDCORE.
Auto-FINISHED at 300. *Illustrative R1 final:* Alpha ₹10.89 L, Echo ₹10.60 L, Delta ₹10.12 L, Bravo ₹9.47 L, Charlie ₹8.9 L.

## End of Round 1 — the admin's two leaderboards
- **[Admin]** *Live leaderboard* shows R1 standings throughout (5–10 s refresh). Once R1S6 is FINISHED, the **R1 Final** snapshot is frozen on the separate **Final leaderboards** tab (amount and percentage). Participants see only their own portfolio.
- Host tells the R1 story. Organizers privately give the top R1 teams the offline hint.

---

# TRANSITION — "Unlock Round 2" (admin, one click)

1. **[Admin]** the **Unlock Round 2** button appears only now (R1S6 FINISHED). Confirmation dialog. Pressed.
2. **[Server]** freezes R1 Final; resets every team to **₹1,00,00,000, no positions, stats 0**; `round_phase = 2`; R2S1 becomes READY; the Stat Shop opens.
3. **[Screen]** reveal animation (no reload). New: limit orders, OFI bar, smart-money badge, shorting (if Capital ≥ 1). Info banner *"Round 2 open: one shared order book. Your orders now move prices."* The **Stats tab is now unlocked**.
4. **No session is running**, so teams can buy stats **now**. There is no budget rule: everyone has ₹1 Cr cash.
   - **Echo Edge** buys Research 1 (₹2 L), 2 (₹5 L), 3 (₹10 L), Capital 1 (₹3 L), Speed 1 (₹2 L) = ₹22 L → ₹78 L left to trade.
   - **Alpha** buys Research 1–2 (₹7 L) and Capital 1 (₹3 L).
   - **Bravo** buys nothing ("I'll just trade"). **Charlie** buys Speed 1–3 (₹14 L). **Delta** buys Capital 1 only.
5. The admin starts R2S1 when the room is ready. The moment a session is STARTING, the shop **locks** ("Shop closes during sessions").

---

# ROUND 2 — INSTITUTIONAL (₹1 Cr, shared book, bots)

## Why the bots exist
They are the other side of every team trade (liquidity) and the force that keeps the market tied to the story: market makers pull price back toward value, **gradually** (10–25 s), noise traders keep the tape alive, momentum bots amplify moves (herding), an institution bot trades toward true value with a lag (smart-money badge). Prices are **not frozen**: they move every half-second from the story anchor (events), team flow and bot flow. They are frozen only between sessions.

## How a team's order behaves
- Fills at the price when it *arrives* after latency (2.4 s base; Speed 1–3: 1.8 / 1.2 / 0.6 s).
- Big orders move the price, then bots walk it back over many ticks.
- News reaches a team 15/10/7/3 s after the move starts, by Research level. **Insider headlines appear only for Research ≥ 2.**

**Example of gradual pull-back [Server]:** Charlie sells ₹3 Cr of RELI-X in a burst → price −1.1% in four ticks. Market makers smooth the deviation over ~2 s, then buy it back: ≈ 45% recovered by +10 s, ≈ 85% by +25 s, in steps of ~0.1–0.3% per tick — and never in a single snap. If Charlie keeps selling, the price stays low and he pays fees and slippage.

## R2S1 — "The Hike" (tense)
| t | [World] | Delivery | Teams |
|---|---|---|---|
| **45** | **E7.1** HDFC-W/INFY-Z/NIMBUS/BZR-V −3, TATA-Y/CRANE −1.5, RELI-X/VOLTAGE −1, GOLDCORE +1.2, PULSE −5; the market starts re-pricing over ~10 s | **Echo (R3) at t=48:** IN "rate decision more hawkish than headlines suggest", AN, NP, FF — all at once · **Alpha (R2) at 52** · Charlie/Bravo (R0) at **60** | Echo shorts INFY-Z/HDFC-W at once (Capital 1, 0.6 s latency) before the price has really moved. Alpha follows 4 s later at a worse price. Bravo reads the FF "rate hike is nothing…" at t=60 (false), buys the dip, drops further. |
| 120 | E7.2 GOLDCORE +1 | NP/AN | Delta already there. |
| 200 | E7.3 PULSE −4 | FF "PULSE is the new safe haven" (false) | Bravo rotates in. |
| 240 | E7.4 HDFC-W −2.5 | Insider (Research ≥ 2) | Echo/Alpha, who read the R1S6 hints, are already out. |

Targets: HDFC-W −5, INFY-Z −5, NIMBUS −6, BZR-V −8, PULSE −9, TATA-Y −2.5, RELI-X −4, GOLDCORE +1.8. *Illustrative:* Echo +3.1%, Alpha +0.9%, Delta +0.6%, Bravo −5.5%, Charlie −6.8%.

**After R2S1 FINISHED:** teams see "Waiting for organizers…". R2S2 is READY; **the shop is open again** until the admin starts R2S2 (no timer). Alpha adds Research 3 (₹10 L). Bravo, down and stung, buys Research 1. Echo buys Speed 2 and Capital 2 (₹12 L) → 2× leverage.

## R2S2 — "Apex Falls" (panic) · APEX unlocks
APEX opens ₹740, P/E 12 on a stale EPS, NPA 3.1% — a value trap.

**E8.1 at t=40 — who gets what:** the market starts re-pricing at t=40 (APEX −14%, HDFC-W −9% over ~12 s; bank mood panic: pull-back τ=4 s).
| Research | Gets all four signals at | Share of a reference event already priced (02 §6, panic) |
|---|---|---|
| L3 (Echo, Alpha) | t=43 (IN "disclosure filed now", AN, NP, FF) | ~0% |
| L2 | t=47 | ~16% |
| L1 | t=50 | ~41% |
| L0 (Bravo, Charlie) | t=55 | ~86% |
- **Echo** shorts APEX with 2× gross at ≈ t=44 (0.6 s latency) — the largest profit of the event. **Alpha** (L3, Capital 1, no leverage) shorts at ≈ t=44 with 1× gross. **Bravo/Charlie** read the NP at t=55, buy "the dip", keep falling.
- **Herding:** t≈70–110, 120+ teams sell HDFC-W together: `|H| ≥ 1.5`, `ρ ≥ 0.7`, ≥ 18 distinct teams → trigger. Momentum bots amplify for 20 s, then a smooth correction over 25 s. Banner at +3 s: "Heavy one-way flow in HDFC-W."
- t=110 E8.2: relief bounce while NP says banks "fall sharply" (false). t=180 E8.3: PULSE +11 (FF "everyone is piling in", true). t=230 E8.4: AN says banks oversold (false). t=255 E8.5: **IN** buyout rumor (false — the one wrong insider).

Targets: APEX −22, HDFC-W −14, CRANE −7, PULSE +11, GOLDCORE +2. *Illustrative:* Echo +12%, Alpha +4%, Delta +0.3%, Bravo −9%, Charlie −11%.

**Elimination example (rare):** *Foxtrot Flyers* bought Capital 2 and ran 2× long on HDFC-W and PULSE through two crashes; equity went to −₹0.3 L on a tick in R2S3 (E9.4). **[Server]** at that tick: ELIMINATED, positions closed, orders cancelled; the team's phone shows "You have been eliminated". It sits at the bottom of both leaderboards with an ELIM tag. *(With the 2× cap this takes repeated max-leverage losses — see §5 note.)*

## R2S3 — "Contagion" · LEDGER unlocks
E9.1 (t=40) INFY-Z −5, NIMBUS −6, LEDGER +1; AN (L≥1) "growth selloff overdone" (false) hurts dip-buyers. E9.2 (t=90) LEDGER +3 (AN). E9.3 (t=150) NP "lenders tighten" (false for CRANE). **E9.4 (t=200) PULSE −16% with an IN "regulators preparing action against token exchanges", NP, FF "dip is a gift" (false)**: L3 Echo/Alpha short at ~t=203; Bravo buys the "gift". E9.5 (t=250) FF "banks bottoming" (false).

## R2S4 — "The Turn" · FORGE unlocks
E10.1 (t=30) stimulus: FORGE +9, CRANE +6; IN (L≥2) "stimulus being unveiled now"; L3 teams buy at t=33, L0 at t=45 (momentum bots have already chased). E10.2 (t=100) FORGE +5 then fades (NP "named lead contractor" false). E10.3 (t=170) banks recover: IN/AN true; cover shorts. E10.4 (t=230) FF "short the rally" (false).

## R2S5 — "New Normal" · calm
E11.1 (t=50) rate peak signalled; E11.2 (t=100) Apex capital raise (IN/AN true); E11.2b (t=170) NP "recover partially" (false: APEX −3); E11.3 (t=220) FF "back to all-time highs" (false); E11.4 (t=270) NP "consumer confidence rebounds" (no move). Moods back to calm; whoever overtrades loses to fees.
Auto-FINISHED at 300.

## After R2S5
- **[Server]** R2 Final snapshot frozen. **[Admin]** *Final leaderboards* tab: **R1 Final**, **R2 Final**, **Overall** (average of the percentage scores; amount and % views). Live leaderboard stops changing.
- Host reveals winners when ready. CSV export and audit trail.
- *Illustrative overall:* Echo wins, Alpha second, Delta third; Bravo/Charlie lag; Foxtrot ELIM.

---

# Live "what if" situations
| Situation | What happens |
|---|---|
| Double-tap Buy | same `client_key` → one fill |
| Order spam | token bucket → `429 rate_limited` |
| Short in R1 | rejected `insufficient_position` |
| R2 order above gross limit | rejected `exposure_limit` (at submit and at fill) |
| Order in flight when session ends | cancelled |
| Admin presses **Pause** | clock stops, orders rejected `session_paused`; Resume continues from the same tick |
| Admin presses **Kill switch** | everything frozen ≤ 1 s, "Market frozen by organizers" |
| Admin tries to start R1S3 before R1S2 is FINISHED | refused (`illegal_transition`) |
| Teams try to buy stats during a session | rejected `shop_closed` |
| Phone loses signal 20 s | reconnect, resync ≤ 3 s; missed news replayed per its Research delay rules |
| Server crashes mid-session | restarts, session comes back **PAUSED**, admin resumes |
| Admin wants a custom R2 headline | allowed, ≤ ±5% anchor impact, logged |

---

# Checks for you (alignment)
1. **R1 headlines at the exact instant the move starts** — everyone equal; the skill in R1 is *credibility of the source* and *joining the move / drift / fade*. OK?
2. **Research has 3 levels** (15 → 10 → 7 → 3 s; Insider from level 2). Is that what you meant by "15 to 10 to 7 to 3"?
3. **Same delay for all sources** at a given level (finfluencer gets no special timing).
4. **Elimination will be rare** with a 2× cap (it needs repeated max-leverage losses). If you want it to really bite, options: a higher leverage cap, or a margin rule (e.g. auto-liquidate below 20% equity).
5. **Shop** is open before R2S1 and in every gap until you press Start. Teams can spend up to ₹42 L; there's no earned-profit rule.
6. **No timers anywhere**; a crash or pause never auto-resumes.
7. A **3-second sync lead-in** after Start (so all phones begin together) — fine?
8. 15 instruments on a phone screen — decide after device tests.

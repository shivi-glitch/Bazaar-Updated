# 02 — NEWS LEDGER (single source of truth for every headline)

## 1. Concepts
- **Event (E-id):** something that really happens to prices (§2). Events move the market; they start moving price at `t_E`.
- **Signal:** a headline about an event, from one of four **sources** (NP, AN, IN, FF), with an implied ticker and direction (▲ ▼ ■) and a hidden **Truth** flag.
- **Silent event** (no signal): only `E3.3`. It rewards chart reading.
- One event can carry several signals.
- **There are no tiers that change timing.** Sources differ only by accuracy; **Insider exists only in Round 2**.

## 2. Event table (the real market moves)
`Net effect` is the total effect on the instrument's price path (R1) or anchor F (R2) by the end of the event's shape (04 §3). Moves are **spread over multiple seconds**, never a single tick (D-21). Other drift in the session comes from the targets in `03` §2.

| Event | Session | t_E (s) | Shape | Net effect (%) | Peak (if spike/dip) |
|---|---|---|---|---|---|
| E1.1 | R1S1 | 120 | jump | HDFC-W -0.4 |  |
| E1.2 | R1S1 | 200 | spike_fade | BZR-V -1.5 | +2.5 |
| E2.1 | R1S2 | 60 | jump | HDFC-W +2.0, INFY-Z +0.5 |  |
| E2.2 | R1S2 | 110 | pead | INFY-Z +4.5 |  |
| E2.4 | R1S2 | 180 | ramp40 | PULSE +5.0 |  |
| E2.5 | R1S2 | 230 | pead | NIMBUS +5.5 |  |
| E3.1 | R1S3 | 70 | jump | HDFC-W -1.5, INFY-Z -0.5 |  |
| E3.2 | R1S3 | 130 | jump | STAPLE +0.0 |  |
| E3.3 | R1S3 | 200 | spike_fade | BZR-V -1.0 | +7.0 |
| E3.4 | R1S3 | 240 | ramp40 | PULSE -3.0 |  |
| E4.1 | R1S4 | 30 | war_shock | RELI-X +5.0, VOLTAGE +6.0, GOLDCORE +1.5, INFY-Z -1.0, HDFC-W -0.5, TATA-Y -0.8, BZR-V -1.5, PULSE -2.0 |  |
| E4.2 | R1S4 | 100 | jump | VOLTAGE -12.0, RELI-X -2.0 |  |
| E4.2b | R1S4 | 130 | jump | VOLTAGE +2.0 |  |
| E4.3 | R1S4 | 170 | jump | GOLDCORE +1.2 |  |
| E4.4 | R1S4 | 240 | jump | HDFC-W +1.0 |  |
| E5.1 | R1S5 | 40 | jump | CRANE +4.0, TATA-Y +1.0 |  |
| E5.2 | R1S5 | 85 | jump | CRANE +3.0 |  |
| E5.3 | R1S5 | 150 | dip_revert | TATA-Y +0.5 | -2.5 |
| E5.4 | R1S5 | 220 | jump | CRANE +1.0, TATA-Y +0.5 |  |
| E6.1 | R1S6 | 30 | jump | BZR-V -0.5 |  |
| E6.3 | R1S6 | 110 | jump | HDFC-W -0.5 |  |
| E6.5 | R1S6 | 230 | ramp40 | PULSE +6.0 |  |
| E7.1 | R2S1 | 45 | rate_shock | HDFC-W -3.0, INFY-Z -3.0, NIMBUS -3.0, BZR-V -3.0, TATA-Y -1.5, CRANE -1.5, RELI-X -1.0, VOLTAGE -1.0, GOLDCORE +1.2, PULSE -5.0, STAPLE -0.3 |  |
| E7.2 | R2S1 | 120 | jump | GOLDCORE +1.0 |  |
| E7.3 | R2S1 | 200 | ramp40 | PULSE -4.0 |  |
| E7.4 | R2S1 | 240 | jump | HDFC-W -2.5 |  |
| E8.1 | R2S2 | 40 | crisis_shock | APEX -14.0, HDFC-W -9.0, CRANE -2.0, INFY-Z -1.0, TATA-Y -1.0, GOLDCORE +1.5, STAPLE +0.3 |  |
| E8.2 | R2S2 | 110 | jump | HDFC-W +1.5, APEX +2.0 |  |
| E8.3 | R2S2 | 180 | ramp40 | PULSE +11.0 |  |
| E8.4 | R2S2 | 230 | jump | HDFC-W -2.0 |  |
| E8.5 | R2S2 | 255 | jump | HDFC-W -1.5 |  |
| E9.1 | R2S3 | 40 | rate_shock | INFY-Z -5.0, NIMBUS -6.0, LEDGER +1.0 |  |
| E9.2 | R2S3 | 90 | jump | LEDGER +3.0 |  |
| E9.3 | R2S3 | 150 | jump | CRANE +1.0, TATA-Y -0.5 |  |
| E9.4 | R2S3 | 200 | crash | PULSE -16.0 |  |
| E9.5 | R2S3 | 250 | jump | HDFC-W -2.0 |  |
| E10.1 | R2S4 | 30 | stimulus | FORGE +9.0, CRANE +6.0, TATA-Y +2.0, VOLTAGE +1.0 |  |
| E10.2 | R2S4 | 100 | spike_fade | FORGE -2.0 | +5.0 |
| E10.3 | R2S4 | 170 | jump | HDFC-W +3.0, APEX +4.0 |  |
| E10.4 | R2S4 | 230 | jump | FORGE +2.0 |  |
| E11.1 | R2S5 | 50 | jump | INFY-Z +2.0, HDFC-W +2.0, NIMBUS +2.0, BZR-V +1.0 |  |
| E11.2 | R2S5 | 100 | jump | APEX +5.0 |  |
| E11.2b | R2S5 | 170 | jump | APEX -3.0 |  |
| E11.3 | R2S5 | 220 | jump | INFY-Z -0.8 |  |
| E11.4 | R2S5 | 270 | jump | BZR-V +0.0 |  |


## 3. Truth definition
A signal is **True** iff `sign(net effect of its event on the signal's implied ticker) == implied direction`; `■` is True iff the net effect is exactly 0. Foreshadow items released in R1 are judged against the named R2 event. The flag is **server-only**; it must never be sent to a client.

## 4. Release rules (organizer's rule, D-04 / D-05)

### Round 1 — everyone, same instant, no insiders
A headline is released at **exactly `t_E`**, the moment the price move starts. All teams receive it together. Informational items release at their listed time. (Foreshadow items about Round 2 release at the listed time.)

| ID | Release t (s) | Source | Event | Headline text | Implied | Truth |
|---|---|---|---|---|---|---|
| R1S1-01 | 120 | NP | E1.1 | Meridian Central Bank holds rates steady, cites 'balanced growth outlook.' | HDFC-W ▲ | F |
| R1S1-02 | 200 | FF | E1.2 | BZR-V is the next big thing. Load up before the close, don't be the one who missed it. | BZR-V ▲ | F |
| R1S2-01 | 60 | NP | E2.1 | Horizon Commercial Bank reports record quarterly loan growth. | HDFC-W ▲ | T |
| R1S2-02 | 110 | AN | E2.2 | Infinity Systems' new logistics contract could support revenue growth through the next two quarters (Calder & Wyn Research). | INFY-Z ▲ | T |
| R1S2-03 | 110 | FF | E2.2 | INFY-Z is done growing. Smart money is already out. | INFY-Z ▼ | F |
| R1S2-04 | 180 | FF | E2.4 | PULSE is going to the moon. This is not a drill. | PULSE ▲ | T |
| R1S2-05 | 230 | NP | E2.5 | Nimbus Cloud Systems posts quarterly earnings above expectations. | NIMBUS ▲ | T |
| R1S3-01 | 70 | NP | E3.1 | Inflation ticks up 0.3%; analysts call it 'transitory.' | HDFC-W ▲ | F |
| R1S3-02 | 130 | NP | E3.2 | Staple & Co. posts steady, unremarkable earnings in line with expectations. | STAPLE ■ | T |
| R1S3-03 | 240 | AN | E3.4 | Northgate Securities is constructive on PULSE after its rally, sees consolidation before the next leg higher. | PULSE ▲ | F |
| R1S4-01 | 30 | NP | E4.1 | Conflict disrupts regional oil corridor; energy prices spike overnight. | RELI-X ▲ | T |
| R1S4-02 | 30 | FF | E4.1 | This is the big one. Oil is about to go parabolic. Get in NOW or miss it forever. | VOLTAGE ▲ | T |
| R1S4-03 | 30 | AN | E4.1 | Energy analysts expect elevated volatility across the sector as supply uncertainty persists; larger, diversified producers likely better insulated than smaller pure-plays. | RELI-X ▲ | T |
| R1S4-04 | 100 | AN | E4.2 | Analysts warn Voltage Grid Holdings carries heavy near-term exposure to the disrupted corridor (Calder & Wyn Research). | VOLTAGE ▼ | T |
| R1S4-05 | 130 | NP | E4.2b | Voltage Grid Holdings confirms corridor exposure in trading update. | VOLTAGE ▼ | F |
| R1S4-06 | 170 | NP | E4.3 | Goldcore Reserve Trust sees record inflows as investors seek safety. | GOLDCORE ▲ | T |
| R1S4-07 | 240 | FF | E4.4 | War means a banking collapse. Dump every bank stock today. | HDFC-W ▼ | F |
| R1S5-01 | 40 | NP | E5.1 | Government signals infrastructure stimulus package to offset war-driven slowdown. | CRANE ▲ | T |
| R1S5-02 | 85 | AN | E5.2 | Crane & Sons Construction well-positioned for upcoming national infrastructure tenders, analysts say. | CRANE ▲ | T |
| R1S5-03 | 150 | NP | E5.3 | Tyrell Autoworks misses delivery targets; shares dip on the news. | TATA-Y ▼ | F |
| R1S5-04 | 220 | FF | E5.4 | The stimulus is a trap. Sell infrastructure before it rolls over. | CRANE ▼ | F |
| R1S6-01 | 30 | NP | E6.1 | Consumer confidence index hits an 18-month high. | BZR-V ▲ | F |
| R1S6-02 | 110 | NP | E6.3 | Horizon Commercial Bank's loan book grows again. | HDFC-W ▲ | F |
| R1S6-03 | 180 | AN | E7.4 | Horizon's provisioning ratios have drifted below sector norms for three consecutive quarters, though management maintains this reflects underwriting quality rather than risk. | HDFC-W ▼ | T |
| R1S6-04 | 230 | FF | E6.5 | PULSE to infinity. Sell your house. | PULSE ▲ | T |
| R1S6-05 | 270 | NP | E7.4 | Horizon Commercial Bank reported to be preparing higher provisions for the coming quarter. | HDFC-W ▼ | T |


### Round 2 — delayed by Research level
`t_E` is when the event starts moving the market. The headline reaches a team at **`t_E + delay(level)`**:

| Research level | L0 (default) | L1 | L2 | L3 |
|---|---|---|---|---|
| Delay after the move starts | **15 s** | **10 s** | **7 s** | **3 s** |
| Sources received | NP, AN, FF | NP, AN, FF | **NP, AN, FF + IN** | NP, AN, FF, IN |

Delay is the same for every source a team can see. Delivery is **per team** over the WebSocket (server-side targeting by `research_level`); only informational items are broadcast. A team that buys a level later receives the *shorter delay* on all subsequent events (not retroactively). Admin-injected news (06 §9) follows the same machinery.

| ID | Event t_E (s) | Source | Event | Headline text | Implied | Truth | Available to |
|---|---|---|---|---|---|---|---|
| R2S1-01 | 45 | AN | E7.1 | Analysts see the hike as front-loaded; rate-sensitive growth names most exposed. | INFY-Z ▼ | T | all teams |
| R2S1-02 | 45 | FF | E7.1 | Rate hike is nothing. Markets will shrug this off by tomorrow. | HDFC-W ▲ | F | all teams |
| R2S1-03 | 45 | IN | E7.1 | Sources: the rate decision is more hawkish than headlines suggest; banks and growth names exposed. | HDFC-W ▼ | T | Research ≥ 2 |
| R2S1-04 | 45 | NP | E7.1 | Meridian Central Bank raises rates unexpectedly, citing 'financial stability concerns.' | HDFC-W ▼ | T | all teams |
| R2S1-05 | 120 | AN | E7.2 | Analysts expect safe-haven inflows into Goldcore to persist while rate uncertainty lasts. | GOLDCORE ▲ | T | all teams |
| R2S1-06 | 120 | NP | E7.2 | Flight to safety: Goldcore Reserve Trust sees inflows as rate hike rattles markets. | GOLDCORE ▲ | T | all teams |
| R2S1-07 | 200 | FF | E7.3 | PULSE is the new safe haven. Rotate out of everything and into PULSE. | PULSE ▲ | F | all teams |
| R2S1-08 | 240 | IN | E7.4 | Sources: Horizon Commercial Bank to raise provisions next quarter, earnings at risk. | HDFC-W ▼ | T | Research ≥ 2 |
| R2S2-01 | 40 | AN | E8.1 | Analysts flag elevated non-performing-loan risk across regional banks as the credit boom unwinds; Apex Capital Bank is a name to watch. | APEX ▼ | T | all teams |
| R2S2-02 | 40 | FF | E8.1 | Told you banks were a house of cards. | HDFC-W ▼ | T | all teams |
| R2S2-03 | 40 | IN | E8.1 | Sources: Apex Capital Bank loan-loss disclosure is being filed now. | APEX ▼ | T | Research ≥ 2 |
| R2S2-04 | 40 | NP | E8.1 | Apex Capital Bank discloses large non-performing loan exposure tied to overextended credit growth. | APEX ▼ | T | all teams |
| R2S2-05 | 110 | NP | E8.2 | Regional banking index falls sharply as Apex disclosure raises sector-wide loan-quality concerns. | HDFC-W ▼ | F | all teams |
| R2S2-06 | 180 | FF | E8.3 | PULSE is the hedge. Everyone is piling in. | PULSE ▲ | T | all teams |
| R2S2-07 | 230 | AN | E8.4 | Bank stocks look oversold after the selloff; analysts see a contrarian entry point. | HDFC-W ▲ | F | all teams |
| R2S2-08 | 255 | IN | E8.5 | Sources: Horizon Commercial Bank is in advanced talks to be acquired at a premium. | HDFC-W ▲ | F | Research ≥ 2 |
| R2S3-01 | 40 | AN | E9.1 | Analysts say the growth selloff is overdone; Infinity Systems looks oversold for a bounce. | INFY-Z ▲ | F | all teams |
| R2S3-02 | 40 | IN | E9.1 | Sources: growth-stock outflows are accelerating across IT names. | INFY-Z ▼ | T | Research ≥ 2 |
| R2S3-03 | 40 | NP | E9.1 | Rising rates squeeze growth-stock valuations; IT sector broadly lower. | INFY-Z ▼ | T | all teams |
| R2S3-04 | 90 | AN | E9.2 | Ledger Data Systems' steady cash flows may draw defensive interest amid the broader tech selloff. | LEDGER ▲ | T | all teams |
| R2S3-05 | 150 | NP | E9.3 | Infrastructure lenders tighten credit standards amid banking-sector stress. | CRANE ▼ | F | all teams |
| R2S3-06 | 200 | FF | E9.4 | The PULSE dip is a gift. Buy it now. | PULSE ▲ | F | all teams |
| R2S3-07 | 200 | IN | E9.4 | Sources: regulators are preparing action against token exchanges. | PULSE ▼ | T | Research ≥ 2 |
| R2S3-08 | 200 | NP | E9.4 | Pulsechain network hit by exploit; trading volumes spike. | PULSE ▼ | T | all teams |
| R2S3-09 | 250 | FF | E9.5 | Banks are bottoming. Buy Horizon now before the bounce. | HDFC-W ▲ | F | all teams |
| R2S4-01 | 30 | IN | E10.1 | Sources: a government crisis-response stimulus is being unveiled now. | FORGE ▲ | T | Research ≥ 2 |
| R2S4-02 | 30 | IN | E10.1 | Sources: infrastructure names are first in line for stimulus tenders. | CRANE ▲ | T | Research ≥ 2 |
| R2S4-03 | 30 | NP | E10.1 | Government unveils crisis-response stimulus package; markets rally on policy support. | FORGE ▲ | T | all teams |
| R2S4-04 | 100 | NP | E10.2 | Forge Industrial Holdings named lead contractor on new government infrastructure initiative. | FORGE ▲ | F | all teams |
| R2S4-05 | 170 | AN | E10.3 | Banking analysts see early signs of stabilization as regulator signals liquidity support. | HDFC-W ▲ | T | all teams |
| R2S4-06 | 170 | IN | E10.3 | Sources: regulator liquidity support for banks is being confirmed. | HDFC-W ▲ | T | Research ≥ 2 |
| R2S4-07 | 230 | FF | E10.4 | Short the rally. This is a dead-cat bounce. | FORGE ▼ | F | all teams |
| R2S5-01 | 50 | NP | E11.1 | Meridian markets stabilize; central bank signals rate hikes are 'nearing their peak.' | HDFC-W ▲ | T | all teams |
| R2S5-02 | 100 | AN | E11.2 | Analysts expect Apex's capital raise to restore regulatory buffers and support a partial recovery. | APEX ▲ | T | all teams |
| R2S5-03 | 100 | IN | E11.2 | Sources: Apex Capital Bank's capital raise is oversubscribed. | APEX ▲ | T | Research ≥ 2 |
| R2S5-04 | 170 | NP | E11.2b | Apex Capital Bank completes capital raise; shares recover partially. | APEX ▲ | F | all teams |
| R2S5-05 | 220 | FF | E11.3 | Crisis fully over. Back to all-time highs by next week. | INFY-Z ▲ | F | all teams |
| R2S5-06 | 270 | NP | E11.4 | Consumer confidence rebounds modestly. | BZR-V ▲ | F | all teams |


### Informational items (broadcast to all)

| Session | t (s) | Text |
|---|---|---|
| R1S1 | 0 | Market open. Welcome to MERX. |
| R1S6 | 60 | MERX 50 Index now live. |
| R2S1 | 0 | Round 2 open: one shared order book. Your orders now move prices. |
| R2S5 | 290 | Final minute of the final session. |


## 5. Accuracy accounting (Phase 1 gate; must stay within ±6 pp of the targets)

| Source | Items | True | Realised accuracy | Target | Within ±6 pp? |
|---|---|---|---|---|---|
| NP | 25 | 14 | 56.0% | 55% | yes |
| AN | 14 | 11 | 78.6% | 75% | yes |
| IN | 10 | 9 | 90.0% | 90% | yes |
| FF | 15 | 5 | 33.3% | 35% | yes |


Total **64 signals** (NP 25, AN 14, IN 10, FF 15) + 4 informational. Insider items: 0 in Round 1, 10 in Round 2. Any edit that changes a truth flag must re-run this table.

## 6. How much of the move is already in the price when each delay expires (R2, bots only)

Share of a reference **+5% event** already in the price at the moment the headline arrives (remaining edge = 100% − value). Model: anchor ramps over 10 s; market makers learn it after `L` seconds; they pull price toward value with time-constant `τ` (05 §3). Phase 8 must reproduce this table within ±8 pp with the real engine and no human flow. Bigger events move proportionally slower in the first seconds.

| Delivery | Delay after t_E (s) | calm (τ=8 s, L=2.5 s) | tense (τ=6 s, L=2.0 s) | panic (τ=4 s, L=1.5 s) | recovery (τ=6 s, L=2.0 s) |
|---|---|---|---|---|---|
| Research L3 (3 s) | 3 | 0% | 0% | 0% | 0% |
| Research L2 (7 s) | 7 | 5% | 9% | 16% | 9% |
| Research L1 (10 s) | 10 | 18% | 27% | 41% | 27% |
| Research L0 (15 s) | 15 | 52% | 66% | 86% | 66% |


Reading the table: at L3 (3 s) a team trades before the price has really moved; at L0 (15 s) it often arrives after half or more of the move (panic: 86%).

## 7. Authoring rules for any new headline
1. ≤ 22 words; one ticker or one named sector; no numbers that contradict `03`.
2. Voice per source (01 §1); an accurate FF item never carries a number.
3. Every new item needs an event, an implied direction, a truth flag, and must keep §5 within tolerance.
4. IN items exist only in Round 2 events and are written in the present tense.

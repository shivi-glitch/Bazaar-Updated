# BAZAAR // MERIDIAN — MASTER IMPLEMENTATION & STAGE ANCHOR SCRIPT
> **Document**: `master-implementation.md` (Root Directory)  
> **Status**: Verified Production Implementation & Operations Runbook  
> **Target**: Technical Leads, Database Administrators & Live Stage Anchors / Emcees

---

## PART 1: TECHNICAL IMPLEMENTATION LOG (CODE & DATABASE)

All changes outlined in **Master Plan 2.0** (`master.md`) have been systematically implemented across the codebase, tested, and synced to the remote PostgreSQL database.

### 1. Stat Shop Economic Overhaul (The 30%–38% Sweet Spot)
* **Backend Modification (`backend/routes/shop.py`)**:
  * Replaced the exorbitant stat pricing model with the calibrated Master Plan 2.0 tier schedule.
  * Research: Level 1 = **₹8L** (`8000000` paise), Level 2 = **₹18L** (`18000000` paise), Level 3 = **₹35L** (`35000000` paise).
  * Capital: Level 1 (Short Selling) = **₹12L** (`12000000` paise), Level 2 ($2\times$ Leverage) = **₹28L** (`28000000` paise).
  * Speed: Level 1 = **₹6L** (`6000000` paise), Level 2 = **₹14L** (`14000000` paise), Level 3 = **₹25L** (`25000000` paise).
  * *Result*: An essential entry pack (**Research L1 + L2 + Capital L1**) costs exactly **₹38 Lakhs (38% of base capital)**, leaving teams with **₹77 Lakhs+** in liquid trading cash.
* **Frontend Sync (`frontend/src/app/stats/page.tsx`)**:
  * Updated `StatCard` cost props to match backend pricing exactly, ensuring that user displays, balance checks, and button labels reflect the new figures.

### 2. High-Frequency Scripted News Database (84 Events)
* **Backend Modification (`backend/core/news_ledger.py`)**:
  * Expanded `SCRIPTED_NEWS_DATABASE` from 44 items to **84 high-frequency news events** across Sessions 1 to 11.
  * Increased news frequency to **7 to 8 events per session** (one headline roughly every **35 to 40 seconds**), completely eliminating the 75-second dead zones.
  * Added **macroeconomic indirect ripple effects** (e.g. Strait closure $\rightarrow$ crude jump $\rightarrow$ LNG import cut $\rightarrow$ power grid crisis $\rightarrow$ auto manufacturing delays $\rightarrow$ bullion flight).
  * Structured the **6-phase Gross NPA banking decay storyline** across S4 to S9.

### 3. Market Engine Enhancements (`backend/core/engine.py` & `r2_math.py`)
* **Global Macroeconomic Shock Propagation**:
  * Updated `check_and_dispatch_scripted_news` so that when `item["ticker"] == "GLOBAL"`, the shock spreads smoothly across all active equity instruments in `self.current_prices` (excluding `GOLDCORE` for bearish shocks).
* **Round 2 Price Persistence**:
  * Updated `apply_active_shocks` so that fractional shock updates permanently adjust `state.P` and `r2_f_values` inside `R2InstrumentState`, ensuring news shocks stick in the reactive simulation.
* **Dynamic Instrument Unlocks in Round 2**:
  * Added session-triggered state instantiation in `start_session`:
    * Session 8: Unlocks `APEX` (Apex Capital Bank, base ₹740.00).
    * Session 9: Unlocks `LEDGER` (Ledger Data Systems, base ₹1,900.00).
    * Session 10: Unlocks `FORGE` (Forge Industrial Holdings, base ₹1,260.00).
* **Dynamic Session Market Mood**:
  * Configured `run_loop` to feed session-accurate mood parameters into `state.tick()`:
    * Session 7: `tense` ($\tau=6\text{s}$)
    * Sessions 8 & 9: `panic` ($\tau=4\text{s}$)
    * Session 10: `recovery` ($\tau=6\text{s}$)
    * Session 11: `calm` ($\tau=8\text{s}$)

### 4. Instrument Roster & Remote Database Push
* **Instruments Expansion (`data/instruments.json`)**:
  * Added complete metadata for all 14 instruments (`RELI-X`, `TATA-Y`, `INFY-Z`, `HDFC-W`, `BZR-V`, `GOLDCORE`, `PULSE`, `NIMBUS`, `STAPLE`, `VOLTAGE`, `CRANE`, `APEX`, `LEDGER`, `FORGE`).
* **Database Migration & Seeding**:
  * Connected to the newly configured remote Neon PostgreSQL database (`neondb` on AWS Singapore).
  * Auto-created all 9 relational tables: `teams`, `instruments`, `sessions`, `team_ledger`, `positions`, `orders`, `leaderboard_snapshots`, `stat_purchases`, `equity_snapshots`.
  * Ran `backend/seed_db.py`, successfully seeding:
    * **14 Instruments** with exact open prices in paise.
    * **11 Session Blocks** (Session 1 `READY`, Sessions 2–11 `LOCKED`).
    * **300 Registered Teams** (`T001` to `T300`) with ₹1.00 Crore (`100,000,000` paise) initial ledger cash.
* **Frontend Production Verification**:
  * Executed `npm run build` in `frontend/`. Compiled cleanly in 6.9s with 0 TypeScript or linting errors.

---

## PART 2: THE STAGE ANCHOR & EMCEE RUNBOOK (S1 TO S11)

This script is designed for the **live host / anchor on stage** with a microphone to electrify the room, build narrative tension, and guide 300 participants through the 18-month Meridian macroeconomic cycle.

```
═════════════════════════════════════════════════════════════════════════
                       STAGE ANCHOR CHEAT SHEET
  • 1 Session = 5.0 Minutes (300 Seconds).
  • Round 1 (S1–S6): Retail Era (Pure Chart & News Drift, No Shorting).
  • Intermission: 10-Minute Break (The 3-Month Time Skip & Stat Shop).
  • Round 2 (S7–S11): Institutional Era (Order Books Move, Shorting Active).
  • Finish: Automatic Sound Cue + Podium Debrief.
═════════════════════════════════════════════════════════════════════════
```

---

### PRE-EVENT: THE WELCOME & ORIENTATION (5 Minutes Before S1)
**Host on Stage**:
> *"Welcome, traders, fund managers, and future market legends, to BAZAAR — the Meridian Financial Exchange!*  
> *Right now, on your screens, you have been entrusted with **₹1.00 Crore in institutional seed capital**.*  
> *You are not just playing a game — you are living through an intense, 18-month macroeconomic saga across 11 high-stakes trading sessions.*  
> *Here are your ground rules: In Round 1, interest rates are at record lows. Money is cheap, everyone feels like a genius, and the charts are trending.*  
> *Watch your news ticker carefully. Some sources speak the truth, like Northgate Research and our confidential Desk Insiders. Others, like @BullRunBhai, are desperate to dump their bags on retail.*  
> *Keep an eye on the clock: each session is exactly **5 minutes**. When the opening bell rings, execute your orders, manage your risk, and let's see who owns the floor!*  
> *Administrators... PRIME SESSION 1!"*

---

### SESSION 1: "OPENING BELL" (Quiet Liquidity & The First Traps)
* **Visual on Stage**: Calm blue/teal ambient lighting. Baseline charts on big screens.
* **Anchor Announcements**:
  * **At $t = 0\text{s}$ (Open)**:  
    > *"Session 1 is LIVE! Opening bell has rung! Seven instruments on your screen. Energy, Tech, Banking, Safe Haven Bullion, and Pulsechain crypto. Find your rhythm!"*
  * **At $t = 60\text{s}$ ($n=40$, BZR-V Finfluencer Pump)**:  
    > *"Look at that news ticker! @BullRunBhai is shouting about a quick-commerce partnership on Bazaar Ventures! BZR-V spiking +3.5%! But wait — is that real news, or are you being baited into retail exit liquidity? Check your sources!"*
  * **At $t = 142\text{s}$ ($n=95$, INFY-Z Cloud Deal)**:  
    > *"Big enterprise move! Infinity Systems locks in a $450 Million European cloud migration! Tech is leading the tape — INFY-Z breaking out to session highs!"*
  * **At $t = 280\text{s}$ (30s to Close)**:  
    > *"Final 20 seconds of Session 1! Square your books or ride your trends into the close!"*

---

### SESSION 2: "CHEAP MONEY" (Tech Acceleration & Leaked Memos)
* **Visual on Stage**: Upward green candles on main screen. High energy.
* **Anchor Announcements**:
  * **At $t = 0\text{s}$ (Open)**:  
    > *"Session 2 is active! Credit growth in Meridian is surging at 16%! A brand-new high-growth cloud player has just unlocked: **NIMBUS CLOUD SYSTEMS (NIMBUS)** at ₹410! Let's see if tech momentum continues!"*
  * **At $t = 67\text{s}$ ($n=45$, BZR-V Leaked Audit)**:  
    > *"FLASH ALERT! A confidential Ministry of Corporate Affairs memo has leaked! Anti-profiteering bureau is preparing an unannounced audit at Bazaar Ventures headquarters! BZR-V is plunging -11%! Who held the bag?!"*
  * **At $t = 187\text{s}$ ($n=125$, PULSE Parabolic Breakout)**:  
    > *"Pulsechain volume crossing $100 Million! Retail crypto mania is taking off — PULSE exploding +9% through ₹930! The party is in full swing!"*

---

### SESSION 3: "A SMALL COUGH" (Stagflation Whispers & FMCG Shelter)
* **Anchor Announcements**:
  * **At $t = 0\text{s}$ (Open)**:  
    > *"Session 3 is underway! Inflation is starting to tick up to 4.5%. For traders looking for low-beta shelter, **STAPLE & CO. PROVISIONS (STAPLE)** is now live at ₹1,180. Boring is profitable when the market coughs!"*
  * **At $t = 105\text{s}$ ($n=70$, PULSE Founder Dump)**:  
    > *"Whale alert! @BullRunBhai claims a 50M whale loaded PULSE, but on-chain monitors show early founders dumping 40M tokens! PULSE reversing immediately! Don't get trapped!"*
  * **At $t = 180\text{s}$ ($n=120$, HDFC-W NPA Praise)**:  
    > *"Horizon Commercial Bank reports Gross NPAs at multi-year lows of 1.8%. The banking sector looks golden... or does it? Remember traders, headline earnings can deceive!"*

---

### SESSION 4: "THE CORRIDOR CLOSES" (THE WAR SHOCK)
* **Stage Cue**: **Dim ambient room lights. Flash amber/red emergency border on auditorium screen.**
* **Anchor Announcements**:
  * **At $t = 22\text{s}$ ($n=15$, War Declaration)**:  
    > *(Urgent tone)* *"BREAKING NEWS TO ALL TERMINALS! MILITARY CONFLICT HAS ERUPTED IN THE STRAITS TRANSIT CORRIDOR! THE COMMERCIAL OIL PASSAGE IS CLOSED!*  
    > *Crude oil is screaming +38% toward $112 a barrel!*  
    > *Look at your boards! Voltage Grid (VOLTAGE) has unlocked right into the storm and is in freefall (-12%)! Reliant Energy is soaring (+6%)! Goldcore bullion is surging as global capital flees equities! Rotate your capital NOW!"*
  * **At $t = 165\text{s}$ ($n=110$, RBI Risk-Weight Circular)**:  
    > *"The central bank is tightening screws! Central Bank circular mandates 125% risk weights on consumer loans! Horizon Bank is feeling the pressure! The war is coming home to our banking system!"*

---

### SESSION 5: "STIMULUS WHISPERS" (Rotation & Capex Revival)
* **Anchor Announcements**:
  * **At $t = 0\text{s}$ (Open)**:  
    > *"Session 5! The state is responding to the energy crisis! National infrastructure firm **CRANE & SONS CONSTRUCTION (CRANE)** unlocks at ₹520 with a massive ₹3,200 Cr government railway award!"*
  * **At $t = 105\text{s}$ ($n=70$, Reliant Ammonia JV Collapse)**:  
    > *"Confidential leak on Reliant Energy! Gulf partners have walked away from the green ammonia joint venture! RELI-X dropping -9%! Take your energy profits!"*
  * **At $t = 180\text{s}$ ($n=120$, The NPA Whisper)**:  
    > *"Listen closely: An internal risk memo at Horizon Commercial Bank has surfaced. Retail loan delinquencies are quietly ticking up to 2.1%. File that away in your memory, traders!"*

---

### SESSION 6: "LAST DANCE OF THE BOOM" (Euphoric Climax & The Trap)
* **Anchor Announcements**:
  * **At $t = 0\text{s}$ (Open)**:  
    > *"Session 6! The final session of Round 1! Consumer confidence is at an 18-month high, and the **MERIDIAN 50 BENCHMARK INDEX (MERX50)** is officially tracking the market at 1,000 points! Enjoy the music while it plays!"*
  * **At $t = 67\text{s}$ ($n=45$, PULSE Blow-Off)**:  
    > *"PULSE IS CROSSING ₹1,000! Up +14% in minutes! Euphoria on the floor! But remember: when the music stops, who will be left without a chair?!"*
  * **At $t = 112\text{s}$ ($n=75$, BZR-V Buyback Fireworks)**:  
    > *"Bazaar Ventures files a surprise ₹250 Cr share buyback! BZR-V exploding +14%! Peak optimism across the entire exchange!"*
  * **At $t = 285\text{s}$ (Closing Countdown)**:  
    > *"Proprietary desks are squaring books! Final 15 seconds of Round 1! 5... 4... 3... 2... 1... SESSION 6 IS CLOSED! Round 1 is in the books!"*

---

### THE 10-MINUTE INTERMISSION: THE NEWSPAPER & STAT SHOP
* **Stage Cue**: **Project "The Meridian Financial Chronicle" front page on all screens. Play tense atmospheric background music.**
* **Anchor Announcements**:
  * **At Minute 1 (The 3-Month Time Skip)**:  
    > *"Traders, step away from your keyboards and look at the main screens!*  
    > *Between Session 6 and Session 7, **three months of history have elapsed**.*  
    > *Read the front page of the Meridian Financial Chronicle:*  
    > *'CENTRAL BANK CONVENES EMERGENCY MONETARY COUNCIL — INFLATION HITS 6.2% AS WAR CORRIDOR BITTERLY BITES.'*  
    > *The cheap credit era is dead. The central bank is meeting behind closed doors, and interbank markets are pricing an emergency 75 basis point rate hike!"*
  * **At Minute 4 (Stat Shop Guide)**:  
    > *"Attention all desks: The **STAT SHOP IS NOW UNLOCKED** on your terminals!*  
    > *In Round 2, everything changes: orders move the market, liquidity bots will trade against you, and banks are hiding toxic assets.*  
    > *Here is the golden rule from our clearinghouse:*  
    > *You need **CAPITAL LEVEL 1** (₹12 Lakhs) to unlock **SHORT SELLING**. If you cannot short, you will be powerless when the banking crash hits!*  
    > *You need **RESEARCH LEVEL 2** (₹18 Lakhs) to receive **THE 9-SECOND EARLY NEWS LEAK**. That gives you 9 full seconds to trade before the public ticker receives the news!*  
    > *Together, Research L2 and Capital L1 cost **₹38 Lakhs** — about 38% of your base capital. Buy your upgrades now before Session 7 opens!"*

---

### SESSION 7: "THE HIKE" (Monetary Tightening Shock & Reactive Market)
* **Visual on Stage**: Amber/orange institutional terminal aesthetic.
* **Anchor Announcements**:
  * **At $t = 22\text{s}$ ($n=15$, The 75 bps Rate Hike)**:  
    > *(Dramatic delivery)* *"FLASH! THE HAMMER HAS FALLEN! MERIDIAN CENTRAL BANK RAISES POLICY RATES BY 75 BASIS POINTS TO 4.75%!*  
    > *Round 2 is reactive! Your orders are moving the price! Tech multiples are contracting! S&P credit spreads are blowing out! Liquidate your high-beta longs and seek shelter in Goldcore!"*
  * **At $t = 97\text{s}$ ($n=65$, RELI-X Sovereign Block)**:  
    > *"SEBI disclosure! Gulf Sovereign Wealth Fund files for a 6.5% strategic block in Reliant Energy! RELI-X spiking +12%! Watch the market makers fade the push!"*
  * **At $t = 225\text{s}$ ($n=150$, Crypto Leverage Squeeze)**:  
    > *"DeFi interest rates spike to 18%! High borrow costs trigger cascading liquidations in PULSE! Down -9% to ₹917!"*

---

### SESSION 8: "APEX FALLS" (THE BANKING PANIC)
* **Stage Cue**: **Red lighting pulse. Tense siren sound effect.**
* **Anchor Announcements**:
  * **At $t = 22\text{s}$ ($n=15$, The Apex Solvency Leak)**:  
    > *(Loud, urgent)* *"URGENT INSIDER LEAK! APEX CAPITAL BANK HAS CONVENED A MIDNIGHT AUDIT! GROSS NPAS HAVE EXPLODED FROM 3.1% TO 8.9%!*  
    > *APEX BANK IS PLUNGING -26%!*  
    > *If you bought Capital Level 1 in the Stat Shop, SHORT APEX NOW!*  
    > *Contagion is spreading to Horizon Bank (HDFC-W) — down -16%! This is the Lehman moment of Meridian!"*
  * **At $t = 142\text{s}$ ($n=95$, The Fake Merger Trap)**:  
    > *"A headline claims Horizon is negotiating a merger with Global Trust Corp (+12%)! But wait — our Desk Sources say it's a desperate smokescreen! Do not buy the dead cat bounce!"*

---

### SESSION 9: "CONTAGION" (The Short Report & Systemic Freeze)
* **Anchor Announcements**:
  * **At $t = 0\text{s}$ (Open)**:  
    > *"Session 9! Interbank credit has turned negative (-2.0%). Debt-free enterprise player **LEDGER DATA SYSTEMS (LEDGER)** unlocks at ₹1,900 as the ultimate defensive tech shelter!"*
  * **At $t = 97\text{s}$ ($n=65$, BZR-V 80-Page Fraud Report)**:  
    > *"An activist short-seller has published an 80-page forensic report alleging circular revenue booking at Bazaar Ventures! Minutes later, their statutory auditor resigns! BZR-V is crashing toward ₹500! Short sellers are printing millions!"*
  * **At $t = 255\text{s}$ ($n=170$, Prime Broker Margin Hike)**:  
    > *"Systemic risk alert! Prime brokers are hiking equity margins! Goldcore bullion crosses ₹6,800 an ounce! The ultimate safe haven is doing its job!"*

---

### SESSION 10: "THE TURN" (THE CRYPTO EXPLOIT & THE INFRASTRUCTURE RALLY)
* **Anchor Announcements**:
  * **At $t = 30\text{s}$ ($n=20$, FORGE Debut)**:  
    > *"The government is stepping in! Federal infrastructure revival package announced! **FORGE INDUSTRIAL HOLDINGS (FORGE)** unlocks at ₹1,260 and is soaring +18% on a ₹28,000 Cr corridor contract!"*
  * **At $t = 105\text{s}$ ($n=70$, The $180M Zero-Day Bridge Exploit)**:  
    > *(High tension)* *"EMERGENCY PROTOCOL ON PULSECHAIN! A ZERO-DAY SMART CONTRACT EXPLOIT IS DRAINING THE BRIDGE IN REAL TIME!*  
    > *180 MILLION DOLLARS LIQUIDATED! PULSE IS COLLAPSED TO ₹630!*  
    > *Whoever caught that 9-second leak just executed the trade of the tournament!"*
  * **At $t = 217\text{s}$ ($n=145$, Central Bank Swap Window)**:  
    > *"The Central Bank activates emergency liquidity swaps! Bank deposits are guaranteed! Horizon and Apex are bouncing off the floor! The turn is here!"*

---

### SESSION 11: "NEW NORMAL" (Final Settlement & The Grand Finale)
* **Anchor Announcements**:
  * **At $t = 0\text{s}$ (Open)**:  
    > *"TRADERS! WELCOME TO THE FINAL SESSION! SESSION 11 — THE NEW NORMAL!*  
    > *The crisis has passed. Central bank rates have peaked. Market makers are in liquidation matching mode.*  
    > *This is your final 5 minutes to close out margin, take your profits, and secure your place on the podium!*  
    > *Every tick counts! TRADE!"*
  * **At $t = 180\text{s}$ ($n=120$, Index Rebalancing)**:  
    > *"Index arbitrage funds are rebalancing Reliant, Forge, and Horizon! Massive institutional blocks crossing the tape!"*
  * **At $t = 270\text{s}$ (Final 30-Second Countdown)**:  
    > *"30 SECONDS REMAINING ON BAZAAR!*  
    > *Clear your positions! Protect your equity!*  
    > *10... 9... 8... 7... 6... 5... 4... 3... 2... 1...*  
    > *MARKET IS FROZEN! ALL TRADING COMPLETE!"*

---

### POST-EVENT: THE PODIUM & DEVELOPER KEYNOTE
* **Stage Cue**: **`/sound.mp3` triggers automatically. All screens transition to `/podium`.**
* **Anchor & Developer on Stage**:
  > *"Listen to that final bell!*  
  > *Look at your screens — you have been redirected to the Meridian Podium!*  
  > *Before we reveal the champion trading desks, let's look at what really happened over these 18 months:*  
  > 1. *Who bought PULSE at ₹1,008 when @BullRunBhai told you it was going to ₹1,500... and then held it all the way down to the ₹630 hack? (A brutal lesson in retail exit liquidity!)*  
  > 2. *Who saw the Gross NPA ratio climbing in Session 4, bought Capital Level 1 in the Stat Shop, and shorted Apex Bank from ₹740 all the way to ₹550? (True fundamental alpha!)*  
  > 3. *And who bought Research Level 2 to get that 9-second early news leak?*  
  > *Bazaar was built to prove one universal truth of financial markets: **Price is what you pay; balance sheet quality is what you own.**  
  > *And now... let's welcome to the stage... THE TOP 3 INSTITUTIONAL TEAMS OF BAZAAR!"*

---
*End of Master Implementation Runbook — Antigravity Engineering Core*

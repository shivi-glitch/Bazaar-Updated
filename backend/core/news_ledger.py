# backend/core/news_ledger.py
# Master Plan 2.0: High-Frequency Scripted News Database (84 Events, 7-8 per session)
# Updated: Reconciled Meridian lore names, fictional tickers (RLNT, TYRL, INFN, HRZN), and coherent net move trajectories.

SCRIPTED_NEWS_DATABASE = [
    # SESSION 1: "OPENING BELL"
    {"g": 1, "public_tick": 15, "ticker": "RLNT", "source": "NP", "text": "Meridian Ministry of Power greenlights ₹4,500 Cr grid modernization subsidy for Reliant Energy", "impact": 0.015, "is_fake": False},
    {"g": 1, "public_tick": 40, "ticker": "BZR-V", "source": "FF", "text": "BZR-V signed exclusive supply agreement with 10-minute quick grocery app! 10x coming! 🚀", "impact": 0.035, "is_fake": True},
    {"g": 1, "public_tick": 65, "ticker": "TYRL", "source": "AN", "text": "Calder & Wyn notes seasonal inventory build at Tyrell Autoworks; advises buying dips near SMA20", "impact": -0.015, "is_fake": False},
    {"g": 1, "public_tick": 95, "ticker": "INFN", "source": "NP", "text": "Infinity Systems closes $450M multi-year enterprise cloud migration deal with Nordic banking group", "impact": 0.04, "is_fake": False},
    {"g": 1, "public_tick": 125, "ticker": "HRZN", "source": "AN", "text": "Credit rating upgrade: Horizon Commercial Bank tier-1 bond yields drop to record lows on retail deposit surge", "impact": 0.03, "is_fake": False},
    {"g": 1, "public_tick": 150, "ticker": "PULSE", "source": "FF", "text": "Top DEX whale wallet moving 20,000 ETH into PULSE liquidity pool! Don't get left behind!", "impact": 0.02, "is_fake": True},
    {"g": 1, "public_tick": 175, "ticker": "GOLDCORE", "source": "IN", "text": "Central depository internal transfer: Sovereign pension fund establishes baseline 500kg gold custody allocation", "impact": 0.008, "is_fake": False},
    {"g": 1, "public_tick": 190, "ticker": "BZR-V", "source": "NP", "text": "Market wrap: Quick-commerce partnership rumors unconfirmed by Bazaar Ventures corporate office", "impact": -0.02, "is_fake": False},

    # SESSION 2: "CHEAP MONEY"
    {"g": 2, "public_tick": 20, "ticker": "NIMBUS", "source": "AN", "text": "Northgate Securities initiates Nimbus Cloud with BUY; cites 42% recurring SaaS revenue CAGR", "impact": 0.045, "is_fake": False},
    {"g": 2, "public_tick": 45, "ticker": "BZR-V", "source": "IN", "text": "Leaked Corporate Bureau memo: Anti-profiteering bureau preparing unannounced audit at BZR headquarters", "impact": -0.11, "is_fake": False},
    {"g": 2, "public_tick": 70, "ticker": "INFN", "source": "FF", "text": "Key enterprise delivery heads at INFN resigning to launch competitor startup! Dump tech now!", "impact": -0.02, "is_fake": True},
    {"g": 2, "public_tick": 95, "ticker": "INFN", "source": "NP", "text": "Infinity Systems confirms retention bonuses for all tech leadership; signs European automotive cloud deal", "impact": 0.035, "is_fake": False},
    {"g": 2, "public_tick": 125, "ticker": "PULSE", "source": "FF", "text": "PULSE volume breaks $100M! Tier-1 Asian exchange adding trading pairs! We are going parabolic! 🔥", "impact": 0.09, "is_fake": False},
    {"g": 2, "public_tick": 150, "ticker": "HRZN", "source": "NP", "text": "Liquidity tightens across domestic money market; short-term corporate paper yields climb", "impact": -0.04, "is_fake": False},
    {"g": 2, "public_tick": 175, "ticker": "TYRL", "source": "AN", "text": "Sector Downgrade: Auto sector input costs rising; recommend trimming industrial cyclicals", "impact": 0.035, "is_fake": True},
    {"g": 2, "public_tick": 190, "ticker": "NIMBUS", "source": "IN", "text": "Confidential preliminary Q2 results: Cloud division operating margins expand 240 bps", "impact": 0.03, "is_fake": False},

    # SESSION 3: "A SMALL COUGH"
    {"g": 3, "public_tick": 20, "ticker": "STAPLE", "source": "NP", "text": "Staple & Co. Provisions unlocks on MERX; company reports resilient FMCG consumer volume", "impact": 0.015, "is_fake": False},
    {"g": 3, "public_tick": 45, "ticker": "INFN", "source": "NP", "text": "Infinity Systems beats Q3 operating margin estimates by 180 bps; raises full-year USD revenue guidance", "impact": 0.05, "is_fake": False},
    {"g": 3, "public_tick": 70, "ticker": "PULSE", "source": "FF", "text": "Whale wallet just loaded 50M PULSE on DEX! Next 50x run starts right now 🔥", "impact": 0.06, "is_fake": True},
    {"g": 3, "public_tick": 95, "ticker": "PULSE", "source": "NP", "text": "Blockchain monitor shows early founders offloaded 40M tokens into DEX liquidity pools", "impact": -0.05, "is_fake": False},
    {"g": 3, "public_tick": 120, "ticker": "HRZN", "source": "AN", "text": "Credit Bureau Data: Gross NPAs for top-tier private lenders contract to multi-year lows of 1.8%", "impact": 0.04, "is_fake": False},
    {"g": 3, "public_tick": 145, "ticker": "BZR-V", "source": "IN", "text": "Board emergency call: Management preparing to issue formal press release denying Corporate Bureau audit rumors", "impact": 0.07, "is_fake": False},
    {"g": 3, "public_tick": 170, "ticker": "STAPLE", "source": "AN", "text": "Defensive rotation note: FMCG pricing power ensures complete margin pass-through despite grain inflation", "impact": 0.012, "is_fake": False},
    {"g": 3, "public_tick": 190, "ticker": "TYRL", "source": "NP", "text": "Domestic steel scrap prices rise 4% week-on-week; automotive casting foundries express margin caution", "impact": -0.015, "is_fake": False},

    # SESSION 4: "THE CORRIDOR CLOSES"
    {"g": 4, "public_tick": 15, "ticker": "GLOBAL", "source": "NP", "text": "BREAKING: Military conflict escalates in Straits transit zone; commercial oil tanker corridor shut", "impact": -0.035, "is_fake": False},
    {"g": 4, "public_tick": 35, "ticker": "RLNT", "source": "AN", "text": "Crude oil spikes +38% to $112/bbl; Reliant Energy domestic refining margins surge to multi-year highs", "impact": 0.06, "is_fake": False},
    {"g": 4, "public_tick": 60, "ticker": "VOLTAGE", "source": "IN", "text": "Confidential memo: Voltage Grid power plants face immediate supply shut-off from imported LNG shipments", "impact": -0.12, "is_fake": False},
    {"g": 4, "public_tick": 85, "ticker": "GOLDCORE", "source": "IN", "text": "Sovereign treasury desk directive: MCB expanding bullion allocation by ₹1,200 Cr this week to hedge war", "impact": 0.045, "is_fake": False},
    {"g": 4, "public_tick": 110, "ticker": "HRZN", "source": "AN", "text": "MCB Circular mandates 125% risk-weight on unsecured retail loans; banking capital adequacy pressured", "impact": -0.06, "is_fake": False},
    {"g": 4, "public_tick": 135, "ticker": "TYRL", "source": "NP", "text": "Industrial diesel prices up 18%; commercial fleet operators freeze new truck procurement contracts", "impact": -0.03, "is_fake": False},
    {"g": 4, "public_tick": 160, "ticker": "RLNT", "source": "FF", "text": "Reliant Energy executive chairman stepping down unexpectedly due to health reasons! Sell energy!", "impact": -0.03, "is_fake": True},
    {"g": 4, "public_tick": 185, "ticker": "STAPLE", "source": "NP", "text": "Consumer staples trade near session highs as investors seek shelter from industrial commodities shock", "impact": 0.01, "is_fake": False},

    # SESSION 5: "STIMULUS WHISPERS"
    {"g": 5, "public_tick": 20, "ticker": "CRANE", "source": "NP", "text": "Crane & Sons unlocks; selected for ₹3,200 Cr federal railway bridge and expressway modernization tender", "impact": 0.05, "is_fake": False},
    {"g": 5, "public_tick": 45, "ticker": "BZR-V", "source": "FF", "text": "Hearing European strategic partner is terminating integration contract with BZR-V due to audit uncertainty", "impact": -0.05, "is_fake": False},
    {"g": 5, "public_tick": 70, "ticker": "RLNT", "source": "IN", "text": "Confidential draft: Gulf strategic partner walks away from Reliant green ammonia joint venture", "impact": -0.09, "is_fake": False},
    {"g": 5, "public_tick": 95, "ticker": "INFN", "source": "AN", "text": "Northgate enterprise IT spend forecast revised upward; cloud optimization services show strong pricing power", "impact": 0.04, "is_fake": False},
    {"g": 5, "public_tick": 120, "ticker": "HRZN", "source": "IN", "text": "Internal risk memo: Horizon Commercial Bank Q3 retail loan delinquencies tick upward to 2.1%", "impact": -0.025, "is_fake": False},
    {"g": 5, "public_tick": 145, "ticker": "TYRL", "source": "NP", "text": "Fire reported at primary auto parts supplier warehouse in Northern Industrial Corridor; delivery delays expected", "impact": -0.035, "is_fake": True},
    {"g": 5, "public_tick": 170, "ticker": "VOLTAGE", "source": "NP", "text": "Ministry of Power announces special tariff adjustment window to compensate domestic gas utilities", "impact": 0.04, "is_fake": False},
    {"g": 5, "public_tick": 190, "ticker": "CRANE", "source": "AN", "text": "Northgate raises CRANE price target to ₹620; highlights 4.2x book-to-bill capex backlog", "impact": 0.025, "is_fake": False},

    # SESSION 6: "LAST DANCE OF THE BOOM"
    {"g": 6, "public_tick": 20, "ticker": "PULSE", "source": "FF", "text": "Major bridge hack alert: Devs supposedly moving treasury to private addresses! (FUD from bears!)", "impact": -0.04, "is_fake": True},
    {"g": 6, "public_tick": 45, "ticker": "PULSE", "source": "FF", "text": "Bridge devs confirm zero losses! Pulsedao buying back 10M tokens! We are going to ₹1,500 tonight! 🚀", "impact": 0.14, "is_fake": False},
    {"g": 6, "public_tick": 75, "ticker": "BZR-V", "source": "NP", "text": "Exchange Regulatory Filing: Bazaar Ventures approves surprise ₹250 Cr open-market share buyback", "impact": 0.14, "is_fake": False},
    {"g": 6, "public_tick": 100, "ticker": "HRZN", "source": "IN", "text": "Insider rumor: Central bank discussing special liquidity refinance window for tier-1 commercial lenders", "impact": 0.03, "is_fake": True},
    {"g": 6, "public_tick": 125, "ticker": "HRZN", "source": "AN", "text": "Calder & Wyn note: Horizon Gross NPA secretly creeps to 2.3%; loan loss provisioning appears stretched", "impact": -0.02, "is_fake": False},
    {"g": 6, "public_tick": 150, "ticker": "INFN", "source": "NP", "text": "IT sector closes at record highs as index funds absorb large institutional block inflows", "impact": 0.03, "is_fake": False},
    {"g": 6, "public_tick": 175, "ticker": "GOLDCORE", "source": "AN", "text": "Meridian Bullion Council reports record sovereign central bank bullion accumulation in quarterly review", "impact": 0.008, "is_fake": False},
    {"g": 6, "public_tick": 190, "ticker": "GLOBAL", "source": "AN", "text": "Closing session alert: Proprietary institutional desks aggressively squaring books ahead of monetary reset", "impact": 0.0, "is_fake": False},

    # SESSION 7: "THE HIKE"
    {"g": 7, "public_tick": 15, "ticker": "GLOBAL", "source": "NP", "text": "FLASH: Meridian Central Bank unexpectedly raises policy repo rate by 75 bps to 4.75% to fight inflation", "impact": -0.04, "is_fake": False},
    {"g": 7, "public_tick": 40, "ticker": "RLNT", "source": "AN", "text": "Calder & Wyn warns high capital costs will compress Reliant's refining expansion returns; trims rating", "impact": -0.02, "is_fake": False},
    {"g": 7, "public_tick": 65, "ticker": "RLNT", "source": "IN", "text": "MERX Regulatory disclosure: Sovereign wealth fund indefinitely suspends planned equity block acquisition in Reliant Energy following rate shock", "impact": -0.04, "is_fake": False},
    {"g": 7, "public_tick": 95, "ticker": "HRZN", "source": "IN", "text": "Confidential inspection report: MCB auditors demand Horizon Bank reclassify ₹1,800 Cr of stressed retail paper", "impact": -0.06, "is_fake": False},
    {"g": 7, "public_tick": 125, "ticker": "BZR-V", "source": "FF", "text": "Activist short seller was just forced to cover entire BZR-V position! We are going to ₹250! (Fake pump)", "impact": -0.06, "is_fake": True},
    {"g": 7, "public_tick": 150, "ticker": "PULSE", "source": "NP", "text": "Interest rate hike drains speculative leverage; DeFi borrow rates jump to 18%, triggering margin liquidations", "impact": -0.09, "is_fake": False},
    {"g": 7, "public_tick": 175, "ticker": "GOLDCORE", "source": "NP", "text": "Bullion trading desks report unprecedented sovereign net inflows following rate shock", "impact": 0.03, "is_fake": False},
    {"g": 7, "public_tick": 190, "ticker": "TYRL", "source": "AN", "text": "Commercial vehicle auto loans face higher monthly EMIs; inventory backlog climbs to 45 days", "impact": -0.025, "is_fake": False},

    # SESSION 8: "APEX FALLS"
    {"g": 8, "public_tick": 15, "ticker": "APEX", "source": "IN", "text": "URGENT LEAK: Apex Capital Bank board convenes midnight audit; Gross NPAs explode from 3.1% to 8.9%!", "impact": -0.15, "is_fake": False},
    {"g": 8, "public_tick": 40, "ticker": "INFN", "source": "NP", "text": "Infinity Systems signs landmark 7-year multi-cloud AI infrastructure alliance with US defense supplier", "impact": 0.06, "is_fake": False},
    {"g": 8, "public_tick": 65, "ticker": "APEX", "source": "NP", "text": "Exchange filing: Apex Capital Bank posts surprise quarterly net loss of ₹1,420 Cr; CEO tenders resignation", "impact": -0.12, "is_fake": False},
    {"g": 8, "public_tick": 95, "ticker": "HRZN", "source": "AN", "text": "Institutional Wire: HRZN entering final negotiations for cross-border merger with Global Trust Corp (Smokescreen!)", "impact": 0.12, "is_fake": True},
    {"g": 8, "public_tick": 120, "ticker": "HRZN", "source": "IN", "text": "Interbank wire: Regulators freeze credit facility as Horizon's contagion exposure to Apex Bank is revealed", "impact": -0.14, "is_fake": False},
    {"g": 8, "public_tick": 145, "ticker": "PULSE", "source": "FF", "text": "Tier-1 exchange listing officially confirmed for PULSE tonight at 8 PM UTC! 🚀 (Short squeeze pump!)", "impact": 0.08, "is_fake": True},
    {"g": 8, "public_tick": 170, "ticker": "TYRL", "source": "IN", "text": "Ministry of Defense tender: Tyrell Autoworks selected as L1 bidder for heavy logistics military fleet", "impact": 0.08, "is_fake": False},
    {"g": 8, "public_tick": 190, "ticker": "GOLDCORE", "source": "NP", "text": "Flight to safety accelerates: Institutional cash dumps commercial paper and floods physical bullion vaults", "impact": 0.025, "is_fake": False},

    # SESSION 9: "CONTAGION"
    {"g": 9, "public_tick": 20, "ticker": "LEDGER", "source": "NP", "text": "Ledger Data Systems unlocks on MERX; highlights zero debt and high free-cash-flow enterprise database contracts", "impact": 0.025, "is_fake": False},
    {"g": 9, "public_tick": 40, "ticker": "HRZN", "source": "FF", "text": "Merger is dead! Antitrust regulators about to reject the HRZN deal! Sell everything immediately!", "impact": -0.03, "is_fake": True},
    {"g": 9, "public_tick": 65, "ticker": "BZR-V", "source": "AN", "text": "Activist hedge fund publishes 80-page forensic report alleging circular revenue booking at Bazaar Ventures", "impact": -0.18, "is_fake": False},
    {"g": 9, "public_tick": 95, "ticker": "INFN", "source": "NP", "text": "Global enterprise software clients freeze IT vendor budgets; Infinity Systems warns of contract push-outs", "impact": -0.07, "is_fake": False},
    {"g": 9, "public_tick": 115, "ticker": "PULSE", "source": "IN", "text": "URGENT: Critical exploit in cross-chain bridge smart contract draining liquidity pools in real time!", "impact": -0.10, "is_fake": False},
    {"g": 9, "public_tick": 135, "ticker": "BZR-V", "source": "IN", "text": "BZR statutory auditor tenders resignation with immediate effect, citing balance sheet documentation discrepancies", "impact": -0.09, "is_fake": False},
    {"g": 9, "public_tick": 155, "ticker": "PULSE", "source": "NP", "text": "On-chain confirmation: $180M liquidated in bridge hack; regulators freeze unregistered staking pools as PULSE collapses", "impact": -0.16, "is_fake": False},
    {"g": 9, "public_tick": 175, "ticker": "GOLDCORE", "source": "NP", "text": "Systemic risk alert: Prime brokers hike margin requirements across equities; massive institutional flight to bullion", "impact": 0.07, "is_fake": False},
    {"g": 9, "public_tick": 190, "ticker": "LEDGER", "source": "AN", "text": "Northgate Securities: Defensive software migration makes Ledger the primary tech shelter in Meridian", "impact": 0.035, "is_fake": False},

    # SESSION 10: "THE TURN"
    {"g": 10, "public_tick": 20, "ticker": "FORGE", "source": "NP", "text": "Forge Industrial unlocks on MERX; named lead turnkey engineering partner for ₹28,000 Cr federal corridor package", "impact": 0.10, "is_fake": False},
    {"g": 10, "public_tick": 45, "ticker": "INFN", "source": "AN", "text": "Analyst downgrade: Enterprise software spend facing structural delay due to overseas macro freezes", "impact": -0.01, "is_fake": True},
    {"g": 10, "public_tick": 70, "ticker": "PULSE", "source": "IN", "text": "Sources: White-hat recovery team secures 85% of exploited bridge collateral; emergency protocol patch approved", "impact": 0.04, "is_fake": False},
    {"g": 10, "public_tick": 95, "ticker": "PULSE", "source": "NP", "text": "Pulsechain protocol restarts with audited validator set; short squeeze propels token recovery", "impact": 0.06, "is_fake": False},
    {"g": 10, "public_tick": 120, "ticker": "BZR-V", "source": "FF", "text": "BZR CEO going live on YouTube to sue short sellers for $2 Billion in damages! Buying back all shares!", "impact": 0.03, "is_fake": True},
    {"g": 10, "public_tick": 145, "ticker": "HRZN", "source": "NP", "text": "Meridian Central Bank activates emergency liquidity swap window; guarantees commercial bank retail deposits", "impact": 0.05, "is_fake": False},
    {"g": 10, "public_tick": 170, "ticker": "CRANE", "source": "AN", "text": "Crane & Sons awarded ₹1,400 Cr urban transit expansion contract; capex cycle turnaround confirmed", "impact": 0.06, "is_fake": False},
    {"g": 10, "public_tick": 190, "ticker": "FORGE", "source": "IN", "text": "Cabinet approval: Ministry fast-tracks 50% mobilization advance payment for Forge heavy engineering projects", "impact": 0.05, "is_fake": False},

    # SESSION 11: "NEW NORMAL"
    {"g": 11, "public_tick": 20, "ticker": "APEX", "source": "NP", "text": "Apex Capital Bank completes sovereign-backed recapitalization; emergency bad-loan carveout approved", "impact": 0.05, "is_fake": False},
    {"g": 11, "public_tick": 45, "ticker": "GLOBAL", "source": "FF", "text": "Emergency domestic market closure rumored for tomorrow due to settlement volatility! Liquidate now! 🚨", "impact": 0.0, "is_fake": True},
    {"g": 11, "public_tick": 70, "ticker": "GLOBAL", "source": "NP", "text": "Coordinated central bank stabilization facility activated ahead of final quad-witching expiry", "impact": 0.015, "is_fake": False},
    {"g": 11, "public_tick": 95, "ticker": "HRZN", "source": "AN", "text": "Provisioning cycle complete: Horizon Commercial Bank balance sheet cleaned; net interest margins rebound", "impact": 0.035, "is_fake": False},
    {"g": 11, "public_tick": 120, "ticker": "RLNT", "source": "AN", "text": "Passive index rebalancing flows force RLNT toward baseline equilibrium with heavy buy-side matching", "impact": 0.015, "is_fake": False},
    {"g": 11, "public_tick": 145, "ticker": "FORGE", "source": "NP", "text": "Forge Industrial confirms order backlog reaches record ₹34,000 Cr; institutional ownership expands", "impact": 0.025, "is_fake": False},
    {"g": 11, "public_tick": 170, "ticker": "GLOBAL", "source": "IN", "text": "Institutional settlement protocol active: Market maker order books switching to liquidation matching mode", "impact": 0.0, "is_fake": False},
    {"g": 11, "public_tick": 190, "ticker": "MERX50", "source": "NP", "text": "Meridian 50 Index closes 18-month cycle in orderly equilibrium as recovery sectors lead final tape", "impact": 0.02, "is_fake": False},
]

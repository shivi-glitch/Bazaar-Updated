# Bazaar: Algorithmic Trading Simulator

Bazaar is a highly advanced, multi-stage trading simulation engine. It evolves from a deterministic, narrative-driven tutorial into a fully dynamic, stochastic institutional market simulator. The platform is designed to teach market microstructure, risk management, and the difference between retail noise and institutional flow.

## The Two-Phase Architecture

Bazaar operates in two distinct phases: **Round 1 (The Retail Phase)** and **Round 2 (The Institutional Phase)**.

---

### Round 1: The Deterministic Engine (Sessions 1 - 6)
**Objective**: Onboard traders, teach platform mechanics (buying, shorting, margin), and introduce fundamental analysis.

* **The Engine**: In Round 1, the market operates on a **Deterministic Replay Engine**. Prices are loaded from a static `price_table` (CSV data). Every tick is pre-calculated.
* **The Market**: This represents a heavily manipulated retail market where technical analysis and drawing lines on charts often feel correct because the market is explicitly scripted to bounce off certain levels.
* **News Dynamics**: News events are scripted and directly correlate with the pre-baked price movements. If a positive Tier 2 news event drops for the Energy sector, the pre-recorded price will immediately gap up.
* **The Lesson**: Traders learn to react to news speed, manage their L1 Capital requirements for shorting, and understand basic asset archetypes (e.g., Safe Havens vs. High-Beta assets).

---

### Round 2: The Institutional Math Engine (Sessions 7 - 11+)
**Objective**: Strip away the training wheels. Introduce live liquidity, algorithmic adversaries, and real-time stochastic math.

At Session 7, the engine seamlessly detaches from the static CSVs and hands control over to the **Live Mathematical Simulation Engine**.

#### 1. The Stochastic Price Engine (Geometric Brownian Motion + Drift)
Prices are no longer static. They are computed live every 1.5 seconds using a custom stochastic differential equation:
* **Micro Brownian Motion**: A continuous random walk (Gaussian noise) is applied to every tick to simulate organic market "breathing".
* **Beta-Adjusted Volatility**: The random walk is scaled by the asset's specific `beta`. A safe haven like `GOLDCORE` has a tiny noise limit (`0.0004`), while a highly volatile asset like `PULSE` swings wildly (`0.0035`).
* **Live Player Flow**: The engine aggregates net notional buying and selling from *all active players* in the session. This real-time order flow creates an organic momentum drift that pushes the price based on actual human supply/demand.

#### 2. The Institutional Bot Pipeline (Liquidity Generation)
To support a real Depth of Market (Level 2), the engine runs a highly optimized Bot Pipeline containing 5 institutional archetypes:
* **Market Makers**: Anchor the spread tightly (0.1% - 0.25%) to provide baseline liquidity.
* **Noise Traders**: Scatter retail limit orders randomly outside the spread to create depth.
* **Mean-Reversion Faders**: Automatically stack massive defensive walls when the engine detects extreme volatility spikes (>1.2x average), fading the momentum.
* **Spoofers**: Temporarily flash massive fake walls 3 levels deep to bait other algorithms, instantly canceling them before they execute.
* **Directional Snipers**: Instantly slam massive, aggressive block orders onto the book the millisecond a news shock registers.

#### 3. Institutional TWAP Execution (Active Shocks)
When news hits in Round 2, it does not create a fake, instant vertical line. Real institutions don't market-buy 500,000 shares at once.
Instead, the engine uses **Active Shocks**. The impact is sliced over 2 to 8 ticks (simulating an algorithmic TWAP execution). This creates an aggressive, organic "waterfall" or momentum candle, giving fast human participants a brief 3-10 second window to jump on the moving train before the algorithms finish their accumulation.

---

## The News Engine & Tiers

The `news_ledger.py` controls the narrative flow. News is categorized to teach traders how to filter signal from noise.

* **Tier 1 (Macro / Systemic)**: Central bank decisions, global geopolitical shocks, broad regulatory changes. These impact the entire board and trigger immediate capital flights to Safe Havens (like `GOLDCORE` or `STAPLE`).
* **Tier 2 (Sector / Thematic)**: Industry-specific tailwinds or headwinds (e.g., a supply chain disruption affecting only Heavy Industrials).
* **Tier 3 (Asset-Specific / Micro)**: Earnings beats, CEO scandals, or individual contract wins. These trigger localized volatility and sniper bot activity on a specific ticker.
* **Tier 4 (Decoys / Rumors)**: Non-actionable noise designed to trap retail traders (e.g., "Analyst upgrades stock after a 400% run").

---

## Asset Archetypes

Bazaar contains 11 specific assets, each engineered to behave differently in the math engine:
1. **Trending (`INFY-Z`, `NIMBUS`)**: High autocorrelation. They ignore minor dips and respect moving averages. Fading momentum is highly dangerous.
2. **Mean-Reverting (`RELI-X`, `TATA-Y`)**: Bound by heavy institutional absorption. They swing violently but always gravitate back to VWAP/SMA 20.
3. **High-Beta Volatile (`BZR-V`, `PULSE`)**: Asymmetric risk engines with zero structural support. Highly vulnerable to margin liquidations and short squeezes.
4. **Safe Haven (`GOLDCORE`, `STAPLE`)**: Negative or ultra-low beta. Dormant during retail bull runs, but they surge violently when macro shocks hit the broader board.

---

## The UI Experience

* **Live Charting**: Features dynamic scaling, drag-to-pan, and smooth SMA overlays (9 and 20 periods) calculated live in the client.
* **Level 2 Depth of Market**: Locked during Round 1. Unlocks in Session 7 to reveal the live Institutional Order Flow tug-of-war.
* **Admin Control Center**: A secure, websocket-driven dashboard that allows the game master to control session progression, manually trigger active news shocks, and view live PnL leaderboards.

Bazaar is not just a game; it is a live, breathing microstructure sandbox.
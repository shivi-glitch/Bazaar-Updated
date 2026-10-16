import random
from typing import Dict, Tuple, List

class LiquidityBots:
    # Order book state cache per ticker for continuity and tradeability
    _cache: Dict[str, dict] = {}

    @classmethod
    def generate_order_book(
        cls, 
        current_paise: int, 
        active_shock_impact: float = 0.0, 
        volatility_multiplier: float = 1.0,
        ticker: str = "GLOBAL"
    ) -> Tuple[List[List[float]], List[List[float]]]:
        """
        Generates a persistent, readable Level 2 Order Book using 5 Bot Archetypes.
        Maintains order book continuity so bids/asks don't violently jitter every second,
        allowing human traders to spot genuine liquidity walls and trade profitably.
        """
        current_price = current_paise / 100.0
        
        state = cls._cache.get(ticker)
        if not state:
            state = {
                "bid_sizes": [random.randint(2200, 3600) for _ in range(4)],
                "ask_sizes": [random.randint(2200, 3600) for _ in range(4)],
                "shock_hold": 0,
                "spoof_hold": 0,
                "spoof_side": "NONE",
                "spoof_size": 0
            }
            cls._cache[ticker] = state

        # Smooth size evolution (dampened delta so sizes don't flicker like strobe lights)
        for i in range(4):
            state["bid_sizes"][i] = max(800, int(state["bid_sizes"][i] * 0.85 + random.randint(1500, 3500) * 0.15))
            state["ask_sizes"][i] = max(800, int(state["ask_sizes"][i] * 0.85 + random.randint(1500, 3500) * 0.15))

        # Base spreads aligned to current market price (at least 5 paise, ~0.10% to 0.18%)
        spread = max(0.10, round(current_price * 0.0012 / 0.05) * 0.05)
        
        bids = []
        asks = []

        # Predictable, realistic price ladder (5 paise increments)
        offsets = [spread, spread + 0.15, spread + 0.35, spread + 0.60]
        for i, off in enumerate(offsets):
            b_price = round((current_price - off) / 0.05) * 0.05
            a_price = round((current_price + off) / 0.05) * 0.05
            bids.append([max(0.05, b_price), state["bid_sizes"][i]])
            asks.append([max(0.10, a_price), state["ask_sizes"][i]])

        # 1. DIRECTIONAL SNIPERS (Real, Actionable News Shock Walls)
        # When active_shock_impact > 0 (bullish), stack a persistent BUY wall of 24,000-32,000 shares!
        # When active_shock_impact < 0 (bearish), stack a persistent SELL wall of 24,000-32,000 shares!
        if active_shock_impact > 0:
            wall_price = bids[0][0]
            bids[0] = [wall_price, max(bids[0][1], random.randint(24000, 32000))]
        elif active_shock_impact < 0:
            wall_price = asks[0][0]
            asks[0] = [wall_price, max(asks[0][1], random.randint(24000, 32000))]

        # 2. MEAN-REVERSION BOTS (Stack liquidity against excessive volatility)
        if volatility_multiplier > 1.2:
            bids[1][1] += random.randint(3000, 6000)
            asks[1][1] += random.randint(3000, 6000)

        # 3. SPOOFING BOTS (Tactical Fake Walls that hold for 4-6 ticks = 6-9 seconds)
        if state["spoof_hold"] > 0:
            state["spoof_hold"] -= 1
            if state["spoof_side"] == "BUY" and len(bids) >= 3:
                bids[2][1] += state["spoof_size"]
            elif state["spoof_side"] == "SELL" and len(asks) >= 3:
                asks[2][1] += state["spoof_size"]
        else:
            # 15% chance to trigger a new spoof wall that holds for several ticks
            if random.random() < 0.15 and abs(active_shock_impact) < 0.005:
                state["spoof_hold"] = random.randint(4, 6)
                state["spoof_side"] = random.choice(["BUY", "SELL"])
                state["spoof_size"] = random.randint(14000, 22000)

        # Sort bids descending, asks ascending
        bids.sort(key=lambda x: x[0], reverse=True)
        asks.sort(key=lambda x: x[0])

        return bids[:4], asks[:4]

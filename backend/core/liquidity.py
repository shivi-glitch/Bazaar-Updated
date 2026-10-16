import random
from typing import Dict, Tuple, List

class LiquidityBots:
    # Order book state cache per ticker for continuity, readability, and tradeability
    _cache: Dict[str, dict] = {}

    @classmethod
    def generate_order_book(
        cls, 
        current_paise: int, 
        active_shock_impact: float = 0.0, 
        directional_trend: float = 0.0,
        volatility_multiplier: float = 1.0,
        ticker: str = "GLOBAL"
    ) -> Tuple[List[List[float]], List[List[float]]]:
        """
        Generates a calm, persistent, human-readable Level 2 Order Book.
        
        Key Design Principles:
        1. Human-Readable Pacing: Holds book sizes steady for 4 ticks (~6 seconds) 
           so human eyes can easily absorb numbers without disorienting flicker.
        2. Actionable Predictive Alpha: Directly correlates order book depth with impending 
           price direction. When the market is about to rise, bids are heavily stacked (75-85%).
           When the market is about to fall, asks are heavily stacked (75-85%).
        """
        current_price = current_paise / 100.0
        
        state = cls._cache.get(ticker)
        if not state:
            state = {
                "hold_ticks": 0,
                "last_price_paise": current_paise,
                "bid_sizes": [3000, 3000, 3000, 3000],
                "ask_sizes": [3000, 3000, 3000, 3000],
            }
            cls._cache[ticker] = state

        # Check if we should hold the existing order book steady (approx 6 seconds = 4 engine ticks)
        # We only refresh sizes when hold_ticks runs out OR if price moves by more than 15 paise (3 ticks)
        price_moved_significantly = abs(current_paise - state.get("last_price_paise", current_paise)) >= 15
        
        if state["hold_ticks"] > 0 and not price_moved_significantly:
            state["hold_ticks"] -= 1
        else:
            # Refresh order book sizes (holds for next 4 ticks = ~6 seconds)
            state["hold_ticks"] = 4
            state["last_price_paise"] = current_paise
            
            # Total predictive directional bias: news shock + fundamental story wave pull
            total_bias = (directional_trend * 2.0) + (active_shock_impact * 2.5)

            if total_bias > 0.002:
                # BULLISH MOMENTUM / UPWARD SHOCK
                # Massive institutional bid support absorbing supply -> Price will move UP
                state["bid_sizes"] = [
                    random.randint(22000, 30000), # Top Bid Wall
                    random.randint(8000, 14000),
                    random.randint(6000, 10000),
                    random.randint(4000, 7000)
                ]
                # Thin asks so price can break out upward easily
                state["ask_sizes"] = [
                    random.randint(1500, 3200),
                    random.randint(2000, 3500),
                    random.randint(2200, 3800),
                    random.randint(2500, 4000)
                ]

            elif total_bias < -0.002:
                # BEARISH MOMENTUM / DOWNWARD SHOCK
                # Massive institutional ask resistance capping price -> Price will move DOWN
                state["ask_sizes"] = [
                    random.randint(22000, 30000), # Top Ask Wall
                    random.randint(8000, 14000),
                    random.randint(6000, 10000),
                    random.randint(4000, 7000)
                ]
                # Thin bids so price can drop without resistance
                state["bid_sizes"] = [
                    random.randint(1500, 3200),
                    random.randint(2000, 3500),
                    random.randint(2200, 3800),
                    random.randint(2500, 4000)
                ]

            else:
                # BALANCED MARKET / CONSOLIDATION
                # Normal two-way liquidity (~50/50 balance)
                base = random.randint(3500, 5500)
                state["bid_sizes"] = [
                    base + random.randint(-500, 500),
                    base + random.randint(-600, 600),
                    base + random.randint(-700, 700),
                    base + random.randint(-800, 800)
                ]
                state["ask_sizes"] = [
                    base + random.randint(-500, 500),
                    base + random.randint(-600, 600),
                    base + random.randint(-700, 700),
                    base + random.randint(-800, 800)
                ]

        # Base spreads aligned to current market price (minimum 5-10 paise)
        spread = max(0.10, round(current_price * 0.0012 / 0.05) * 0.05)
        
        bids = []
        asks = []

        # Predictable, clean 5-paise price ladders pegged to current price
        offsets = [spread, spread + 0.15, spread + 0.35, spread + 0.60]
        for i, off in enumerate(offsets):
            b_price = round((current_price - off) / 0.05) * 0.05
            a_price = round((current_price + off) / 0.05) * 0.05
            bids.append([max(0.05, b_price), state["bid_sizes"][i]])
            asks.append([max(0.10, a_price), state["ask_sizes"][i]])

        # Sort bids descending, asks ascending
        bids.sort(key=lambda x: x[0], reverse=True)
        asks.sort(key=lambda x: x[0])

        return bids[:4], asks[:4]

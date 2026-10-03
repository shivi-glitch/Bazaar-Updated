import random

class LiquidityBots:
    @staticmethod
    def generate_order_book(current_paise, active_shock_impact=0.0, volatility_multiplier=1.0):
        """
        Generates a Level 2 Order Book using 5 Bot Archetypes.
        Returns the top 4 bids and asks as [[price, size], ...].
        """
        current_price = current_paise / 100.0
        
        bids = []
        asks = []

        # 1. MARKET MAKER BOTS (The Anchor)
        # Provides baseline liquidity. Maintains a tight spread of 0.1% - 0.25%.
        mm_spread = current_price * random.uniform(0.001, 0.0025)
        bids.append([round(current_price - mm_spread, 2), random.randint(1500, 3500)])
        asks.append([round(current_price + mm_spread, 2), random.randint(1500, 3500)])

        # 2. NOISE TRADERS (Retail Flow)
        # Random limit orders scattered further down the order book.
        for i in range(2, 4):
            b_price = current_price - (i * random.uniform(0.1, 0.4))
            a_price = current_price + (i * random.uniform(0.1, 0.4))
            bids.append([round(b_price, 2), random.randint(300, 1200)])
            asks.append([round(a_price, 2), random.randint(300, 1200)])

        # 3. MEAN-REVERSION BOTS (The Faders)
        # If volatility is high, they stack liquidity against the trend to fade the move.
        if volatility_multiplier > 1.2:
            bids.append([round(current_price - 0.6, 2), random.randint(4000, 7000)])
            asks.append([round(current_price + 0.6, 2), random.randint(4000, 7000)])

        # 4. SPOOFING BOTS (The Manipulators)
        # Randomly flashes a massive fake wall 3 levels deep to manipulate the UI imbalance gauge.
        if random.random() > 0.6: 
            is_spoofing_buy = random.choice([True, False])
            spoof_size = random.randint(15000, 25000)
            if is_spoofing_buy:
                bids.append([round(current_price - 0.45, 2), spoof_size])
            else:
                asks.append([round(current_price + 0.45, 2), spoof_size])

        # 5. DIRECTIONAL SNIPERS (News Reactants)
        # When a news shock is active, they instantly stack massive, real liquidity walls.
        if active_shock_impact > 0:
            # Bullish Shock: Stack a massive buy wall right below current price.
            bids.append([round(current_price - 0.05, 2), random.randint(18000, 35000)])
        elif active_shock_impact < 0:
            # Bearish Shock: Stack a massive sell wall right above current price.
            asks.append([round(current_price + 0.05, 2), random.randint(18000, 35000)])

        # Aggregate, sort, and slice the top 4 levels for the frontend DOM
        bids.sort(key=lambda x: x[0], reverse=True)
        asks.sort(key=lambda x: x[0])

        return bids[:4], asks[:4]

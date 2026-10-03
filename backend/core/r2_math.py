import math

# LIQUIDITY PROFILES (Market Depth)
# Represents the exact Rupee amount of net buying/selling required to move the stock 1%.
LIQUIDITY_PROFILE = {
    "RELI-X": 3_00_00_000,   # Blue-chip: 3.0 Cr for 1%
    "HDFC-W": 2_50_00_000,
    "INFY-Z": 2_00_00_000,
    "TATA-Y": 1_50_00_000,
    "GOLDCORE": 4_00_00_000, # Massive depth
    "STAPLE": 1_00_00_000,
    "NIMBUS": 75_00_000,
    "LEDGER": 60_00_000,
    "APEX": 50_00_000,
    "VOLTAGE": 40_00_000,
    "FORGE": 35_00_000,
    "CRANE": 25_00_000,      # Small Cap: 25 Lakhs for 1%
    "BZR-V": 15_00_000,      # Micro Cap: 15 Lakhs for 1%
    "PULSE": 10_00_000       # Penny Stock: 10 Lakhs for 1%
}

MOODS = {
    "calm": {"tau": 8, "L": 2.5},
    "tense": {"tau": 6, "L": 2.0},
    "panic": {"tau": 4, "L": 1.5},
    "recovery": {"tau": 6, "L": 2.0},
}

class R2InstrumentState:
    def __init__(self, ticker: str, initial_price: float):
        self.ticker = ticker
        self.P = float(initial_price)
        self.dev_s = 0.0
        self.history_F = [float(initial_price)] * 120

    def tick(self, F_current: float, A_net_notional: float, active_teams: int = 300, mood: str = "calm") -> float:
        self.history_F.append(F_current)
        params = MOODS[mood]
        L_ticks = int(params["L"] * 2)
        F_delayed = self.history_F[-L_ticks - 1]

        # 1. Price vs Value deviation
        dev = math.log(self.P) - math.log(F_delayed)
        
        # 2. Smooth deviation EMA
        self.dev_s = self.dev_s + 0.221 * (dev - self.dev_s)

        # 3. Bot pull-back force (Mean Reversion)
        alpha = 1 - math.exp(-0.5 / params["tau"])
        pull = -alpha * self.dev_s

        # 4. Market Impact (Player Flow vs Liquidity Profile)
        depth_rupees = LIQUIDITY_PROFILE.get(self.ticker, 1_00_00_000)
        flow_impact = 0.01 * (A_net_notional / depth_rupees)
        
        r_i = pull + flow_impact
        
        # 5. Clip move to max 5% per tick to allow massive trades to spike the chart
        r_i = max(-0.05, min(0.05, r_i))

        # 6. Apply return and round to 5 paise
        self.P = self.P * math.exp(r_i)
        self.P = round(self.P / 0.05) * 0.05
        
        return self.P
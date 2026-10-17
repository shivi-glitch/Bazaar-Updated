import math
import random
from typing import Dict

# LIQUIDITY PROFILES (Market Depth)
# Represents the exact Rupee amount of net buying/selling required to move the stock 1%.
LIQUIDITY_PROFILE = {
    "RLNT": 3_00_00_000,   # Blue-chip: 3.0 Cr for 1%
    "HRZN": 2_50_00_000,
    "INFN": 2_00_00_000,
    "TYRL": 1_50_00_000,
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

# Microstructure Volatility & Characteristics per Instrument
# Defines realistic tick-by-tick micro-volatility (sigma) and natural wicks so lines never flatline
TICKER_VOLATILITY: Dict[str, dict] = {
    "BZR-V": {"sigma": 0.0022, "beta": 1.70},   # Volatile micro-cap tech
    "PULSE": {"sigma": 0.0035, "beta": 2.40},   # Highly speculative crypto
    "VOLTAGE": {"sigma": 0.0019, "beta": 1.50}, # Small-cap energy
    "CRANE": {"sigma": 0.0017, "beta": 1.30},   # Small-cap freight
    "TYRL": {"sigma": 0.0014, "beta": 1.10},    # Mid-cap cyclicals
    "NIMBUS": {"sigma": 0.0016, "beta": 1.35},  # Mid-cap cloud/AI
    "APEX": {"sigma": 0.0018, "beta": 1.45},    # Leveraged private bank
    "FORGE": {"sigma": 0.0015, "beta": 1.15},   # Mid-cap infrastructure
    "HRZN": {"sigma": 0.0012, "beta": 0.95},    # Commercial bank
    "RLNT": {"sigma": 0.0009, "beta": 0.85},    # Blue-chip energy
    "INFN": {"sigma": 0.0011, "beta": 0.90},    # Enterprise IT
    "LEDGER": {"sigma": 0.0010, "beta": 0.80},  # Enterprise software
    "STAPLE": {"sigma": 0.0007, "beta": 0.50},  # FMCG consumer defensive
    "GOLDCORE": {"sigma": 0.0006, "beta": 0.20},# Sovereign bullion reserve
}

MOODS = {
    "calm":     {"tau": 32.0, "L": 2.5, "s_n": 0.08, "kappa_mo": 0.05, "kappa_inf": 0.025, "L_inf": 6.0},
    "tense":    {"tau": 24.0, "L": 2.0, "s_n": 0.12, "kappa_mo": 0.08, "kappa_inf": 0.035, "L_inf": 5.0},
    "panic":    {"tau": 18.0, "L": 1.5, "s_n": 0.18, "kappa_mo": 0.14, "kappa_inf": 0.050, "L_inf": 4.0},
    "recovery": {"tau": 26.0, "L": 2.0, "s_n": 0.10, "kappa_mo": 0.09, "kappa_inf": 0.030, "L_inf": 5.0},
    "pulse-own":{"tau": 38.0, "L": 3.0, "s_n": 0.25, "kappa_mo": 0.18, "kappa_inf": 0.000, "L_inf": 0.0},
}

class R2InstrumentState:
    def __init__(self, ticker: str, initial_price: float):
        self.ticker = ticker
        self.P = float(initial_price)
        self.dev_s = 0.0
        self.history_F = [float(initial_price)] * 120
        self.history_P = [float(initial_price)] * 120
        self.smart_money = 0
        self.bounce_state = 1.0  # Tracks bid-ask microstructure bounce

    @property
    def current_price(self) -> float:
        return self.P

    def tick(self, F_current: float, A_net_notional: float, active_teams: int = 300, mood: str = "calm", dt: float = 1.5) -> float:
        """
        Executes a single 1.5-second market tick combining:
        1. Fundamental Anchor Pull (Story trend & news discovery)
        2. Ambient Bot Swarm (Retail noise, momentum bots, institutional smart money)
        3. Realistic Microstructure Noise (Bid-Ask bounce and candle wicks so lines never flatline)
        """
        self.history_F.append(F_current)
        self.history_P.append(self.P)
        if len(self.history_F) > 240:
            self.history_F.pop(0)
            self.history_P.pop(0)

        # Select mood params (PULSE has its own speculative crypto profile)
        mood_key = "pulse-own" if self.ticker == "PULSE" else mood
        params = MOODS.get(mood_key, MOODS["calm"])
        t_vol = TICKER_VOLATILITY.get(self.ticker, {"sigma": 0.0014, "beta": 1.0})

        # 1. Delayed fundamental anchors (Market Maker delay vs Institutional delay)
        L_ticks = max(1, int(params["L"] / dt))
        F_delayed = self.history_F[-L_ticks - 1]

        L_inf_ticks = max(1, int(params["L_inf"] / dt)) if params["L_inf"] > 0 else 1
        F_inf_delayed = self.history_F[-L_inf_ticks - 1]

        # 2. Price vs Value deviation
        dev = math.log(max(1.0, self.P)) - math.log(max(1.0, F_delayed))

        # Smooth deviation EMA (2.5-second EMA: bots react smoothly without 1-tick cliff drops)
        ema_factor = 1.0 - math.exp(-dt / 2.5)
        self.dev_s = self.dev_s + ema_factor * (dev - self.dev_s)

        # 3. Market Maker Pull-Back Force (Mean Reversion toward Fundamental Value)
        alpha = 1.0 - math.exp(-dt / params["tau"])
        pull = -alpha * self.dev_s

        depth_rupees = LIQUIDITY_PROFILE.get(self.ticker, 1_00_00_000)

        # 4. AMBIENT BOT SWARM POPULATIONS:
        # a) Retail Day-Traders & Ambient Scalpers (Generates authentic background order volume)
        s_n = params["s_n"]
        ambient_retail_flow = random.gauss(0, s_n * depth_rupees * 0.18)

        # b) Momentum Algos (Chase short-term velocity over ~8-12 seconds)
        p_lookback = self.history_P[-min(len(self.history_P), max(2, int(9.0 / dt)))]
        ret_lookback = math.log(max(1.0, self.P)) - math.log(max(1.0, p_lookback))
        Q_mom = params["kappa_mo"] * depth_rupees * math.tanh(ret_lookback / 0.006)

        # c) Institutional Smart-Money (Trades toward long-term intrinsic value F)
        val_gap = math.log(max(1.0, F_inf_delayed)) - math.log(max(1.0, self.P))
        Q_inf = params["kappa_inf"] * depth_rupees * math.tanh(val_gap / 0.012)

        # Smart Money Flag (+1 accumulating, -1 distributing, 0 neutral)
        norm_inf = Q_inf / depth_rupees
        if norm_inf >= 0.4 * params["kappa_inf"] and params["kappa_inf"] > 0:
            self.smart_money = 1
        elif norm_inf <= -0.4 * params["kappa_inf"] and params["kappa_inf"] > 0:
            self.smart_money = -1
        else:
            self.smart_money = 0

        # Total Aggressive Flow: Live Player Orders + Ambient Bot Swarm
        A_total = A_net_notional + ambient_retail_flow + Q_mom + Q_inf
        flow_impact = 0.01 * (A_total / depth_rupees)

        # 5. AUTHENTIC MICROSTRUCTURE NOISE & SPREAD BOUNCE:
        # Prevents dead flatlines by ensuring price breathes naturally across 5-paise ticks
        self.bounce_state = -self.bounce_state if random.random() < 0.60 else self.bounce_state
        spread_bounce = self.bounce_state * (t_vol["sigma"] * 0.35)
        stochastic_noise = random.gauss(0, t_vol["sigma"])

        # Total tick return
        r_i = pull + flow_impact + stochastic_noise + spread_bounce

        # Clip per tick to allow sharp moves up to 3.5%, avoiding unnatural instant cliffs
        r_i = max(-0.035, min(0.035, r_i))

        # Apply return and round to standard NSE 5-paise tick increments
        new_price = self.P * math.exp(r_i)
        
        # Ensure price never gets stuck on exact same 5 paise if stochastic noise is present
        rounded = round(new_price / 0.05) * 0.05
        if rounded == self.P and random.random() < 0.45:
            # Subtle micro-tick shift (±5 paise) to maintain organic heartbeat
            step = 0.05 if random.random() < 0.5 else -0.05
            rounded = max(0.05, round((self.P + step) / 0.05) * 0.05)

        self.P = max(0.05, rounded)
        return self.P
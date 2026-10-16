import math
import random

LIQUIDITY_PROFILE = {
    "RLNT": 3_00_00_000,   # Blue-chip: 3.0 Cr for 1%
    "HRZN": 2_50_00_000,
    "INFN": 2_00_00_000,
    "TYRL": 1_50_00_000,
    "GOLDCORE": 4_00_00_000,
    "STAPLE": 1_00_00_000,
    "NIMBUS": 75_00_000,
    "LEDGER": 60_00_000,
    "APEX": 50_00_000,
    "VOLTAGE": 40_00_000,
    "FORGE": 35_00_000,
    "CRANE": 25_00_000,
    "BZR-V": 15_00_000,
    "PULSE": 10_00_000
}

MOODS = {
    "calm":     {"tau": 8.0, "L": 2.5, "s_n": 0.05, "kappa_mo": 0.04, "kappa_inf": 0.075, "L_inf": 6.0},
    "tense":    {"tau": 6.0, "L": 2.0, "s_n": 0.08, "kappa_mo": 0.08, "kappa_inf": 0.100, "L_inf": 5.0},
    "panic":    {"tau": 4.0, "L": 1.5, "s_n": 0.12, "kappa_mo": 0.15, "kappa_inf": 0.125, "L_inf": 4.0},
    "recovery": {"tau": 6.0, "L": 2.0, "s_n": 0.07, "kappa_mo": 0.10, "kappa_inf": 0.100, "L_inf": 5.0},
    "pulse-own":{"tau": 12.0, "L": 3.0, "s_n": 0.18, "kappa_mo": 0.18, "kappa_inf": 0.000, "L_inf": 0.0},
}

WAVE_PROFILE_24 = [
    0.0, 0.12, 0.25, 0.37, 0.50, 0.59, 0.60, 0.56, 0.51, 0.50,
    0.56, 0.65, 0.73, 0.81, 0.89, 0.98, 1.04, 1.05, 1.03, 1.02,
    1.01, 1.00, 1.00, 1.00
]

class R2InstrumentState:
    def __init__(self, ticker: str, initial_price: float):
        self.ticker = ticker
        self.P = float(initial_price)
        self.dev_s = 0.0
        self.history_F = [float(initial_price)] * 120
        self.history_P = [float(initial_price)] * 120
        self.smart_money = 0

    @property
    def current_price(self) -> float:
        return self.P

    def tick(self, F_current: float, A_net_notional: float, mood: str = "calm", dt: float = 1.0) -> float:
        self.history_F.append(F_current)
        self.history_P.append(self.P)
        if len(self.history_F) > 200:
            self.history_F.pop(0)
            self.history_P.pop(0)

        # Select mood params (PULSE has its own wild mood)
        mood_key = "pulse-own" if self.ticker == "PULSE" else mood
        params = MOODS.get(mood_key, MOODS["calm"])

        # 1. Delayed fundamental anchors
        L_ticks = max(1, int(params["L"] / dt))
        F_delayed = self.history_F[-L_ticks - 1]

        L_inf_ticks = max(1, int(params["L_inf"] / dt)) if params["L_inf"] > 0 else 1
        F_inf_delayed = self.history_F[-L_inf_ticks - 1]

        # 2. Price vs Value deviation
        dev = math.log(self.P) - math.log(F_delayed)

        # Smooth deviation EMA (tau_ema ~ 2s -> factor = 1 - exp(-dt / 2.0) ~ 0.39 for dt=1.0)
        ema_factor = 1.0 - math.exp(-dt / 2.0)
        self.dev_s = self.dev_s + ema_factor * (dev - self.dev_s)

        # 3. Market Maker Pull-Back Force (Mean Reversion)
        alpha = 1.0 - math.exp(-dt / params["tau"])
        pull = -alpha * self.dev_s

        depth_rupees = LIQUIDITY_PROFILE.get(self.ticker, 1_00_00_000)

        # 4. Bot Flows:
        # a) Noise Traders: small random 2-sided liquidity
        s_n = params["s_n"]
        Q_noise = random.gauss(0, s_n * depth_rupees * 0.08)

        # b) Momentum Traders: chase price changes over ~10 seconds (10 ticks)
        p_10_back = self.history_P[-min(len(self.history_P), 10)]
        ret_10 = math.log(self.P) - math.log(p_10_back)
        Q_mom = params["kappa_mo"] * depth_rupees * math.tanh(ret_10 / 0.008)

        # c) Institutional Smart-Money: trades toward true value
        # When P > F (overvalued), Q_inf < 0 (institutions sell / short into the pump)
        # When P < F (undervalued), Q_inf > 0 (institutions accumulate)
        val_gap = math.log(F_inf_delayed) - math.log(self.P)
        Q_inf = params["kappa_inf"] * depth_rupees * math.tanh(val_gap / 0.01)

        # Smart Money Flag (+1 accumulating, -1 distributing, 0 neutral)
        norm_inf = Q_inf / depth_rupees
        if norm_inf >= 0.5 * params["kappa_inf"] and params["kappa_inf"] > 0:
            self.smart_money = 1
        elif norm_inf <= -0.5 * params["kappa_inf"] and params["kappa_inf"] > 0:
            self.smart_money = -1
        else:
            self.smart_money = 0

        # Total Aggressive Flow
        A_total = A_net_notional + Q_noise + Q_mom + Q_inf
        flow_impact = 0.01 * (A_total / depth_rupees)

        r_i = pull + flow_impact

        # Clip per tick to allow sharp moves up to 4%, avoiding runaway
        r_i = max(-0.04, min(0.04, r_i))

        # Apply return and round to 5 paise
        self.P = self.P * math.exp(r_i)
        self.P = round(self.P / 0.05) * 0.05
        return self.P

def test_scenario_idle():
    print("=== SCENARIO 1: ZERO PLAYER TRADES (STORYLINE TRACKING) ===")
    state = R2InstrumentState("RLNT", 2450.0)
    anchor = 2450.0
    shock_step = 0
    shock_total = 24
    base_f = 2450.0
    impact = 0.03  # +3% news shock starting at tick 10

    for t in range(50):
        # Micro Brownian breathing on anchor
        anchor *= (1 + random.gauss(0, 0.0001))
        
        # News shock active from tick 10 to 34
        if 10 <= t < 10 + shock_total:
            fraction = WAVE_PROFILE_24[shock_step]
            anchor = base_f * (1.0 + impact * fraction)
            shock_step += 1

        price = state.tick(F_current=anchor, A_net_notional=0.0, mood="tense")
        if t in [0, 9, 10, 15, 20, 25, 30, 34, 40, 49]:
            print(f"t={t:02d} | Anchor F={anchor:.2f} | Traded P={price:.2f} | Diff={price-anchor:+.2f} ({((price/anchor)-1)*100:+.2f}%) | SM={state.smart_money}")

def test_scenario_pump():
    print("\n=== SCENARIO 2: PLAYER PUMP & INSTITUTIONAL RETRACEMENT ===")
    state = R2InstrumentState("RLNT", 2450.0)
    anchor = 2450.0

    print("Baseline before pump: P =", state.P, "F =", anchor)
    # Ticks 1 to 5: Teams pump ₹3 Cr total buying
    for t in range(1, 40):
        player_flow = 0.0
        if 5 <= t <= 9:
            # ₹1.5 Cr per tick for 5 ticks = ₹7.5 Cr aggressive buy
            player_flow = 1_50_00_000.0

        price = state.tick(F_current=anchor, A_net_notional=player_flow, mood="calm")
        if t in [4, 5, 7, 9, 10, 12, 15, 20, 25, 30, 35]:
            dev_pct = ((price / anchor) - 1.0) * 100
            print(f"t={t:02d} | Flow={player_flow/1e7:+.2f}Cr | P={price:.2f} | F={anchor:.2f} | Dev={dev_pct:+.2f}% | SM={state.smart_money}")

if __name__ == "__main__":
    test_scenario_idle()
    test_scenario_pump()

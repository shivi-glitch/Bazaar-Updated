import os
import sys
import hashlib
import numpy as np
import pandas as pd

# Add repo root to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from backend.core.news_ledger import SCRIPTED_NEWS_DATABASE

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
MASTER_SEED = 42

def to_paise(rupees): 
    return int(round(rupees * 100))

# Full Session Target Matrix for R1
TARGETS = {
    1: {"RLNT": 0.8, "TYRL": 0.5, "INFN": 3.0, "HRZN": 2.5, "BZR-V": 1.5, "GOLDCORE": 0.3, "PULSE": 0.5},
    2: {"RLNT": 1.0, "TYRL": 0.4, "INFN": 4.5, "HRZN": 3.5, "BZR-V": -2.0, "GOLDCORE": 0.3, "PULSE": 9.0, "NIMBUS": 6.0},
    3: {"RLNT": 0.5, "TYRL": -0.5, "INFN": 1.0, "HRZN": 1.0, "BZR-V": 2.5, "GOLDCORE": 0.3, "PULSE": -3.0, "NIMBUS": 2.0, "STAPLE": 0.6},
    4: {"RLNT": 2.0, "TYRL": -1.5, "INFN": -2.5, "HRZN": -1.0, "BZR-V": -3.0, "GOLDCORE": 2.8, "PULSE": -4.0, "NIMBUS": -3.0, "STAPLE": 0.2, "VOLTAGE": -9.0},
    5: {"RLNT": -3.0, "TYRL": 1.0, "INFN": 1.5, "HRZN": 1.0, "BZR-V": 2.0, "GOLDCORE": 0.5, "PULSE": 2.0, "NIMBUS": 1.5, "STAPLE": 0.4, "VOLTAGE": 4.0, "CRANE": 5.0},
    6: {"RLNT": -1.0, "TYRL": 0.5, "INFN": 3.0, "HRZN": 2.5, "BZR-V": 5.0, "GOLDCORE": 0.3, "PULSE": 14.0, "NIMBUS": 4.0, "STAPLE": 0.4, "VOLTAGE": 1.0, "CRANE": 2.5}
}

# Base Open Prices
BASE_PRICES = {
    "RLNT": 2450.0, "TYRL": 880.0, "INFN": 1520.0, "HRZN": 1640.0, 
    "BZR-V": 640.0, "GOLDCORE": 6200.0, "PULSE": 850.0, "NIMBUS": 410.0, 
    "STAPLE": 1180.0, "VOLTAGE": 310.0, "CRANE": 520.0
}

def wave_profile(n_steps=24):
    """Generates authentic higher-highs and higher-lows multi-wave price discovery."""
    u = np.linspace(0, 1, n_steps)
    xp = [0.0, 0.25, 0.45, 0.80, 1.0]
    yp = [0.0, 0.62, 0.48, 1.06, 1.0]
    lin = np.interp(u, xp, yp)
    kernel = np.array([0.15, 0.7, 0.15])
    sm = np.convolve(lin, kernel, mode='same')
    sm[0] = 0.0
    sm[-1] = 1.0
    return sm

def fade_wave_profile(n_steps=35):
    """Generates an initial speculative surge that exhausts and fades back down."""
    u = np.linspace(0, 1, n_steps)
    xp = [0.0, 0.25, 0.45, 0.65, 0.85, 1.0]
    yp = [0.0, 0.90, 0.65, 1.00, 0.40, 0.0]
    lin = np.interp(u, xp, yp)
    kernel = np.array([0.15, 0.7, 0.15])
    sm = np.convolve(lin, kernel, mode='same')
    sm[0] = 0.0
    sm[-1] = 0.0
    return sm

WAVE_24 = wave_profile(24)
FADE_35 = fade_wave_profile(35)

def get_session_events(g, ticker):
    """Collects all news events relevant to this ticker in session g."""
    events = []
    for item in SCRIPTED_NEWS_DATABASE:
        if item["g"] == g and item["ticker"] == ticker:
            events.append({
                "tick": item["public_tick"],
                "impact": item["impact"],
                "is_fake": item["is_fake"]
            })
    events.sort(key=lambda x: x["tick"])
    # Check if a fake event has a subsequent follow-up event in the same session
    for i, ev in enumerate(events):
        ev["has_followup"] = (i < len(events) - 1)
    return events

def build_realistic_curve(open_p, target_p, events, rng):
    n_ticks = 301
    target_log = np.log(target_p / open_p)
    
    if not events:
        # Organic Brownian bridge with natural sine oscillations
        t = np.arange(n_ticks) / 300.0
        # Gentle cyclical wave (period ~100 ticks) so it's not a sterile line
        wave_cycle = 0.0012 * np.sin(2 * np.pi * t * 3.0)
        drift = target_log * t + wave_cycle
    else:
        # Event-driven curve with realistic higher highs & higher lows
        drift = np.zeros(n_ticks, dtype=float)
        wave_shifts = np.zeros(n_ticks, dtype=float)
        
        for ev in events:
            tick = ev["tick"]
            impact = ev["impact"]
            is_fake = ev["is_fake"]
            has_followup = ev["has_followup"]
            
            if is_fake and not has_followup:
                # Fading rumor / trap
                w_len = min(len(FADE_35), n_ticks - tick)
                wave_shifts[tick : tick + w_len] += impact * FADE_35[:w_len]
            else:
                # Multi-wave reaction
                w_len = min(len(WAVE_24), n_ticks - tick)
                wave_shifts[tick : tick + w_len] += impact * WAVE_24[:w_len]
                if tick + w_len < n_ticks:
                    wave_shifts[tick + w_len :] += impact * 1.0

        # Pre-news behavior: price stays near open (n < first event tick)
        first_tick = events[0]["tick"]
        
        # Post-news drift: smoothly connects the post-wave level to target_log by tick 300
        last_ev = events[-1]
        last_settle_tick = min(300, last_ev["tick"] + 24)
        
        final_wave_level = wave_shifts[-1]
        remaining_gap = target_log - final_wave_level
        
        post_drift = np.zeros(n_ticks, dtype=float)
        if last_settle_tick < 300:
            post_t = np.arange(301 - last_settle_tick) / float(300 - last_settle_tick)
            post_drift[last_settle_tick:] = remaining_gap * post_t
        else:
            if abs(final_wave_level) > 1e-6:
                wave_shifts *= (target_log / final_wave_level)
                
        drift = wave_shifts + post_drift

    # Micro noise (higher highs & higher lows texture across all candles)
    noise = rng.normal(0, 0.00032, size=n_ticks)
    noise[0] = 0
    noise_cum = np.cumsum(noise)
    noise_pinned = noise_cum - (np.arange(n_ticks) / 300.0) * noise_cum[-1]
    
    ln_P = np.log(open_p) + drift + noise_pinned
    P_rounded = np.round(np.exp(ln_P) / 0.05) * 0.05
    # Pin exact boundary ticks
    P_rounded[0] = np.round(open_p / 0.05) * 0.05
    P_rounded[-1] = np.round(target_p / 0.05) * 0.05
    return P_rounded

def generate_r1_arrays():
    rng = np.random.Generator(np.random.PCG64(MASTER_SEED))
    records = []
    closing_prices = {}
    
    for g in range(1, 7):
        session_targets = TARGETS[g]
        for ticker, target_pct in session_targets.items():
            # Carry over closing price or use base open
            if ticker in closing_prices:
                # Realistic minor overnight gap (+/- 0.05% to 0.12%)
                overnight_drift = np.clip(rng.normal(0, 0.0006), -0.0015, 0.0015)
                open_price_r = closing_prices[ticker] * (1.0 + overnight_drift)
                open_price_r = np.round(open_price_r / 0.05) * 0.05
            else:
                open_price_r = BASE_PRICES[ticker]
            
            target_p = open_price_r * (1.0 + (target_pct / 100.0))
            events = get_session_events(g, ticker)
            
            P_rounded = build_realistic_curve(open_price_r, target_p, events, rng)
            closing_prices[ticker] = P_rounded[-1]
            
            # Volume profile: baseline + spikes during news events
            base_vol = np.abs(rng.normal(400, 40, size=301)).astype(int)
            for ev in events:
                tick = ev["tick"]
                spike_len = min(25, 301 - tick)
                # Volume surges during news price discovery
                multiplier = np.linspace(3.5, 1.2, spike_len)
                base_vol[tick : tick + spike_len] = (base_vol[tick : tick + spike_len] * multiplier).astype(int)
            
            for n in range(301):
                records.append({
                    "g": g, "ticker": ticker, "n": n,
                    "price_paise": to_paise(P_rounded[n]), "volume": int(base_vol[n])
                })

    df = pd.DataFrame(records)
    parquet_path = os.path.join(DATA_DIR, 'prices_r1.parquet')
    df.to_parquet(parquet_path, index=False)
    
    with open(parquet_path, "rb") as f:
        file_hash = hashlib.sha256(f.read()).hexdigest()
        
    with open(os.path.join(DATA_DIR, 'r1_arrays.sha256'), "w") as f:
        f.write(file_hash)
        
    print(f"[OK] Full R1 arrays generated: {len(df)} ticks across 6 sessions.")
    print("Session 1-2 Sample Continuity for RLNT:")
    s1_rlnt = df[(df['g'] == 1) & (df['ticker'] == 'RLNT')]
    s2_rlnt = df[(df['g'] == 2) & (df['ticker'] == 'RLNT')]
    print(f"  S1 Open: Rs {s1_rlnt.iloc[0]['price_paise']/100:.2f} | S1 Close: Rs {s1_rlnt.iloc[-1]['price_paise']/100:.2f}")
    print(f"  S2 Open: Rs {s2_rlnt.iloc[0]['price_paise']/100:.2f} | S2 Close: Rs {s2_rlnt.iloc[-1]['price_paise']/100:.2f}")
    diff = (s2_rlnt.iloc[0]['price_paise'] - s1_rlnt.iloc[-1]['price_paise']) / 100.0
    print(f"  Overnight Gap: Rs {diff:+.2f} ({(diff / (s1_rlnt.iloc[-1]['price_paise']/100))*100:+.2f}%)")

if __name__ == "__main__":
    generate_r1_arrays()
import os
import hashlib
import numpy as np
import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
MASTER_SEED = 42

def to_paise(rupees): return int(round(rupees * 100))

# Full Session Target Matrix for R1[cite: 4]
TARGETS = {
    1: {"RLNT": 0.8, "TYRL": 0.5, "INFN": 3.0, "HRZN": 2.5, "BZR-V": 1.5, "GOLDCORE": 0.3, "PULSE": 0.5},
    2: {"RLNT": 1.0, "TYRL": 0.4, "INFN": 4.5, "HRZN": 3.5, "BZR-V": -2.0, "GOLDCORE": 0.3, "PULSE": 9.0, "NIMBUS": 6.0},
    3: {"RLNT": 0.5, "TYRL": -0.5, "INFN": 1.0, "HRZN": 1.0, "BZR-V": 2.5, "GOLDCORE": 0.3, "PULSE": -3.0, "NIMBUS": 2.0, "STAPLE": 0.6},
    4: {"RLNT": 2.0, "TYRL": -1.5, "INFN": -2.5, "HRZN": -1.0, "BZR-V": -3.0, "GOLDCORE": 2.8, "PULSE": -4.0, "NIMBUS": -3.0, "STAPLE": 0.2, "VOLTAGE": -9.0},
    5: {"RLNT": -3.0, "TYRL": 1.0, "INFN": 1.5, "HRZN": 1.0, "BZR-V": 2.0, "GOLDCORE": 0.5, "PULSE": 2.0, "NIMBUS": 1.5, "STAPLE": 0.4, "VOLTAGE": 4.0, "CRANE": 5.0},
    6: {"RLNT": -1.0, "TYRL": 0.5, "INFN": 3.0, "HRZN": 2.5, "BZR-V": 5.0, "GOLDCORE": 0.3, "PULSE": 14.0, "NIMBUS": 4.0, "STAPLE": 0.4, "VOLTAGE": 1.0, "CRANE": 2.5}
}

# Base Open Prices
BASE_PRICES = {"RLNT": 2450.0, "TYRL": 880.0, "INFN": 1520.0, "HRZN": 1640.0, "BZR-V": 640.0, "GOLDCORE": 6200.0, "PULSE": 850.0, "NIMBUS": 410.0, "STAPLE": 1180.0, "VOLTAGE": 310.0, "CRANE": 520.0}

def generate_r1_arrays():
    rng = np.random.Generator(np.random.PCG64(MASTER_SEED))
    records = []
    closing_prices = {}
    
    for g in range(1, 7):
        session_targets = TARGETS[g]
        for ticker, target_pct in session_targets.items():
            # Carry over closing price or use base open
            open_price_r = closing_prices.get(ticker, BASE_PRICES[ticker])
            
            D = np.log(1 + (target_pct / 100.0))
            n_ticks = np.arange(301)
            t_seconds = n_ticks.astype(float)
            
            raw_noise = rng.normal(0, 0.0005, size=301)
            raw_noise[0] = 0
            X = np.cumsum(raw_noise)
            X_pinned = X - (n_ticks / 300.0) * X[-1]
            
            ln_P = np.log(open_price_r) + D * (t_seconds / 300.0) + X_pinned
            P_rounded = np.round(np.exp(ln_P) / 0.05) * 0.05
            
            closing_prices[ticker] = P_rounded[-1]
            
            vol = np.abs(rng.normal(500, 50, size=301)).astype(int)
            
            for n in range(301):
                records.append({
                    "g": g, "ticker": ticker, "n": n,
                    "price_paise": to_paise(P_rounded[n]), "volume": vol[n]
                })

    df = pd.DataFrame(records)
    parquet_path = os.path.join(DATA_DIR, 'prices_r1.parquet')
    df.to_parquet(parquet_path, index=False)
    
    with open(parquet_path, "rb") as f:
        file_hash = hashlib.sha256(f.read()).hexdigest()
        
    with open(os.path.join(DATA_DIR, 'r1_arrays.sha256'), "w") as f:
        f.write(file_hash)
        
    print(f"[OK] Full R1 arrays generated: {len(df)} ticks.")

if __name__ == "__main__":
    generate_r1_arrays()
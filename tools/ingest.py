import json
import os
import math

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
os.makedirs(DATA_DIR, exist_ok=True)

# 1. Roster Data (03_INSTRUMENTS_AND_FUNDAMENTALS.md)
INSTRUMENTS = [
    {"ticker": "RELI-X", "name": "Reliant Energy Corp", "sector": "Energy", "live_from": "R1S1", "open_price": 2450.00, "s_i": 1.5, "d_i_pct": 0.60},
    {"ticker": "TATA-Y", "name": "Tyrell Autoworks", "sector": "Infrastructure", "live_from": "R1S1", "open_price": 880.00, "s_i": 0.9, "d_i_pct": 0.40},
    {"ticker": "INFY-Z", "name": "Infinity Systems", "sector": "IT", "live_from": "R1S1", "open_price": 1520.00, "s_i": 1.2, "d_i_pct": 0.50},
    {"ticker": "HDFC-W", "name": "Horizon Commercial Bank", "sector": "Banking", "live_from": "R1S1", "open_price": 1640.00, "s_i": 1.4, "d_i_pct": 0.50},
    {"ticker": "BZR-V", "name": "Bazaar Ventures Media", "sector": "Consumables", "live_from": "R1S1", "open_price": 640.00, "s_i": 1.0, "d_i_pct": 0.30},
    {"ticker": "GOLDCORE", "name": "Goldcore Reserve Trust", "sector": "Safe Haven", "live_from": "R1S1", "open_price": 6200.00, "s_i": 0.6, "d_i_pct": 0.80},
    {"ticker": "PULSE", "name": "Pulsechain Token", "sector": "Digital Assets", "live_from": "R1S1", "open_price": 850.00, "s_i": 1.6, "d_i_pct": 0.25}
    # Note: Expand with remaining 8 instruments for production.
]

# 2. Session Targets Data (R1S1)
SESSION_TARGETS = {
    "R1S1": {
        "RELI-X": 0.8, "TATA-Y": 0.5, "INFY-Z": 3.0, "HDFC-W": 2.5, 
        "BZR-V": 1.5, "GOLDCORE": 0.3, "PULSE": 0.5
    }
}

# 3. News Ledger Data (Sample set to validate Truth Flag Logic)
NEWS_LEDGER = [
    {"id": "R1S1-01", "t": 120, "source": "NP", "event": "E1.1", "implied": "HDFC-W", "dir": 1, "truth_target": False},
    {"id": "R1S1-02", "t": 200, "source": "FF", "event": "E1.2", "implied": "BZR-V", "dir": 1, "truth_target": False}
]

def to_paise(rupees): return int(round(rupees * 100))

def run_ingestion():
    print("Starting Content Pipeline Ingestion...")
    
    # Process Instruments & Convert to BIGINT Paise
    processed_instruments = []
    for inst in INSTRUMENTS:
        inst_copy = inst.copy()
        inst_copy["open_price_paise"] = to_paise(inst["open_price"])
        del inst_copy["open_price"]
        processed_instruments.append(inst_copy)
        
    with open(os.path.join(DATA_DIR, 'instruments.json'), 'w') as f:
        json.dump(processed_instruments, f, indent=2)

    with open(os.path.join(DATA_DIR, 'session_targets.json'), 'w') as f:
        json.dump(SESSION_TARGETS, f, indent=2)

    with open(os.path.join(DATA_DIR, 'news_ledger.json'), 'w') as f:
        json.dump(NEWS_LEDGER, f, indent=2)
        
    print(f"[OK] Master data written to {DATA_DIR}")

if __name__ == "__main__":
    run_ingestion()
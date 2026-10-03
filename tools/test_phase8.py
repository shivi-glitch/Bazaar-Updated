import math
import sys
from backend.core.r2_math import R2InstrumentState

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

def run_c5_test():
    print("--- Verifying Phase 8 Gate C5: Gradual Pull-back ---")
    
    # 1. Setup RELI-X at ₹2450 in a "calm" mood[cite: 9]
    initial_value = 2450.0
    state = R2InstrumentState("RELI-X", initial_value)
    
    # 2. Simulate players pushing the price exactly +5% above true value[cite: 9]
    # We bypass the flow calculation and force the displacement directly.
    pushed_price = initial_value * 1.05
    state.P = pushed_price
    state.dev_s = math.log(pushed_price) - math.log(initial_value) # Seed the EMA
    
    print(f"True Value (F): ₹{initial_value}")
    print(f"Pushed Traded Price (P): ₹{state.P:.2f} (+5%)")
    print("Simulating bot pull-back for 30 seconds (60 ticks)...\n")
    
    max_tick_retrace = 0.0
    prices = []
    
    # 3. Tick loop: 60 ticks with 0 player flow. Bots should pull P down to F.
    for n in range(60):
        old_p = state.P
        new_p = state.tick(F_current=initial_value, A_net_notional=0, active_teams=300, mood="calm")
        prices.append(new_p)
        
        # Track largest single-tick snap
        pct_change = abs(new_p - old_p) / old_p
        if pct_change > max_tick_retrace:
            max_tick_retrace = pct_change
            
        if n in [0, 9, 19, 39, 59]:
            print(f"Tick {n+1:02d} ({float(n+1)/2}s): ₹{new_p:.2f}")
    
    # 4. Calibration Measurements[cite: 9]
    # Retrace is measured against the original 5% gap.
    gap_total = pushed_price - initial_value
    retrace_10s = (pushed_price - prices[19]) / gap_total 
    retrace_25s = (pushed_price - prices[49]) / gap_total 
    
    print("\n--- Gate C5 Results ---")
    print(f"Max single-tick retrace: {max_tick_retrace*100:.3f}% (Threshold: <= 0.35%)")
    print(f"Retraced in 10s: {retrace_10s*100:.1f}% (Threshold: >= 40%)")
    print(f"Retraced in 25s: {retrace_25s*100:.1f}% (Threshold: >= 80%)")
    
    if max_tick_retrace <= 0.0035 and retrace_10s >= 0.40 and retrace_25s >= 0.80:
        print("\n[PASS] Gate C5: Gradual pull-back behaves organically. No snap-backs.")
        print("✓ Phase 8 HARD GATES Complete.")
    else:
        print("\n[FAIL] Gate C5: Bot parameters require recalibration.")

if __name__ == "__main__":
    run_c5_test()
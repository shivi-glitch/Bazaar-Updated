import asyncio
from backend.core.engine import MarketEngine
from backend.core.news_ledger import SCRIPTED_NEWS_DATABASE

async def run_full_r2_test():
    print("=================================================================")
    print("      ROUND 2 FULL ENGINE SIMULATION TEST (SESSIONS 7 TO 11)     ")
    print("=================================================================")
    
    engine = MarketEngine()
    engine._load_and_verify_data()
    
    # Baseline check: R1 Session 6 close simulated
    engine.current_prices = {
        "RLNT": [245000, 1000],
        "TYRL": [88000, 1500],
        "INFN": [152000, 1200],
        "HRZN": [164000, 1100],
        "BZR-V": [64000, 2500],
        "GOLDCORE": [620000, 500],
        "PULSE": [85000, 3000],
        "NIMBUS": [41000, 1000],
        "STAPLE": [118000, 1000],
        "VOLTAGE": [31000, 1000],
        "CRANE": [52000, 1000]
    }

    for g in range(7, 12):
        print(f"\n>>> STARTING SESSION {g} <<<")
        await engine.start_session(g)
        engine.session_states[g] = "RUNNING"
        
        session_news = [item for item in SCRIPTED_NEWS_DATABASE if item["g"] == g]
        print(f"Session {g} loaded with {len(session_news)} scripted news events.")

        open_prices = {t: data[0] / 100.0 for t, data in engine.current_prices.items()}
        print(f"Session {g} Open: RLNT={open_prices.get('RLNT', 0):.2f}, HRZN={open_prices.get('HRZN', 0):.2f}, PULSE={open_prices.get('PULSE', 0):.2f}")

        # Simulate 200 ticks per session
        for tick in range(1, 201):
            engine.n = tick
            
            # Simulate a player pump in Session 7 between ticks 30 and 35 on PULSE
            if g == 7 and 30 <= tick <= 34:
                engine.register_flow("PULSE", 15_00_000.0, "BUY") # ₹15 Lakhs buy per tick

            # Advance shocks & check news
            engine.apply_active_shocks()
            await engine.check_and_dispatch_scripted_news()

            # Execute R2 math tick
            current_mood = "calm"
            if g == 7: current_mood = "tense"
            elif g in [8, 9]: current_mood = "panic"
            elif g == 10: current_mood = "recovery"
            elif g == 11: current_mood = "calm"

            for ticker, state in engine.r2_states.items():
                net_flow = engine.flow_buffer.get(ticker, 0.0)
                engine.flow_buffer[ticker] = 0.0

                new_p = state.tick(
                    F_current=engine.r2_f_values[ticker],
                    A_net_notional=net_flow,
                    mood=current_mood,
                    dt=1.5
                )
                engine.current_prices[ticker] = [int(new_p * 100), 1000]

            # Print milestones
            if tick in [15, 40, 75, 100, 150, 200]:
                rlnt_p = engine.current_prices["RLNT"][0] / 100.0
                hrzn_p = engine.current_prices["HRZN"][0] / 100.0
                pulse_p = engine.current_prices["PULSE"][0] / 100.0
                gold_p = engine.current_prices["GOLDCORE"][0] / 100.0
                print(f"  [S{g} Tick {tick:03d}] RLNT={rlnt_p:7.2f} | HRZN={hrzn_p:7.2f} | PULSE={pulse_p:7.2f} | GOLDCORE={gold_p:7.2f}")

        close_prices = {t: data[0] / 100.0 for t, data in engine.current_prices.items()}
        print(f"Session {g} Close: RLNT={close_prices.get('RLNT', 0):.2f}, HRZN={close_prices.get('HRZN', 0):.2f}, PULSE={close_prices.get('PULSE', 0):.2f}")
        engine.session_states[g] = "FINISHED"

    print("\n=================================================================")
    print("      ALL ROUND 2 SESSIONS (7-11) SIMULATED SUCCESSFULLY!        ")
    print("=================================================================")

if __name__ == "__main__":
    asyncio.run(run_full_r2_test())

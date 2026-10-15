import os
import time
import json
import uuid
import asyncio
import hashlib
import random
from typing import Optional, Dict, Any, List
import pandas as pd
from sqlalchemy import select, update

from backend.database import AsyncSessionLocal
from backend.models import StatPurchase, Team, SessionBlock
from backend.core.news_ledger import SCRIPTED_NEWS_DATABASE
from backend.core.r2_math import R2InstrumentState
from backend.core.liquidity import LiquidityBots

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'data')

class MarketEngine:
    def __init__(self):
        self.current_g: int = 1
        self.n: int = 0
        self.session_states: Dict[int, str] = {i: "LOCKED" for i in range(1, 12)}
        self.session_states[1] = "READY"
        self.r2_unlocked: bool = False
        self.is_frozen: bool = False
        
        self.t0: Optional[float] = None
        
        self.price_table: Dict[int, Dict[int, Dict[str, list]]] = {}
        self.current_prices: Dict[str, list] = {}
        self.news_ledger: List[dict] = []
        self.delivered_news: set = set()
        self.active_shocks: List[dict] = []  # Tracks impacts spreading over 2-8 ticks
        
        # Phase 9: Round 2 Live State
        self.r2_states: Dict[str, R2InstrumentState] = {}
        self.r2_f_values: Dict[str, float] = {}
        self.flow_buffer: Dict[str, float] = {} 
        
        self.ws_manager = None
        self._start_task: Optional[asyncio.Task] = None
        
        self._load_and_verify_data()

    def set_ws_manager(self, manager):
        self.ws_manager = manager

    async def sync_state_from_db(self):
        """Called once on startup to load or initialize DB state."""
        async with AsyncSessionLocal() as db:
            res = await db.execute(select(SessionBlock).order_by(SessionBlock.g))
            blocks = res.scalars().all()
            
            if not blocks:
                for i in range(1, 12):
                    r_num = 1 if i < 7 else 2
                    state = "READY" if i == 1 else "LOCKED"
                    db.add(SessionBlock(g=i, round_num=r_num, state=state))
                await db.commit()
                self.session_states = {i: "LOCKED" for i in range(1, 12)}
                self.session_states[1] = "READY"
                self.current_g = 1
                self.n = 0
            else:
                for b in blocks:
                    self.session_states[b.g] = b.state
                
                # Determine current active session
                self.current_g = 1
                for i in range(1, 12):
                    if self.session_states[i] in ["STARTING", "RUNNING", "PAUSED", "READY"]:
                        self.current_g = i
                        break
                
                self.r2_unlocked = (self.session_states.get(7) != "LOCKED")
                self.n = 0 # Restart tick counter after crash

    async def _update_db_state(self, g: int, state: str):
        async with AsyncSessionLocal() as db:
            await db.execute(update(SessionBlock).where(SessionBlock.g == g).values(state=state))
            await db.commit()
        
    def register_flow(self, ticker: str, notional_rupees: float, side: str):
        """Accumulates live player flow to impact Round 2 prices."""
        if ticker not in self.flow_buffer:
            self.flow_buffer[ticker] = 0.0
        if side == "BUY":
            self.flow_buffer[ticker] += notional_rupees
        elif side == "SELL":
            self.flow_buffer[ticker] -= notional_rupees

    def _load_and_verify_data(self):
        parquet_path = os.path.join(DATA_DIR, 'prices_r1.parquet')
        if os.path.exists(parquet_path):
            df = pd.read_parquet(parquet_path)
            for _, row in df.iterrows():
                g, n, ticker = int(row['g']), int(row['n']), str(row['ticker'])
                p, v = int(row['price_paise']), int(row['volume'])
                if g not in self.price_table:
                    self.price_table[g] = {}
                if n not in self.price_table[g]:
                    self.price_table[g][n] = {}
                self.price_table[g][n][ticker] = [p, v]
        news_path = os.path.join(DATA_DIR, 'news_ledger.json')
        if os.path.exists(news_path):
            with open(news_path, 'r') as f:
                self.news_ledger = json.load(f)

        # Ensure Round 1 Session 1 assets are ready as baseline so teams can view all stocks before R1 starts
        if not self.current_prices:
            r1_s1 = self.price_table.get(1, {}).get(0, {})
            if r1_s1:
                self.current_prices = dict(r1_s1)

    def get_live_or_initial_prices(self) -> Dict[str, list]:
        """Returns live prices if session is running, or initial baseline for Round 1 Session 1."""
        if self.current_prices:
            return dict(self.current_prices)
        r1_s1 = self.price_table.get(1, {}).get(0, {})
        if r1_s1:
            return dict(r1_s1)
        return {
            "RELI-X": [245000, 1000],
            "INFY-Z": [152000, 1200],
            "HDFC-W": [168000, 1100],
            "BZR-V": [32000, 2500],
            "PULSE": [11500, 3000],
            "GOLDCORE": [620000, 500],
            "TATA-Y": [98000, 1500]
        }

    def get_current_session_state(self, g: Optional[int] = None) -> str:
        target_g = g if g is not None else self.current_g
        return self.session_states.get(target_g, "LOCKED")

    async def broadcast_state(self, g: int, state: str):
        if self.ws_manager:
            prices = self.get_live_or_initial_prices()
            await self.ws_manager.broadcast({
                "type": "session",
                "g": g,
                "n": self.n,
                "state": state,
                "prices": prices
            })

    async def start_session(self, g: int):
        if self.is_frozen: raise ValueError("market_frozen")
        self.current_g = g
        self.n = 0
        self.session_states[g] = "STARTING"
        
        # Immediately prepare baseline prices for this session
        if g < 7:
            g_data = self.price_table.get(g, {})
            if 0 in g_data:
                self.current_prices = dict(g_data[0])
        else:
            if not self.r2_states:
                base_prices = {"RELI-X": 2450.0, "TATA-Y": 880.0, "INFY-Z": 1520.0, "HDFC-W": 1640.0, "BZR-V": 640.0, "GOLDCORE": 6200.0, "PULSE": 850.0, "NIMBUS": 410.0, "STAPLE": 1180.0, "VOLTAGE": 310.0, "CRANE": 520.0}
                for t, def_p in base_prices.items():
                    # Inherit prior session close if available, else fallback to baseline
                    p = (self.current_prices[t][0] / 100.0) if t in self.current_prices else def_p
                    self.r2_states[t] = R2InstrumentState(t, p)
                    self.r2_f_values[t] = p
                    self.flow_buffer[t] = 0.0

            # Unlock new R2 instruments on their respective sessions
            if g >= 8 and "APEX" not in self.r2_states:
                self.r2_states["APEX"] = R2InstrumentState("APEX", 740.0)
                self.r2_f_values["APEX"] = 740.0
                self.flow_buffer["APEX"] = 0.0
                self.current_prices["APEX"] = [74000, 1000]

            if g >= 9 and "LEDGER" not in self.r2_states:
                self.r2_states["LEDGER"] = R2InstrumentState("LEDGER", 1900.0)
                self.r2_f_values["LEDGER"] = 1900.0
                self.flow_buffer["LEDGER"] = 0.0
                self.current_prices["LEDGER"] = [190000, 1000]

            if g >= 10 and "FORGE" not in self.r2_states:
                self.r2_states["FORGE"] = R2InstrumentState("FORGE", 1260.0)
                self.r2_f_values["FORGE"] = 1260.0
                self.flow_buffer["FORGE"] = 0.0
                self.current_prices["FORGE"] = [126000, 1000]

            if not self.current_prices or any(t not in self.current_prices for t in self.r2_states):
                self.current_prices = {
                    t: [int(s.current_price * 100), random.randint(200, 800)]
                    for t, s in self.r2_states.items()
                }

        # Record initial session baseline prices into price_table
        if g not in self.price_table:
            self.price_table[g] = {}
        if 0 not in self.price_table[g]:
            self.price_table[g][0] = {t: [d[0], d[1]] for t, d in self.current_prices.items()}

        await self._update_db_state(g, "STARTING")
        await self.broadcast_state(g, "STARTING")
        self._start_task = asyncio.create_task(self._complete_starting_sync(g))
        return {"status": "STARTING", "g": g}

    async def _complete_starting_sync(self, g: int):
        try:
            await asyncio.sleep(3.0)
            if self.session_states.get(g) == "STARTING":
                self.session_states[g] = "RUNNING"
                await self._update_db_state(g, "RUNNING")
                self.t0 = time.time()
                await self.broadcast_state(g, "RUNNING")
        except asyncio.CancelledError:
            pass

    async def pause_session(self, g: int):
        self.session_states[g] = "PAUSED"
        await self._update_db_state(g, "PAUSED")
        await self.broadcast_state(g, "PAUSED")
        return {"status": "PAUSED"}

    async def resume_session(self, g: int):
        if self.is_frozen: raise ValueError("market_frozen")
        self.session_states[g] = "RUNNING"
        await self._update_db_state(g, "RUNNING")
        await self.broadcast_state(g, "RUNNING")
        return {"status": "RUNNING"}

    async def _record_round2_snapshots(self, g: int):
        try:
            from backend.models import TeamLedger, Position, EquitySnapshot
            from backend.core.scoring import calculate_equity_paise
            async with AsyncSessionLocal() as db:
                teams_res = await db.execute(select(Team))
                teams = teams_res.scalars().all()
                ledgers_res = await db.execute(select(TeamLedger))
                ledgers = {l.team_id: l for l in ledgers_res.scalars().all()}
                pos_res = await db.execute(select(Position))
                positions = pos_res.scalars().all()
                team_positions = {}
                for p in positions:
                    team_positions.setdefault(p.team_id, []).append(p)
                live_prices = {t: d[0] for t, d in self.current_prices.items()}
                now_ts = int(time.time())
                for t in teams:
                    if t.eliminated:
                        eq = 0
                    else:
                        cash = ledgers[t.id].cash_paise if t.id in ledgers else 1000000000
                        pos_list = team_positions.get(t.id, [])
                        eq = calculate_equity_paise(cash, pos_list, live_prices)
                    snap = EquitySnapshot(
                        team_id=t.id,
                        round_num=2,
                        session_g=g,
                        tick_n=self.n,
                        label=f"S{g}",
                        equity_paise=eq,
                        created_at=now_ts
                    )
                    db.add(snap)
                await db.commit()
        except Exception as e:
            print(f"Error recording equity snapshots for session {g}: {e}")

    async def end_session(self, g: int):
        self.session_states[g] = "FINISHED"
        await self._update_db_state(g, "FINISHED")
        if g < 11: 
            self.session_states[g + 1] = "READY"
            await self._update_db_state(g + 1, "READY")
        await self.broadcast_state(g, "FINISHED")
        if g >= 7:
            asyncio.create_task(self._record_round2_snapshots(g))
        return {"status": "FINISHED"}

    async def unlock_round2(self):
        self.r2_unlocked = True
        self.session_states[7] = "READY"
        await self._update_db_state(7, "READY")
        await self.broadcast_state(7, "READY")
        return {"status": "ROUND_2_UNLOCKED"}

    async def freeze(self):
        self.is_frozen = True
        if self.session_states.get(self.current_g) == "RUNNING":
            self.session_states[self.current_g] = "PAUSED"
            await self.broadcast_state(self.current_g, "PAUSED")
        return {"status": "FROZEN"}

    async def unfreeze(self):
        self.is_frozen = False
        await self.broadcast_state(self.current_g, self.get_current_session_state())
        return {"status": "UNFROZEN"}

    async def reset_event(self):
        self.current_g = 1
        self.n = 0
        self.r2_unlocked = False
        self.is_frozen = False
        self.session_states = {i: "LOCKED" for i in range(1, 12)}
        self.session_states[1] = "READY"
        
        async with AsyncSessionLocal() as db:
            for i in range(1, 12):
                state = "READY" if i == 1 else "LOCKED"
                await db.execute(update(SessionBlock).where(SessionBlock.g == i).values(state=state))
            await db.commit()
            
        self.price_table.clear()
        self.r2_states.clear()
        self.delivered_news.clear()
        self.active_shocks.clear()
        self._load_and_verify_data()
        await self.broadcast_state(1, "READY")
        if self.ws_manager:
            await self.ws_manager.broadcast({
                "type": "reset",
                "g": 1,
                "n": 0,
                "state": "READY",
                "prices": self.get_live_or_initial_prices()
            })
        return {"status": "RESET"}

    async def jump_to(self, target_g: int):
        """God Mode: Forces the engine to a specific session state for testing."""
        self.current_g = target_g
        self.n = 0
        self.r2_unlocked = (target_g >= 7)
        self.is_frozen = False
        
        for i in range(1, target_g):
            self.session_states[i] = "FINISHED"
        self.session_states[target_g] = "READY"
        for i in range(target_g + 1, 12):
            self.session_states[i] = "LOCKED"
            
        async with AsyncSessionLocal() as db:
            for i in range(1, target_g):
                await db.execute(update(SessionBlock).where(SessionBlock.g == i).values(state="FINISHED"))
            await db.execute(update(SessionBlock).where(SessionBlock.g == target_g).values(state="READY"))
            for i in range(target_g + 1, 12):
                await db.execute(update(SessionBlock).where(SessionBlock.g == i).values(state="LOCKED"))
            await db.commit()
            
        self.delivered_news.clear()
        self.price_table.clear()
        self.r2_states.clear()
        self.active_shocks.clear()
        self._load_and_verify_data()
        
        await self.broadcast_state(target_g, "READY")
        return {"status": "JUMPED", "g": target_g}

    def get_price_history(self, up_to_g: Optional[int] = None, up_to_n: Optional[int] = None) -> Dict[str, list]:
        """
        Returns continuous historical price points for all instruments across sessions:
        { ticker: [{"time": (g - 1) * 201 + min(200, n), "value": price_paise, "volume": volume}, ...] }
        """
        target_g = up_to_g if up_to_g is not None else self.current_g
        target_n = up_to_n if up_to_n is not None else self.n
        history: Dict[str, list] = {}

        for g in sorted(self.price_table.keys()):
            if g > target_g:
                break
            g_data = self.price_table[g]
            for n in sorted(g_data.keys()):
                if n > 200:
                    continue
                if g == target_g and n > target_n:
                    break
                continuous_t = (g - 1) * 201 + n
                for ticker, p_data in g_data[n].items():
                    if ticker not in history:
                        history[ticker] = []
                    history[ticker].append({
                        "time": continuous_t,
                        "value": p_data[0],
                        "volume": p_data[1]
                    })
        return history

    async def inject_live_news(self, news_item: dict):
        """Allows Admins to fire custom, unscripted news on the fly."""
        self.news_ledger.append(news_item)
        if self.ws_manager:
            asyncio.create_task(self.ws_manager.dispatch_targeted_news(news_item))
        return {"status": "FIRED"}

    async def get_upgraded_research_teams(self):
        """Fetches a list of team IDs that possess Research Level 2 or 3."""
        teams_with_l2 = []
        async with AsyncSessionLocal() as db:
            res = await db.execute(select(StatPurchase))
            purchases = res.scalars().all()
            for p in purchases:
                if (getattr(p, "research", 0) >= 2) or (getattr(p, "stat", "") == "Research" and getattr(p, "level", 0) >= 2):
                    teams_with_l2.append(p.team_id)
            res2 = await db.execute(select(Team))
            for t in res2.scalars().all():
                if (t.research_level or 0) >= 2:
                    teams_with_l2.append(t.id)
        return list(set(teams_with_l2))

    async def check_and_dispatch_scripted_news(self):
        """Handles 9-second early leaks and queues multi-tick price shocks."""
        for item in SCRIPTED_NEWS_DATABASE:
            if item["g"] != self.current_g:
                continue
                
            public_tick = item["public_tick"]
            early_tick = public_tick - 6

            news_payload = {
                "id": f"{self.current_g}-{public_tick}",
                "source": item["source"],
                "ticker": item["ticker"],
                "text": item["text"],
                "impact": item["impact"],
                "is_fake": item["is_fake"]
            }

            # 1. EARLY LEAK DISPATCH
            if self.n == early_tick:
                privileged_teams = await self.get_upgraded_research_teams()
                if self.ws_manager and privileged_teams:
                    await self.ws_manager.broadcast_to_specific_teams(privileged_teams, {
                        "type": "news", **news_payload
                    })
            
            # 2. PUBLIC DISPATCH & QUEUE SHOCK
            elif self.n == public_tick:
                self.news_ledger.append(news_payload)
                
                if self.ws_manager:
                    await self.ws_manager.dispatch_targeted_news(news_payload)
                
                # Instead of instantly changing the price, queue a smooth shock
                if item["impact"] != 0:
                    duration_ticks = random.randint(2, 8)
                    impact_per_tick = item["impact"] / duration_ticks
                    
                    if item["ticker"] == "GLOBAL":
                        # Broad macroeconomic shock applies across active non-safe-haven instruments
                        for t in list(self.current_prices.keys()):
                            if t != "GOLDCORE":
                                self.active_shocks.append({
                                    "ticker": t,
                                    "impact_per_tick": impact_per_tick,
                                    "ticks_remaining": duration_ticks,
                                    "volume_boost": 3.0
                                })
                    elif item["ticker"] in self.current_prices:
                        self.active_shocks.append({
                            "ticker": item["ticker"],
                            "impact_per_tick": impact_per_tick,
                            "ticks_remaining": duration_ticks,
                            "volume_boost": 3.5
                        })

    def apply_active_shocks(self):
        """Runs every single tick to smoothly apply fractional price changes."""
        still_active = []
        for shock in self.active_shocks:
            if shock["ticks_remaining"] > 0:
                ticker = shock["ticker"]
                if ticker in self.current_prices:
                    current_paise, vol = self.current_prices[ticker]
                    
                    # Apply just a fraction of the total news impact this tick
                    new_paise = int(current_paise * (1.0 + shock["impact_per_tick"]))
                    new_vol = int(vol * shock["volume_boost"])
                    
                    self.current_prices[ticker] = [max(100, new_paise), new_vol]
                    if ticker in self.r2_states:
                        self.r2_states[ticker].P = new_paise / 100.0
                        self.r2_f_values[ticker] = new_paise / 100.0
                
                shock["ticks_remaining"] -= 1
                if shock["ticks_remaining"] > 0:
                    still_active.append(shock)
                
        self.active_shocks = still_active

    async def run_loop(self):
        last_tick_time = time.perf_counter()
        while True:
            state = self.session_states.get(self.current_g)
            if state == "RUNNING" and not self.is_frozen:
                next_time = last_tick_time + 1.5
                now = time.perf_counter()
                await asyncio.sleep(max(0.0, next_time - now))
                last_tick_time = time.perf_counter()
                
                if self.session_states.get(self.current_g) != "RUNNING" or self.is_frozen:
                    continue
                    
                # R1: Deterministic Engine
                if self.current_g < 7:
                    g_data = self.price_table.get(self.current_g, {})
                    if self.n in g_data:
                        self.current_prices = g_data[self.n]
                
                # R2: Live Mathematical Simulation
                else:
                    if not self.r2_states:
                        base_prices = {"RELI-X": 2450.0, "TATA-Y": 880.0, "INFY-Z": 1520.0, "HDFC-W": 1640.0, "BZR-V": 640.0, "GOLDCORE": 6200.0, "PULSE": 850.0, "NIMBUS": 410.0, "STAPLE": 1180.0, "VOLTAGE": 310.0, "CRANE": 520.0}
                        for t, def_p in base_prices.items():
                            p = (self.current_prices[t][0] / 100.0) if t in self.current_prices else def_p
                            self.r2_states[t] = R2InstrumentState(t, p)
                            self.r2_f_values[t] = p
                            self.flow_buffer[t] = 0.0

                    # Dynamic market mood based on session
                    current_mood = "calm"
                    if self.current_g == 7:
                        current_mood = "tense"
                    elif self.current_g in [8, 9]:
                        current_mood = "panic"
                    elif self.current_g == 10:
                        current_mood = "recovery"
                    elif self.current_g == 11:
                        current_mood = "calm"
                            
                    for ticker, state in self.r2_states.items():
                        # Micro Brownian motion so the market breathes organically
                        self.r2_f_values[ticker] *= (1 + random.gauss(0, 0.00015))
                        
                        # Extract the aggregated player flow over the last 1.0s
                        net_flow = self.flow_buffer.get(ticker, 0.0)
                        self.flow_buffer[ticker] = 0.0 
                        
                        new_p = state.tick(
                            F_current=self.r2_f_values[ticker],
                            A_net_notional=net_flow,
                            active_teams=300, 
                            mood=current_mood
                        )
                        self.current_prices[ticker] = [int(new_p * 100), random.randint(200, 800)]
                
                # 1. Apply ongoing momentum from previous news
                self.apply_active_shocks()

                # 2. Check if new news needs to be fired today / queue new shocks
                await self.check_and_dispatch_scripted_news()

                # 3. Broadcast prices via websocket
                prices_payload = {}
                for ticker, data in self.current_prices.items():
                    current_paise = data[0]
                    current_vol = data[1]
                    
                    # 1. INJECT CONTINUOUS STOCHASTIC DRIFT (The "Heartbeat")
                    # Default micro-volatility range (+/- 0.1%)
                    noise_limit = 0.001 
                    
                    # Apply asset-specific multipliers based on their fundamental Beta
                    if ticker in ["BZR-V", "PULSE"]:
                        noise_limit = 0.0035  # Highly volatile, wide swings
                    elif ticker in ["INFY-Z", "HDFC-W"]:
                        noise_limit = 0.0015  # Trending, moderate noise
                    elif ticker == "GOLDCORE":
                        noise_limit = 0.0004  # Safe haven, very tight noise
                    
                    # Generate the random walk percentage for this specific tick
                    drift_percent = random.uniform(-noise_limit, noise_limit)
                    
                    # Apply the drift and add baseline bot volume
                    current_paise = int(current_paise * (1.0 + drift_percent))
                    
                    # Generate a baseline "background" volume so the volume bars aren't empty
                    background_vol = random.randint(100, 500)
                    volume = max(background_vol, current_vol)
                    
                    # Update the engine's state (preserve shock volume if it's currently spiking)
                    self.current_prices[ticker] = [current_paise, volume]

                    # Record into price_table for continuous historical chart continuity
                    if self.current_g not in self.price_table:
                        self.price_table[self.current_g] = {}
                    if self.n not in self.price_table[self.current_g]:
                        self.price_table[self.current_g][self.n] = {}
                    self.price_table[self.current_g][self.n][ticker] = [current_paise, volume]
                    
                    # Determine if news bots need to react
                    active_impact = 0.0
                    for shock in self.active_shocks:
                        if shock["ticker"] == ticker:
                            active_impact = shock["impact_per_tick"]
                    
                    # Generate the live limit order book
                    bids, asks = LiquidityBots.generate_order_book(current_paise, active_impact)
                    
                    # Append the DOM arrays to the standard price payload
                    prices_payload[ticker] = [current_paise, volume, bids, asks]

                if self.ws_manager:
                    await self.ws_manager.broadcast({
                        "type": "tick", "g": self.current_g, "n": self.n, "prices": prices_payload
                    })

                self.n += 1
                if self.n > 200:
                    await self.end_session(self.current_g)
            else:
                last_tick_time = time.perf_counter()
                await asyncio.sleep(0.05)

engine_app = MarketEngine()
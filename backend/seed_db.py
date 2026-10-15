import asyncio
import json
import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
import sys
sys.path.insert(0, os.path.dirname(__file__))

from models import Instrument, SessionBlock, Team, TeamLedger, Base
from core.security import hash_pin
from database import AsyncSessionLocal, engine

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')

async def seed():
    print("Starting database seed...")
    with open(os.path.join(DATA_DIR, 'instruments.json'), 'r') as f:
        instruments_data = json.load(f)

    async with AsyncSessionLocal() as session:
        # 1. Seed Instruments
        for data in instruments_data:
            inst = Instrument(
                ticker=data["ticker"],
                name=data["name"],
                sector=data["sector"],
                open_price_paise=data["open_price_paise"]
            )
            await session.merge(inst)
            
        # 2. Seed Session Blocks (g1 to g11)
        for g in range(1, 12):
            round_num = 1 if g <= 6 else 2
            state = "READY" if g == 1 else "LOCKED"
            block = SessionBlock(g=g, round_num=round_num, state=state)
            await session.merge(block)
            
        # 3. Seed Default Test Teams (T001 - T010)
        default_pin = "796688"
        pin_h = hash_pin(default_pin)
        for i in range(1, 11):
            t_id = f"T{i:03d}"
            team = Team(id=t_id, name=f"Team {i}", pin=default_pin, pin_hash=pin_h)
            await session.merge(team)
            ledger = TeamLedger(team_id=t_id, cash_paise=100000000)
            await session.merge(ledger)

        await session.commit()
    print("[OK] Database seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed())
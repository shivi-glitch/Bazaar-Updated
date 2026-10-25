import asyncio
import os
import sys
from sqlalchemy import text
from dotenv import load_dotenv

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(__file__))

# Load backend/.env
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)

from database import engine

async def reset_clean():
    print("=" * 60)
    print("🧹 BAZAAR DATABASE PURGE & RESET TOOL")
    print("=" * 60)
    print("Connecting to database...")

    async with engine.connect() as conn:
        print("\n1. Wiping player, trading, and team data...")
        await conn.execute(text("""
            TRUNCATE TABLE 
                teams, 
                team_ledger, 
                positions, 
                orders, 
                stat_purchases, 
                leaderboard_snapshots, 
                equity_snapshots 
            CASCADE;
        """))
        print("   [PURGED] teams, team_ledger, positions, orders, stat_purchases, snapshots wiped clean.")

        print("\n2. Resetting Session Blocks (g1 to g11)...")
        for g in range(1, 12):
            round_num = 1 if g <= 6 else 2
            state = "READY" if g == 1 else "LOCKED"
            await conn.execute(text("""
                INSERT INTO sessions (g, round_num, state, t0, running_seconds)
                VALUES (:g, :round_num, :state, NULL, 0)
                ON CONFLICT (g) DO UPDATE 
                SET state = :state, t0 = NULL, running_seconds = 0;
            """), {"g": g, "round_num": round_num, "state": state})
        
        await conn.commit()
        print("   [OK] Session g1 set to READY. Sessions g2-g11 set to LOCKED.")

        print("\n3. Verifying playable Stock data (instruments)...")
        result = await conn.execute(text("SELECT count(*) FROM instruments;"))
        count = result.scalar()
        print(f"   [PRESERVED] {count} playable stocks/instruments remain untouched.")

    print("\n" + "=" * 60)
    print("✨ DATABASE SUCCESSFULLY RESET!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(reset_clean())

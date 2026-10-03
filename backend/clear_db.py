import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_async_engine(DATABASE_URL, echo=False)

async def clear_db():
    print("Clearing tables...")
    async with engine.begin() as conn:
        await conn.execute(text("TRUNCATE TABLE teams CASCADE;"))
        await conn.execute(text("TRUNCATE TABLE team_ledger CASCADE;"))
        await conn.execute(text("TRUNCATE TABLE positions CASCADE;"))
        await conn.execute(text("TRUNCATE TABLE orders CASCADE;"))
        await conn.execute(text("TRUNCATE TABLE leaderboard_snapshots CASCADE;"))
        await conn.execute(text("TRUNCATE TABLE stat_purchases CASCADE;"))
    print("[OK] Tables cleared successfully.")

if __name__ == "__main__":
    asyncio.run(clear_db())

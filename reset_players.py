import asyncio
from sqlalchemy import text
from backend.database import engine

async def reset_player_data():
    print("Connecting to Render database to purge player data...")
    
    # Tables to wipe clean
    tables = [
        "orders",
        "positions", 
        "team_ledger",
        "stat_purchases",
        "leaderboard_snapshots",
        "teams"
    ]
    
    async with engine.begin() as conn:
        for table in tables:
            print(f"   Deleting all records from '{table}'...")
            await conn.execute(text(f"DELETE FROM {table}"))
            
    print("Successfully purged all player data!")
    print("Game mechanics (instruments, sessions) were NOT touched.")

if __name__ == "__main__":
    asyncio.run(reset_player_data())

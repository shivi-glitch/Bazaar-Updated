import asyncio
from sqlalchemy import update
from backend.database import AsyncSessionLocal
from backend.models import Team
from backend.core.security import hash_pin

async def reset_t001_pin():
    async with AsyncSessionLocal() as db:
        new_pin = "123456"
        hashed = hash_pin(new_pin)
        
        # Update T001 with the new known PIN
        result = await db.execute(
            update(Team).where(Team.id == "T001").values(pin_hash=hashed)
        )
        await db.commit()
        
        if result.rowcount > 0:
            print(f"[SUCCESS] Team T001 PIN successfully reset to: {new_pin}")
        else:
            print("[FAIL] Team T001 not found. Did you run the generation script?")

if __name__ == "__main__":
    asyncio.run(reset_t001_pin())
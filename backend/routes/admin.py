import os
import time
import random
import string
import asyncio
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete

from backend.database import AsyncSessionLocal
from backend.models import Team, TeamLedger
from backend.core.security import hash_pin, verify_admin

router = APIRouter(prefix="/admin", tags=["admin"])

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

def generate_single_team(i: int):
    team_id = f"T{i:03d}"
    pin = ''.join(random.choices(string.digits, k=6))
    hashed = hash_pin(pin)
    return team_id, pin, hashed

@router.post("/teams/generate", dependencies=[Depends(verify_admin)])
async def generate_teams(num_teams: int = 300, db: AsyncSession = Depends(get_db)):
    # Limit number of teams based on request
    count = min(num_teams, 300)
    
    # Process sequentially in small chunks so we don't completely freeze the 0.1vCPU Render instance
    results = []
    for i in range(1, count + 1):
        # We await each thread one by one (or in small batches) to yield to the event loop
        res = await asyncio.to_thread(generate_single_team, i)
        results.append(res)
        await asyncio.sleep(0.01)  # Yield explicitly to keep server responsive to other requests

    teams = []
    ledgers = []
    plain_credentials = []
    created_time = int(time.time())
    
    for team_id, pin, hashed in results:
        teams.append(Team(
            id=team_id,
            name=f"Team {int(team_id[1:])}",
            pin=pin,
            pin_hash=hashed,
            created_at=created_time
        ))
        ledgers.append(TeamLedger(
            team_id=team_id,
            cash_paise=100000000 # 10 Lakhs INR
        ))
        plain_credentials.append({"team_id": team_id, "pin": pin})
        
    await db.execute(delete(TeamLedger))
    await db.execute(delete(Team))
    db.add_all(teams)
    db.add_all(ledgers)
    await db.commit()
    
    return {"message": "300 teams generated", "teams": plain_credentials}
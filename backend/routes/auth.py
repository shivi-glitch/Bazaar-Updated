from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import time

from backend.database import AsyncSessionLocal
from backend.models import Team
from backend.core.security import verify_pin, create_access_token, login_attempts

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    team_id: str
    pin: str

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Brute-force lockout check (Gate G3.4)
    attempt_info = login_attempts.get(req.team_id, {"fails": 0, "lock_until": 0})
    if time.time() < attempt_info["lock_until"]:
        raise HTTPException(status_code=429, detail="Locked out. Try again later.")

    clean_id = req.team_id.strip().lower()
    result = await db.execute(select(Team).where(func.lower(Team.id) == clean_id))
    team = result.scalar_one_or_none()

    if not team or not verify_pin(req.pin, team.pin_hash):
        attempt_info["fails"] += 1
        if attempt_info["fails"] >= 5:
            attempt_info["lock_until"] = time.time() + 60  # 60s lockout[cite: 9]
        login_attempts[req.team_id] = attempt_info
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Success: reset fails
    login_attempts.pop(req.team_id, None)
    
    token = create_access_token({"sub": team.id, "role": "participant"})
    return {"token": token}
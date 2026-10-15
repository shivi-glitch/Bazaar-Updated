from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import time

from backend.database import AsyncSessionLocal
from backend.models import Team
from backend.core.security import verify_pin, create_access_token, login_attempts
from backend.core.trading import check_login_rate_limit

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    team_id: str
    pin: str

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    clean_id = req.team_id.strip().lower()

    # 1. Brute-force lockout check (Gate G3.4)
    attempt_info = login_attempts.get(clean_id, {"fails": 0, "lock_until": 0})
    if time.time() < attempt_info["lock_until"]:
        remaining = int(attempt_info["lock_until"] - time.time())
        raise HTTPException(status_code=429, detail=f"Locked out due to repeated failures. Try again in {remaining}s.")

    # 2. Rapid-fire rate limiting to prevent bcrypt CPU exhaustion DDoS
    if not check_login_rate_limit(clean_id):
        raise HTTPException(status_code=429, detail="Too many login attempts. Please wait a moment.")

    result = await db.execute(select(Team).where(func.lower(Team.id) == clean_id))
    team = result.scalar_one_or_none()

    if not team or not verify_pin(req.pin, team.pin_hash):
        attempt_info["fails"] += 1
        if attempt_info["fails"] >= 5:
            attempt_info["lock_until"] = time.time() + 60  # 60s lockout
        login_attempts[clean_id] = attempt_info
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Success: reset fails
    login_attempts.pop(clean_id, None)
    
    token = create_access_token({"sub": team.id, "role": "participant"})
    return {"token": token}
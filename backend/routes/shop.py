from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import jwt
from backend.core.security import SECRET_KEY, ALGORITHM

from backend.database import AsyncSessionLocal
from backend.models import Team, TeamLedger, StatPurchase
from backend.core.engine import engine_app

router = APIRouter(prefix="/stats", tags=["shop"])

# Stat Costs in integer paise (₹1 = 100 paise)[cite: 7]
STAT_COSTS = {
    "Research": {1: 20000000, 2: 50000000, 3: 100000000},
    "Capital": {1: 30000000, 2: 80000000},
    "Speed": {1: 20000000, 2: 40000000, 3: 80000000}
}

class ShopRequest(BaseModel):
    stat: str
    level: int

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def get_current_team(authorization: str = Header(...), db: AsyncSession = Depends(get_db)):
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        team_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    if not team_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    result = await db.execute(select(Team).where(func.lower(Team.id) == str(team_id).strip().lower()))
    team = result.scalar_one_or_none()
    if not team:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return team

@router.post("/purchase")
async def purchase_stat(req: ShopRequest, team: Team = Depends(get_current_team), db: AsyncSession = Depends(get_db)):
    # Rule: Only when R2 unlocked[cite: 7]
    if not engine_app.r2_unlocked:
        raise HTTPException(status_code=403, detail="stat_locked")
        
    # Rule: Only when no session is STARTING, RUNNING, or PAUSED[cite: 7]
    current_state = engine_app.get_current_session_state()
    if current_state in ["STARTING", "RUNNING", "PAUSED"]:
        raise HTTPException(status_code=403, detail="shop_closed")
        
    if req.stat not in STAT_COSTS or req.level not in STAT_COSTS[req.stat]:
        raise HTTPException(status_code=400, detail="invalid_stat")
        
    # Rule: Levels are bought in order[cite: 7]
    current_level = getattr(team, f"{req.stat.lower()}_level")
    if req.level != current_level + 1:
        raise HTTPException(status_code=400, detail="levels_must_be_sequential")
        
    cost_paise = STAT_COSTS[req.stat][req.level]
    
    # Lock ledger
    ledger_res = await db.execute(select(TeamLedger).where(TeamLedger.team_id == team.id).with_for_update())
    ledger = ledger_res.scalar_one_or_none()
    
    if not ledger or ledger.cash_paise < cost_paise:
        raise HTTPException(status_code=400, detail="insufficient_cash")
        
    # Deduct cash and apply upgrade
    ledger.cash_paise -= cost_paise
    setattr(team, f"{req.stat.lower()}_level", req.level)
    
    # Audit trail
    purchase = StatPurchase(
        team_id=team.id, stat=req.stat, level=req.level, 
        cost_paise=cost_paise, at_state=current_state
    )
    db.add(purchase)
    await db.commit()
    
    return {"status": "SUCCESS", "new_balance": ledger.cash_paise}
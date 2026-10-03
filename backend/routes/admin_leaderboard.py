import os
import time
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.database import AsyncSessionLocal
from backend.models import Team, TeamLedger, Position
from backend.core.engine import engine_app
from backend.core.scoring import calculate_equity_paise, calculate_return_pct

router = APIRouter(prefix="/admin/leaderboard", tags=["admin-leaderboard"])
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "admin-master-secret")

def verify_admin(authorization: str = Header(None)):
    if not authorization or authorization != f"Bearer {ADMIN_TOKEN}":
        raise HTTPException(status_code=403, detail="Forbidden")

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.get("/live", dependencies=[Depends(verify_admin)])
async def get_live_leaderboard(db: AsyncSession = Depends(get_db)):
    # 1. Fetch all teams, ledgers, and positions
    teams_res = await db.execute(select(Team))
    teams = teams_res.scalars().all()
    
    ledgers_res = await db.execute(select(TeamLedger))
    ledgers = {l.team_id: l for l in ledgers_res.scalars().all()}
    
    positions_res = await db.execute(select(Position))
    positions = positions_res.scalars().all()
    
    # Group positions by team
    team_positions = {}
    for pos in positions:
        team_positions.setdefault(pos.team_id, []).append(pos)
        
    # 2. Get live prices from the engine
    live_prices = {ticker: data[0] for ticker, data in engine_app.current_prices.items()}
    
    # R1 Start Capital = 10 Lakhs (100,000,000 paise). R2 = 1 Crore (1,000,000,000 paise)
    is_r2 = engine_app.r2_unlocked
    start_capital = 1000000000 if is_r2 else 100000000
    
    # 3. Calculate MTM Equity
    leaderboard = []
    for team in teams:
        ledger = ledgers.get(team.id)
        cash = ledger.cash_paise if ledger else start_capital
        pos_list = team_positions.get(team.id, [])
        
        equity = calculate_equity_paise(cash, pos_list, live_prices)
        ret_pct = calculate_return_pct(equity, start_capital)
        
        # ELIMINATED rule (Score = -100%)[cite: 7]
        if team.eliminated or equity <= 0:
            equity = 0
            ret_pct = -100.0
            
        leaderboard.append({
            "team_id": team.id,
            "name": team.name,
            "equity_paise": equity,
            "return_pct": round(ret_pct, 4),
            "status": "ELIM" if team.eliminated or equity <= 0 else "ACTIVE"
        })
        
    # Sort by absolute amount descending
    leaderboard.sort(key=lambda x: x["equity_paise"], reverse=True)
    
    # Assign ranks
    for i, entry in enumerate(leaderboard):
        entry["rank"] = i + 1
        
    return {"taken_at": time.time(), "round": 2 if is_r2 else 1, "rows": leaderboard}
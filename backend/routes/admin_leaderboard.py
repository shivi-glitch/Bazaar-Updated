import os
import time
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.database import AsyncSessionLocal
from backend.models import Team, TeamLedger, Position, LeaderboardSnapshot
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
    """Primary Round Leaderboard for the active round."""
    teams_res = await db.execute(select(Team))
    teams = teams_res.scalars().all()
    
    ledgers_res = await db.execute(select(TeamLedger))
    ledgers = {l.team_id: l for l in ledgers_res.scalars().all()}
    
    positions_res = await db.execute(select(Position))
    positions = positions_res.scalars().all()
    
    team_positions = {}
    for pos in positions:
        team_positions.setdefault(pos.team_id, []).append(pos)
        
    live_prices = {ticker: data[0] for ticker, data in engine_app.current_prices.items()}
    
    is_r2 = engine_app.r2_unlocked
    start_capital = 1000000000 if is_r2 else 100000000
    
    leaderboard = []
    for team in teams:
        ledger = ledgers.get(team.id)
        cash = ledger.cash_paise if ledger else start_capital
        pos_list = team_positions.get(team.id, [])
        
        equity = calculate_equity_paise(cash, pos_list, live_prices)
        ret_pct = calculate_return_pct(equity, start_capital)
        
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
        
    leaderboard.sort(key=lambda x: x["equity_paise"], reverse=True)
    
    for i, entry in enumerate(leaderboard):
        entry["rank"] = i + 1
        
    return {
        "taken_at": time.time(), 
        "round": 2 if is_r2 else 1, 
        "round_name": "Round 2 (Institutional Trading)" if is_r2 else "Round 1 (Retail Momentum)",
        "rows": leaderboard
    }

@router.get("/cumulative", dependencies=[Depends(verify_admin)])
async def get_cumulative_leaderboard(force: bool = False, db: AsyncSession = Depends(get_db)):
    """Overall Leaderboard combining both Round 1 & Round 2.
    Rule: Only updates after both rounds finish (Session 11 FINISHED)."""
    r1_done = engine_app.r2_unlocked or engine_app.session_states.get(6) == "FINISHED"
    r2_done = engine_app.session_states.get(11) == "FINISHED"
    both_finished = r1_done and r2_done

    if not both_finished and not force:
        return {
            "is_final": False,
            "message": "The cumulative leaderboard will automatically calculate and lock after both Round 1 and Round 2 finish (Session 11 conclusion).",
            "round_1_complete": r1_done,
            "round_2_complete": r2_done,
            "rows": []
        }

    # Fetch teams and ledgers
    teams_res = await db.execute(select(Team))
    teams = teams_res.scalars().all()

    ledgers_res = await db.execute(select(TeamLedger))
    ledgers = {l.team_id: l for l in ledgers_res.scalars().all()}

    positions_res = await db.execute(select(Position))
    positions = positions_res.scalars().all()
    team_positions = {}
    for p in positions:
        team_positions.setdefault(p.team_id, []).append(p)

    live_prices = {ticker: data[0] for ticker, data in engine_app.current_prices.items()}

    # Check for R1 snapshot if available
    r1_snapshot_res = await db.execute(
        select(LeaderboardSnapshot).where(LeaderboardSnapshot.round_num == 1).order_by(LeaderboardSnapshot.id.desc())
    )
    r1_snapshot = r1_snapshot_res.scalars().first()
    r1_returns = {}
    r1_equities = {}
    if r1_snapshot and isinstance(r1_snapshot.rows, list):
        for r in r1_snapshot.rows:
            r1_returns[r.get("team_id")] = r.get("return_pct", 0.0)
            r1_equities[r.get("team_id")] = r.get("equity_paise", 100000000)

    # R2 current performance
    r2_start_capital = 1000000000 # 1 Cr
    cumulative_rows = []

    for team in teams:
        ledger = ledgers.get(team.id)
        cash = ledger.cash_paise if ledger else r2_start_capital
        pos_list = team_positions.get(team.id, [])

        r2_equity = calculate_equity_paise(cash, pos_list, live_prices)
        r2_ret = calculate_return_pct(r2_equity, r2_start_capital)
        if team.eliminated or r2_equity <= 0:
            r2_equity = 0
            r2_ret = -100.0

        r1_ret = r1_returns.get(team.id, 0.0)
        r1_eq = r1_equities.get(team.id, 100000000)

        # Compound cumulative return % across both rounds
        cum_ret = ((1 + r1_ret / 100.0) * (1 + r2_ret / 100.0) - 1.0) * 100.0
        total_pnl = (r1_eq - 100000000) + (r2_equity - r2_start_capital)

        cumulative_rows.append({
            "team_id": team.id,
            "name": team.name,
            "r1_return_pct": round(r1_ret, 2),
            "r2_return_pct": round(r2_ret, 2),
            "cumulative_return_pct": round(cum_ret, 2),
            "cumulative_pnl_paise": total_pnl,
            "r2_final_equity": r2_equity,
            "status": "ELIM" if team.eliminated or r2_equity <= 0 else "ACTIVE"
        })

    cumulative_rows.sort(key=lambda x: x["cumulative_return_pct"], reverse=True)
    for i, entry in enumerate(cumulative_rows):
        entry["rank"] = i + 1

    return {
        "is_final": True,
        "round_name": "Cumulative Tournament Standings (Rounds 1 & 2)",
        "taken_at": time.time(),
        "rows": cumulative_rows
    }
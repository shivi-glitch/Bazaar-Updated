import os
import time
import uuid
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update, delete, select

from backend.database import AsyncSessionLocal
from backend.models import Team, TeamLedger, Position, Order, StatPurchase, EquitySnapshot, LeaderboardSnapshot
from backend.core.scoring import calculate_equity_paise, calculate_return_pct
from backend.core.engine import engine_app
from backend.core.news_ledger import SCRIPTED_NEWS_DATABASE
from backend.core.security import verify_admin

router = APIRouter(prefix="/admin", tags=["admin_sessions"])

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.post("/sessions/{g}/start", dependencies=[Depends(verify_admin)])
async def start_session_route(g: int):
    try:
        res = await engine_app.start_session(g)
        return res
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

@router.post("/sessions/{g}/pause", dependencies=[Depends(verify_admin)])
async def pause_session_route(g: int):
    try:
        res = await engine_app.pause_session(g)
        return res
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

@router.post("/sessions/{g}/resume", dependencies=[Depends(verify_admin)])
async def resume_session_route(g: int):
    try:
        res = await engine_app.resume_session(g)
        return res
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

@router.post("/sessions/{g}/end", dependencies=[Depends(verify_admin)])
async def end_session_route(g: int):
    try:
        res = await engine_app.end_session(g)
        return res
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

@router.post("/round2/unlock", dependencies=[Depends(verify_admin)])
async def unlock_round2_route(db: AsyncSession = Depends(get_db)):
    try:
        # Engine rule: Can only unlock if R1S6 is FINISHED
        res = await engine_app.unlock_round2()
        
        # 1. Snapshot Round 1 Final Standings before state wipe
        teams_res = await db.execute(select(Team))
        teams = teams_res.scalars().all()
        ledgers_res = await db.execute(select(TeamLedger))
        ledgers = {l.team_id: l.cash_paise for l in ledgers_res.scalars().all()}
        pos_res = await db.execute(select(Position))
        positions = pos_res.scalars().all()
        team_pos = {}
        for p in positions:
            team_pos.setdefault(p.team_id, []).append(p)
        live_prices = {t: d[0] for t, d in engine_app.current_prices.items()}

        r1_rows = []
        for t in teams:
            cash = ledgers.get(t.id, 100000000)
            p_list = team_pos.get(t.id, [])
            equity = calculate_equity_paise(cash, p_list, live_prices)
            ret_pct = calculate_return_pct(equity, 100000000)
            if t.eliminated or equity <= 0:
                equity = 0
                ret_pct = -100.0
            r1_rows.append({
                "team_id": t.id,
                "name": t.name,
                "equity_paise": equity,
                "return_pct": round(ret_pct, 4),
                "status": "ELIM" if t.eliminated or equity <= 0 else "ACTIVE"
            })
        r1_rows.sort(key=lambda x: x["equity_paise"], reverse=True)
        for i, row in enumerate(r1_rows):
            row["rank"] = i + 1

        r1_snapshot = LeaderboardSnapshot(
            round_num=1,
            kind="final",
            taken_at=int(time.time()),
            rows=r1_rows
        )
        db.add(r1_snapshot)

        # 2. Wipe all current positions
        await db.execute(delete(Position))
        
        # 3. Reset every ledger to exactly 1 Crore INR (1,000,000,000 paise)
        await db.execute(update(TeamLedger).values(cash_paise=1000000000))
        
        # 4. Reset team stats and clear eliminations
        await db.execute(
            update(Team).values(
                research_level=0, 
                capital_level=0, 
                speed_level=0, 
                eliminated=False
            )
        )
        
        await db.commit()
        return res
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

@router.post("/demo/unlock", dependencies=[Depends(verify_admin)])
async def unlock_demo_route(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(delete(Position))
        await db.execute(delete(Order))
        await db.execute(update(TeamLedger).values(cash_paise=100000000))
        await db.execute(update(Team).values(research_level=0, capital_level=0, speed_level=0, eliminated=False))
        await db.commit()
        return await engine_app.unlock_demo_round()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/demo/reset", dependencies=[Depends(verify_admin)])
async def reset_demo_route(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(delete(Position))
        await db.execute(delete(Order))
        await db.execute(update(TeamLedger).values(cash_paise=100000000))
        await db.execute(update(Team).values(research_level=0, capital_level=0, speed_level=0, eliminated=False))
        await db.commit()
        return await engine_app.unlock_demo_round()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/demo/exit", dependencies=[Depends(verify_admin)])
async def exit_demo_route(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(delete(Position))
        await db.execute(delete(Order))
        await db.execute(update(TeamLedger).values(cash_paise=100000000))
        await db.execute(update(Team).values(research_level=0, capital_level=0, speed_level=0, eliminated=False))
        await db.commit()
        return await engine_app.exit_demo_round()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/freeze", dependencies=[Depends(verify_admin)])
async def freeze_route():
    return await engine_app.freeze()

@router.post("/unfreeze", dependencies=[Depends(verify_admin)])
async def unfreeze_route():
    return await engine_app.unfreeze()

@router.get("/sessions", dependencies=[Depends(verify_admin)])
async def get_sessions():
    return {
        "current_g": engine_app.current_g,
        "n": engine_app.n,
        "states": engine_app.session_states,
        "is_demo": engine_app.is_demo,
        "is_frozen": engine_app.is_frozen,
        "r2_unlocked": engine_app.r2_unlocked,
        "news_history": engine_app.news_ledger,
        "scripted_news": SCRIPTED_NEWS_DATABASE
    }

@router.get("/news/scripted", dependencies=[Depends(verify_admin)])
async def get_scripted_news_endpoint():
    return {"scripted_news": SCRIPTED_NEWS_DATABASE}

@router.get("/round2/graph-data", dependencies=[Depends(verify_admin)])
async def get_round2_graph_data(db: AsyncSession = Depends(get_db)):
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
    start_capital = 1000000000 # 1 Crore reset for Round 2
    
    leaderboard = []
    for team in teams:
        ledger = ledgers.get(team.id)
        cash = ledger.cash_paise if ledger else start_capital
        pos_list = team_positions.get(team.id, [])
        equity = calculate_equity_paise(cash, pos_list, live_prices)
        if team.eliminated or equity <= 0:
            equity = 0
        leaderboard.append({
            "team_id": team.id,
            "name": team.name,
            "equity_paise": equity,
            "eliminated": team.eliminated
        })
        
    leaderboard.sort(key=lambda x: x["equity_paise"], reverse=True)
    
    # Query snapshots if recorded
    snapshots_res = await db.execute(
        select(EquitySnapshot)
        .where(EquitySnapshot.round_num == 2)
        .order_by(EquitySnapshot.session_g.asc(), EquitySnapshot.created_at.asc())
    )
    raw_snapshots = snapshots_res.scalars().all()
    
    # Group snapshots by session
    session_snapshots: dict = {}
    for s in raw_snapshots:
        session_snapshots.setdefault(s.session_g, []).append({
            "team_id": s.team_id,
            "equity_paise": s.equity_paise,
            "tick": s.tick_n
        })
    
    sessions_meta = [
        {"g": 7, "label": "R2S1 · War Shock", "theme": "Commodity inflation spike · Retail capital retreats"},
        {"g": 8, "label": "R2S2 · Rate Hike", "theme": "Emergency central bank hike · Banking margins strained"},
        {"g": 9, "label": "R2S3 · Banking Crisis", "theme": "Interbank liquidity contagion · Panic market selloff"},
        {"g": 10, "label": "R2S4 · State Bailout", "theme": "Emergency state intervention · Targeted sector short squeeze"},
        {"g": 11, "label": "R2S5 · Final Settle", "theme": "Institutional order reconciliation · Terminal resolution"}
    ]
    
    return {
        "sessions": sessions_meta,
        "current_g": engine_app.current_g,
        "is_finished": engine_app.session_states.get(11) == "FINISHED",
        "top_teams": leaderboard[:8],
        "live_prices": live_prices,
        "session_snapshots": session_snapshots
    }

@router.post("/reset", dependencies=[Depends(verify_admin)])
@router.post("/sessions/reset", dependencies=[Depends(verify_admin)])
async def reset_entire_event(db: AsyncSession = Depends(get_db)):
    try:
        # 1. Wipe all transactions and positions
        await db.execute(delete(Position))
        await db.execute(delete(Order))
        await db.execute(delete(StatPurchase))
        
        # 2. Reset Ledger back to exactly 10 Lakhs (R1 Start)
        await db.execute(update(TeamLedger).values(cash_paise=100000000))
        
        # 3. Strip all upgrades
        await db.execute(
            update(Team).values(research_level=0, capital_level=0, speed_level=0, eliminated=False)
        )
        await db.commit()
        
        # 4. Snap the engine back to R1S1
        await engine_app.reset_event()
        return {"status": "SUCCESS", "message": "Event hard reset to R1S1"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel
import random

class JumpRequest(BaseModel):
    target_g: int

@router.post("/jump", dependencies=[Depends(verify_admin)])
@router.post("/sessions/jump", dependencies=[Depends(verify_admin)])
async def jump_to_session(req: JumpRequest, db: AsyncSession = Depends(get_db)):
    if not 1 <= req.target_g <= 11:
        raise HTTPException(status_code=400, detail="Invalid session number")

    try:
        # 1. Wipe all active transactions and positions
        await db.execute(delete(Position))
        await db.execute(delete(Order))
        await db.execute(delete(StatPurchase))
        
        # 2. Assign the correct starting capital based on the Round
        cash = 1000000000 if req.target_g >= 7 else 100000000
        await db.execute(update(TeamLedger).values(cash_paise=cash))
        
        # 3. Strip all upgrades
        await db.execute(
            update(Team).values(research_level=0, capital_level=0, speed_level=0, eliminated=False)
        )
        await db.commit()
        
        # 4. Snap the engine
        res = await engine_app.jump_to(req.target_g)
        return res
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/news/fire", dependencies=[Depends(verify_admin)])
async def fire_custom_news(req: dict):
    news_item = {
        "id": str(uuid.uuid4()),
        "source": req.get("source", "IN"),
        "ticker": req.get("ticker", "GLOBAL"),
        "text": req.get("text", "Market breaking event.")
    }
    await engine_app.inject_live_news(news_item)
    return {"status": "SUCCESS", "news": news_item}

from backend.core.security import hash_pin

class TeamActionReq(BaseModel):
    team_id: str

class SetTeamPinReq(BaseModel):
    team_id: str
    pin: str

@router.get("/teams", dependencies=[Depends(verify_admin)])
async def get_all_teams(db: AsyncSession = Depends(get_db)):
    """Returns all teams with their real PINs and Cash Balances."""
    teams_res = await db.execute(select(Team))
    teams = teams_res.scalars().all()
    
    ledgers_res = await db.execute(select(TeamLedger))
    ledgers = {l.team_id: l.cash_paise for l in ledgers_res.scalars().all()}
    
    from backend.routes.ws import manager
    online_teams = manager.get_online_team_ids()
    
    return {"teams": [
        {
            "id": t.id, 
            "pin": t.pin or "796688", 
            "cash_paise": ledgers.get(t.id, 100000000), # 1 Crore default
            "eliminated": t.eliminated,
            "is_online": t.id in online_teams
        } for t in teams
    ]}

@router.post("/teams/create", dependencies=[Depends(verify_admin)])
async def create_team(req: TeamActionReq, db: AsyncSession = Depends(get_db)):
    """Creates a new team with a custom name and a random 6-digit PIN."""
    new_pin = str(random.randint(100000, 999999))
    pin_h = hash_pin(new_pin)
    new_team = Team(id=req.team_id, name=req.team_id, pin=new_pin, pin_hash=pin_h)
    db.add(new_team)
    
    # 1 Crore for Round 1, 10 Crore if starting in Round 2
    cash = 1000000000 if engine_app.current_g >= 7 else 100000000
    new_ledger = TeamLedger(team_id=req.team_id, cash_paise=cash)
    db.add(new_ledger)
    
    await db.commit()
    return {"status": "SUCCESS", "team_id": req.team_id, "pin": new_pin}

@router.post("/teams/reset-pin", dependencies=[Depends(verify_admin)])
async def reset_team_pin(req: TeamActionReq, db: AsyncSession = Depends(get_db)):
    """Generates a new PIN for a team."""
    new_pin = str(random.randint(100000, 999999))
    pin_h = hash_pin(new_pin)
    await db.execute(update(Team).where(Team.id == req.team_id).values(pin=new_pin, pin_hash=pin_h))
    await db.commit()
    return {"status": "SUCCESS", "new_pin": new_pin}

@router.post("/teams/set-pin", dependencies=[Depends(verify_admin)])
async def set_team_pin(req: SetTeamPinReq, db: AsyncSession = Depends(get_db)):
    """Admin sets a custom PIN for a team."""
    clean_pin = str(req.pin).strip()
    if not clean_pin:
        raise HTTPException(status_code=400, detail="PIN cannot be empty")
    pin_h = hash_pin(clean_pin)
    await db.execute(update(Team).where(Team.id == req.team_id).values(pin=clean_pin, pin_hash=pin_h))
    await db.commit()
    return {"status": "SUCCESS", "new_pin": clean_pin}

@router.post("/teams/remove", dependencies=[Depends(verify_admin)])
async def remove_team(req: TeamActionReq, db: AsyncSession = Depends(get_db)):
    """Completely deletes a team and all their trading history."""
    await db.execute(delete(StatPurchase).where(StatPurchase.team_id == req.team_id))
    await db.execute(delete(Order).where(Order.team_id == req.team_id))
    await db.execute(delete(Position).where(Position.team_id == req.team_id))
    await db.execute(delete(TeamLedger).where(TeamLedger.team_id == req.team_id))
    await db.execute(delete(Team).where(Team.id == req.team_id))
    await db.commit()
    return {"status": "SUCCESS"}



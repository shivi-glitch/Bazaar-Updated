import uuid
import time
import asyncio
import random
import jwt
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError

from backend.database import AsyncSessionLocal
from backend.models import Team, TeamLedger, Position, Order, LeaderboardSnapshot
from backend.core.trading import calculate_fee, check_rate_limit
from backend.core.engine import engine_app
from backend.core.scoring import calculate_equity_paise, calculate_return_pct
from backend.core.security import SECRET_KEY, ALGORITHM

router = APIRouter(tags=["trading"])

class OrderRequest(BaseModel):
    client_key: str
    ticker: str
    side: str
    qty: int
    type: str

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def get_current_team(authorization: str = Header(...), db: AsyncSession = Depends(get_db)):
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        team_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    if not team_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    result = await db.execute(select(Team).where(func.lower(Team.id) == str(team_id).strip().lower()))
    team = result.scalar_one_or_none()
    if not team:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return team

@router.post("/orders")
async def place_order(req: OrderRequest, team: Team = Depends(get_current_team), db: AsyncSession = Depends(get_db)):
    if team.eliminated:
        raise HTTPException(status_code=403, detail="Account liquidated")

    if engine_app.is_frozen:
        raise HTTPException(status_code=403, detail="Market is frozen by administrator")

    current_state = engine_app.get_current_session_state()
    if current_state != "RUNNING":
        raise HTTPException(status_code=403, detail=f"Trading closed. Market session is currently {current_state}")
    
    if not check_rate_limit(team.id):
        raise HTTPException(status_code=429, detail={"error": "rate_limited", "message": "Order rate limit reached. Please wait a moment."})
        
    if req.qty < 1:
        raise HTTPException(status_code=400, detail="invalid_qty")

    # In Round 2 (g >= 7), apply execution latency determined by team's Speed Level
    if engine_app.current_g >= 7:
        speed_delays = {0: 2.4, 1: 1.8, 2: 1.2, 3: 0.6}
        base_delay = speed_delays.get(team.speed_level or 0, 2.4)
        jitter = random.uniform(-0.15, 0.15)
        exec_latency = max(0.1, base_delay + jitter)
        await asyncio.sleep(exec_latency)

    live_prices = {t: d[0] for t, d in engine_app.current_prices.items()}
    if req.ticker not in live_prices:
        raise HTTPException(status_code=400, detail="Instrument not live")
        
    fill_price_paise = live_prices[req.ticker]
    fee_paise = calculate_fee(req.qty, fill_price_paise)
    notional_paise = req.qty * fill_price_paise
    
    try:
        ledger_res = await db.execute(select(TeamLedger).where(TeamLedger.team_id == team.id).with_for_update())
        ledger = ledger_res.scalar_one_or_none()
        if not ledger:
            ledger = TeamLedger(team_id=team.id, cash_paise=100000000)
            db.add(ledger)
            await db.flush()
        
        pos_res = await db.execute(select(Position).where(Position.team_id == team.id).with_for_update())
        all_positions = pos_res.scalars().all()

        # 1. Calculate Current Equity
        equity_paise = ledger.cash_paise
        for p in all_positions:
            equity_paise += p.qty * live_prices.get(p.ticker, p.average_cost_paise)
            
        if equity_paise <= 0:
            team.eliminated = True
            await db.commit()
            raise HTTPException(status_code=400, detail="Account liquidated")

        # 2. Leverage Rules
        leverage = 2 if team.capital_level >= 2 else 1
        max_exposure = equity_paise * leverage
        
        target_pos = next((p for p in all_positions if p.ticker == req.ticker), None)
        if not target_pos:
            target_pos = Position(team_id=team.id, ticker=req.ticker, qty=0, average_cost_paise=0)
            db.add(target_pos)
            all_positions.append(target_pos)

        current_qty = target_pos.qty

        # 3. Apply Trade & Zero-Crossing Cost Basis Math
        if req.side == "BUY":
            new_qty = current_qty + req.qty
            ledger.cash_paise -= (notional_paise + fee_paise)
            
            if current_qty >= 0:
                # Adding to Long (Blend Average Cost)
                total_value = (current_qty * target_pos.average_cost_paise) + notional_paise
                target_pos.average_cost_paise = total_value // new_qty
            else:
                # Covering a Short
                if new_qty > 0:
                    # Crossed zero line -> Now Long. Reset cost basis to current fill price.
                    target_pos.average_cost_paise = fill_price_paise
                # If new_qty <= 0, we are still short, average short price remains unchanged

        elif req.side == "SELL":
            new_qty = current_qty - req.qty
            ledger.cash_paise += (notional_paise - fee_paise)
            
            if current_qty <= 0:
                # Adding to Short (Blend Average Cost)
                total_value = (abs(current_qty) * target_pos.average_cost_paise) + notional_paise
                target_pos.average_cost_paise = total_value // abs(new_qty)
            else:
                # Selling a Long
                if new_qty < 0:
                    # Crossed zero line -> Now Short. Reset cost basis to current fill price.
                    target_pos.average_cost_paise = fill_price_paise
                # If new_qty >= 0, we are still long, average long price remains unchanged
            
        # 4. Enforce Short Selling Lock (Capital Level 1)
        if new_qty < 0 and team.capital_level < 1:
            raise HTTPException(status_code=400, detail="Short selling requires Capital Level 1")

        # 5. Enforce Buying Power limit
        post_trade_exposure = 0
        for p in all_positions:
            qty = new_qty if p.ticker == req.ticker else p.qty
            post_trade_exposure += abs(qty) * live_prices.get(p.ticker, p.average_cost_paise)
            
        if post_trade_exposure > max_exposure:
            raise HTTPException(status_code=400, detail=f"Insufficient Buying Power (Max: ₹{max_exposure/100:,.2f})")

        target_pos.qty = new_qty
        if target_pos.qty == 0:
            target_pos.average_cost_paise = 0
            
        new_order = Order(
            id=str(uuid.uuid4()), client_key=req.client_key, team_id=team.id,
            ticker=req.ticker, side=req.side, qty=req.qty, order_type=req.type,
            fill_price_paise=fill_price_paise, fee_paise=fee_paise
        )
        db.add(new_order)
        await db.commit()
        
        if engine_app.current_g >= 7:
            engine_app.register_flow(req.ticker, notional_paise / 100.0, req.side)
            
        return {"status": "FILLED", "fill_price_paise": fill_price_paise, "fee": fee_paise}
        
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="duplicate_key")

@router.get("/portfolio")
async def get_portfolio(team: Team = Depends(get_current_team), db: AsyncSession = Depends(get_db)):
    ledger_res = await db.execute(select(TeamLedger).where(TeamLedger.team_id == team.id))
    ledger = ledger_res.scalar_one_or_none()
    cash = ledger.cash_paise if ledger else 100000000

    pos_res = await db.execute(select(Position).where(Position.team_id == team.id))
    positions = pos_res.scalars().all()

    live_prices = {ticker: data[0] for ticker, data in engine_app.current_prices.items()}
    equity = calculate_equity_paise(cash, positions, live_prices)

    pos_data = []
    for p in positions:
        if p.qty != 0:
            pos_data.append({
                "ticker": p.ticker, "qty": p.qty,
                "average_cost_paise": p.average_cost_paise,
                "current_price_paise": live_prices.get(p.ticker, p.average_cost_paise)
            })

    return {
        "cash_paise": cash, "equity_paise": equity, "positions": pos_data,
        "eliminated": team.eliminated, "r2_unlocked": engine_app.r2_unlocked,
        "stats": {"research": team.research_level, "capital": team.capital_level, "speed": team.speed_level},
        "session": {
            "state": engine_app.get_current_session_state(),
            "g": engine_app.current_g,
            "n": engine_app.n,
            "is_frozen": engine_app.is_frozen,
            "r2_unlocked": engine_app.r2_unlocked
        }
    }

@router.get("/session/current")
async def get_current_session_info():
    return {
        "state": engine_app.get_current_session_state(),
        "g": engine_app.current_g,
        "n": engine_app.n,
        "is_frozen": engine_app.is_frozen,
        "r2_unlocked": engine_app.r2_unlocked
    }

@router.get("/leaderboard")
async def get_final_leaderboard(team: Team = Depends(get_current_team), db: AsyncSession = Depends(get_db)):
    """Public score and debrief endpoint for the authenticated team."""
    # 1. Fetch ledgers & positions
    ledgers_res = await db.execute(select(TeamLedger))
    ledgers = {l.team_id: l.cash_paise for l in ledgers_res.scalars().all()}
    
    pos_res = await db.execute(select(Position))
    positions = pos_res.scalars().all()
    
    team_positions = {}
    for p in positions:
        team_positions.setdefault(p.team_id, []).append(p)
        
    live_prices = {t: d[0] for t, d in engine_app.current_prices.items()}
    
    # 2. Determine Round 1 and Round 2 specific performance
    is_r2 = engine_app.r2_unlocked
    r1_start_capital = 100000000    # 10 Lakhs INR (100,000,000 paise)
    r2_start_capital = 1000000000   # 1 Crore INR (1,000,000,000 paise)
    
    # Query Round 1 final snapshot if available
    r1_snapshot_res = await db.execute(
        select(LeaderboardSnapshot)
        .where(LeaderboardSnapshot.round_num == 1)
        .order_by(LeaderboardSnapshot.id.desc())
    )
    r1_snapshot = r1_snapshot_res.scalars().first()
    
    r1_equity = None
    r1_return_pct = None
    if r1_snapshot and isinstance(r1_snapshot.rows, list):
        for r in r1_snapshot.rows:
            if r.get("team_id") == team.id:
                r1_equity = r.get("equity_paise")
                r1_return_pct = r.get("return_pct")
                break
                
    if is_r2:
        # In Round 2
        user_cash = ledgers.get(team.id, r2_start_capital)
        user_pos = team_positions.get(team.id, [])
        if team.eliminated:
            r2_equity = 0
            r2_return_pct = -100.0
        else:
            r2_equity = calculate_equity_paise(user_cash, user_pos, live_prices)
            r2_return_pct = calculate_return_pct(r2_equity, r2_start_capital)
            
        if r1_equity is None:
            r1_equity = r1_start_capital
            r1_return_pct = 0.0
    else:
        # In Round 1
        user_cash = ledgers.get(team.id, r1_start_capital)
        user_pos = team_positions.get(team.id, [])
        if team.eliminated:
            r1_equity = 0
            r1_return_pct = -100.0
        else:
            r1_equity = calculate_equity_paise(user_cash, user_pos, live_prices)
            r1_return_pct = calculate_return_pct(r1_equity, r1_start_capital)
        r2_equity = None
        r2_return_pct = None
        
    total_pnl = 0
    if r1_equity is not None:
        total_pnl += (r1_equity - r1_start_capital)
    if r2_equity is not None:
        total_pnl += (r2_equity - r2_start_capital)
        
    return {
        "team_id": team.id,
        "team_name": team.name or team.id,
        "eliminated": team.eliminated,
        "is_r2": is_r2,
        "r1_start_capital_paise": r1_start_capital,
        "r1_equity_paise": r1_equity,
        "r1_return_pct": round(r1_return_pct, 2) if r1_return_pct is not None else None,
        "r2_start_capital_paise": r2_start_capital,
        "r2_equity_paise": r2_equity,
        "r2_return_pct": round(r2_return_pct, 2) if r2_return_pct is not None else None,
        "total_pnl_paise": total_pnl,
        "top_10": [],
        "my_result": {
            "team_id": team.id,
            "team_name": team.name or team.id,
            "equity_paise": r2_equity if is_r2 else r1_equity,
            "eliminated": team.eliminated
        }
    }

@router.get("/news")
async def get_news_ledger(authorization: str = Header(None), db: AsyncSession = Depends(get_db)):
    """Returns all news published across all sessions and rounds so far."""
    team_research_level = 0
    if authorization:
        try:
            token = authorization.replace("Bearer ", "")
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            team_id = payload.get("sub")
            if team_id:
                res = await db.execute(select(Team).where(func.lower(Team.id) == str(team_id).strip().lower()))
                team = res.scalar_one_or_none()
                if team:
                    team_research_level = team.research_level
        except Exception:
            pass

    delays = {0: 15, 1: 10, 2: 7, 3: 3}
    team_delay = delays.get(team_research_level, 15)
    now = time.time()

    filtered = []
    for item in engine_app.news_ledger:
        if item.get("source") == "IN" and team_research_level < 2:
            continue
        item_ts = item.get("timestamp", 0)
        # Enforce Research level delay so REST polling cannot bypass WebSocket delays
        if item_ts > 0 and (now < item_ts + team_delay):
            continue
        filtered.append({
            "id": item.get("id"),
            "source": item.get("source", "NP"),
            "ticker": item.get("ticker", "GLOBAL"),
            "text": item.get("text", ""),
            "timestamp": item.get("timestamp", 0)
        })
    return {"news": filtered}

@router.get("/prices/history")
async def get_price_history():
    """Returns continuous historical price series across all completed and current sessions."""
    return {"history": engine_app.get_price_history()}
import uuid
import jwt
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError

from backend.database import AsyncSessionLocal
from backend.models import Team, TeamLedger, Position, Order
from backend.core.trading import calculate_fee, check_rate_limit
from backend.core.engine import engine_app
from backend.core.scoring import calculate_equity_paise
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
    
    if not check_rate_limit(team.id):
        raise HTTPException(status_code=429, detail={"error": "rate_limited"})
        
    if req.qty < 1:
        raise HTTPException(status_code=400, detail="invalid_qty")

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
    """Public leaderboard for the end-of-event podium."""
    # 1. Get all teams
    teams_res = await db.execute(select(Team))
    all_teams = teams_res.scalars().all()
    
    # 2. Get all ledgers & positions
    ledgers_res = await db.execute(select(TeamLedger))
    ledgers = {l.team_id: l.cash_paise for l in ledgers_res.scalars().all()}
    
    pos_res = await db.execute(select(Position))
    positions = pos_res.scalars().all()
    
    team_positions = {}
    for p in positions:
        if p.team_id not in team_positions:
            team_positions[p.team_id] = []
        team_positions[p.team_id].append(p)
        
    # 3. Calculate Equity
    live_prices = {t: d[0] for t, d in engine_app.current_prices.items()}
    results = []
    
    for t in all_teams:
        cash = ledgers.get(t.id, 100000000)
        pos = team_positions.get(t.id, [])
        if t.eliminated:
            equity = 0
        else:
            equity = calculate_equity_paise(cash, pos, live_prices)
            
        results.append({
            "team_id": t.id,
            "equity_paise": equity,
            "eliminated": t.eliminated
        })
        
    # 4. Sort and Rank
    results.sort(key=lambda x: x["equity_paise"], reverse=True)
    
    for idx, r in enumerate(results):
        r["rank"] = idx + 1
        
    # Find current user's rank
    user_result = next((r for r in results if r["team_id"] == team.id), None)
    
    return {
        "top_10": results[:10],
        "my_result": user_result
    }
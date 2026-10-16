from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import jwt
from backend.core.security import SECRET_KEY, ALGORITHM

from backend.database import AsyncSessionLocal
from backend.models import Team, TeamLedger, StatPurchase
from backend.core.engine import engine_app
from backend.core.trading import check_shop_rate_limit

router = APIRouter(prefix="/stats", tags=["shop"])

# Stat Costs in integer paise (₹1 = 100 paise) - Recalibrated: Max tier is 10-13% of 1 Crore (₹10L-₹13L)
STAT_COSTS = {
    "Research": {1: 35000000, 2: 75000000, 3: 130000000},     # ₹3.5L, ₹7.5L, ₹13.0L (13% of 1 Cr)
    "Capital": {1: 50000000, 2: 110000000},                   # ₹5.0L, ₹11.0L (11% of 1 Cr)
    "Speed": {1: 30000000, 2: 60000000, 3: 105000000}         # ₹3.0L, ₹6.0L, ₹10.5L (10.5% of 1 Cr)
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

IMPACT_SPECS = {
    "Research": {
        1: {
            "title": "News Wire Latency Slashed to 10s",
            "summary": "Wire latency reduced from 15.0s to 10.0s (33% faster delivery).",
            "bullets": [
                "News delivery speed improved from 15.0s to 10.0s.",
                "5-second lead over unupgraded retail teams.",
                "Allows earlier position entry before retail price waves start."
            ]
        },
        2: {
            "title": "Insider Wire Feed ('IN') Unlocked + 7s Latency",
            "summary": "7.0s wire latency + privileged access to private corporate leaks.",
            "bullets": [
                "News wire latency reduced to 7.0s (over 2x faster than base).",
                "UNLOCKED: Institutional Insider Rumor Wire ('IN' tag) with 90% directional accuracy.",
                "See impending market moves before official announcements hit retail."
            ]
        },
        3: {
            "title": "Ultra-Low Latency News Wire (3.0s)",
            "summary": "Sub-5s institutional news feed for immediate alpha capture.",
            "bullets": [
                "Wire latency slashed to 3.0s (maximum tier).",
                "Receive news 12 full seconds ahead of standard retail terminals.",
                "Capture peak price momentum at ground-floor valuations."
            ]
        }
    },
    "Capital": {
        1: {
            "title": "Short Selling (Bearish Positions) Unlocked",
            "summary": "Allows opening short positions to profit from falling prices.",
            "bullets": [
                "UNLOCKED: Short selling capability up to 1.0x total equity.",
                "Sell high and buy back low to profit during bearish market crashes.",
                "Order slip 'Sell to Open' short controls now active."
            ]
        },
        2: {
            "title": "2.0x Margin Leverage Enabled",
            "summary": "Doubles total buying power to 200% of portfolio equity.",
            "bullets": [
                "UNLOCKED: 2.0x Margin Leverage.",
                "Maximum gross exposure expanded from 1.0x to 2.0x equity.",
                "Hold up to ₹2 Crore of positions on ₹1 Crore equity for high-conviction plays."
            ]
        }
    },
    "Speed": {
        1: {
            "title": "Order Routing Latency Reduced to 1.8s",
            "summary": "Execution delay decreased from 2.4s to 1.8s (25% faster fills).",
            "bullets": [
                "Order fill delay improved to 1.8s.",
                "25% faster execution over base retail queues.",
                "Reduced price slippage when chasing active breakout candles."
            ]
        },
        2: {
            "title": "Direct Market Access (DMA) Queue: 1.2s",
            "summary": "Order fill delay dropped to 1.2s (50% faster fills).",
            "bullets": [
                "Fill delay improved to 1.2s.",
                "Front-runs standard retail orders when liquidity is thin.",
                "Priority matching on fast momentum breakouts."
            ]
        },
        3: {
            "title": "Co-Located Ultra-Fast Routing: 0.6s",
            "summary": "Institutional direct routing with near-zero fill latency.",
            "bullets": [
                "Fill delay slashed to 0.6s (maximum speed tier).",
                "Instantaneous execution priority on high-volatility news candles.",
                "Guaranteed top-of-queue priority ahead of competing teams."
            ]
        }
    }
}

@router.post("/purchase")
async def purchase_stat(req: ShopRequest, team: Team = Depends(get_current_team), db: AsyncSession = Depends(get_db)):
    if not check_shop_rate_limit(team.id):
        raise HTTPException(status_code=429, detail="Too many purchase attempts. Please wait a moment.")

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
    
    impact = IMPACT_SPECS.get(req.stat, {}).get(req.level, {
        "title": f"{req.stat} Level {req.level} Activated",
        "summary": "Terminal capability upgraded.",
        "bullets": ["System specifications refreshed."]
    })
    
    return {
        "status": "SUCCESS", 
        "new_balance": ledger.cash_paise,
        "stat": req.stat,
        "level": req.level,
        "cost_paise": cost_paise,
        "impact": impact
    }
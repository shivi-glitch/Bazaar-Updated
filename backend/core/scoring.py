from typing import List
from backend.models import Position

def calculate_equity_paise(cash_paise: int, positions: List[Position], current_prices: dict) -> int:
    """Calculates Mark-to-Market (MTM) equity in integer paise."""
    equity = cash_paise
    for pos in positions:
        # Get live price from engine, fallback to avg_cost if market is closed/missing
        live_price = current_prices.get(pos.ticker, pos.average_cost_paise)
        equity += (pos.qty * live_price)
    return equity

def calculate_return_pct(equity_paise: int, start_capital_paise: int) -> float:
    """Calculates percentage return. Bonus calculation will be layered here later."""
    return ((equity_paise - start_capital_paise) / start_capital_paise) * 100.0
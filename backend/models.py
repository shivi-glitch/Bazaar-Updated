from sqlalchemy import Column, String, Integer, Boolean, BigInteger, JSON
try:
    from .database import Base
except ImportError:
    from database import Base

class Team(Base):
    __tablename__ = "teams"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    pin_hash = Column(String, nullable=False)
    pin = Column(String, nullable=True)
    research_level = Column(Integer, default=0)
    capital_level = Column(Integer, default=0)
    speed_level = Column(Integer, default=0)
    locked = Column(Boolean, default=False)
    eliminated = Column(Boolean, default=False)
    created_at = Column(BigInteger)

class Instrument(Base):
    __tablename__ = "instruments"
    ticker = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    sector = Column(String, nullable=False)
    open_price_paise = Column(BigInteger, nullable=False)

class SessionBlock(Base):
    __tablename__ = "sessions"
    g = Column(Integer, primary_key=True)
    round_num = Column(Integer, nullable=False)
    state = Column(String, nullable=False, default="LOCKED") # LOCKED, READY, STARTING, RUNNING, PAUSED, FINISHED
    t0 = Column(BigInteger, nullable=True)
    running_seconds = Column(Integer, default=0)

class TeamLedger(Base):
    __tablename__ = "team_ledger"
    team_id = Column(String, primary_key=True)
    # R1 Start Capital: 10 Lakhs INR = 1,000,000 INR = 100,000,000 paise
    cash_paise = Column(BigInteger, default=100000000, nullable=False)

class Position(Base):
    __tablename__ = "positions"
    team_id = Column(String, primary_key=True)
    ticker = Column(String, primary_key=True)
    qty = Column(Integer, default=0, nullable=False)
    average_cost_paise = Column(BigInteger, default=0, nullable=False)

class Order(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True)
    client_key = Column(String, unique=True, nullable=False) # Idempotency
    team_id = Column(String, nullable=False)
    ticker = Column(String, nullable=False)
    side = Column(String, nullable=False) # "BUY" or "SELL"
    qty = Column(Integer, nullable=False)
    order_type = Column(String, nullable=False) # "MARKET"
    status = Column(String, default="FILLED") # For Phase 4 testing, we fill immediately
    fill_price_paise = Column(BigInteger, nullable=True)
    fee_paise = Column(BigInteger, nullable=True)

class LeaderboardSnapshot(Base):
    __tablename__ = "leaderboard_snapshots"
    id = Column(Integer, primary_key=True, autoincrement=True)
    round_num = Column(Integer, nullable=False)
    kind = Column(String, nullable=False) # "live" or "final"
    taken_at = Column(BigInteger, nullable=False)
    rows = Column(JSON, nullable=False)

class StatPurchase(Base):
    __tablename__ = "stat_purchases"
    id = Column(Integer, primary_key=True, autoincrement=True)
    team_id = Column(String, nullable=False)
    stat = Column(String, nullable=False) # "Research", "Capital", "Speed"
    level = Column(Integer, nullable=False)
    cost_paise = Column(BigInteger, nullable=False)
    at_state = Column(String, nullable=False)

class EquitySnapshot(Base):
    __tablename__ = "equity_snapshots"
    id = Column(Integer, primary_key=True, autoincrement=True)
    team_id = Column(String, nullable=False, index=True)
    round_num = Column(Integer, default=2)
    session_g = Column(Integer, nullable=False)
    tick_n = Column(Integer, default=0)
    label = Column(String, nullable=True)
    equity_paise = Column(BigInteger, nullable=False)
    created_at = Column(BigInteger, nullable=False)
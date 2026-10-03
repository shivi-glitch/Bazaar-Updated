import time

class TokenBucket:
    def __init__(self, capacity: float = 3.0, rate: float = 1.5):
        self.capacity = float(capacity)
        self.rate = float(rate)
        self.tokens = float(capacity)
        self.last_update = time.time()

    def allow_request(self) -> bool:
        now = time.time()
        elapsed = now - self.last_update
        self.last_update = now
        self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)
        if self.tokens >= 1.0:
            self.tokens -= 1.0
            return True
        return False

_team_buckets: dict[str, TokenBucket] = {}

def check_rate_limit(team_id: str) -> bool:
    if team_id not in _team_buckets:
        _team_buckets[team_id] = TokenBucket(capacity=3.0, rate=1.5)
    return _team_buckets[team_id].allow_request()

def calculate_fee(qty: int, price_paise: int) -> int:
    # 0.05% brokerage/exchange fee in paise
    notional = qty * price_paise
    return int(notional * 0.0005)
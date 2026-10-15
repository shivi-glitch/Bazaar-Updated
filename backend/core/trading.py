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

# Distinct token buckets by category and identifier
_order_buckets: dict[str, TokenBucket] = {}
_shop_buckets: dict[str, TokenBucket] = {}
_login_buckets: dict[str, TokenBucket] = {}

def check_rate_limit(team_id: str) -> bool:
    """Rate limit for /orders: burst capacity 3, refills 1.5 tokens/sec (~1-2 orders/sec)."""
    clean_id = str(team_id).strip().lower()
    if clean_id not in _order_buckets:
        _order_buckets[clean_id] = TokenBucket(capacity=3.0, rate=1.5)
    return _order_buckets[clean_id].allow_request()

def check_shop_rate_limit(team_id: str) -> bool:
    """Rate limit for /stats/purchase: burst capacity 2, refills 0.5 tokens/sec (prevents upgrade spam)."""
    clean_id = str(team_id).strip().lower()
    if clean_id not in _shop_buckets:
        _shop_buckets[clean_id] = TokenBucket(capacity=2.0, rate=0.5)
    return _shop_buckets[clean_id].allow_request()

def check_login_rate_limit(identifier: str) -> bool:
    """Rate limit for /auth/login: burst capacity 5, refills 1.0 token/sec (prevents CPU-heavy bcrypt DDoS)."""
    clean_id = str(identifier).strip().lower()
    if clean_id not in _login_buckets:
        _login_buckets[clean_id] = TokenBucket(capacity=5.0, rate=1.0)
    return _login_buckets[clean_id].allow_request()

def calculate_fee(qty: int, price_paise: int) -> int:
    # 0.05% brokerage/exchange fee in paise
    notional = qty * price_paise
    return int(notional * 0.0005)
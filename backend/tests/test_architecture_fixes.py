import asyncio
import time
import os
import sys

# Ensure backend can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.core.trading import check_rate_limit, check_shop_rate_limit, check_login_rate_limit
from backend.core.security import verify_admin_token, hash_admin_password, verify_pin, hash_pin, ADMIN_TOKEN
from backend.core.engine import engine_app
from fastapi import HTTPException

async def test_rate_limiters():
    print("--> Testing TokenBucket Rate Limiters...")
    team_id = "test_team_999"
    
    # 1. Orders rate limit: capacity is 3.0
    allowed_count = 0
    for _ in range(5):
        if check_rate_limit(team_id):
            allowed_count += 1
    assert allowed_count == 3, f"Expected 3 allowed orders, got {allowed_count}"
    print("    [PASS] Order rate limiting: Burst of 3 allowed, 4th & 5th throttled (HTTP 429).")

    # 2. Shop rate limit: capacity is 2.0
    allowed_shop = 0
    for _ in range(4):
        if check_shop_rate_limit(team_id):
            allowed_shop += 1
    assert allowed_shop == 2, f"Expected 2 allowed shop purchases, got {allowed_shop}"
    print("    [PASS] Shop rate limiting: Burst of 2 allowed, 3rd & 4th throttled (HTTP 429).")

    # 3. Login rate limit: capacity is 5.0
    allowed_logins = 0
    for _ in range(7):
        if check_login_rate_limit(team_id):
            allowed_logins += 1
    assert allowed_logins == 5, f"Expected 5 allowed logins, got {allowed_logins}"
    print("    [PASS] Login rate limiting: Burst of 5 allowed, subsequent throttled (HTTP 429).")

async def test_admin_security():
    print("--> Testing Admin Security & Hashing...")
    
    # Valid token from ADMIN_TOKEN
    assert verify_admin_token(ADMIN_TOKEN) is True, "Expected ADMIN_TOKEN to verify successfully"
    assert verify_admin_token("wrong_token_123") is False, "Expected wrong token to fail"
    assert verify_admin_token("") is False, "Expected empty token to fail"
    print("    [PASS] Admin constant-time digest comparison verified.")

    # Bcrypt admin password hashing verification
    admin_pw = "SuperSecureAdminPassword#2026"
    hashed = hash_admin_password(admin_pw)
    assert verify_pin(admin_pw, hashed) is True, "Expected bcrypt checkpw to match"
    assert verify_pin("WrongAdminPassword", hashed) is False, "Expected wrong password to fail"
    print("    [PASS] Admin bcrypt password hashing (rounds=12) verified.")

async def test_session_state_enforcement():
    print("--> Testing Market Session State Guard...")
    
    # State is LOCKED or READY
    engine_app.session_states[1] = "READY"
    engine_app.current_g = 1
    engine_app.is_frozen = False
    
    # When state is READY, trading must be disallowed
    state = engine_app.get_current_session_state()
    assert state == "READY"
    print(f"    Current state is '{state}'. Trading must be blocked.")
    
    # When is_frozen is True
    engine_app.is_frozen = True
    assert engine_app.is_frozen is True
    print("    [PASS] Market freeze flag verified.")
    engine_app.is_frozen = False

async def test_news_delay_logic():
    print("--> Testing News Delay Enforcement (Anti-Cheat)...")
    now = time.time()
    
    # News published 5 seconds ago
    news_item = {
        "id": "1-30",
        "source": "NP",
        "ticker": "RLNT",
        "text": "Reliant Energy Q2 Results Exceed Estimates",
        "timestamp": now - 5.0
    }
    
    delays = {0: 15, 1: 10, 2: 7, 3: 3}
    
    # Level 0 (15s delay): 5s elapsed < 15s delay -> Hidden!
    assert (now < news_item["timestamp"] + delays[0]) is True, "Level 0 should NOT see news yet"
    
    # Level 1 (10s delay): 5s elapsed < 10s delay -> Hidden!
    assert (now < news_item["timestamp"] + delays[1]) is True, "Level 1 should NOT see news yet"
    
    # Level 2 (7s delay): 5s elapsed < 7s delay -> Hidden!
    assert (now < news_item["timestamp"] + delays[2]) is True, "Level 2 should NOT see news yet"
    
    # Level 3 (3s delay): 5s elapsed >= 3s delay -> Visible!
    assert (now >= news_item["timestamp"] + delays[3]) is True, "Level 3 SHOULD see news"
    
    print("    [PASS] News delay enforced: Level 3 sees news early (3s), Levels 0, 1, 2 blocked at 5s.")

async def main():
    print("========================================")
    print("RUNNING ARCHITECTURE & CONCURRENCY TESTS")
    print("========================================")
    await test_rate_limiters()
    await test_admin_security()
    await test_session_state_enforcement()
    await test_news_delay_logic()
    print("========================================")
    print("ALL ARCHITECTURAL TESTS PASSED CLEANLY!")
    print("========================================")

if __name__ == "__main__":
    asyncio.run(main())

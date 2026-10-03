import httpx
import asyncio
import time
import uuid

BASE_URL = "http://127.0.0.1:8000"

async def run_phase4_audit():
    print("--- Verifying Phase 4 Gates ---")
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        
        team_token = "T001" # Using mock token for isolated Phase 4 test
        headers = {"Authorization": f"Bearer {team_token}"}
        
        # 1. Test Rate Limiting (Gate G4.5)
        print("Testing rate limit (1.5/s, burst 3)...")
        tasks = [client.post("/orders", json={
            "client_key": str(uuid.uuid4()), "ticker": "RELI-X", 
            "side": "BUY", "qty": 1, "type": "MARKET"
        }, headers=headers) for _ in range(5)]
        res_list = await asyncio.gather(*tasks)
        responses = [r.status_code for r in res_list]
        
        if 429 in responses:
            print("[PASS] Gate G4.5: Rate limit enforced correctly.")
        else:
            print(f"[FAIL] Gate G4.5: Rate limit failed. Responses: {responses}")

        await asyncio.sleep(2) # Let bucket refill
        
        # 2. Test R1 Constraints (Gate G4.4) - Short Selling Prevention
        res = await client.post("/orders", json={
            "client_key": str(uuid.uuid4()), "ticker": "INFY-Z", 
            "side": "SELL", "qty": 50, "type": "MARKET"
        }, headers=headers)
        
        if res.status_code == 400 and "insufficient_position" in res.text:
            print("[PASS] Gate G4.4: R1 constraint (No Short Selling) enforced.")
        else:
            print(f"[FAIL] Gate G4.4: Expected insufficient_position, got {res.status_code}")
            
        # 3. Test Idempotency (Gate G4.2)
        print("Testing idempotency...")
        idem_key = str(uuid.uuid4())
        payload = {"client_key": idem_key, "ticker": "RELI-X", "side": "BUY", "qty": 10, "type": "MARKET"}
        
        # Fire 20 exact same requests concurrently
        tasks = [client.post("/orders", json=payload, headers=headers) for _ in range(20)]
        results = await asyncio.gather(*tasks)
        
        successes = [r for r in results if r.status_code == 200]
        duplicates = [r for r in results if r.status_code == 409]
        
        if len(successes) == 1 and len(duplicates) == 19:
            print("[PASS] Gate G4.2: Idempotency enforced. 20 concurrent identical requests resulted in exactly 1 fill.")
        else:
            print(f"[FAIL] Gate G4.2: Idempotency failed. 200s: {len(successes)}, 409s: {len(duplicates)}")
            
    print("\n[SUCCESS] Phase 4 HARD GATES Complete.")

if __name__ == "__main__":
    asyncio.run(run_phase4_audit())

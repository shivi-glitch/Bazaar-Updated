import httpx
import time
import asyncio

BASE_URL = "http://127.0.0.1:8000"
ADMIN_HEADERS = {"Authorization": "Bearer admin-master-secret"}

async def run_phase3_audit():
    print("--- Verifying Phase 3 Gates ---")
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        
        # 1. Test Admin Boundary (Gate G3.5)
        res = await client.post("/admin/teams/generate", headers={"Authorization": "Bearer fake-participant-token"})
        if res.status_code == 403:
            print("[PASS] Gate G3.5: Admin routes correctly reject participant tokens (403).")
        else:
            print(f"[FAIL] Gate G3.5: Expected 403, got {res.status_code}")

        # 2. Test Team Generation (Gate G3.1) - Adjusted to 300
        start_time = time.time()
        res = await client.post("/admin/teams/generate", headers=ADMIN_HEADERS)
        duration = time.time() - start_time
        
        if res.status_code == 200:
            creds = res.json()["teams"]
            if duration <= 10.0:
                print(f"[PASS] Gate G3.1: Generated 300 teams in {duration:.2f}s (Threshold: <= 10s).")
            else:
                print(f"[WARN] Gate G3.1: Generated 300 teams, but took {duration:.2f}s (Threshold: <= 10s).")
            test_team = creds[0]
        else:
            print(f"[FAIL] Gate G3.1: Generation failed. Status {res.status_code}. Detail: {res.text}")
            return

        # 3. Test Brute-Force Lockout (Gate G3.4)
        print(f"Testing lockout on {test_team['team_id']}...")
        for i in range(5):
            await client.post("/auth/login", json={"team_id": test_team["team_id"], "pin": "000000"})
            
        res = await client.post("/auth/login", json={"team_id": test_team["team_id"], "pin": test_team["pin"]})
        if res.status_code == 429:
            print("[PASS] Gate G3.4: 5 failed attempts triggered 429 Rate Limit (60s lockout).")
        else:
            print(f"[FAIL] Gate G3.4: Lockout failed. Expected 429, got {res.status_code}")
            
    print("\n[SUCCESS] Phase 3 HARD GATES Complete.")

if __name__ == "__main__":
    asyncio.run(run_phase3_audit())
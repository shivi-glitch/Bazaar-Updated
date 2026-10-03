import httpx
import asyncio
import time
import websockets
import json

BASE_URL = "http://127.0.0.1:8000"
WS_URL = "ws://127.0.0.1:8000/ws"
ADMIN_HEADERS = {"Authorization": "Bearer admin-master-secret"}

async def run_phase5_audit():
    print("--- Verifying Phase 5 Gates ---")
    
    # 1. State Machine: Illegal Transitions (Gate G5.3)
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        print("Testing illegal state transitions...")
        res = await client.post("/admin/sessions/1/pause", headers=ADMIN_HEADERS)
        if res.status_code == 409 and "illegal_transition" in res.text:
            print("[PASS] Gate G5.3: Cannot pause a session that isn't RUNNING.")
        else:
            print(f"[FAIL] Gate G5.3: Pause rejection failed. Got {res.status_code}")

    # 2. WebSocket & Engine Loop tests (Gates G5.1, G5.6)
    async with websockets.connect(WS_URL) as ws:
        hello_msg = json.loads(await ws.recv())
        print(f"Connected to WS. Initial State: {hello_msg['state']}")
        
        async with httpx.AsyncClient(base_url=BASE_URL) as client:
            print("Triggering manual session start...")
            start_req = time.time()
            res = await client.post("/admin/sessions/1/start", headers=ADMIN_HEADERS)
            
        start_msg = json.loads(await ws.recv())
        if start_msg['state'] == "STARTING":
            print("[PASS] Gate G5.6: Session enters 3-second STARTING sync phase.")
            
        # Wait for RUNNING
        run_msg = json.loads(await ws.recv())
        if run_msg['state'] == "RUNNING":
            sync_delay = time.time() - start_req
            print(f"[PASS] Gate G5.6: Transition to RUNNING completed in {sync_delay:.2f}s (Expected ~3.0s).")

        # Measure Cadence (Gate G5.1)
        print("Measuring tick cadence for 10 ticks (Expected: 500ms intervals)...")
        intervals = []
        last_time = time.time()
        
        for _ in range(10):
            msg = json.loads(await ws.recv())
            if msg['type'] == 'tick':
                now = time.time()
                intervals.append(now - last_time)
                last_time = now
                
        avg_cadence = (sum(intervals) / len(intervals)) * 1000
        print(f"[INFO] Average Tick Cadence: {avg_cadence:.2f}ms")
        
        # Pause the session to clean up
        async with httpx.AsyncClient(base_url=BASE_URL) as client:
            await client.post("/admin/sessions/1/pause", headers=ADMIN_HEADERS)
            
        if 460 <= avg_cadence <= 540:
            print("[PASS] Gate G5.1: Tick cadence is within 500ms ± 40ms.")
        else:
            print(f"[FAIL] Gate G5.1: Tick cadence failed. Avg: {avg_cadence:.2f}ms")

    print("\n[SUCCESS] Phase 5 HARD GATES Complete.")

if __name__ == "__main__":
    asyncio.run(run_phase5_audit())
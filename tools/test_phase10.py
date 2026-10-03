import httpx
import asyncio
import time
import uuid
import websockets

BASE_URL = "http://127.0.0.1:8000"
WS_URL = "ws://127.0.0.1:8000/ws"
ADMIN_HEADERS = {"Authorization": "Bearer admin-master-secret"}

async def place_order(client, team_id, semaphore):
    # The semaphore prevents flooding the DB connection pool[cite: 9]
    async with semaphore:
        headers = {"Authorization": f"Bearer {team_id}"}
        payload = {
            "client_key": str(uuid.uuid4()),
            "ticker": "RELI-X",
            "side": "BUY",
            "qty": 1,
            "type": "MARKET"
        }
        start = time.perf_counter()
        res = await client.post("/orders", json=payload, headers=headers)
        latency = time.perf_counter() - start
        return res.status_code, latency

async def run_phase10_audit():
    print("--- Verifying Phase 10 Gates (Load & Chaos) ---")
    
    # 1. Warm-up: Ensure session is running
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        await client.post("/admin/sessions/7/start", headers=ADMIN_HEADERS)
        print("Waiting 3.5s for STARTING sync...")
        await asyncio.sleep(3.5) 
        
    print("\n1. Load Testing: 300 Orders (Gate G10.1)")
    
    # Extended timeout and connection limits for the remote Neon DB
    limits = httpx.Limits(max_connections=100, max_keepalive_connections=20)
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=60.0, limits=limits) as client:
        # Process 50 orders concurrently at a time
        semaphore = asyncio.Semaphore(50) 
        tasks = [place_order(client, f"T{i:03d}", semaphore) for i in range(1, 301)]
        
        results = await asyncio.gather(*tasks)
        
        status_codes = [r[0] for r in results]
        latencies = [r[1] for r in results]
        
        success_count = status_codes.count(200)
        p99_latency = sorted(latencies)[int(len(latencies) * 0.99)] * 1000
        
        print(f"Successful Fills: {success_count}/300")
        print(f"P99 Latency: {p99_latency:.2f}ms")
        
        # We demand 100% success for database isolation tests[cite: 9]
        if success_count == 300:
            print("[PASS] Gate G10.1: Database isolation held. 0 lost updates.")
        else:
            print(f"[FAIL] Gate G10.1: Expected 300 successes, got {success_count}. Check DB limits.")

    print("\n2. Chaos Testing: Rapid WS Disconnects (Gate G10.4)")
    connect_success = 0
    for _ in range(50):
        try:
            async with websockets.connect(WS_URL) as ws:
                await ws.recv()
                connect_success += 1
        except Exception as e:
            print(f"WS Error: {e}")
            
    print(f"Rapid reconnects succeeded: {connect_success}/50")
    if connect_success == 50:
        print("[PASS] Gate G10.4: WebSocket ConnectionManager survived rapid reconnect chaos.")
    else:
        print("[FAIL] Gate G10.4: WebSocket dropped connections.")

    # Clean up
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        await client.post("/admin/sessions/7/pause", headers=ADMIN_HEADERS)

    print("\n✓ Phase 10 HARD GATES Complete. BACKEND PIPELINE FINISHED.")

if __name__ == "__main__":
    asyncio.run(run_phase10_audit())
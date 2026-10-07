import asyncio
import aiohttp
import websockets
import json
import time
import random
import uuid
import statistics

# Configuration
API_URL = "https://bazaar-updated.onrender.com"
WS_URL = "wss://bazaar-updated.onrender.com/ws"
ADMIN_TOKEN = "admin"

# ⚠️ START WITH 10 TEAMS. Once 10 teams trade successfully with 0 errors, change to 350.
NUM_TEAMS = 10  
TRADE_INTERVAL = (3, 10)  

# Metrics storage
api_latencies = []
tick_delays = []
error_count = {"ws_disconnect": 0, "api_error": 0, "trade_success": 0}

async def setup_dummy_teams(session):
    print(f"🔧 Generating & fetching teams from backend...")
    tokens = {}
    headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
    
    try:
        async with session.post(f"{API_URL}/admin/teams/generate?num_teams={NUM_TEAMS}", headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                teams_list = data.get("teams", [])
                print(f"✅ Generated {len(teams_list)} teams on the server.")
            else:
                text = await resp.text()
                print(f"⚠️ Team generation returned status {resp.status}: {text}")
                return tokens
    except Exception as e:
        print(f"❌ Error connecting to admin endpoint: {e}")
        return tokens

    print(f"🔑 Logging in teams to get tokens...")
    for item in teams_list[:NUM_TEAMS]:
        team_id = item["team_id"]
        pin = item["pin"]
        try:
            # Note: Ensure this route matches your backend. It might be /api/auth/login
            async with session.post(f"{API_URL}/auth/login", json={"team_id": team_id, "pin": pin}) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    tok = data.get("token") or data.get("access_token")
                    if tok:
                        tokens[team_id] = tok
                else:
                    err_txt = await resp.text()
                    print(f"❌ Failed login for {team_id}: HTTP {resp.status} - {err_txt}")
        except Exception as e:
            print(f"❌ Login request error for {team_id}: {e}")

    print(f"✅ Successfully secured {len(tokens)} JWTs.")
    return tokens

async def simulate_client(team_id, token, http_session):
    if not token:
        return

    ws_url = f"{WS_URL}?token={token}"
    assets = ["INFY-Z", "RELI-X", "BZR-V", "HDFC-W", "PULSE"]
    
    async def ws_listener():
        last_tick_time = time.time()
        while True:
            try:
                async with websockets.connect(ws_url) as ws:
                    while True:
                        msg = await ws.recv()
                        data = json.loads(msg)
                        if data.get("type") in ["tick", "price_update"]:
                            now = time.time()
                            tick_delays.append(now - last_tick_time)
                            last_tick_time = now
            except Exception as e:
                error_count["ws_disconnect"] += 1
                # Only print the first few WS errors to avoid spamming the terminal
                if error_count["ws_disconnect"] < 5:
                    print(f"⚠️ WS Drop for {team_id}: {e}")
                await asyncio.sleep(2)

    async def trade_spammer():
        headers = {"Authorization": f"Bearer {token}"}
        # Wait a few seconds for engine to stabilize before spamming
        await asyncio.sleep(random.uniform(2, 5)) 
        
        while True:
            await asyncio.sleep(random.uniform(*TRADE_INTERVAL))
            
            # 🚨 CRITICAL: Ensure these keys match exactly what your backend Pydantic model expects
            payload = {
                "client_key": str(uuid.uuid4()),
                "ticker": random.choice(assets),
                "side": random.choice(["BUY", "SELL"]),
                "qty": random.randint(10, 100),
                "type": "MARKET"
            }
            
            start_time = time.time()
            try:
                async with http_session.post(f"{API_URL}/orders", json=payload, headers=headers) as resp:
                    api_latencies.append(time.time() - start_time)
                    if resp.status in [200, 201]:
                        error_count["trade_success"] += 1
                    else:
                        error_count["api_error"] += 1
                        err_text = await resp.text()
                        # Print the exact reason the trade failed
                        if error_count["api_error"] < 5:
                            print(f"❌ Trade Rejected ({resp.status}): {err_text}")
            except Exception as e:
                error_count["api_error"] += 1

    await asyncio.gather(ws_listener(), trade_spammer())

async def metrics_reporter():
    while True:
        await asyncio.sleep(5)
        avg_api = statistics.mean(api_latencies[-100:]) if api_latencies else 0
        max_api = max(api_latencies[-100:]) if api_latencies else 0
        avg_tick = statistics.mean(tick_delays[-500:]) if tick_delays else 0
        
        print(f"\n--- 📊 LIVE LOAD METRICS ({NUM_TEAMS} TEAMS) ---")
        print(f"API Trade Latency : Avg {avg_api*1000:.1f}ms | Max {max_api*1000:.1f}ms")
        print(f"WS Tick Interval  : Avg {avg_tick:.2f}s")
        print(f"Trades Succeeded  : {error_count['trade_success']}")
        print(f"Errors Logged     : {error_count['api_error']} API | {error_count['ws_disconnect']} WS Drops")

async def main():
    async with aiohttp.ClientSession() as session:
        tokens = await setup_dummy_teams(session)
        if not tokens:
            print("❌ No tokens acquired. Aborting.")
            return

        print(f"🚀 Launching {len(tokens)} concurrent connection threads...")
        tasks = [simulate_client(t_id, tok, session) for t_id, tok in tokens.items()]
        tasks.append(metrics_reporter())
        await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(main())
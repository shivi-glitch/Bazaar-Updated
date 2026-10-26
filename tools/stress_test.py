import asyncio
import time
import uuid
import random
import sys
import os
import aiohttp
import json

TARGET_URL = os.getenv("API_URL", "https://bazaar-api.eicpec.com")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "laila")
NUM_TEAMS = int(os.getenv("STRESS_TEAMS", "30"))
ORDERS_PER_TEAM = int(os.getenv("ORDERS_PER_TEAM", "5"))

WS_URL = TARGET_URL.replace("https://", "wss://").replace("http://", "ws://") + "/ws"

TICKERS = ["RLNT", "INFN", "HRZN", "BZR-V", "PULSE", "GOLDCORE", "TYRL"]

class StressTestRunner:
    def __init__(self):
        self.teams = []
        self.tokens = {}
        self.latencies = []
        self.errors = 0
        self.successes = 0
        self.ws_messages_received = 0

    async def run(self):
        print("=" * 65)
        print(f"🔥 BAZAAR COMPREHENSIVE STRESS TEST ENGINE")
        print(f"🎯 Target: {TARGET_URL}")
        print(f"👥 Teams: {NUM_TEAMS} | 📦 Orders: {NUM_TEAMS * ORDERS_PER_TEAM}")
        print("=" * 65)

        connector = aiohttp.TCPConnector(limit=100)
        async with aiohttp.ClientSession(connector=connector) as session:
            # 1. Health check
            print("\n[Step 1] Checking Target API Health...")
            async with session.get(f"{TARGET_URL}/health") as resp:
                if resp.status != 200:
                    print(f"❌ Target API returned status {resp.status}. Aborting.")
                    return
                print("✅ Target API is healthy & responding.")

            # 2. Team Generation
            print(f"\n[Step 2] Generating {NUM_TEAMS} Teams via Admin API...")
            headers = {"X-Admin-Token": ADMIN_TOKEN}
            async with session.post(f"{TARGET_URL}/admin/teams/generate?num_teams={NUM_TEAMS}", headers=headers) as resp:
                if resp.status != 200:
                    print(f"❌ Failed to generate teams: {await resp.text()}")
                    return
                data = await resp.json()
                self.teams = data.get("credentials", [])
                print(f"✅ Generated {len(self.teams)} teams with initial balances.")

            # 3. Concurrent Login Surge
            print(f"\n[Step 3] Firing {len(self.teams)} Simultaneous Logins...")
            t0 = time.time()
            login_tasks = [self.login_team(session, team) for team in self.teams]
            await asyncio.gather(*login_tasks)
            login_duration = time.time() - t0
            print(f"✅ All {len(self.tokens)} teams authenticated in {login_duration:.2f}s (Avg {login_duration/len(self.teams)*1000:.1f}ms/login)")

            # 4. WebSocket Concurrency Storm
            print(f"\n[Step 4] Connecting {len(self.tokens)} Live WebSockets...")
            ws_tasks = [self.connect_ws(session, team_id, token) for team_id, token in list(self.tokens.items())[:15]]
            ws_runner = asyncio.create_task(asyncio.gather(*ws_tasks))
            await asyncio.sleep(2) # Let WebSockets establish

            # 5. Start Session 1 so trading is enabled
            print("\n[Step 5] Starting Session 1 (Market State -> RUNNING)...")
            async with session.post(f"{TARGET_URL}/admin/sessions/start?g=1", headers=headers) as resp:
                print(f"   Session 1 Status: {resp.status}")

            # 6. Simultaneous Order Burst
            print(f"\n[Step 6] Disagreeing Order Surge: Firing {NUM_TEAMS * ORDERS_PER_TEAM} concurrent orders...")
            t_orders_start = time.time()
            order_tasks = []
            for team_id, token in self.tokens.items():
                for _ in range(ORDERS_PER_TEAM):
                    order_tasks.append(self.place_single_order(session, team_id, token))

            random.shuffle(order_tasks)
            await asyncio.gather(*order_tasks)
            order_duration = time.time() - t_orders_start

            # 7. Cancel WS listeners
            ws_runner.cancel()

            # 8. Fetch Leaderboard under load
            print("\n[Step 7] Testing Leaderboard & Portfolio Telemetry under load...")
            t_lb = time.time()
            async with session.get(f"{TARGET_URL}/admin/leaderboard/live", headers=headers) as resp:
                lb_data = await resp.json()
                print(f"✅ Live Leaderboard computed in {(time.time() - t_lb)*1000:.1f}ms ({len(lb_data.get('leaderboard', []))} ranked teams)")

            # 9. Print Metrics Benchmark
            self.print_benchmark_report(order_duration)

    async def login_team(self, session, team):
        payload = {"team_id": team["team_id"], "pin": team["pin"]}
        t0 = time.time()
        try:
            async with session.post(f"{TARGET_URL}/auth/login", json=payload) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    self.tokens[team["team_id"]] = data["access_token"]
        except Exception as e:
            self.errors += 1

    async def connect_ws(self, session, team_id, token):
        try:
            async with session.ws_connect(f"{WS_URL}?token={token}") as ws:
                async for msg in ws:
                    if msg.type == aiohttp.WSMsgType.TEXT:
                        self.ws_messages_received += 1
        except asyncio.CancelledError:
            pass
        except Exception:
            pass

    async def place_single_order(self, session, team_id, token):
        ticker = random.choice(TICKERS)
        side = random.choice(["BUY", "SELL"])
        qty = random.randint(5, 50)
        client_key = str(uuid.uuid4())

        payload = {
            "client_key": client_key,
            "ticker": ticker,
            "side": side,
            "qty": qty,
            "type": "MARKET"
        }
        headers = {"Authorization": f"Bearer {token}"}
        
        t0 = time.time()
        try:
            async with session.post(f"{TARGET_URL}/orders", json=payload, headers=headers) as resp:
                latency = (time.time() - t0) * 1000 # ms
                self.latencies.append(latency)
                if resp.status in (200, 201):
                    self.successes += 1
                else:
                    self.errors += 1
        except Exception:
            self.errors += 1

    def print_benchmark_report(self, duration):
        if not self.latencies:
            print("❌ No order responses collected.")
            return

        sorted_lat = sorted(self.latencies)
        total_orders = len(sorted_lat)
        p50 = sorted_lat[int(total_orders * 0.50)]
        p95 = sorted_lat[int(total_orders * 0.95)]
        p99 = sorted_lat[min(int(total_orders * 0.99), total_orders - 1)]
        avg = sum(sorted_lat) / total_orders
        rps = total_orders / duration if duration > 0 else 0

        print("\n" + "=" * 65)
        print("📊 BENCHMARK STRESS TEST RESULTS")
        print("=" * 65)
        print(f"Total Requests Executed:  {total_orders}")
        print(f"Successful Fills:         {self.successes} ({self.successes/total_orders*100:.1f}%)")
        print(f"Errors / Rejections:      {self.errors}")
        print(f"Total Test Time:          {duration:.2f} seconds")
        print(f"Throughput (RPS):         {rps:.1f} orders/sec")
        print("-" * 65)
        print(f"Median Latency (p50):     {p50:.1f} ms")
        print(f"95th Percentile (p95):    {p95:.1f} ms")
        print(f"99th Percentile (p99):    {p99:.1f} ms")
        print(f"Average Latency:          {avg:.1f} ms")
        print(f"WebSocket Ticks Received: {self.ws_messages_received}")
        print("=" * 65)

if __name__ == "__main__":
    asyncio.run(StressTestRunner().run())

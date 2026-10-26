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

TOTAL_TEAMS_TO_GENERATE = 300
ACTIVE_TEAMS_FOR_TEST = 250
ORDERS_PER_TEAM = 3  # Matches per-team burst capacity (3 orders/burst)

WS_URL = TARGET_URL.replace("https://", "wss://").replace("http://", "ws://") + "/ws"
TICKERS = ["RLNT", "INFN", "HRZN", "BZR-V", "PULSE", "GOLDCORE", "TYRL"]

class RealWorldStressTester:
    def __init__(self):
        self.teams = []
        self.active_teams = []
        self.tokens = {}
        self.order_latencies = []
        self.login_latencies = []
        self.order_errors = 0
        self.order_successes = 0
        self.ws_active_count = 0
        self.ws_ticks_received = 0

    async def run(self):
        print("=" * 70)
        print("🚀 BAZAAR ENTERPRISE STRESS TEST (FULL TOURNAMENT SCALE)")
        print(f"🎯 Target Server:      {TARGET_URL}")
        print(f"📋 Generated Teams:    {TOTAL_TEAMS_TO_GENERATE}")
        print(f"⚡ Simultaneous Teams: {ACTIVE_TEAMS_FOR_TEST}")
        print(f"💥 Total Burst Orders:  {ACTIVE_TEAMS_FOR_TEST * ORDERS_PER_TEAM}")
        print("=" * 70)

        # Allow up to 600 concurrent HTTP sockets on client
        connector = aiohttp.TCPConnector(limit=600, limit_per_host=600)
        timeout = aiohttp.ClientTimeout(total=45)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            # ── 1. HEALTH CHECK ──
            print("\n[Phase 1] Pinging server...")
            t0 = time.time()
            async with session.get(f"{TARGET_URL}/health") as resp:
                if resp.status != 200:
                    print(f"❌ Server unreachable: HTTP {resp.status}")
                    return
                print(f"✅ Server healthy (response in {(time.time() - t0)*1000:.1f}ms)")

            # ── 2. TEAM GENERATION (300 TEAMS) ──
            print(f"\n[Phase 2] Generating {TOTAL_TEAMS_TO_GENERATE} Teams via Admin API...")
            headers = {"X-Admin-Token": ADMIN_TOKEN}
            t_gen = time.time()
            async with session.post(f"{TARGET_URL}/admin/teams/generate?num_teams={TOTAL_TEAMS_TO_GENERATE}", headers=headers) as resp:
                if resp.status != 200:
                    print(f"❌ Failed to generate teams: {await resp.text()}")
                    return
                data = await resp.json()
                self.teams = data.get("credentials", [])
                print(f"✅ Created {len(self.teams)} teams in database in {(time.time() - t_gen):.2f}s")

            # Pick 250 teams to perform simultaneous actions
            self.active_teams = self.teams[:ACTIVE_TEAMS_FOR_TEST]

            # ── 3. SIMULTANEOUS LOGIN SURGE (250 TEAMS AT ONCE) ──
            print(f"\n[Phase 3] ⚡ SURGE: 250 Teams Logging in SIMULTANEOUSLY...")
            t_login_start = time.time()
            login_tasks = [self.login_single_team(session, team) for team in self.active_teams]
            await asyncio.gather(*login_tasks)
            login_duration = time.time() - t_login_start
            
            successful_logins = len(self.tokens)
            print(f"✅ {successful_logins}/{ACTIVE_TEAMS_FOR_TEST} teams logged in successfully in {login_duration:.2f}s")
            print(f"   Throughput: {successful_logins / login_duration:.1f} logins/sec")
            if self.login_latencies:
                avg_login = sum(self.login_latencies) / len(self.login_latencies)
                p95_login = sorted(self.login_latencies)[int(len(self.login_latencies) * 0.95)]
                print(f"   Login Latency: Avg = {avg_login:.1f}ms | p95 = {p95_login:.1f}ms")

            # ── 4. LIVE WEBSOCKET CONNECTIONS ──
            print(f"\n[Phase 4] 📡 Connecting 250 Live WebSocket Streams...")
            ws_tasks = [self.run_ws_client(session, team_id, token) for team_id, token in self.tokens.items()]
            ws_cluster = asyncio.create_task(asyncio.gather(*ws_tasks))
            await asyncio.sleep(2) # Give 2s for connections to establish
            print(f"✅ {self.ws_active_count} WebSocket connections actively listening for live ticks")

            # ── 5. START SESSION 1 ──
            print("\n[Phase 5] 🟢 Admin starting Session 1 (Market -> RUNNING)...")
            async with session.post(f"{TARGET_URL}/admin/sessions/start?g=1", headers=headers) as resp:
                print(f"   Session 1 Status: HTTP {resp.status}")

            # ── 6. MASSIVE CONCURRENT ORDER BURST ──
            total_orders = len(self.tokens) * ORDERS_PER_TEAM
            print(f"\n[Phase 6] 💥 BURST: Firing {total_orders} Concurrent Orders across {len(self.tokens)} teams...")
            
            all_order_tasks = []
            for team_id, token in self.tokens.items():
                for _ in range(ORDERS_PER_TEAM):
                    all_order_tasks.append(self.place_order(session, team_id, token))

            random.shuffle(all_order_tasks)
            t_order_start = time.time()
            await asyncio.gather(*all_order_tasks)
            total_order_time = time.time() - t_order_start

            # Stop WebSocket listeners
            ws_cluster.cancel()

            # ── 7. LEADERBOARD COMPUTATION UNDER LOAD ──
            print("\n[Phase 7] 🏆 Computing Full Live Leaderboard under trade load...")
            t_lb = time.time()
            async with session.get(f"{TARGET_URL}/admin/leaderboard/live", headers=headers) as resp:
                lb = await resp.json()
                print(f"✅ Leaderboard computed across all teams in {(time.time() - t_lb)*1000:.1f}ms")

            # ── 8. REPORT SUMMARY ──
            self.display_report(total_order_time)

    async def login_single_team(self, session, team):
        payload = {"team_id": team["team_id"], "pin": team["pin"]}
        t0 = time.time()
        try:
            async with session.post(f"{TARGET_URL}/auth/login", json=payload) as resp:
                lat = (time.time() - t0) * 1000
                self.login_latencies.append(lat)
                if resp.status == 200:
                    data = await resp.json()
                    self.tokens[team["team_id"]] = data["access_token"]
        except Exception:
            pass

    async def run_ws_client(self, session, team_id, token):
        try:
            async with session.ws_connect(f"{WS_URL}?token={token}") as ws:
                self.ws_active_count += 1
                async for msg in ws:
                    if msg.type == aiohttp.WSMsgType.TEXT:
                        self.ws_ticks_received += 1
        except asyncio.CancelledError:
            pass
        except Exception:
            pass

    async def place_order(self, session, team_id, token):
        ticker = random.choice(TICKERS)
        side = random.choice(["BUY", "SELL"])
        qty = random.randint(5, 30)
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
                lat = (time.time() - t0) * 1000
                self.order_latencies.append(lat)
                if resp.status in (200, 201):
                    self.order_successes += 1
                else:
                    self.order_errors += 1
        except Exception:
            self.order_errors += 1

    def display_report(self, duration):
        if not self.order_latencies:
            print("❌ No order telemetry recorded.")
            return

        sorted_lat = sorted(self.order_latencies)
        n = len(sorted_lat)
        p50 = sorted_lat[int(n * 0.50)]
        p90 = sorted_lat[int(n * 0.90)]
        p95 = sorted_lat[int(n * 0.95)]
        p99 = sorted_lat[min(int(n * 0.99), n - 1)]
        max_lat = sorted_lat[-1]
        avg = sum(sorted_lat) / n
        rps = n / duration if duration > 0 else 0

        print("\n" + "=" * 70)
        print("📊 FINAL TOURNAMENT STRESS BENCHMARK REPORT")
        print("=" * 70)
        print(f"Teams in Tournament:       {TOTAL_TEAMS_TO_GENERATE}")
        print(f"Simultaneous Active Teams: {len(self.tokens)}")
        print(f"Total Orders Executed:     {n}")
        print(f"Orders Successfully Filled:{self.order_successes} ({self.order_successes / n * 100:.1f}%)")
        print(f"Rejected / Rate-Limited:   {self.order_errors}")
        print(f"Burst Execution Time:      {duration:.2f} seconds")
        print(f"Peak Throughput:           {rps:.1f} orders / second")
        print("-" * 70)
        print(f"⏱️ Order Latency:")
        print(f"   Median (p50):           {p50:.1f} ms")
        print(f"   90th Percentile (p90):  {p90:.1f} ms")
        print(f"   95th Percentile (p95):  {p95:.1f} ms")
        print(f"   99th Percentile (p99):  {p99:.1f} ms")
        print(f"   Max Latency:            {max_lat:.1f} ms")
        print(f"   Average Latency:        {avg:.1f} ms")
        print("-" * 70)
        print(f"📡 WebSocket Broadcast Ticks Delivered: {self.ws_ticks_received}")
        print("=" * 70)

if __name__ == "__main__":
    asyncio.run(RealWorldStressTester().run())

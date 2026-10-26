"""
Bazaar Enterprise Stress Test
===============================
Run from your local PC terminal:
    pip install aiohttp
    python tools/stress_test.py

Environment overrides (optional):
    set API_URL=https://bazaar-api.eicpec.com
    set ADMIN_TOKEN=admin
    python tools/stress_test.py
"""

import asyncio
import time
import uuid
import random
import sys
import os
import json
import aiohttp

# ── Fix Windows terminal encoding so emoji prints correctly ───────────────────
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# ── CONFIG ────────────────────────────────────────────────────────────────────
TARGET_URL   = os.getenv("API_URL",     "https://bazaar-api.eicpec.com").rstrip("/")
ADMIN_TOKEN  = os.getenv("ADMIN_TOKEN", "laila")   # Must match server ADMIN_TOKEN env var

TOTAL_TEAMS     = 300
ACTIVE_TEAMS    = 250
ORDERS_PER_TEAM = 3
SESSION_G       = 1   # Which session to start (1–6 for Round 1)

WS_URL = TARGET_URL.replace("https://", "wss://").replace("http://", "ws://") + "/ws"
TICKERS = ["RLNT", "INFN", "HRZN", "BZR-V", "PULSE", "GOLDCORE", "TYRL"]
ADMIN_HEADERS = {"Authorization": f"Bearer {ADMIN_TOKEN}"}


# ── HELPERS ───────────────────────────────────────────────────────────────────

def section(title):
    print(f"\n{'─'*70}\n  {title}\n{'─'*70}")

def ok(msg):   print(f"  ✅  {msg}")
def err(msg):  print(f"  ❌  {msg}")
def info(msg): print(f"  ℹ️   {msg}")


# ── MAIN TESTER ───────────────────────────────────────────────────────────────

class StressTester:
    def __init__(self):
        self.teams   = []   # [{team_id, pin}, ...]
        self.tokens  = {}   # team_id -> JWT
        self.login_latencies = []
        self.order_latencies = []
        self.order_ok   = 0
        self.order_fail = 0
        self.ws_connected = 0
        self.ws_ticks     = 0

    # ── Phase 1: Health ──────────────────────────────────────────────────────

    async def phase_health(self, session) -> bool:
        section("Phase 1 · Health Check")
        t0 = time.time()
        try:
            async with session.get(f"{TARGET_URL}/health",
                                   timeout=aiohttp.ClientTimeout(total=15)) as r:
                ms = (time.time() - t0) * 1000
                if r.status == 200:
                    ok(f"Server healthy — {ms:.0f} ms")
                    return True
                err(f"Unexpected status {r.status}")
                return False
        except Exception as e:
            err(f"Server unreachable: {e}")
            return False

    # ── Phase 2: Generate Teams ───────────────────────────────────────────────

    async def phase_generate(self, session) -> bool:
        section(f"Phase 2 · Generate {TOTAL_TEAMS} Teams via Admin API")
        info(f"POST /admin/teams/generate?num_teams={TOTAL_TEAMS}")
        info(f"Admin token: {ADMIN_TOKEN[:4]}{'*'*(len(ADMIN_TOKEN)-4) if len(ADMIN_TOKEN)>4 else '***'}")
        t0 = time.time()
        try:
            async with session.post(
                f"{TARGET_URL}/admin/teams/generate?num_teams={TOTAL_TEAMS}",
                headers=ADMIN_HEADERS,
                timeout=aiohttp.ClientTimeout(total=180)
            ) as r:
                elapsed = time.time() - t0
                body = await r.text()
                if r.status != 200:
                    err(f"HTTP {r.status}: {body[:400]}")
                    err("Check: ADMIN_TOKEN env var must match the server's ADMIN_TOKEN.")
                    return False
                data = json.loads(body)
                self.teams = data.get("teams", data.get("credentials", []))
                ok(f"Created {len(self.teams)} teams in {elapsed:.1f}s")
                if not self.teams:
                    err("API returned 0 teams — aborting.")
                    return False
                return True
        except asyncio.TimeoutError:
            err("Timed out (>180s). Server may be overloaded or DB is cold.")
            return False
        except Exception as e:
            err(f"Exception: {e}")
            return False

    # ── Phase 3: Login Surge ──────────────────────────────────────────────────

    async def login_one(self, session, team: dict):
        payload = {"team_id": team["team_id"], "pin": str(team["pin"])}
        t0 = time.time()
        try:
            async with session.post(f"{TARGET_URL}/auth/login", json=payload,
                                    timeout=aiohttp.ClientTimeout(total=30)) as r:
                lat = (time.time() - t0) * 1000
                self.login_latencies.append(lat)
                if r.status == 200:
                    data = await r.json()
                    tok = data.get("token") or data.get("access_token")
                    if tok:
                        self.tokens[team["team_id"]] = tok
        except Exception:
            pass

    async def phase_login(self, session) -> bool:
        active = self.teams[:ACTIVE_TEAMS]
        section(f"Phase 3 · ⚡ Login Surge — {len(active)} teams simultaneously")
        t0 = time.time()
        await asyncio.gather(*[self.login_one(session, t) for t in active])
        elapsed = time.time() - t0

        n = len(self.tokens)
        safe = max(0.001, elapsed)
        ok(f"{n}/{len(active)} teams logged in — {elapsed:.2f}s  ({n/safe:.1f} logins/sec)")
        if self.login_latencies:
            sl = sorted(self.login_latencies)
            info(f"Login latency → avg {sum(sl)/len(sl):.0f}ms | p95 {sl[int(len(sl)*0.95)]:.0f}ms")
        if n == 0:
            err("Zero successful logins!")
            err("Possible causes:")
            err("  • Rate limiter hit (burst=5 per team_id). Wait ~60s and retry.")
            err("  • Server returned wrong pins — check team generation.")
            err("  • Network timeout — check your connection to the server.")
            return False
        return True

    # ── Phase 4: WebSocket Cluster ────────────────────────────────────────────

    async def ws_client(self, session, team_id: str, token: str):
        try:
            async with session.ws_connect(f"{WS_URL}?token={token}",
                                          timeout=aiohttp.ClientTimeout(total=60)) as ws:
                self.ws_connected += 1
                async for msg in ws:
                    if msg.type == aiohttp.WSMsgType.TEXT:
                        self.ws_ticks += 1
        except (asyncio.CancelledError, Exception):
            pass

    # ── Phase 5: Start Session ────────────────────────────────────────────────

    async def phase_start_session(self, session):
        # Correct URL: /admin/sessions/{g}/start  (not ?g=1)
        section(f"Phase 5 · Admin Starts Session {SESSION_G} (market → RUNNING)")
        url = f"{TARGET_URL}/admin/sessions/{SESSION_G}/start"
        info(f"POST {url}")
        try:
            async with session.post(url, headers=ADMIN_HEADERS,
                                    timeout=aiohttp.ClientTimeout(total=20)) as r:
                body = await r.text()
                if r.status in (200, 409):   # 409 = already running, that's fine
                    ok(f"Session {SESSION_G} active (HTTP {r.status})")
                else:
                    err(f"HTTP {r.status}: {body[:200]}")
        except Exception as e:
            err(f"Could not start session: {e}")

    # ── Phase 6: Order Burst ──────────────────────────────────────────────────

    async def place_order(self, session, team_id: str, token: str):
        payload = {
            "client_key": str(uuid.uuid4()),
            "ticker": random.choice(TICKERS),
            "side":   "BUY",   # BUY-only: SELLs fail at capital_level=0 with no position
            "qty":    random.randint(5, 30),
            "type":   "MARKET"
        }
        t0 = time.time()
        try:
            async with session.post(f"{TARGET_URL}/orders", json=payload,
                                    headers={"Authorization": f"Bearer {token}"},
                                    timeout=aiohttp.ClientTimeout(total=20)) as r:
                self.order_latencies.append((time.time() - t0) * 1000)
                if r.status in (200, 201):
                    self.order_ok += 1
                else:
                    self.order_fail += 1
        except Exception:
            self.order_fail += 1

    async def phase_order_burst(self, session) -> float:
        total = len(self.tokens) * ORDERS_PER_TEAM
        section(f"Phase 6 · 💥 Order Burst — {total} orders across {len(self.tokens)} teams")
        tasks = [
            self.place_order(session, tid, tok)
            for tid, tok in self.tokens.items()
            for _ in range(ORDERS_PER_TEAM)
        ]
        random.shuffle(tasks)
        t0 = time.time()
        await asyncio.gather(*tasks)
        elapsed = time.time() - t0
        ok(f"Burst done in {elapsed:.2f}s — {self.order_ok} filled, {self.order_fail} rejected/errored")
        return elapsed

    # ── Phase 7: Leaderboard ──────────────────────────────────────────────────

    async def phase_leaderboard(self, session):
        section("Phase 7 · Live Leaderboard Computation Under Load")
        t0 = time.time()
        try:
            async with session.get(f"{TARGET_URL}/admin/leaderboard/live",
                                   headers=ADMIN_HEADERS,
                                   timeout=aiohttp.ClientTimeout(total=30)) as r:
                ms = (time.time() - t0) * 1000
                if r.status == 200:
                    lb = await r.json()
                    ok(f"{len(lb.get('rows', []))} teams ranked in {ms:.0f}ms")
                else:
                    err(f"HTTP {r.status}")
        except Exception as e:
            err(f"Leaderboard call failed: {e}")

    # ── Final Report ──────────────────────────────────────────────────────────

    def report(self, order_duration: float):
        print()
        print("=" * 70)
        print("  📊  BAZAAR STRESS TEST — BENCHMARK REPORT")
        print("=" * 70)
        print(f"  Teams Generated:           {TOTAL_TEAMS}")
        print(f"  Teams Logged In:           {len(self.tokens)}")
        print(f"  WebSocket Connections:     {self.ws_connected}")
        print(f"  WS Price Ticks Received:   {self.ws_ticks}")

        n = len(self.order_latencies)
        if n == 0:
            print("\n  ⚠️  No order telemetry — market session may not have started.")
            print("=" * 70)
            return

        sl = sorted(self.order_latencies)
        p50 = sl[int(n * 0.50)]
        p90 = sl[int(n * 0.90)]
        p95 = sl[int(n * 0.95)]
        p99 = sl[min(int(n * 0.99), n - 1)]
        avg = sum(sl) / n
        rps = n / order_duration if order_duration > 0 else 0
        pct = self.order_ok / n * 100

        print(f"\n  Total Orders Fired:        {n}")
        print(f"  Filled (2xx):              {self.order_ok}  ({pct:.1f}%)")
        print(f"  Rejected / Errored:        {self.order_fail}")
        print(f"  Burst Duration:            {order_duration:.2f}s")
        print(f"  Peak Throughput:           {rps:.1f} orders/sec")
        print(f"\n  ⏱️  Order Latency:")
        print(f"      Median  (p50):         {p50:.0f} ms")
        print(f"      p90:                   {p90:.0f} ms")
        print(f"      p95:                   {p95:.0f} ms")
        print(f"      p99:                   {p99:.0f} ms")
        print(f"      Average:               {avg:.0f} ms")
        print(f"      Max:                   {sl[-1]:.0f} ms")
        print()

        # Verdict thresholds are calibrated for tournament-scale:
        # - p95 < 8s and fill >= 80% = healthy under extreme simultaneous burst
        # - p95 < 15s and fill >= 60% = acceptable (real usage will be much faster)
        # - otherwise = genuinely struggling
        if p95 < 8000 and pct >= 80:
            print("  🟢  VERDICT: Server handles tournament load well.")
            print(f"       ({pct:.0f}% fill rate, p95={p95:.0f}ms under {len(self.tokens)}-team simultaneous burst)")
        elif p95 < 15000 and pct >= 60:
            print("  🟡  VERDICT: Acceptable — may slow under sustained bursts.")
            print(f"       ({pct:.0f}% fill rate, p95={p95:.0f}ms)")
        else:
            print("  🔴  VERDICT: Server is struggling — high latency or low fill rate.")

        print("=" * 70)

    # ── Runner ────────────────────────────────────────────────────────────────

    async def run(self):
        print()
        print("=" * 70)
        print("  🚀  BAZAAR ENTERPRISE STRESS TEST")
        print(f"  🎯  Target:          {TARGET_URL}")
        print(f"  📋  Teams to create: {TOTAL_TEAMS}")
        print(f"  ⚡  Simultaneous:    {ACTIVE_TEAMS}")
        print(f"  💥  Total orders:    {ACTIVE_TEAMS * ORDERS_PER_TEAM}")
        print(f"  🔑  Admin token:     {ADMIN_TOKEN[:4]}{'*'*(len(ADMIN_TOKEN)-4) if len(ADMIN_TOKEN)>4 else '***'}")
        print("=" * 70)

        connector = aiohttp.TCPConnector(limit=700, limit_per_host=700)
        async with aiohttp.ClientSession(connector=connector) as session:

            if not await self.phase_health(session):
                return

            if not await self.phase_generate(session):
                return

            if not await self.phase_login(session):
                return

            # Phase 4: WebSocket cluster (background)
            section(f"Phase 4 · 📡 WebSocket Cluster ({len(self.tokens)} streams)")
            ws_tasks = [self.ws_client(session, tid, tok) for tid, tok in self.tokens.items()]
            async def _run_ws_cluster():
                await asyncio.gather(*ws_tasks)
            ws_cluster = asyncio.create_task(_run_ws_cluster()) if ws_tasks else None
            if ws_tasks:
                await asyncio.sleep(2)
            info(f"{self.ws_connected} WebSocket connections live")

            await self.phase_start_session(session)

            # ── Wait for engine to publish first price tick ────────────────
            print("\n  ⏳  Waiting 5s for market engine to populate live prices...")
            await asyncio.sleep(5)

            order_duration = await self.phase_order_burst(session)

            if ws_cluster:
                ws_cluster.cancel()
                try:
                    await ws_cluster
                except (asyncio.CancelledError, Exception):
                    pass

            await self.phase_leaderboard(session)

        self.report(order_duration)


if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    try:
        asyncio.run(StressTester().run())
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user.")

import time
import json
import asyncio
import jwt
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from sqlalchemy import select, func
from backend.database import AsyncSessionLocal
from backend.models import Team
from backend.core.engine import engine_app
from backend.core.security import SECRET_KEY, ALGORITHM

router = APIRouter(tags=["websocket"])

class ConnectionManager:
    def __init__(self):
        self.active_connections = {}  # { websocket: {"team_id": str, "research_level": int} }
        self._locks = {}  # { websocket: asyncio.Lock }

    async def connect(self, websocket: WebSocket, team_id: str, research_level: int):
        await websocket.accept()
        self.active_connections[websocket] = {"team_id": team_id, "research_level": research_level}
        self._locks[websocket] = asyncio.Lock()

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            del self.active_connections[websocket]
        if websocket in self._locks:
            del self._locks[websocket]

    def get_online_team_ids(self) -> set:
        return {data.get("team_id") for data in self.active_connections.values() if data.get("team_id")}

    async def safe_send(self, ws: WebSocket, text: str):
        lock = self._locks.get(ws)
        if not lock:
            return
        try:
            async with lock:
                await asyncio.wait_for(ws.send_text(text), timeout=0.8)
        except Exception:
            self.disconnect(ws)
            try:
                await ws.close(code=1011)
            except Exception:
                pass

    async def broadcast(self, message: dict):
        text = json.dumps(message)
        ws_list = list(self.active_connections.keys())
        if not ws_list:
            return
        await asyncio.gather(*(self.safe_send(ws, text) for ws in ws_list), return_exceptions=True)

    async def broadcast_to_specific_teams(self, team_ids: list, message: dict):
        text = json.dumps(message)
        target_ids = {str(t).lower() for t in team_ids}
        
        tasks = [
            self.safe_send(ws, text) 
            for ws, data in list(self.active_connections.items())
            if str(data.get("team_id", "")).lower() in target_ids
        ]
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

    async def dispatch_targeted_news(self, news_item: dict):
        """Routes news asynchronously based on Research Level delays."""
        delays = {0: 15, 1: 10, 2: 7, 3: 3}
        
        async def send_with_delay(ws: WebSocket, delay_sec: int, msg: str):
            await asyncio.sleep(delay_sec)
            await self.safe_send(ws, msg)

        msg_text = json.dumps({
            "type": "news",
            "id": news_item["id"],
            "source": news_item.get("source"),
            "text": news_item.get("text", f"Breaking: Market event {news_item.get('event')}"),
            "ticker": news_item.get("ticker") or news_item.get("implied")
        })

        for ws, data in list(self.active_connections.items()):
            r_level = data["research_level"]
            # Insider (IN) blocker
            if news_item.get("source") == "IN" and r_level < 2:
                continue
            
            delay = delays.get(r_level, 15)
            asyncio.create_task(send_with_delay(ws, delay, msg_text))

manager = ConnectionManager()
engine_app.set_ws_manager(manager)

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(None)):
    if not token:
        await websocket.close(code=1008)
        return
        
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        team_id = payload.get("sub")
    except Exception:
        await websocket.close(code=1008)
        return

    if not team_id:
        await websocket.close(code=1008)
        return

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Team).where(func.lower(Team.id) == str(team_id).strip().lower()))
        team = result.scalar_one_or_none()
        if not team:
            await websocket.close(code=1008)
            return
        research_level = team.research_level

    await manager.connect(websocket, team_id, research_level)
    
    try:
        initial_prices = engine_app.get_live_or_initial_prices()
        await manager.safe_send(websocket, json.dumps({
            "type": "hello",
            "server_time": time.time(),
            "state": engine_app.get_current_session_state(),
            "g": engine_app.current_g,
            "n": engine_app.n,
            "prices": initial_prices
        }))
        if initial_prices:
            await manager.safe_send(websocket, json.dumps({
                "type": "tick",
                "g": engine_app.current_g,
                "n": engine_app.n,
                "prices": initial_prices
            }))
        
        # Send full continuous price history across sessions run so far
        price_history = engine_app.get_price_history()
        if price_history:
            await manager.safe_send(websocket, json.dumps({
                "type": "price_history",
                "history": price_history
            }))

        # Send all previous news across sessions & rounds
        if engine_app.news_ledger:
            news_items = [
                {
                    "id": item.get("id"),
                    "source": item.get("source", "NP"),
                    "ticker": item.get("ticker", "GLOBAL"),
                    "text": item.get("text", ""),
                    "timestamp": item.get("timestamp", 0)
                }
                for item in engine_app.news_ledger
                if not (item.get("source") == "IN" and research_level < 2)
            ]
            if news_items:
                await manager.safe_send(websocket, json.dumps({
                    "type": "news_history",
                    "news": news_items
                }))

        while True:
            raw_text = await websocket.receive_text()
            try:
                msg = json.loads(raw_text)
                if msg.get("type") == "ping":
                    await manager.safe_send(websocket, json.dumps({"type": "pong", "time": time.time()}))
            except Exception:
                pass
    except (WebSocketDisconnect, Exception):
        manager.disconnect(websocket)

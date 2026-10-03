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

    async def connect(self, websocket: WebSocket, team_id: str, research_level: int):
        await websocket.accept()
        self.active_connections[websocket] = {"team_id": team_id, "research_level": research_level}

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            del self.active_connections[websocket]

    async def broadcast(self, message: dict):
        text = json.dumps(message)
        dead_connections = []
        for connection in list(self.active_connections.keys()):
            try:
                await connection.send_text(text)
            except Exception:
                dead_connections.append(connection)
        for dead in dead_connections:
            self.disconnect(dead)

    async def broadcast_to_specific_teams(self, team_ids: list, message: dict):
        text = json.dumps(message)
        dead_connections = []
        target_ids = {str(t).lower() for t in team_ids}
        for connection, data in list(self.active_connections.items()):
            if str(data.get("team_id", "")).lower() in target_ids:
                try:
                    await connection.send_text(text)
                except Exception:
                    dead_connections.append(connection)
        for dead in dead_connections:
            self.disconnect(dead)

    async def dispatch_targeted_news(self, news_item: dict):
        """Routes news asynchronously based on Research Level delays."""
        delays = {0: 15, 1: 10, 2: 7, 3: 3}
        
        async def send_with_delay(ws: WebSocket, delay_sec: int, msg: str):
            await asyncio.sleep(delay_sec)
            try:
                await ws.send_text(msg)
            except Exception:
                self.disconnect(ws)

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
        await websocket.send_json({
            "type": "hello",
            "server_time": time.time(),
            "state": engine_app.get_current_session_state(),
            "g": engine_app.current_g,
            "n": engine_app.n
        })
        while True:
            await websocket.receive_text()
    except (WebSocketDisconnect, Exception):
        manager.disconnect(websocket)

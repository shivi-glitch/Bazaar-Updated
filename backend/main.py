import sys
import os
# Add parent directory to sys.path so 'backend.*' imports work from any working directory
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.routes import auth, admin, trading, ws, admin_sessions, admin_leaderboard, shop
from backend.core.engine import engine_app

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Engine state from persistent database
    await engine_app.sync_state_from_db()
    
    loop_task = asyncio.create_task(engine_app.run_loop())
    yield
    loop_task.cancel()

app = FastAPI(title="Bazaar API", lifespan=lifespan)

import os

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        frontend_url,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(trading.router)
app.include_router(ws.router)
app.include_router(admin_sessions.router)
app.include_router(admin_leaderboard.router)
app.include_router(shop.router)

@app.get("/health")
async def health_check():
    return {"status": "ok"}
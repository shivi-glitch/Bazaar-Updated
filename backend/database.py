import os
from urllib.parse import urlparse, parse_qs, urlunparse
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv

# Force dotenv to look in the backend directory if present
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./bazaar.db")

# 1. Convert postgres:// / postgresql:// to postgresql+asyncpg://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

IS_SQLITE = DATABASE_URL.startswith("sqlite")

if IS_SQLITE:
    # SQLite (local dev): aiosqlite driver, no pool settings, enable WAL for concurrency
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        connect_args={"check_same_thread": False},
    )
else:
    # PostgreSQL (remote): asyncpg driver with SSL and connection pool
    parsed = urlparse(DATABASE_URL)
    query_params = parse_qs(parsed.query)
    connect_args = {}

    if "sslmode" in query_params:
        sslmode_val = query_params.get("sslmode")[0]
        if sslmode_val in ["require", "prefer", "verify-ca", "verify-full"]:
            connect_args["ssl"] = True

    # Strip query string — asyncpg doesn't support libpq params like channel_binding
    DATABASE_URL = urlunparse(parsed._replace(query=""))

    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        connect_args=connect_args,
        pool_size=15,
        max_overflow=15,
        pool_timeout=60,
        pool_pre_ping=True,
    )

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)
Base = declarative_base()
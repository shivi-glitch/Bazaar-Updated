import os
import ssl
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv

# Force dotenv to look exactly in the backend directory
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path, override=True)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is missing.")

# 1. Convert postgres:// / postgresql:// to postgresql+asyncpg://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# 2. Remove incompatible query parameters (like sslmode, channel_binding) for asyncpg
parsed = urlparse(DATABASE_URL)
query_params = parse_qs(parsed.query)
connect_args = {}

if "sslmode" in query_params:
    sslmode_val = query_params.get("sslmode")[0]
    if sslmode_val in ["require", "prefer", "verify-ca", "verify-full"]:
        connect_args["ssl"] = True

# asyncpg does not support typical libpq query parameters like channel_binding.
# We strip the entire query string to avoid 'unexpected keyword argument' errors.
DATABASE_URL = urlunparse(parsed._replace(query=""))

engine = create_async_engine(
    DATABASE_URL, 
    echo=False, 
    connect_args=connect_args,
    pool_size=20,
    max_overflow=40,
    pool_timeout=10,
    pool_pre_ping=True
)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)
Base = declarative_base()
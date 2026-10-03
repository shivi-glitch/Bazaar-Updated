import os
import bcrypt
import jwt
import time
from datetime import datetime, timedelta, timezone

SECRET_KEY = os.getenv("JWT_SECRET", "fallback-secret")
ALGORITHM = "HS256"

# In-memory brute force tracker (valid for single asyncio process architecture)
login_attempts = {}

def hash_pin(pin: str) -> str:
    # bcrypt cost >= 10 as per Gate G3.2
    salt = bcrypt.gensalt(rounds=10)
    return bcrypt.hashpw(pin.encode(), salt).decode()

def verify_pin(pin: str, hashed: str) -> bool:
    return bcrypt.checkpw(pin.encode(), hashed.encode())

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=12)
    to_encode.update({"exp": int(expire.timestamp())})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
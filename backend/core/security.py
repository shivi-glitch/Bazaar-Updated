import os
import bcrypt
import jwt
import time
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(env_path)

SECRET_KEY = os.getenv("JWT_SECRET", "fallback-secret")
ALGORITHM = "HS256"

# Admin secrets
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "admin-master-secret")
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH", "")

# In-memory brute force tracker (valid for single asyncio process architecture)
login_attempts = {}

import secrets
from fastapi import Header, HTTPException

def hash_pin(pin: str) -> str:
    # bcrypt cost >= 10 as per Gate G3.2
    salt = bcrypt.gensalt(rounds=10)
    return bcrypt.hashpw(pin.encode(), salt).decode()

def verify_pin(pin: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pin.encode(), hashed.encode())
    except Exception:
        return False

def hash_admin_password(password: str) -> str:
    """Utility to generate a bcrypt hash for an admin password."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode(), salt).decode()

def verify_admin_token(token: str) -> bool:
    """
    Verifies admin credentials using:
    1. Constant-time digest comparison against ADMIN_TOKEN
    2. Bcrypt hash comparison if ADMIN_PASSWORD_HASH is set
    3. Admin JWT payload verification if token is a valid JWT signed with role 'admin'
    """
    if not token:
        return False

    clean_token = token.strip()

    # 1. Constant-time comparison against ADMIN_TOKEN
    if ADMIN_TOKEN and secrets.compare_digest(clean_token, ADMIN_TOKEN.strip()):
        return True

    # 2. Bcrypt hash verification against ADMIN_PASSWORD_HASH
    if ADMIN_PASSWORD_HASH:
        try:
            if bcrypt.checkpw(clean_token.encode(), ADMIN_PASSWORD_HASH.strip().encode()):
                return True
        except Exception:
            pass

    # 3. Check if valid JWT with role="admin"
    try:
        payload = jwt.decode(clean_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("role") == "admin":
            return True
    except Exception:
        pass

    return False

def verify_admin(authorization: str = Header(None)):
    """FastAPI dependency to secure all admin routes."""
    if not authorization:
        raise HTTPException(status_code=403, detail="Forbidden: Admin authentication header missing")
    
    token = authorization.replace("Bearer ", "").strip()
    if not verify_admin_token(token):
        raise HTTPException(status_code=403, detail="Forbidden: Invalid admin credentials")

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=12)
    to_encode.update({"exp": int(expire.timestamp())})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
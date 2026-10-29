# Bazaar Deployment & Server Guide

## Local Development
```powershell
.\backend\venv\Scripts\Activate.ps1
uvicorn backend.main:app --reload --port 8000
```
API Health Check: http://localhost:8000/health

---

## AWS Deployment Guide: EC2 vs Amplify

### 1. Where should Backend and Frontend run?
- **Backend (FastAPI + WebSockets + Market Engine)**: **MUST run on AWS EC2** (or persistent container like ECS/App Runner).
  - **Reason**: The backend runs an in-memory simulation engine (`MarketEngine` with continuous price loops, order books, and persistent state) and maintains long-lived WebSockets (`/ws`) connected to all participants and admin.
  - **Crucial Rule**: Run Uvicorn with **1 worker** (`--workers 1` or default). Because `MarketEngine` is in Python process memory, running multiple workers (`--workers 4`) would create 4 separate, desynchronized market simulations where requests alternate between different tick clocks!
  - **Production EC2 command**:
    ```bash
    uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 1
    ```
    (Or managed by `systemd` or `pm2`).

- **Frontend (Next.js)**: Can run on **AWS EC2**, **AWS Amplify**, or **Vercel**.
  - If deploying frontend on Amplify or Vercel, set the environment variables:
    - `NEXT_PUBLIC_API_URL=https://api.yourdomain.com` (pointing to your EC2 backend)
    - `NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com/ws` (secure websocket pointing to your EC2 backend)

### 2. Why the Admin Timer was jumping on AWS & How it is fixed:
1. **Removed Aggressive 3s HTTP Polling**: The Admin dashboard previously ran an HTTP interval calling `/admin/sessions` every 3 seconds. Over AWS/Amplify/CloudFront reverse proxies, HTTP caching and out-of-order latency responses caused tick `n` to bounce backward and forward (e.g. 4m -> 2m -> 4m).
2. **Admin Real-Time WebSocket**: Admin is now connected directly to the `/ws` WebSocket stream alongside participants, receiving tick and session broadcasts in real time with 0 network jitter.
3. **No-Store Anti-Cache Headers**: Both the backend endpoints (`/admin/sessions`) and frontend API clients explicitly set `Cache-Control: no-cache, no-store, must-revalidate` with timestamp cache-busters to prevent reverse proxies or browsers from serving stale clocks.
4. **Frozen Clock on Session Pause**: Previously, pausing a session reset the clock to 5:00 and resuming snapped to 2:00. Now remaining seconds freeze in-place during pause.
5. **Smooth Drift Nudge**: Clock differences under 12 seconds are adjusted with gentle 1-second nudges rather than sudden 10-second visual jumps.

import httpx
import asyncio

async def start():
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        print("Triggering R1S1 Start...")
        res = await client.post("/admin/sessions/1/start", headers={"Authorization": "Bearer admin-master-secret"})
        print(res.json())

asyncio.run(start())
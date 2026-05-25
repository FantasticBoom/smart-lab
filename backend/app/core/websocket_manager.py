from fastapi import WebSocket
from typing import Dict, List
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.frontend_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, client_id: str):
        """Menerima koneksi baru dari agen Windows klien."""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        # Notify all frontend listeners
        await self.notify_frontends({
            "type": "AGENT_CONNECTED",
            "client_id": client_id,
            "is_locked": False,
            "computer_number": client_id[:8]
        })

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
        # Fire and forget notification (will be awaited by caller)

    async def disconnect_and_notify(self, client_id: str):
        self.disconnect(client_id)
        await self.notify_frontends({
            "type": "AGENT_DISCONNECTED",
            "client_id": client_id,
            "is_locked": False,
            "computer_number": client_id[:8]
        })

    async def connect_frontend(self, websocket: WebSocket):
        """Connect a frontend monitoring WebSocket."""
        await websocket.accept()
        self.frontend_connections.append(websocket)

    def disconnect_frontend(self, websocket: WebSocket):
        if websocket in self.frontend_connections:
            self.frontend_connections.remove(websocket)

    async def notify_frontends(self, message: dict):
        """Send a message to all connected frontend clients."""
        disconnected = []
        for ws in self.frontend_connections:
            try:
                await ws.send_json(message)
            except Exception:
                disconnected.append(ws)
        for ws in disconnected:
            self.disconnect_frontend(ws)

    async def send_lock_command(self, client_id: str) -> bool:
        if client_id in self.active_connections:
            websocket = self.active_connections[client_id]
            await websocket.send_json({"action": "LOCK"})
            await self.notify_frontends({
                "type": "STATUS_CHANGED",
                "client_id": client_id,
                "is_locked": True,
                "computer_number": client_id[:8]
            })
            return True
        return False
    
    async def send_unlock_command(self, client_id: str) -> bool:
        if client_id in self.active_connections:
            websocket = self.active_connections[client_id]
            await websocket.send_json({"action": "UNLOCK"})
            await self.notify_frontends({
                "type": "STATUS_CHANGED",
                "client_id": client_id,
                "is_locked": False,
                "computer_number": client_id[:8]
            })
            return True
        return False

    async def broadcast_command(self, action: str) -> int:
        """Send a command to ALL connected agents. Returns count of agents commanded."""
        count = 0
        for client_id in list(self.active_connections.keys()):
            if action == "LOCK":
                success = await self.send_lock_command(client_id)
            else:
                success = await self.send_unlock_command(client_id)
            if success:
                count += 1
        return count

    def get_active_agents(self) -> list:
        """Return list of active agent info."""
        agents = []
        for client_id in self.active_connections:
            agents.append({
                "client_id": client_id,
                "status": "ONLINE",
                "is_locked": False,
                "computer_number": client_id[:8]
            })
        return agents

manager = ConnectionManager()
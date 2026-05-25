from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from pydantic import BaseModel
from app.db.database import get_db
from sqlalchemy.orm import Session
from app.core.websocket_manager import manager
from app.api.v1.auth import get_current_user
from app.models.users import User
from app.models.logs_agents import AuditLog

router = APIRouter()

class BroadcastCommand(BaseModel):
    action: str


@router.websocket("/ws/agent/{client_id}")
async def agent_websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        await manager.disconnect_and_notify(client_id)


@router.websocket("/websocket")
async def frontend_websocket_endpoint(websocket: WebSocket):
    await manager.connect_frontend(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_frontend(websocket)


@router.get("/websocket/agents")
async def get_agents(
    current_user: User = Depends(get_current_user)
):
    return manager.get_active_agents()


@router.post("/websocket/broadcast")
async def broadcast_command(
    command: BroadcastCommand,
    current_user: User = Depends(get_current_user)
):
    count = await manager.broadcast_command(command.action)
    return {
        "status": "success",
        "message": f"Perintah {command.action} dikirim ke {count} agen.",
        "affected_agents": count
    }


@router.post("/command/lock/{client_id}")
async def trigger_lock_screen(
    client_id: str,
    db : Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = await manager.send_lock_command(client_id)
    
    if not success:
        raise HTTPException(
            status_code=404, 
            detail=f"Agent dengan ID {client_id} tidak ditemukan atau sedang offline."
        )
    
    audit_entry = AuditLog(
        user_id = current_user.id,
        action = f"LOCK PC Mac: {client_id}",
        target_id = None
    )

    db.add(audit_entry)
    db.commit()
    
    return {
        "status": "success", 
        "message": f"Perintah LOCK berhasil dikirim ke agen {client_id}."
    }


@router.post("/command/unlock/{client_id}")
async def trigger_unlock_screen(
    client_id: str, 
    db : Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = await manager.send_unlock_command(client_id)
    if not success:
        raise HTTPException(
            status_code=404, 
            detail="Agen tidak ditemukan atau sedang offline."
        )
    
    audit_entry = AuditLog(
        user_id = current_user.id,
        action = "UNLOCK",
        target_id = None
    )

    db.add(audit_entry)
    db.commit()
    
    return {"status": "success", "message": f"Perintah UNLOCK dikirim ke {client_id}."}
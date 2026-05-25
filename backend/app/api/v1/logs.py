from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.database import get_db
from app.models.logs_agents import AuditLog, MaintenanceLog
from app.schema.logs import MaintenanceCreate, MaintenanceResponse, AuditLogResponse
from app.api.v1.auth import get_current_user
from app.api.v1.users import get_admin_user
from app.models.users import User
from app.models.inventory import Item
from app.core.websocket_manager import manager

router = APIRouter(prefix="/api/v1/logs", tags=["Logs"])


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    online_agents = len(manager.active_connections)
    total_items = db.query(Item).count()
    active_users = db.query(User).count()
    system_status = "SECURE" if online_agents >= 0 else "WARNING"
    
    return {
        "online_agents": online_agents,
        "total_items": total_items,
        "active_users": active_users,
        "system_status": system_status
    }


@router.post("/maintenance", response_model=MaintenanceResponse, status_code=status.HTTP_201_CREATED)
def create_maintenance(
    item: MaintenanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    new_report = MaintenanceLog(
        item_id=item.item_id,
        dilaporkan_oleh=current_user.id,
        keterangan=item.keterangan,
        status=item.status_perbaikan
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

@router.get("/maintenance", response_model=List[MaintenanceResponse])
def get_maintenance(
    skip : int = 0,
    limit : int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    logs = db.query(MaintenanceLog).offset(skip).limit(limit).all()
    return logs

@router.get("/audit", response_model=List[AuditLogResponse])
def get_audit(
    skip : int = 0,
    limit : int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    result = []
    for log in logs:
        result.append(AuditLogResponse(
            id=log.id,
            user_id=log.user_id,
            action=log.action,
            target_id=log.target_id,
            created_at=log.created_at,
            username=log.user.username if log.user else None
        ))
    return result
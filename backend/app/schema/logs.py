from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class MaintenanceCreate(BaseModel):
    item_id: UUID
    keterangan: str
    status_perbaikan: str = "Pending"

class MaintenanceResponse(BaseModel):
    id : UUID
    item_id : UUID
    dilaporkan_oleh : UUID
    keterangan : str
    status : str

    class Config:
        from_attributes = True

class AuditLogResponse(BaseModel):
    id : UUID
    user_id : UUID
    action : str
    target_id : Optional[str] = None
    created_at : datetime
    username : Optional[str] = None

    class Config:
        from_attributes = True
from pydantic import BaseModel
from typing import Optional, Dict, Any
from uuid import UUID

class ItemBase(BaseModel):
    nama_item : str
    spesifikasi : Optional[Dict[str, Any]] = None
    lab_id : UUID
    meja_id : Optional[UUID] = None

class ItemCreate(ItemBase):
    pass

class ItemResponse(BaseModel):
    id: UUID
    nama_item: str
    spesifikasi: Optional[Dict[str, Any]] = None
    lab_id: UUID
    meja_id: Optional[UUID] = None
    lab_name: Optional[str] = None

    class Config:
        from_attributes = True

class LabResponse(BaseModel):
    id: UUID
    name_lab: str
    tipe_lab: str

    class Config:
        from_attributes = True

class MejaResponse(BaseModel):
    id: UUID
    lab_id: UUID
    nomor_meja: int

    class Config:
        from_attributes = True
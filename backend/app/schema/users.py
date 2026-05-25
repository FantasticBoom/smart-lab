from uuid import UUID
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    role_id : UUID

class UserCreate(UserBase):
    password: str

class UserResponse(BaseModel):
    id: UUID
    username: str
    role_id: UUID
    role_name: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RoleResponse(BaseModel):
    id: UUID
    name_role: str

    class Config:
        from_attributes = True
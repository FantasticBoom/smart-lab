from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.database import get_db
from app.models.inventory import Item, Lab, Meja
from app.schema.inventory import ItemCreate, ItemResponse, LabResponse, MejaResponse
from app.api.v1.auth import get_current_user
from app.models.users import User

router = APIRouter(prefix="/api/v1/inventory", tags=["Inventory"])

@router.post("/items", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(
    item: ItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_item = Item(**item.model_dump())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.get("/items", response_model=List[ItemResponse])
def get_items(
    skip : int = 0,
    limit : int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items = db.query(Item).offset(skip).limit(limit).all()
    result = []
    for item in items:
        result.append(ItemResponse(
            id=item.id,
            nama_item=item.nama_item,
            spesifikasi=item.spesifikasi,
            lab_id=item.lab_id,
            meja_id=item.meja_id,
            lab_name=item.lab.name_lab if item.lab else None
        ))
    return result

@router.get("/labs", response_model=List[LabResponse])
def get_labs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Lab).all()

@router.get("/labs/{lab_id}/tables", response_model=List[MejaResponse])
def get_tables(
    lab_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Meja).filter(Meja.lab_id == lab_id).all()
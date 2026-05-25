from fastapi import Depends, status, HTTPException, APIRouter
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.database import get_db
from app.models.users import User, Role
from app.schema.users import UserCreate, UserResponse, RoleResponse
from app.api.v1.auth import get_current_user
from app.core.security import get_password_hash


router = APIRouter(prefix="/api/v1/users", tags=["Users"])

def get_admin_user(
    current_user: User = Depends(get_current_user),
):
    if current_user.role.name_role.lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action"
        )
    return current_user

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    password_hash = get_password_hash(user.password)

    new_user = User(
        username=user.username,
        password_hash=password_hash,
        role_id=user.role_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/", response_model=List[UserResponse])
def get_users(
    skip : int = 0,
    limit : int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    users = db.query(User).offset(skip).limit(limit).all()
    result = []
    for u in users:
        result.append(UserResponse(
            id=u.id,
            username=u.username,
            role_id=u.role_id,
            role_name=u.role.name_role if u.role else None,
            created_at=u.created_at
        ))
    return result

@router.get("/roles", response_model=List[RoleResponse])
def get_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    return db.query(Role).all()
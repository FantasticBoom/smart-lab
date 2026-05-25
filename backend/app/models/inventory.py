import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.db.database import Base


class Lab(Base):
    __tablename__ = "labs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name_lab = Column(String, unique=True, index=True, nullable=False)
    tipe_lab = Column(String, nullable=False)

    meja = relationship("Meja", back_populates="lab")
    items = relationship("Item", back_populates="lab")

class Meja(Base):
    __tablename__ = "meja"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    lab_id = Column(UUID(as_uuid=True), ForeignKey("labs.id"), nullable=False)
    nomor_meja = Column(Integer, nullable=False)

    lab = relationship("Lab", back_populates="meja")
    items = relationship("Item", back_populates="meja")

class Item(Base):
    __tablename__ = "items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    nama_item = Column(String, unique=True, index=True, nullable=False)
    spesifikasi = Column(JSONB)

    lab_id = Column(UUID(as_uuid=True), ForeignKey("labs.id"), nullable=False)
    meja_id = Column(UUID(as_uuid=True), ForeignKey("meja.id"), nullable=True)

    lab = relationship("Lab", back_populates="items")
    meja = relationship("Meja", back_populates="items")
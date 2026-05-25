import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base


class ClientAgents(Base):
    __tablename__ = "client_agents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    meja_id = Column(UUID(as_uuid=True), ForeignKey("meja.id"), nullable=False, unique=True)
    ip_address = Column(String, nullable=False)
    mac_address = Column(String, nullable=False)
    status_koneksi = Column(String, default="Offline")
    status_layar = Column(String, default="Active")

    meja = relationship("Meja")

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    item_id = Column(UUID(as_uuid=True), ForeignKey("items.id"), nullable=False)
    dilaporkan_oleh = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    keterangan = Column(String, nullable=False)
    status = Column(String, default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    item = relationship("Item")
    pelapor = relationship("User")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    target_id = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
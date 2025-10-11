from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.models.user import PyObjectId
from app.models.invoice import InvoiceStatus

class ConsentStatus(str, Enum):
    PENDING = "pending"
    ACKNOWLEDGED = "acknowledged"
    DISPUTED = "disputed"
    EXPIRED = "expired"

class NotificationType(str, Enum):
    EMAIL = "email"
    WHATSAPP = "whatsapp"
    SMS = "sms"
    REGISTERED_POST = "registered_post"

class NotificationStatus(str, Enum):
    QUEUED = "queued"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"

class ConsentEvent(str, Enum):
    NOTIFICATION_SENT = "notification_sent"
    NOTIFICATION_DELIVERED = "notification_delivered"
    NOTIFICATION_READ = "notification_read"
    EXPLICIT_CONSENT = "explicit_consent"
    DISPUTE_RAISED = "dispute_raised"
    PASSIVE_CONSENT = "passive_consent"
    CONSENT_WINDOW_EXPIRED = "consent_window_expired"

class ConsentLog(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    invoice_id: PyObjectId
    event: ConsentEvent
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}

class Notification(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    invoice_id: PyObjectId
    type: NotificationType
    recipient: str  # Email address, phone number, etc.
    status: NotificationStatus = NotificationStatus.QUEUED
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    message_id: Optional[str] = None  # External ID from notification provider
    content: str
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}

class ConsentRecord(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    invoice_id: PyObjectId
    buyer_email: str
    buyer_phone: Optional[str] = None
    status: ConsentStatus = ConsentStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    consent_window_start: datetime
    consent_window_end: datetime
    notifications: List[PyObjectId] = []  # References to Notification objects
    logs: List[PyObjectId] = []  # References to ConsentLog objects
    dispute_reason: Optional[str] = None
    dispute_details: Optional[Dict[str, Any]] = None
    ledger_entry: Optional[str] = None  # Final ledger entry for record keeping

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}

class ConsentCreate(BaseModel):
    invoice_id: str
    buyer_email: str
    buyer_phone: Optional[str] = None

class ConsentUpdate(BaseModel):
    status: Optional[ConsentStatus] = None
    dispute_reason: Optional[str] = None
    dispute_details: Optional[Dict[str, Any]] = None

class NotificationCreate(BaseModel):
    invoice_id: str
    type: NotificationType
    recipient: str
    content: str
    metadata: Optional[Dict[str, Any]] = None

class NotificationUpdate(BaseModel):
    status: NotificationStatus
    message_id: Optional[str] = None
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None

class ConsentLogCreate(BaseModel):
    invoice_id: str
    event: ConsentEvent
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

# Made with Bob

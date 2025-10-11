from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator
from app.models.user import PyObjectId

class InvoiceStatus(str, Enum):
    PENDING_VALIDATION = "pending_validation"
    PENDING_CONSENT = "pending_consent"  # Waiting for buyer verification
    VALIDATED = "validated"
    REJECTED = "rejected"
    FUNDED = "funded"
    PAID = "paid"
    DEFAULTED = "defaulted"

class RiskTier(str, Enum):
    A = "A"  # Low risk
    B = "B"  # Medium risk
    C = "C"  # High risk
    D = "D"  # Very high risk

class ValidationResult(str, Enum):
    PASS = "pass"
    WARNING = "warning"
    FAIL = "fail"

class LineItem(BaseModel):
    description: str
    quantity: float
    unit_price: float
    amount: float
    tax: Optional[float] = 0.0

class ValidationCheck(BaseModel):
    check_name: str
    result: ValidationResult
    message: str
    details: Optional[Dict[str, Any]] = None

class InvoiceBase(BaseModel):
    invoice_number: str
    amount: float
    invoice_date: datetime
    due_date: datetime
    description: Optional[str] = None
    buyer_name: str
    buyer_email: Optional[str] = None  # Email for buyer verification
    buyer_phone: Optional[str] = None  # Phone for buyer verification
    buyer_gstin: Optional[str] = None
    buyer_address: Optional[str] = None
    line_items: Optional[List[LineItem]] = None
    purchase_order_number: Optional[str] = None
    terms: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    seller_id: str
    buyer_email: Optional[str] = None
    buyer_phone: Optional[str] = None
    supporting_documents: Optional[List[str]] = None  # File paths or IDs

class InvoiceInDB(InvoiceBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    seller_id: PyObjectId
    status: InvoiceStatus = InvoiceStatus.PENDING_VALIDATION
    trust_score: Optional[int] = None
    risk_tier: Optional[RiskTier] = None
    validation_results: Optional[List[ValidationCheck]] = None
    supporting_documents: Optional[List[str]] = None
    funded_amount: float = 0
    available_amount: float = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    file_path: Optional[str] = None  # Path to the uploaded invoice file
    ocr_data: Optional[Dict[str, Any]] = None  # Raw OCR extracted data
    hash: Optional[str] = None  # SHA-256 hash of the invoice file for tamper detection

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}

class Invoice(InvoiceBase):
    id: str
    seller_id: str
    status: InvoiceStatus
    trust_score: Optional[int] = None
    risk_tier: Optional[RiskTier] = None
    validation_results: Optional[List[ValidationCheck]] = None
    supporting_documents: Optional[List[str]] = None
    funded_amount: float = 0
    available_amount: float = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class InvoiceUpdate(BaseModel):
    status: Optional[InvoiceStatus] = None
    trust_score: Optional[int] = None
    risk_tier: Optional[RiskTier] = None
    validation_results: Optional[List[ValidationCheck]] = None
    funded_amount: Optional[float] = None
    available_amount: Optional[float] = None

class SupportingDocument(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    invoice_id: PyObjectId
    document_type: str  # e.g., "purchase_order", "delivery_challan", "e_way_bill"
    file_path: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    hash: Optional[str] = None  # SHA-256 hash for tamper detection

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}

# Made with Bob

from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
from bson import ObjectId
from pydantic import GetCoreSchemaHandler
from pydantic_core import core_schema




class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler: GetCoreSchemaHandler):
        # Validation logic for ObjectId
        return core_schema.no_info_after_validator_function(
            cls.validate,
            core_schema.str_schema()
        )


    @classmethod
    def __get_pydantic_json_schema__(cls, schema, handler):
        # JSON schema output for OpenAPI/docs
        return {"type": "string", "example": "507f1f77bcf86cd799439011"}


    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str) and ObjectId.is_valid(v):
            return ObjectId(v)
        raise ValueError("Invalid ObjectId")




class UserType(str, Enum):
    BUSINESS = "business"
    INVESTOR = "investor"




class BusinessType(str, Enum):
    MSME = "msme"
    STARTUP = "startup"




class GSTStatus(str, Enum):
    REGISTERED = "gst-registered"
    NON_REGISTERED = "non-gst"




class InvestorType(str, Enum):
    INDIVIDUAL = "individual"
    HNI = "hni"
    CORPORATE = "corporate"
    FAMILY_OFFICE = "family-office"




class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    type: UserType
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)




class BusinessProfile(BaseModel):
    business_type: BusinessType
    gst_status: GSTStatus
    company_name: str
    gstin: Optional[str] = None
    pan: str
    udyam: Optional[str] = None
    business_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    annual_turnover: Optional[str] = None




class InvestorProfile(BaseModel):
    investor_type: InvestorType
    investment_capacity: str
    pan: str




class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None
    type: UserType
    business_profile: Optional[BusinessProfile] = None
    investor_profile: Optional[InvestorProfile] = None


    @field_validator("business_profile")
    def validate_business_profile(cls, v, values):
        if values.get("type") == UserType.BUSINESS and not v:
            raise ValueError("Business profile is required for business users")
        return v


    @field_validator("investor_profile")
    def validate_investor_profile(cls, v, values):
        if values.get("type") == UserType.INVESTOR and not v:
            raise ValueError("Investor profile is required for investor users")
        return v




class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashed_password: str
    business_profile: Optional[BusinessProfile] = None
    investor_profile: Optional[InvestorProfile] = None


    class Config:
        populate_by_name = True   # v2 replacement for allow_population_by_field_name
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}




class User(UserBase):
    id: str
    business_profile: Optional[BusinessProfile] = None
    investor_profile: Optional[InvestorProfile] = None


    class Config:
        from_attributes = True   # v2 replacement for orm_mode




class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    business_profile: Optional[BusinessProfile] = None
    investor_profile: Optional[InvestorProfile] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    user_type: UserType

class TokenPayload(BaseModel):
    sub: Optional[str] = None
import os
from typing import List
from pydantic import BaseModel, field_validator
from dotenv import load_dotenv


load_dotenv()


class Settings(BaseModel):
    # API settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "TEVANI"
   
    # CORS settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "https://tevani.com"]
   
    # MongoDB settings
    MONGO_URL: str = os.getenv("MONGO_URL", "mongodb+srv://invoicedis123_db_user:VOm4io2h7JeaETbQ@cluster0.1hduvfh.mongodb.net/")
    MONGO_DB_NAME: str = os.getenv("MONGO_DB_NAME", "tevani_db")
   
    # JWT settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-for-jwt-please-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
   
    # OCR settings
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
   
    # LegalBot settings
    EMAIL_NOTIFICATION_ENABLED: bool = True
    WHATSAPP_NOTIFICATION_ENABLED: bool = False
    CONSENT_WINDOW_HOURS: int = 48
    
    # Email settings
    EMAIL_HOST: str = "smtp.gmail.com"
    EMAIL_PORT: int = 587
    EMAIL_USERNAME: str = "invoicedis123@gmail.com"
    # Note: For Gmail, you need to use an App Password, not your regular password
    # To generate an App Password:
    # 1. Go to your Google Account > Security > 2-Step Verification > App passwords
    # 2. Select "Mail" and "Other (Custom name)" and enter "TEVANI"
    # 3. Copy the generated 16-character password and paste it below
    EMAIL_PASSWORD: str = os.getenv("EMAIL_PASSWORD", "")
    EMAIL_USE_TLS: bool = True
    # Set to False to disable actual email sending during development/testing
    EMAIL_SENDING_ENABLED: bool = os.getenv("EMAIL_SENDING_ENABLED", "True").lower() == "true"
   
    @field_validator("MONGO_URL")
    def validate_mongo_url(cls, v):
        if not v:
            raise ValueError("MONGO_URL must be set")
        return v
   
    @field_validator("SECRET_KEY")
    def validate_secret_key(cls, v):
        if v == "your-secret-key-for-jwt-please-change-in-production":
            print("WARNING: Using default SECRET_KEY. Please set a secure SECRET_KEY in production.")
        return v


settings = Settings()


# Create upload directory if it doesn't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

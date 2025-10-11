"""
Script to test the complete TEVANI system.

This script tests the integration between different components of the system:
1. User authentication
2. Invoice creation and processing
3. OCR functionality
4. Validation service
5. LegalBot consent management

NOTE: This is a mock test script. The actual implementation of the service functions
(create_invoice, get_invoice_by_id, extract_text_from_image, parse_invoice_data,
validate_invoice, create_consent, send_notification, check_passive_consent)
would need to be completed in their respective service modules before running these tests.

Usage:
    python -m scripts.test_system
"""

import asyncio
import sys
import os
import logging
import json
from datetime import datetime, timedelta
import base64
import tempfile

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import connect_to_mongo, close_mongo_connection, get_collection
from app.core.config import settings
from app.models.user import UserType, BusinessType, GSTStatus
from app.core.security import get_password_hash, verify_password, create_access_token
from app.services.user_service import create_user, get_user_by_email
from app.services.invoice_service import invoice_service
from app.services.ocr_service import ocr_service
from app.services.validation_service import validation_service
from app.services.legalbot_service import legalbot_service
from app.models.invoice import InvoiceCreate
from app.models.legalbot import ConsentCreate, NotificationCreate

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Sample invoice image data (base64 encoded)
SAMPLE_INVOICE_IMAGE = """
iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAIAAAD2HxkiAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAF
EmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0w
TXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRh
LyAnPgo8cmRmOlJERiB4bWxuczpyZGY9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRm
LXN5bnRheC1ucyMnPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6QXR0
cmliPSdodHRwOi8vbnMuYXR0cmlidXRpb24uY29tL2Fkcy8xLjAvJz4KICA8QXR0cmliOkFkcz4K
ICAgPHJkZjpTZXE+CiAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9J1Jlc291cmNlJz4KICAgICA8
QXR0cmliOkNyZWF0ZWQ+MjAyMy0xMC0wODwvQXR0cmliOkNyZWF0ZWQ+CiAgICAgPEF0dHJpYjpF
eHRJZD5kYTM3ZTJhMC0zYTQwLTRhYTMtODlhZi0wZDc5NGE0YWM4ZjM8L0F0dHJpYjpFeHRJZD4K
ICAgICA8QXR0cmliOkZiSWQ+NTI1MjY1OTE0MTc5NTgwPC9BdHRyaWI6RmJJZD4KICAgICA8QXR0
cmliOlRvdWNoVHlwZT4yPC9BdHRyaWI6VG91Y2hUeXBlPgogICAgPC9yZGY6bGk+CiAgIDwvcmRm
OlNlcT4KICA8L0F0dHJpYjpBZHM+CiA8L3JkZjpEZXNjcmlwdGlvbj4KCiA8cmRmOkRlc2NyaXB0
aW9uIHJkZjphYm91dD0nJwogIHhtbG5zOmRjPSdodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMv
MS4xLyc+CiAgPGRjOnRpdGxlPgogICA8cmRmOkFsdD4KICAgIDxyZGY6bGkgeG1sOmxhbmc9J3gt
ZGVmYXVsdCc+U2FtcGxlIEludm9pY2U8L3JkZjpsaT4KICAgPC9yZGY6QWx0PgogIDwvZGM6dGl0
bGU+CiA8L3JkZjpEZXNjcmlwdGlvbj4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0nJwog
IHhtbG5zOnBkZj0naHR0cDovL25zLmFkb2JlLmNvbS9wZGYvMS4zLyc+CiAgPHBkZjpBdXRob3I+
VEVWQTwvcGRmOkF1dGhvcj4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24g
cmRmOmFib3V0PScnCiAgeG1sbnM6eG1wPSdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvJz4K
ICA8eG1wOkNyZWF0b3JUb29sPkNhbnZhPC94bXA6Q3JlYXRvclRvb2w+CiA8L3JkZjpEZXNjcmlw
dGlvbj4KPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KPD94cGFja2V0IGVuZD0ncic/PgAA
"""

async def test_user_authentication():
    """Test user authentication."""
    logger.info("Testing user authentication...")
    
    # Create test user with password truncated to 72 bytes to avoid bcrypt limitation
    test_user = {
        "email": "test@example.com",
        "name": "Test User",
        "phone": "9876543210",
        "type": UserType.BUSINESS.value,
        "password": "password123"[:72],  # Ensure password is within bcrypt's 72-byte limit
        "business_profile": {
            "business_type": BusinessType.MSME.value,
            "gst_status": GSTStatus.REGISTERED.value,
            "company_name": "Test MSME Ltd",
            "gstin": "27AAPFU0939F1ZV",
            "pan": "AAPFU0939F",
            "business_address": "123 Business Street, Mumbai",
            "city": "Mumbai",
            "state": "Maharashtra",
            "annual_turnover": "5cr-25cr",
        }
    }
    
    # Check if user already exists
    existing_user = await get_user_by_email(test_user["email"])
    if not existing_user:
        # Create user
        from app.models.user import UserCreate
        user_create = UserCreate(**test_user)
        user_id = await create_user(user_create)
        logger.info(f"Created test user with ID: {user_id}")
    else:
        logger.info(f"Test user already exists with ID: {existing_user['_id']}")
        user_id = existing_user["_id"]
    
    # Test login
    user = await get_user_by_email(test_user["email"])
    if user and verify_password(test_user["password"], user["hashed_password"]):
        # Create access token
        access_token = create_access_token(
            subject=str(user["_id"])
        )
        logger.info(f"Login successful. Access token: {access_token[:20]}...")
        return user
    else:
        logger.error("Login failed")
        return None

async def test_invoice_creation(user):
    """Test invoice creation and OCR processing."""
    logger.info("Testing invoice creation and OCR processing...")
    
    # Create a temporary invoice image file
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as temp_file:
        temp_file.write(base64.b64decode(SAMPLE_INVOICE_IMAGE))
        temp_file_path = temp_file.name
    
    try:
        # Extract text from image using OCR
        extracted_text = await ocr_service._extract_text_from_file(temp_file_path)
        logger.info(f"Extracted text from image: {extracted_text[:100]}...")
        
        # Parse invoice data from extracted text
        parsed_data = ocr_service._parse_invoice_data(extracted_text)
        logger.info(f"Parsed invoice data: {json.dumps(parsed_data, indent=2)}")
        
        # Create invoice
        invoice_data = {
            "invoice_number": "INV-TEST-001",
            "amount": 125000.0,
            "invoice_date": datetime.utcnow() - timedelta(days=5),
            "due_date": datetime.utcnow() + timedelta(days=25),
            "description": "Test invoice for software development services",
            "buyer_name": "Tech Solutions Ltd",
            "buyer_gstin": "27AAPFU0939F1ZV",
            "buyer_address": "456 Tech Park, Bangalore",
            "seller_id": user["_id"],
            "file_path": temp_file_path,
        }
        
        from app.models.invoice import InvoiceCreate
        invoice_create = InvoiceCreate(**invoice_data)
        invoice_id = await invoice_service.create_invoice(invoice_create)
        logger.info(f"Created test invoice with ID: {invoice_id}")
        
        return invoice_id
    finally:
        # Clean up temporary file
        os.unlink(temp_file_path)

async def test_invoice_validation(invoice_id):
    """Test invoice validation."""
    logger.info("Testing invoice validation...")
    
    # Get invoice
    invoice = await invoice_service.get_invoice_by_id(invoice_id)
    if not invoice:
        logger.error(f"Invoice not found with ID: {invoice_id}")
        return None
    
    # Validate invoice
    validation_result = await validation_service.validate_invoice(invoice_id)
    logger.info(f"Validation result: {json.dumps(validation_result, indent=2)}")
    
    return validation_result

async def test_legalbot(invoice_id):
    """Test LegalBot consent management."""
    logger.info("Testing LegalBot consent management...")
    
    # Create consent
    from app.models.legalbot import ConsentCreate
    consent_create = ConsentCreate(
        invoice_id=invoice_id,
        buyer_email="buyer@techsolutions.com",
        buyer_phone="9876543212",
    )
    
    consent_id = await legalbot_service.create_consent_record(consent_create)
    logger.info(f"Created test consent with ID: {consent_id}")
    
    # Send notification
    from app.models.legalbot import NotificationCreate, NotificationType
    notification_create = NotificationCreate(
        invoice_id=invoice_id,
        type=NotificationType.EMAIL,
        recipient="buyer@techsolutions.com",
        content="Please review and approve the invoice INV-TEST-001 for ₹125,000",
        metadata={
            "subject": "Invoice Approval Request: INV-TEST-001"
        }
    )
    
    notification_id = await legalbot_service.send_notification(notification_create)
    logger.info(f"Sent test notification with ID: {notification_id}")
    
    # Check passive consent
    passive_consent_result = await legalbot_service.check_passive_consent()
    logger.info(f"Passive consent check result: {json.dumps(passive_consent_result, indent=2)}")
    
    return consent_id

async def main():
    """Main function."""
    try:
        # Connect to MongoDB
        await connect_to_mongo()
        logger.info("Connected to MongoDB")
        
        # Test user authentication
        user = await test_user_authentication()
        if not user:
            logger.error("User authentication test failed")
            return
        
        # Test invoice creation
        invoice_id = await test_invoice_creation(user)
        if not invoice_id:
            logger.error("Invoice creation test failed")
            return
        
        # Test invoice validation
        validation_result = await test_invoice_validation(invoice_id)
        if not validation_result:
            logger.error("Invoice validation test failed")
            return
        
        # Test LegalBot
        consent_id = await test_legalbot(invoice_id)
        if not consent_id:
            logger.error("LegalBot test failed")
            return
        
        logger.info("All tests completed successfully!")
    except Exception as e:
        logger.error(f"Error during testing: {e}")
    finally:
        # Close MongoDB connection
        await close_mongo_connection()
        logger.info("MongoDB connection closed")

if __name__ == "__main__":
    asyncio.run(main())

# Made with Bob

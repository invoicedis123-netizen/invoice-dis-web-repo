"""
Script to test MongoDB connection and set up collections with schemas.


This script connects to MongoDB, creates collections with schemas and indexes,
and inserts some test data.


Usage:
    python -m scripts.setup_db
"""


import asyncio
import sys
import os
import logging
from datetime import datetime, timedelta


# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


from app.core.database import connect_to_mongo, close_mongo_connection, get_collection
from app.core.config import settings
from app.models.user import UserType, BusinessType, GSTStatus, InvestorType
from app.core.security import get_password_hash


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


async def insert_test_data():
    """Insert test data into the database."""
    try:
        # Connect to MongoDB
        await connect_to_mongo()
        logger.info("Connected to MongoDB")


        # Insert test users
        users_collection = get_collection("users")
       
        # Check if users already exist
        existing_users = await users_collection.count_documents({})
        if existing_users > 0:
            logger.info(f"Found {existing_users} existing users, skipping user creation")
        else:
            # Create test business user
            business_user = {
                "email": "business@example.com",
                "name": "Test Business",
                "phone": "9876543210",
                "type": UserType.BUSINESS.value,
                "hashed_password": get_password_hash("password123"),
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
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
            await users_collection.insert_one(business_user)
            logger.info("Inserted test business user")
           
            # Create test investor user
            investor_user = {
                "email": "investor@example.com",
                "name": "Test Investor",
                "phone": "9876543211",
                "type": UserType.INVESTOR.value,
                "hashed_password": get_password_hash("password123"),
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "investor_profile": {
                    "investor_type": InvestorType.INDIVIDUAL.value,
                    "investment_capacity": "25lakh-1cr",
                    "pan": "AAPFU0939G",
                }
            }
            await users_collection.insert_one(investor_user)
            logger.info("Inserted test investor user")
       
        # Insert test invoices
        invoices_collection = get_collection("invoices")
       
        # Check if invoices already exist
        existing_invoices = await invoices_collection.count_documents({})
        if existing_invoices > 0:
            logger.info(f"Found {existing_invoices} existing invoices, skipping invoice creation")
        else:
            # Get business user ID
            business_user = await users_collection.find_one({"email": "business@example.com"})
            if business_user:
                # Create test invoice
                invoice = {
                    "invoice_number": "INV-2025-001",
                    "amount": 125000.0,
                    "invoice_date": datetime.utcnow() - timedelta(days=5),
                    "due_date": datetime.utcnow() + timedelta(days=25),
                    "description": "Test invoice for software development services",
                    "buyer_name": "Tech Solutions Ltd",
                    "buyer_gstin": "27AAPFU0939F1ZV",
                    "buyer_address": "456 Tech Park, Bangalore",
                    "seller_id": business_user["_id"],
                    "status": "pending_validation",
                    "trust_score": 85,
                    "risk_tier": "B",
                    "funded_amount": 0.0,
                    "available_amount": 125000.0,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "line_items": [
                        {
                            "description": "Software Development Services",
                            "quantity": 1.0,
                            "unit_price": 100000.0,
                            "amount": 100000.0,
                            "tax": 25000.0
                        }
                    ]
                }
                await invoices_collection.insert_one(invoice)
                logger.info("Inserted test invoice")
               
                # Create test consent record
                consent_records_collection = get_collection("consent_records")
               
                # Check if consent records already exist
                existing_consents = await consent_records_collection.count_documents({})
                if existing_consents > 0:
                    logger.info(f"Found {existing_consents} existing consent records, skipping consent creation")
                else:
                    # Get invoice ID
                    invoice = await invoices_collection.find_one({"invoice_number": "INV-2025-001"})
                    if invoice:
                        # Create test consent record
                        consent_record = {
                            "invoice_id": invoice["_id"],
                            "buyer_email": "buyer@techsolutions.com",
                            "buyer_phone": "9876543212",
                            "status": "pending",
                            "created_at": datetime.utcnow(),
                            "updated_at": datetime.utcnow(),
                            "consent_window_start": datetime.utcnow(),
                            "consent_window_end": datetime.utcnow() + timedelta(days=2),
                            "notifications": [],
                            "logs": []
                        }
                        consent_result = await consent_records_collection.insert_one(consent_record)
                        logger.info("Inserted test consent record")
                       
                        # Create test notification
                        notifications_collection = get_collection("notifications")
                       
                        # Check if notifications already exist
                        existing_notifications = await notifications_collection.count_documents({})
                        if existing_notifications > 0:
                            logger.info(f"Found {existing_notifications} existing notifications, skipping notification creation")
                        else:
                            # Create test notification
                            notification = {
                                "invoice_id": invoice["_id"],
                                "type": "email",
                                "recipient": "buyer@techsolutions.com",
                                "status": "sent",
                                "sent_at": datetime.utcnow(),
                                "content": "Please review and approve the invoice INV-2025-001 for ₹125,000",
                                "metadata": {
                                    "subject": "Invoice Approval Request: INV-2025-001"
                                }
                            }
                            notification_result = await notifications_collection.insert_one(notification)
                            logger.info("Inserted test notification")
                           
                            # Update consent record with notification ID
                            await consent_records_collection.update_one(
                                {"_id": consent_result.inserted_id},
                                {"$push": {"notifications": notification_result.inserted_id}}
                            )
                           
                            # Create test consent log
                            consent_logs_collection = get_collection("consent_logs")
                           
                            # Check if consent logs already exist
                            existing_logs = await consent_logs_collection.count_documents({})
                            if existing_logs > 0:
                                logger.info(f"Found {existing_logs} existing consent logs, skipping log creation")
                            else:
                                # Create test consent log
                                consent_log = {
                                    "invoice_id": invoice["_id"],
                                    "event": "notification_sent",
                                    "timestamp": datetime.utcnow(),
                                    "details": {
                                        "notification_id": str(notification_result.inserted_id),
                                        "type": "email"
                                    }
                                }
                                log_result = await consent_logs_collection.insert_one(consent_log)
                                logger.info("Inserted test consent log")
                               
                                # Update consent record with log ID
                                await consent_records_collection.update_one(
                                    {"_id": consent_result.inserted_id},
                                    {"$push": {"logs": log_result.inserted_id}}
                                )
       
        logger.info("Test data insertion completed")
    except Exception as e:
        logger.error(f"Error inserting test data: {e}")
        raise
    finally:
        # Close MongoDB connection
        await close_mongo_connection()
        logger.info("MongoDB connection closed")


async def main():
    """Main function."""
    try:
        await insert_test_data()
    except Exception as e:
        logger.error(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
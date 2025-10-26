import os
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from bson import ObjectId
from app.core.config import settings
from app.core.database import get_collection
from app.utils.email_utils import send_email
from app.models.legalbot import (
    ConsentStatus, 
    NotificationType, 
    NotificationStatus, 
    ConsentEvent,
    ConsentCreate,
    NotificationCreate
)

class LegalBotService:
    """
    Service for LegalBot consent management
    """
    
    @staticmethod
    async def create_consent_record(consent_data: ConsentCreate) -> Dict[str, Any]:
        """
        Create a new consent record for an invoice
        """
        consent_collection = get_collection("consent_records")
        
        # Get the invoice
        invoices_collection = get_collection("invoices")
        invoice = await invoices_collection.find_one({"_id": ObjectId(consent_data.invoice_id)})
        
        if not invoice:
            raise ValueError(f"Invoice with ID {consent_data.invoice_id} not found")
        
        # Calculate consent window
        now = datetime.utcnow()
        consent_window_end = now + timedelta(hours=settings.CONSENT_WINDOW_HOURS)
        
        # Create consent record
        consent_record = {
            "invoice_id": ObjectId(consent_data.invoice_id),
            "buyer_email": consent_data.buyer_email,
            "buyer_phone": consent_data.buyer_phone,
            "status": ConsentStatus.PENDING,
            "created_at": now,
            "updated_at": now,
            "consent_window_start": now,
            "consent_window_end": consent_window_end,
            "notifications": [],
            "logs": [],
            "ledger_entry": None
        }
        
        # Insert into database
        result = await consent_collection.insert_one(consent_record)
        consent_id = str(result.inserted_id)
        
        # Send initial notification
        if settings.EMAIL_NOTIFICATION_ENABLED and consent_data.buyer_email:
            await LegalBotService.send_notification(
                NotificationCreate(
                    invoice_id=consent_data.invoice_id,
                    type=NotificationType.EMAIL,
                    recipient=consent_data.buyer_email,
                    content=LegalBotService._generate_email_content(invoice)["body"],
                    metadata={"email_content": LegalBotService._generate_email_content(invoice)}
                ),
                consent_id=consent_id
            )
        
        if settings.WHATSAPP_NOTIFICATION_ENABLED and consent_data.buyer_phone:
            await LegalBotService.send_notification(
                NotificationCreate(
                    invoice_id=consent_data.invoice_id,
                    type=NotificationType.WHATSAPP,
                    recipient=consent_data.buyer_phone,
                    content=LegalBotService._generate_whatsapp_content(invoice)
                ),
                consent_id=consent_id
            )
        
        # Log event
        await LegalBotService.log_consent_event(
            consent_id=consent_id,
            event=ConsentEvent.NOTIFICATION_SENT,
            details={
                "invoice_id": consent_data.invoice_id,
                "buyer_email": consent_data.buyer_email,
                "buyer_phone": consent_data.buyer_phone,
                "consent_window_end": consent_window_end.isoformat()
            }
        )
        
        # Get the created consent record
        created_record = await LegalBotService.get_consent_record(consent_id)
        
        return created_record if created_record else {}
    
    @staticmethod
    async def get_consent_record(consent_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a consent record by ID
        """
        consent_collection = get_collection("consent_records")
        record = await consent_collection.find_one({"_id": ObjectId(consent_id)})
        
        if record:
            # Convert ObjectId to string for the response
            record["id"] = str(record["_id"])
            record["invoice_id"] = str(record["invoice_id"])
            
            # Convert notification and log IDs to strings
            record["notifications"] = [str(nid) for nid in record["notifications"]]
            record["logs"] = [str(lid) for lid in record["logs"]]
            
            del record["_id"]
        
        return record
    
    @staticmethod
    async def get_consent_by_invoice(invoice_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a consent record by invoice ID
        """
        consent_collection = get_collection("consent_records")
        record = await consent_collection.find_one({"invoice_id": ObjectId(invoice_id)})
        
        if record:
            # Convert ObjectId to string for the response
            record["id"] = str(record["_id"])
            record["invoice_id"] = str(record["invoice_id"])
            
            # Convert notification and log IDs to strings
            record["notifications"] = [str(nid) for nid in record["notifications"]]
            record["logs"] = [str(lid) for lid in record["logs"]]
            
            del record["_id"]
        
        return record
    
    @staticmethod
    async def update_consent_status(
        consent_id: str,
        status: ConsentStatus,
        details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Update the status of a consent record
        """
        consent_collection = get_collection("consent_records")
        
        # Get the consent record
        record = await consent_collection.find_one({"_id": ObjectId(consent_id)})
        if not record:
            raise ValueError(f"Consent record with ID {consent_id} not found")
        
        # Update status
        update_data = {
            "status": status,
            "updated_at": datetime.utcnow()
        }
        
        # Add dispute details if provided
        if status == ConsentStatus.DISPUTED and details:
            update_data["dispute_reason"] = details.get("reason")
            update_data["dispute_details"] = details
        
        # Generate ledger entry
        ledger_entry = LegalBotService._generate_ledger_entry(record, status, details)
        update_data["ledger_entry"] = ledger_entry
        
        # Update in database
        await consent_collection.update_one(
            {"_id": ObjectId(consent_id)},
            {"$set": update_data}
        )
        
        # Log event
        event = ConsentEvent.EXPLICIT_CONSENT
        if status == ConsentStatus.DISPUTED:
            event = ConsentEvent.DISPUTE_RAISED
        elif status == ConsentStatus.ACKNOWLEDGED:
            event = ConsentEvent.EXPLICIT_CONSENT
        elif status == ConsentStatus.EXPIRED:
            event = ConsentEvent.CONSENT_WINDOW_EXPIRED
        
        await LegalBotService.log_consent_event(
            consent_id=consent_id,
            event=event,
            details=details
        )
        
        # Update invoice status based on consent status
        invoice_id = str(record["invoice_id"])
        invoices_collection = get_collection("invoices")
        
        from app.models.invoice import InvoiceStatus
        
        if status == ConsentStatus.ACKNOWLEDGED:
            # If consent is acknowledged (explicitly or passively), update invoice to VALIDATED
            await invoices_collection.update_one(
                {"_id": record["invoice_id"]},
                {"$set": {"status": InvoiceStatus.VALIDATED, "updated_at": datetime.utcnow()}}
            )
        elif status == ConsentStatus.DISPUTED:
            # If consent is disputed, update invoice to REJECTED
            await invoices_collection.update_one(
                {"_id": record["invoice_id"]},
                {"$set": {"status": InvoiceStatus.REJECTED, "updated_at": datetime.utcnow()}}
            )
        
        # Get the updated record
        updated_record = await LegalBotService.get_consent_record(consent_id)
        
        return updated_record if updated_record else {}
    
    @staticmethod
    async def check_passive_consent() -> List[Dict[str, Any]]:
        """
        Check for passive consent (no response within consent window)
        """
        consent_collection = get_collection("consent_records")
        
        # Find records with expired consent window and still in PENDING status
        now = datetime.utcnow()
        query = {
            "status": ConsentStatus.PENDING,
            "consent_window_end": {"$lt": now}
        }
        
        cursor = consent_collection.find(query)
        updated_records = []
        
        async for record in cursor:
            consent_id = str(record["_id"])
            
            # Update to ACKNOWLEDGED status (passive consent)
            updated_record = await LegalBotService.update_consent_status(
                consent_id=consent_id,
                status=ConsentStatus.ACKNOWLEDGED,
                details={"passive_consent": True}
            )
            
            # Log passive consent event
            await LegalBotService.log_consent_event(
                consent_id=consent_id,
                event=ConsentEvent.PASSIVE_CONSENT,
                details={"consent_window_end": record["consent_window_end"].isoformat()}
            )
            
            updated_records.append(updated_record)
        
        return updated_records
    
    @staticmethod
    async def send_notification(
        notification_data: NotificationCreate,
        consent_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send a notification and record it
        """
        notifications_collection = get_collection("notifications")
        
        # Create notification record
        notification = {
            "invoice_id": ObjectId(notification_data.invoice_id),
            "type": notification_data.type,
            "recipient": notification_data.recipient,
            "status": NotificationStatus.QUEUED,
            "sent_at": None,
            "delivered_at": None,
            "read_at": None,
            "message_id": None,
            "content": notification_data.content,
            "metadata": notification_data.metadata
        }
        
        # Insert into database
        result = await notifications_collection.insert_one(notification)
        notification_id = result.inserted_id
        
        # Send the actual notification based on type
        success = False
        message_id = None
        
        if notification_data.type == NotificationType.EMAIL:
            # Get invoice details for CC
            invoices_collection = get_collection("invoices")
            invoice = await invoices_collection.find_one({"_id": ObjectId(notification_data.invoice_id)})
            
            if invoice and "seller_email" in invoice:
                # If this is an email notification and we have email content in dictionary format
                if isinstance(notification_data.metadata, dict) and "email_content" in notification_data.metadata:
                    email_content = notification_data.metadata["email_content"]
                    subject = email_content.get("subject", "TEVANI Invoice Notification")
                    body = email_content.get("body", notification_data.content)
                    
                    # Send email with CC to seller
                    success = await send_email(
                        subject=subject,
                        body=body,
                        to_email=notification_data.recipient,
                        cc_email=invoice.get("seller_email")
                    )
                else:
                    # Get email content from invoice
                    email_data = LegalBotService._generate_email_content(invoice)
                    
                    # Send email with CC to seller
                    success = await send_email(
                        subject=email_data["subject"],
                        body=email_data["body"],
                        to_email=notification_data.recipient,
                        cc_email=invoice.get("seller_email")
                    )
                
                if success:
                    message_id = f"email_{notification_id}"
            else:
                # Fallback if we don't have seller email
                success = await send_email(
                    subject="TEVANI Invoice Notification",
                    body=notification_data.content,
                    to_email=notification_data.recipient
                )
                if success:
                    message_id = f"email_{notification_id}"
        
        elif notification_data.type == NotificationType.WHATSAPP:
            # In a real application, integrate with WhatsApp API here
            # For demo purposes, we'll just mark it as sent
            success = True
            message_id = f"whatsapp_{notification_id}"
        
        # Update notification status based on sending result
        status = NotificationStatus.SENT if success else NotificationStatus.FAILED
        update_data = {
            "status": status,
            "sent_at": datetime.utcnow() if success else None
        }
        
        # Log the result
        if success:
            print(f"Successfully sent {notification_data.type} notification to {notification_data.recipient}")
        else:
            print(f"Failed to send {notification_data.type} notification to {notification_data.recipient}. " +
                  "Check email settings and ensure you're using an App Password for Gmail.")
        
        if message_id:
            update_data["message_id"] = message_id
            
        await notifications_collection.update_one(
            {"_id": notification_id},
            {"$set": update_data}
        )
        
        # If consent_id is provided, add notification to consent record
        if consent_id:
            consent_collection = get_collection("consent_records")
            await consent_collection.update_one(
                {"_id": ObjectId(consent_id)},
                {"$push": {"notifications": notification_id}}
            )
        
        # Get the created notification
        created_notification = await notifications_collection.find_one({"_id": notification_id})
        
        # Convert ObjectId to string for the response
        created_notification["id"] = str(created_notification["_id"])
        created_notification["invoice_id"] = str(created_notification["invoice_id"])
        del created_notification["_id"]
        
        return created_notification
    
    @staticmethod
    async def update_notification_status(
        notification_id: str,
        status: NotificationStatus,
        details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Update the status of a notification
        """
        notifications_collection = get_collection("notifications")
        
        # Get the notification
        notification = await notifications_collection.find_one({"_id": ObjectId(notification_id)})
        if not notification:
            raise ValueError(f"Notification with ID {notification_id} not found")
        
        # Create update data dictionary
        now = datetime.utcnow()
        update_data = {"status": status}
        
        # Add timestamps based on status
        if status == NotificationStatus.DELIVERED:
            # Create a new dictionary to avoid modifying the status field incorrectly
            update_data = {
                "status": status,
                "delivered_at": now
            }
        elif status == NotificationStatus.READ:
            # Create a new dictionary to avoid modifying the status field incorrectly
            update_data = {
                "status": status,
                "read_at": now
            }
        
        if details and "message_id" in details:
            update_data["message_id"] = details["message_id"]
        
        # Update in database
        await notifications_collection.update_one(
            {"_id": ObjectId(notification_id)},
            {"$set": update_data}
        )
        
        # Find consent record associated with this notification
        consent_collection = get_collection("consent_records")
        consent_record = await consent_collection.find_one({"notifications": ObjectId(notification_id)})
        
        # If found, log the event
        if consent_record:
            consent_id = str(consent_record["_id"])
            
            if status == NotificationStatus.DELIVERED:
                await LegalBotService.log_consent_event(
                    consent_id=consent_id,
                    event=ConsentEvent.NOTIFICATION_DELIVERED,
                    details={"notification_id": notification_id}
                )
            elif status == NotificationStatus.READ:
                await LegalBotService.log_consent_event(
                    consent_id=consent_id,
                    event=ConsentEvent.NOTIFICATION_READ,
                    details={"notification_id": notification_id}
                )
        
        # Get the updated notification
        updated_notification = await notifications_collection.find_one({"_id": ObjectId(notification_id)})
        
        # Convert ObjectId to string for the response
        updated_notification["id"] = str(updated_notification["_id"])
        updated_notification["invoice_id"] = str(updated_notification["invoice_id"])
        del updated_notification["_id"]
        
        return updated_notification
    
    @staticmethod
    async def log_consent_event(
        consent_id: str,
        event: ConsentEvent,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Log a consent event
        """
        logs_collection = get_collection("consent_logs")
        consent_collection = get_collection("consent_records")
        
        # Get the consent record
        consent_record = await consent_collection.find_one({"_id": ObjectId(consent_id)})
        if not consent_record:
            raise ValueError(f"Consent record with ID {consent_id} not found")
        
        # Create log entry
        log_entry = {
            "invoice_id": consent_record["invoice_id"],
            "event": event,
            "timestamp": datetime.utcnow(),
            "details": details or {},
            "ip_address": ip_address,
            "user_agent": user_agent
        }
        
        # Insert into database
        result = await logs_collection.insert_one(log_entry)
        log_id = result.inserted_id
        
        # Add log to consent record
        await consent_collection.update_one(
            {"_id": ObjectId(consent_id)},
            {"$push": {"logs": log_id}}
        )
        
        # Get the created log
        created_log = await logs_collection.find_one({"_id": log_id})
        
        # Convert ObjectId to string for the response
        created_log["id"] = str(created_log["_id"])
        created_log["invoice_id"] = str(created_log["invoice_id"])
        del created_log["_id"]
        
        return created_log
    
    @staticmethod
    def _generate_email_content(invoice: Dict[str, Any]) -> Dict[str, str]:
        """
        Generate email content for invoice notification
        
        Returns a dictionary with subject and body
        """
        invoice_number = invoice.get("invoice_number", "Unknown")
        amount = invoice.get("amount", 0)
        buyer_name = invoice.get("buyer_name", "Sir/Madam")
        seller_name = invoice.get("seller_name", "the seller")
        
        subject = f"Important: Invoice {invoice_number} Assignment Notification"
        
        body = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #4a6fa5; color: white; padding: 10px 20px; text-align: center; }}
                .content {{ padding: 20px; border: 1px solid #ddd; }}
                .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #777; }}
                .important {{ color: #d9534f; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>TEVANI Invoice Financing</h2>
                </div>
                <div class="content">
                    <p>Dear {buyer_name},</p>
                    
                    <p>This is to inform you that invoice <strong>#{invoice_number}</strong> for the amount of <strong>₹{amount:,.2f}</strong>
                    has been submitted for financing on the TEVANI platform by {seller_name}.</p>
                    
                    <p>As per the terms of the invoice, the payment rights are being assigned to investors on our platform.
                    <span class="important">If you have any objections to this assignment, please respond to this email within 48 hours.</span></p>
                    
                    <p>If we do not hear from you within this timeframe, it will be considered as your acknowledgment and acceptance of this assignment.</p>
                    
                    <p>For any queries, please contact us at <a href="mailto:support@tevani.com">support@tevani.com</a>.</p>
                    
                    <p>Regards,<br>
                    TEVANI Team</p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply directly to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return {
            "subject": subject,
            "body": body
        }
    
    @staticmethod
    def _generate_whatsapp_content(invoice: Dict[str, Any]) -> str:
        """
        Generate WhatsApp content for invoice notification
        """
        invoice_number = invoice.get("invoice_number", "Unknown")
        amount = invoice.get("amount", 0)
        
        return f"""
        TEVANI: Invoice #{invoice_number} for ₹{amount:,.2f} has been submitted for financing. Payment rights are being assigned to investors. Any objections? Reply within 48 hrs. No response will be considered as acceptance.
        """
    
    @staticmethod
    def _generate_ledger_entry(
        record: Dict[str, Any],
        status: ConsentStatus,
        details: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate a ledger entry for a consent record
        """
        now = datetime.utcnow()
        
        if status == ConsentStatus.ACKNOWLEDGED:
            if details and details.get("passive_consent"):
                return f"Passive consent recorded on {now.isoformat()}. No response received within the consent window."
            else:
                return f"Explicit consent received on {now.isoformat()}."
        elif status == ConsentStatus.DISPUTED:
            reason = details.get("reason", "No reason provided") if details else "No reason provided"
            return f"Dispute raised on {now.isoformat()}. Reason: {reason}"
        elif status == ConsentStatus.EXPIRED:
            return f"Consent window expired on {now.isoformat()}."
        else:
            return f"Consent status updated to {status} on {now.isoformat()}."

legalbot_service = LegalBotService()

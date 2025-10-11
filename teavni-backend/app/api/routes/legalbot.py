from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.models.legalbot import (
    ConsentCreate, 
    ConsentUpdate, 
    NotificationCreate, 
    NotificationUpdate,
    ConsentStatus,
    NotificationStatus,
    ConsentEvent
)
from app.services.legalbot_service import legalbot_service
from app.services.user_service import get_current_user

router = APIRouter()

@router.post("/consent", status_code=status.HTTP_201_CREATED)
async def create_consent(
    consent_data: ConsentCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Create a new consent record for an invoice
    """
    try:
        consent_record = await legalbot_service.create_consent_record(consent_data)
        return consent_record
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/consent/{consent_id}")
async def get_consent(
    consent_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get a consent record by ID
    """
    consent_record = await legalbot_service.get_consent_record(consent_id)
    
    if not consent_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consent record not found"
        )
    
    return consent_record

@router.get("/consent/invoice/{invoice_id}")
async def get_consent_by_invoice(
    invoice_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get a consent record by invoice ID
    """
    consent_record = await legalbot_service.get_consent_by_invoice(invoice_id)
    
    if not consent_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consent record not found for this invoice"
        )
    
    return consent_record

@router.put("/consent/{consent_id}")
async def update_consent(
    consent_id: str,
    consent_update: ConsentUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Update a consent record
    """
    try:
        updated_record = await legalbot_service.update_consent_status(
            consent_id=consent_id,
            status=consent_update.status,
            details=consent_update.dict(exclude={"status"})
        )
        return updated_record
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/notification")
async def send_notification(
    notification_data: NotificationCreate,
    consent_id: str = Query(None),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Send a notification
    """
    try:
        notification = await legalbot_service.send_notification(
            notification_data=notification_data,
            consent_id=consent_id
        )
        return notification
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.put("/notification/{notification_id}")
async def update_notification(
    notification_id: str,
    notification_update: NotificationUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Update a notification status
    """
    try:
        updated_notification = await legalbot_service.update_notification_status(
            notification_id=notification_id,
            status=notification_update.status,
            details=notification_update.dict(exclude={"status"})
        )
        return updated_notification
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/consent/log/{consent_id}")
async def log_consent_event(
    consent_id: str,
    event: ConsentEvent,
    details: Dict[str, Any] = None,
    ip_address: str = None,
    user_agent: str = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Log a consent event
    """
    try:
        log_entry = await legalbot_service.log_consent_event(
            consent_id=consent_id,
            event=event,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent
        )
        return log_entry
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/consent/check-passive")
async def check_passive_consent(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Check for passive consent (no response within consent window)
    """
    try:
        updated_records = await legalbot_service.check_passive_consent()
        return {"updated_records": len(updated_records), "records": updated_records}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check passive consent: {str(e)}"
        )

# Made with Bob

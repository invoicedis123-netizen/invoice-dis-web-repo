from typing import List, Dict, Any, Optional
import os
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from app.models.invoice import InvoiceCreate, Invoice, InvoiceUpdate, InvoiceStatus, RiskTier
from app.services.invoice_service import invoice_service
from app.services.user_service import get_current_user
from app.services.ocr_service import ocr_service

router = APIRouter()

@router.post("/process", status_code=status.HTTP_200_OK)
async def process_invoice_file(
    invoice_file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Process an invoice file with OCR without creating an invoice
    """
    try:
        # Save the file temporarily
        file_path = await invoice_service._save_uploaded_file(invoice_file)
        
        # Process with OCR
        ocr_result = await ocr_service.process_invoice_file(file_path)
        
        # Remove the temporary file after processing
        if os.path.exists(file_path):
            os.remove(file_path)
        
        return {
            "success": True,
            "data": ocr_result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process invoice file: {str(e)}"
        )

@router.post("/", response_model=Invoice, status_code=status.HTTP_201_CREATED)
@router.post("", response_model=Invoice, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    invoice_number: str = Form(...),
    amount: float = Form(...),
    invoice_date: str = Form(...),
    due_date: str = Form(...),
    buyer_name: str = Form(...),
    seller_id: str = Form(...),
    buyer_gstin: Optional[str] = Form(None),
    buyer_email: Optional[str] = Form(None),
    buyer_phone: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    invoice_file: Optional[UploadFile] = File(None),
    supporting_docs: List[UploadFile] = File([]),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Create a new invoice
    """
    # Verify that the seller_id matches the current user's ID
    if seller_id != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="seller_id must match the authenticated user's ID"
        )
    
    try:
        # Convert string dates to datetime objects
        from datetime import datetime
        try:
            invoice_date_dt = datetime.fromisoformat(invoice_date.replace('Z', '+00:00'))
        except ValueError:
            invoice_date_dt = datetime.strptime(invoice_date, "%Y-%m-%d")
            
        try:
            due_date_dt = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
        except ValueError:
            due_date_dt = datetime.strptime(due_date, "%Y-%m-%d")
        
        # Create InvoiceCreate object
        invoice_data = InvoiceCreate(
            invoice_number=invoice_number,
            amount=float(amount),
            invoice_date=invoice_date_dt,
            due_date=due_date_dt,
            buyer_name=buyer_name,
            buyer_email=buyer_email,
            buyer_phone=buyer_phone,
            seller_id=seller_id,
            buyer_gstin=buyer_gstin,
            description=description
        )
        
        invoice = await invoice_service.create_invoice(
            invoice_data=invoice_data,
            invoice_file=invoice_file,
            supporting_docs=supporting_docs
        )
        return invoice
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        import traceback
        print(f"Error creating invoice: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create invoice: {str(e)}"
        )

@router.get("/", response_model=List[Invoice])
@router.get("", response_model=List[Invoice])
async def list_invoices(
    status: Optional[InvoiceStatus] = None,
    risk_tier: Optional[RiskTier] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    List invoices for the current user
    """
    # For business users, only show their own invoices
    # For investor users, show all available invoices
    seller_id = None
    if current_user["type"] == "business":
        seller_id = current_user["id"]
    
    invoices = await invoice_service.list_invoices(
        seller_id=seller_id,
        status=status,
        risk_tier=risk_tier,
        skip=skip,
        limit=limit
    )
    
    return invoices

@router.get("/{invoice_id}", response_model=Invoice)
async def get_invoice(
    invoice_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get a specific invoice
    """
    invoice = await invoice_service.get_invoice_by_id(invoice_id)
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Check if user has access to this invoice
    if current_user["type"] == "business" and str(invoice["seller_id"]) != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this invoice"
        )
    
    return invoice

@router.put("/{invoice_id}", response_model=Invoice)
async def update_invoice(
    invoice_id: str,
    invoice_update: InvoiceUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Update an invoice
    """
    # Get the invoice first to check permissions
    invoice = await invoice_service.get_invoice_by_id(invoice_id)
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Check if user has permission to update this invoice
    if current_user["type"] == "business" and str(invoice["seller_id"]) != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this invoice"
        )
    
    # Business users can only update certain fields
    if current_user["type"] == "business":
        allowed_fields = ["description"]
        update_data = {k: v for k, v in invoice_update.dict(exclude_unset=True).items() if k in allowed_fields}
    else:
        # Admin/investor users can update all fields
        update_data = invoice_update.dict(exclude_unset=True)
    
    updated_invoice = await invoice_service.update_invoice(invoice_id, update_data)
    
    return updated_invoice

@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invoice(
    invoice_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Delete an invoice
    """
    # Get the invoice first to check permissions
    invoice = await invoice_service.get_invoice_by_id(invoice_id)
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Check if user has permission to delete this invoice
    if current_user["type"] == "business" and str(invoice["seller_id"]) != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this invoice"
        )
    
    # Only allow deletion if invoice is not yet validated or funded
    if invoice["status"] not in [InvoiceStatus.PENDING_VALIDATION, InvoiceStatus.REJECTED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete an invoice that has been validated or funded"
        )
    
    success = await invoice_service.delete_invoice(invoice_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete invoice"
        )

# Made with Bob

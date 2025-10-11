from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.invoice import Invoice
from app.services.validation_service import validation_service
from app.services.user_service import get_current_user

router = APIRouter()

@router.post("/{invoice_id}", response_model=Invoice)
async def validate_invoice(
    invoice_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Validate an invoice
    """
    try:
        # In a real application, you would check permissions here
        # For demo purposes, any authenticated user can validate an invoice
        
        validated_invoice = await validation_service.validate_invoice(invoice_id)
        return validated_invoice
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Validation failed: {str(e)}"
        )

# Made with Bob

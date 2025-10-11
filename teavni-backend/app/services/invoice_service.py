import os
import shutil
from datetime import datetime
from typing import Dict, Any, List, Optional
from bson import ObjectId
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings
from app.core.database import get_collection
from app.models.invoice import InvoiceCreate, InvoiceStatus, RiskTier
from app.services.ocr_service import ocr_service
from app.services.validation_service import validation_service

class InvoiceService:
    """
    Service for invoice management
    """
    
    @staticmethod
    async def create_invoice(
        invoice_data: InvoiceCreate,
        invoice_file: Optional[UploadFile] = None,
        supporting_docs: Optional[List[UploadFile]] = None
    ) -> Dict[str, Any]:
        """
        Create a new invoice
        """
        invoices_collection = get_collection("invoices")
        
        # Process invoice file if provided
        file_path = None
        ocr_data = None
        file_hash = None
        
        if invoice_file:
            # Save the file
            file_path = await InvoiceService._save_uploaded_file(invoice_file)
            
            # Process with OCR
            ocr_result = await ocr_service.process_invoice_file(file_path)
            ocr_data = ocr_result
            file_hash = ocr_result.get("hash")
            
            # Merge OCR data with provided data
            # In a real application, you would have more sophisticated merging logic
            if not invoice_data.invoice_number and ocr_data.get("invoice_number"):
                invoice_data.invoice_number = ocr_data["invoice_number"]
            if not invoice_data.amount and ocr_data.get("amount"):
                invoice_data.amount = ocr_data["amount"]
            if not invoice_data.buyer_name and ocr_data.get("buyer_name"):
                invoice_data.buyer_name = ocr_data["buyer_name"]
        
        # Process supporting documents if provided
        supporting_doc_paths = []
        if supporting_docs:
            for doc in supporting_docs:
                doc_path = await InvoiceService._save_uploaded_file(doc, "supporting")
                supporting_doc_paths.append(doc_path)
        
        # Create invoice dict
        invoice_dict = invoice_data.dict()
        invoice_dict["seller_id"] = ObjectId(invoice_data.seller_id)
        invoice_dict["status"] = InvoiceStatus.PENDING_VALIDATION
        invoice_dict["created_at"] = datetime.utcnow()
        invoice_dict["updated_at"] = invoice_dict["created_at"]
        invoice_dict["file_path"] = file_path
        invoice_dict["ocr_data"] = ocr_data
        invoice_dict["hash"] = file_hash
        invoice_dict["supporting_documents"] = supporting_doc_paths
        invoice_dict["funded_amount"] = 0.0
        invoice_dict["available_amount"] = float(invoice_data.amount)  # Set available amount to the invoice amount
        
        # Insert into database
        result = await invoices_collection.insert_one(invoice_dict)
        
        # Run validation
        invoice_id = str(result.inserted_id)
        await validation_service.validate_invoice(invoice_id)
        
        # Get the created invoice
        created_invoice = await InvoiceService.get_invoice_by_id(invoice_id)
        
        if not created_invoice:
            raise ValueError(f"Failed to retrieve created invoice with ID {invoice_id}")
            
        return created_invoice
    
    @staticmethod
    async def _save_uploaded_file(file: UploadFile, subfolder: str = "") -> str:
        """
        Save an uploaded file to disk
        """
        # Create upload directory if it doesn't exist
        upload_dir = settings.UPLOAD_DIR
        if subfolder:
            upload_dir = os.path.join(upload_dir, subfolder)
        
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate a unique filename
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(upload_dir, filename)
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return file_path
    
    @staticmethod
    async def get_invoice_by_id(invoice_id: str) -> Optional[Dict[str, Any]]:
        """
        Get an invoice by ID
        """
        invoices_collection = get_collection("invoices")
        invoice = await invoices_collection.find_one({"_id": ObjectId(invoice_id)})
        
        if invoice:
            # Convert ObjectId to string for the response
            invoice["id"] = str(invoice["_id"])
            invoice["seller_id"] = str(invoice["seller_id"])
            del invoice["_id"]
        
        return invoice
    
    @staticmethod
    async def list_invoices(
        seller_id: Optional[str] = None,
        status: Optional[InvoiceStatus] = None,
        risk_tier: Optional[RiskTier] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        List invoices with filters and pagination
        """
        invoices_collection = get_collection("invoices")
        
        # Build query
        query = {}
        if seller_id:
            query["seller_id"] = ObjectId(seller_id)
        if status:
            query["status"] = status
        if risk_tier:
            query["risk_tier"] = risk_tier
        
        # Execute query
        cursor = invoices_collection.find(query).skip(skip).limit(limit)
        invoices = []
        
        async for invoice in cursor:
            # Convert ObjectId to string for the response
            invoice["id"] = str(invoice["_id"])
            invoice["seller_id"] = str(invoice["seller_id"])
            del invoice["_id"]
            invoices.append(invoice)
        
        return invoices
    
    @staticmethod
    async def update_invoice(invoice_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update an invoice
        """
        invoices_collection = get_collection("invoices")
        
        update_data["updated_at"] = datetime.utcnow()
        
        await invoices_collection.update_one(
            {"_id": ObjectId(invoice_id)},
            {"$set": update_data}
        )
        
        return await InvoiceService.get_invoice_by_id(invoice_id)
    
    @staticmethod
    async def delete_invoice(invoice_id: str) -> bool:
        """
        Delete an invoice
        """
        invoices_collection = get_collection("invoices")
        
        # Get the invoice first to check if it exists and get file paths
        invoice = await InvoiceService.get_invoice_by_id(invoice_id)
        if not invoice:
            return False
        
        # Delete associated files
        if invoice.get("file_path") and os.path.exists(invoice["file_path"]):
            os.remove(invoice["file_path"])
        
        for doc_path in invoice.get("supporting_documents", []):
            if os.path.exists(doc_path):
                os.remove(doc_path)
        
        # Delete from database
        result = await invoices_collection.delete_one({"_id": ObjectId(invoice_id)})
        
        return result.deleted_count > 0

invoice_service = InvoiceService()

# Made with Bob

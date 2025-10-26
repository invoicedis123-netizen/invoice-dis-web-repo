import re
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from app.core.database import get_collection
from app.models.invoice import ValidationResult, ValidationCheck, RiskTier, InvoiceStatus

class ValidationService:
    """
    Service for invoice validation
    """
    
    @staticmethod
    async def validate_invoice(invoice_id: str) -> Dict[str, Any]:
        """
        Validate an invoice and update its status, trust score, and risk tier
        """
        # Get the invoice
        invoices_collection = get_collection("invoices")
        from bson import ObjectId
        invoice = await invoices_collection.find_one({"_id": ObjectId(invoice_id)})
        
        if not invoice:
            raise ValueError(f"Invoice with ID {invoice_id} not found")
        
        # Run validation checks
        validation_results = []
        
        # Structural checks
        validation_results.extend(ValidationService._validate_structure(invoice))
        
        # Evidence linking checks
        validation_results.extend(ValidationService._validate_evidence(invoice))
        
        # Anomaly screening
        validation_results.extend(ValidationService._screen_anomalies(invoice))
        
        # Calculate trust score and risk tier
        trust_score, risk_tier = ValidationService._calculate_trust_score(validation_results)
        
        # Determine status based on validation results
        status = InvoiceStatus.PENDING_CONSENT  # Changed from VALIDATED to PENDING_CONSENT
        if any(check.result == ValidationResult.FAIL for check in validation_results):
            status = InvoiceStatus.REJECTED
        
        # Update invoice with validation results
        update_data = {
            "validation_results": [check.dict() for check in validation_results],
            "trust_score": trust_score,
            "risk_tier": risk_tier,
            "status": status,
            "updated_at": datetime.utcnow(),
        }
        
        # If validated, set available amount
        if status == InvoiceStatus.VALIDATED:
            update_data["available_amount"] = invoice["amount"]
        
        await invoices_collection.update_one(
            {"_id": ObjectId(invoice_id)},
            {"$set": update_data}
        )
        
        # Get the updated invoice
        updated_invoice = await invoices_collection.find_one({"_id": ObjectId(invoice_id)})
        
        # Convert ObjectId to string for the response
        updated_invoice["id"] = str(updated_invoice["_id"])
        updated_invoice["seller_id"] = str(updated_invoice["seller_id"])
        del updated_invoice["_id"]
        
        return updated_invoice
    
    @staticmethod
    def _validate_structure(invoice: Dict[str, Any]) -> List[ValidationCheck]:
        """
        Validate the structure of an invoice
        """
        results = []
        
        # Check invoice number format
        if invoice.get("invoice_number"):
            invoice_number = invoice["invoice_number"]
            if not re.match(r"^[A-Za-z0-9\-/]+$", invoice_number):
                results.append(ValidationCheck(
                    check_name="invoice_number_format",
                    result=ValidationResult.WARNING,
                    message="Invoice number format is unusual",
                    details={"invoice_number": invoice_number}
                ))
            else:
                results.append(ValidationCheck(
                    check_name="invoice_number_format",
                    result=ValidationResult.PASS,
                    message="Invoice number format is valid",
                    details={"invoice_number": invoice_number}
                ))
        else:
            results.append(ValidationCheck(
                check_name="invoice_number_format",
                result=ValidationResult.FAIL,
                message="Invoice number is missing",
                details={}
            ))
        
        # Check invoice amount
        if invoice.get("amount"):
            amount = invoice["amount"]
            if amount <= 0:
                results.append(ValidationCheck(
                    check_name="invoice_amount",
                    result=ValidationResult.FAIL,
                    message="Invoice amount must be positive",
                    details={"amount": amount}
                ))
            else:
                results.append(ValidationCheck(
                    check_name="invoice_amount",
                    result=ValidationResult.PASS,
                    message="Invoice amount is valid",
                    details={"amount": amount}
                ))
        else:
            results.append(ValidationCheck(
                check_name="invoice_amount",
                result=ValidationResult.FAIL,
                message="Invoice amount is missing",
                details={}
            ))
        
        # Check date sequence
        if invoice.get("invoice_date") and invoice.get("due_date"):
            invoice_date = invoice["invoice_date"]
            due_date = invoice["due_date"]
            
            if isinstance(invoice_date, str):
                invoice_date = datetime.fromisoformat(invoice_date.replace("Z", "+00:00"))
            
            if isinstance(due_date, str):
                due_date = datetime.fromisoformat(due_date.replace("Z", "+00:00"))
            
            if due_date < invoice_date:
                results.append(ValidationCheck(
                    check_name="date_sequence",
                    result=ValidationResult.FAIL,
                    message="Due date cannot be before invoice date",
                    details={"invoice_date": invoice_date, "due_date": due_date}
                ))
            else:
                results.append(ValidationCheck(
                    check_name="date_sequence",
                    result=ValidationResult.PASS,
                    message="Date sequence is valid",
                    details={"invoice_date": invoice_date, "due_date": due_date}
                ))
        
        # Check GSTIN format if present
        if invoice.get("buyer_gstin"):
            gstin = invoice["buyer_gstin"]
            if not re.match(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[A-Z0-9]{1}$", gstin):
                results.append(ValidationCheck(
                    check_name="gstin_format",
                    result=ValidationResult.WARNING,
                    message="GSTIN format is invalid",
                    details={"gstin": gstin}
                ))
            else:
                results.append(ValidationCheck(
                    check_name="gstin_format",
                    result=ValidationResult.PASS,
                    message="GSTIN format is valid",
                    details={"gstin": gstin}
                ))
        
        # Check line items if present
        if invoice.get("line_items"):
            line_items = invoice["line_items"]
            total_amount = sum(item.get("amount", 0) for item in line_items)
            
            if abs(total_amount - invoice.get("amount", 0)) > 0.01:
                results.append(ValidationCheck(
                    check_name="line_items_total",
                    result=ValidationResult.WARNING,
                    message="Line items total does not match invoice amount",
                    details={"line_items_total": total_amount, "invoice_amount": invoice.get("amount")}
                ))
            else:
                results.append(ValidationCheck(
                    check_name="line_items_total",
                    result=ValidationResult.PASS,
                    message="Line items total matches invoice amount",
                    details={"line_items_total": total_amount, "invoice_amount": invoice.get("amount")}
                ))
        
        return results
    
    @staticmethod
    def _validate_evidence(invoice: Dict[str, Any]) -> List[ValidationCheck]:
        """
        Validate the evidence linking of an invoice
        """
        results = []
        
        # Check if supporting documents are present
        if invoice.get("supporting_documents") and len(invoice["supporting_documents"]) > 0:
            results.append(ValidationCheck(
                check_name="supporting_documents",
                result=ValidationResult.PASS,
                message="Supporting documents are present",
                details={"count": len(invoice["supporting_documents"])}
            ))
        else:
            results.append(ValidationCheck(
                check_name="supporting_documents",
                result=ValidationResult.WARNING,
                message="No supporting documents provided",
                details={}
            ))
        
        # Check if file hash is present
        if invoice.get("hash"):
            results.append(ValidationCheck(
                check_name="file_hash",
                result=ValidationResult.PASS,
                message="File hash is present for tamper detection",
                details={"hash": invoice["hash"]}
            ))
        else:
            results.append(ValidationCheck(
                check_name="file_hash",
                result=ValidationResult.WARNING,
                message="No file hash available for tamper detection",
                details={}
            ))
        
        return results
    
    @staticmethod
    def _screen_anomalies(invoice: Dict[str, Any]) -> List[ValidationCheck]:
        """
        Screen for anomalies in an invoice
        """
        results = []
        
        # Check for round amounts (potential red flag)
        if invoice.get("amount") and invoice["amount"] % 1000 == 0:
            results.append(ValidationCheck(
                check_name="round_amount",
                result=ValidationResult.WARNING,
                message="Invoice amount is suspiciously round",
                details={"amount": invoice["amount"]}
            ))
        else:
            results.append(ValidationCheck(
                check_name="round_amount",
                result=ValidationResult.PASS,
                message="Invoice amount is not suspiciously round",
                details={"amount": invoice.get("amount")}
            ))
        
        # Check for very short payment terms (potential red flag)
        if invoice.get("invoice_date") and invoice.get("due_date"):
            invoice_date = invoice["invoice_date"]
            due_date = invoice["due_date"]
            
            if isinstance(invoice_date, str):
                invoice_date = datetime.fromisoformat(invoice_date.replace("Z", "+00:00"))
            
            if isinstance(due_date, str):
                due_date = datetime.fromisoformat(due_date.replace("Z", "+00:00"))
            
            days_difference = (due_date - invoice_date).days
            
            if days_difference < 7:
                results.append(ValidationCheck(
                    check_name="short_payment_terms",
                    result=ValidationResult.WARNING,
                    message="Payment terms are unusually short",
                    details={"days": days_difference}
                ))
            else:
                results.append(ValidationCheck(
                    check_name="short_payment_terms",
                    result=ValidationResult.PASS,
                    message="Payment terms are reasonable",
                    details={"days": days_difference}
                ))
        
        # Check for unusually high unit prices in line items
        if invoice.get("line_items"):
            line_items = invoice["line_items"]
            high_unit_price_items = []
            
            for item in line_items:
                if item.get("unit_price", 0) > 10000:  # Arbitrary threshold
                    high_unit_price_items.append(item)
            
            if high_unit_price_items:
                results.append(ValidationCheck(
                    check_name="high_unit_prices",
                    result=ValidationResult.WARNING,
                    message="Some line items have unusually high unit prices",
                    details={"items": high_unit_price_items}
                ))
            else:
                results.append(ValidationCheck(
                    check_name="high_unit_prices",
                    result=ValidationResult.PASS,
                    message="Line item unit prices are within reasonable ranges",
                    details={}
                ))
        
        return results
    
    @staticmethod
    def _calculate_trust_score(validation_results: List[ValidationCheck]) -> Tuple[int, RiskTier]:
        """
        Calculate trust score and risk tier based on validation results
        """
        # Count results by type
        pass_count = sum(1 for check in validation_results if check.result == ValidationResult.PASS)
        warning_count = sum(1 for check in validation_results if check.result == ValidationResult.WARNING)
        fail_count = sum(1 for check in validation_results if check.result == ValidationResult.FAIL)
        
        total_checks = len(validation_results)
        
        # Calculate trust score (0-100)
        if total_checks == 0:
            trust_score = 0
        else:
            # Each PASS is worth 1 point, each WARNING is worth 0.5 points, each FAIL is worth 0 points
            trust_score = int((pass_count + 0.5 * warning_count) / total_checks * 100)
        
        # Determine risk tier
        if trust_score >= 90:
            risk_tier = RiskTier.A
        elif trust_score >= 75:
            risk_tier = RiskTier.B
        elif trust_score >= 60:
            risk_tier = RiskTier.C
        else:
            risk_tier = RiskTier.D
        
        return trust_score, risk_tier

validation_service = ValidationService()

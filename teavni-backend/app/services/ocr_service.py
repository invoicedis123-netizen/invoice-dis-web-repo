import os
import io
import re
import json
import hashlib
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
import pytesseract
from PIL import Image
from pdf2image import convert_from_path
from app.core.config import settings

class OCRService:
    """
    Service for OCR processing of invoice documents
    """
    
    @staticmethod
    async def process_invoice_file(file_path: str) -> Dict[str, Any]:
        """
        Process an invoice file (PDF or image) using OCR
        """
        # Calculate file hash for tamper detection
        file_hash = OCRService._calculate_file_hash(file_path)
        
        # Extract text from file
        text = await OCRService._extract_text_from_file(file_path)
        
        # Parse invoice data from text
        invoice_data = OCRService._parse_invoice_data(text)
        
        # Add metadata
        invoice_data["file_path"] = file_path
        invoice_data["hash"] = file_hash
        invoice_data["ocr_text"] = text
        
        return invoice_data
    
    @staticmethod
    def _calculate_file_hash(file_path: str) -> str:
        """
        Calculate SHA-256 hash of a file
        """
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    
    @staticmethod
    async def _extract_text_from_file(file_path: str) -> str:
        """
        Extract text from a file using OCR
        """
        file_ext = os.path.splitext(file_path)[1].lower()
        
        if file_ext == ".pdf":
            # Convert PDF to images
            images = convert_from_path(file_path)
            text = ""
            
            # Process each page
            for image in images:
                text += pytesseract.image_to_string(image)
        else:
            # Process image file
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
        
        return text
    
    @staticmethod
    def _parse_invoice_data(text: str) -> Dict[str, Any]:
        """
        Parse invoice data from OCR text
        """
        data = {
            "invoice_number": OCRService._extract_invoice_number(text),
            "invoice_date": OCRService._extract_date(text, "invoice date"),
            "due_date": OCRService._extract_date(text, "due date"),
            "amount": OCRService._extract_amount(text),
            "buyer_name": OCRService._extract_buyer_name(text),
            "buyer_gstin": OCRService._extract_gstin(text),
            "line_items": OCRService._extract_line_items(text),
            "purchase_order_number": OCRService._extract_po_number(text),
        }
        
        return data
    
    @staticmethod
    def _extract_invoice_number(text: str) -> Optional[str]:
        """
        Extract invoice number from text
        """
        patterns = [
            r"invoice\s*(?:#|number|num|no)[:.\s]*([A-Za-z0-9\-/]+)",
            r"invoice\s*:\s*([A-Za-z0-9\-/]+)",
            r"bill\s*(?:#|number|num|no)[:.\s]*([A-Za-z0-9\-/]+)",
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        return None
    
    @staticmethod
    def _extract_date(text: str, date_type: str) -> Optional[str]:
        """
        Extract date from text
        """
        # Various date formats
        date_patterns = [
            r"(?:" + date_type + r")\s*(?::|is|of)?[\s:]*(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4})",
            r"(?:" + date_type + r")\s*(?::|is|of)?[\s:]*(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})",
            r"(?:" + date_type + r")\s*(?::|is|of)?[\s:]*(\d{4}[-/\.]\d{1,2}[-/\.]\d{1,2})",
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                date_str = match.group(1).strip()
                # In a real application, you would parse and standardize the date format
                return date_str
        
        return None
    
    @staticmethod
    def _extract_amount(text: str) -> Optional[float]:
        """
        Extract invoice amount from text
        """
        # Look for total amount patterns
        patterns = [
            r"total\s*(?:amount|sum)?\s*(?::|is|of)?[\s:]*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)",
            r"(?:grand|invoice|net)\s*total\s*(?::|is|of)?[\s:]*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)",
            r"amount\s*(?:due|payable|total)\s*(?::|is|of)?[\s:]*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)",
            r"(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)",
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                amount_str = match.group(1).replace(",", "")
                try:
                    return float(amount_str)
                except ValueError:
                    continue
        
        return None
    
    @staticmethod
    def _extract_buyer_name(text: str) -> Optional[str]:
        """
        Extract buyer name from text
        """
        patterns = [
            r"(?:bill|invoice|sold)\s*to\s*:?\s*([A-Za-z0-9\s&.,]+?)(?:\n|$|GST|PAN)",
            r"(?:customer|client|buyer)\s*:?\s*([A-Za-z0-9\s&.,]+?)(?:\n|$|GST|PAN)",
            r"(?:name)\s*:?\s*([A-Za-z0-9\s&.,]+?)(?:\n|$|GST|PAN)",
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        return None
    
    @staticmethod
    def _extract_gstin(text: str) -> Optional[str]:
        """
        Extract GSTIN from text
        """
        # GSTIN format: 2 digits, 10 characters, 1 digit, 1 character, 1 digit/character
        pattern = r"(?:GSTIN|GST|GST IN|GST No)[:\s]*([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[A-Z0-9]{1})"
        
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
        
        return None
    
    @staticmethod
    def _extract_line_items(text: str) -> List[Dict[str, Any]]:
        """
        Extract line items from text
        """
        # This is a simplified implementation
        # In a real application, you would use more sophisticated techniques
        # such as table detection and parsing
        
        # Try to find a table-like structure
        lines = text.split("\n")
        line_items = []
        
        # Look for patterns like "1. Item description 2 500.00 1000.00"
        item_pattern = r"(\d+\.?\s+)([A-Za-z0-9\s\-&.,]+)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)"
        
        for line in lines:
            match = re.search(item_pattern, line)
            if match:
                try:
                    description = match.group(2).strip()
                    quantity = float(match.group(3))
                    unit_price = float(match.group(4))
                    amount = float(match.group(5))
                    
                    line_items.append({
                        "description": description,
                        "quantity": quantity,
                        "unit_price": unit_price,
                        "amount": amount,
                        "tax": 0.0  # Would need more sophisticated parsing for tax
                    })
                except (ValueError, IndexError):
                    continue
        
        return line_items
    
    @staticmethod
    def _extract_po_number(text: str) -> Optional[str]:
        """
        Extract purchase order number from text
        """
        patterns = [
            r"(?:purchase\s*order|PO|P\.O\.)\s*(?:#|number|num|no)[:.\s]*([A-Za-z0-9\-/]+)",
            r"(?:purchase\s*order|PO|P\.O\.)\s*:\s*([A-Za-z0-9\-/]+)",
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        return None

ocr_service = OCRService()

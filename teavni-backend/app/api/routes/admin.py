

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.models.user import User, UserType, AdminRole
from app.models.invoice import Invoice, InvoiceStatus, RiskTier
from app.services.user_service import get_current_user
from app.services.invoice_service import invoice_service
from app.services.validation_service import validation_service
from app.core.database import get_collection
from bson import ObjectId
from datetime import datetime, timedelta


router = APIRouter()


# Admin authorization middleware
async def get_admin_user(current_user: Dict[str, Any] = Depends(get_current_user)):
   if current_user.get("type") != UserType.ADMIN:
       raise HTTPException(
           status_code=status.HTTP_403_FORBIDDEN,
           detail="Admin access required"
       )
   return current_user


# Super admin authorization middleware
async def get_super_admin_user(current_user: Dict[str, Any] = Depends(get_admin_user)):
   if current_user.get("admin_role") != AdminRole.SUPERUSER:
       raise HTTPException(
           status_code=status.HTTP_403_FORBIDDEN,
           detail="Superuser access required"
       )
   return current_user


# Dashboard endpoints
@router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: Dict[str, Any] = Depends(get_admin_user)):
   """
   Get dashboard statistics for admin
   """
   users_collection = get_collection("users")
   invoices_collection = get_collection("invoices")
   investments_collection = get_collection("investments")
  
   # User stats
   total_users = await users_collection.count_documents({})
   business_users = await users_collection.count_documents({"type": UserType.BUSINESS})
   investor_users = await users_collection.count_documents({"type": UserType.INVESTOR})
   active_users = await users_collection.count_documents({"is_active": True})
  
   # Invoice stats
   total_invoices = await invoices_collection.count_documents({})
   pending_validation = await invoices_collection.count_documents({"status": InvoiceStatus.PENDING_VALIDATION})
   validated_invoices = await invoices_collection.count_documents({"status": InvoiceStatus.VALIDATED})
   funded_invoices = await invoices_collection.count_documents({"status": InvoiceStatus.FUNDED})
   defaulted_invoices = await invoices_collection.count_documents({"status": InvoiceStatus.DEFAULTED})
  
   # Investment stats
   investments = await investments_collection.find({}).to_list(length=None)
   total_volume = sum(investment.get("amount", 0) for investment in investments)
   active_investments = await investments_collection.count_documents({"status": "active"})
  
   # Calculate average ROI
   if active_investments > 0:
       total_roi = sum(investment.get("roi", 0) for investment in investments)
       average_roi = total_roi / active_investments
   else:
       average_roi = 0
  
   # TRRF stats
   trrf_collection = get_collection("trrf")
   trrf_doc = await trrf_collection.find_one({"_id": "main"})
  
   # If TRRF document doesn't exist, create default values
   if not trrf_doc:
       trrf_doc = {
           "total_pool": 50000000,  # 5 Cr
           "utilized": 12000000,    # 1.2 Cr
           "default_rate": 0.4,
           "industry_avg_default": 1.2
       }
       # Insert the default document
       await trrf_collection.insert_one({
           "_id": "main",
           **trrf_doc,
           "created_at": datetime.utcnow(),
           "updated_at": datetime.utcnow()
       })
  
   trrf_stats = {
       "total_pool": trrf_doc.get("total_pool", 50000000),
       "utilized": trrf_doc.get("utilized", 12000000),
       "available": trrf_doc.get("total_pool", 50000000) - trrf_doc.get("utilized", 12000000),
       "default_rate": trrf_doc.get("default_rate", 0.4),
       "industry_avg_default": trrf_doc.get("industry_avg_default", 1.2)
   }
  
   # Transaction trends (last 7 days)
   transaction_trends = []
   for i in range(7):
       date = datetime.utcnow() - timedelta(days=i)
       date_start = datetime(date.year, date.month, date.day)
       date_end = datetime(date.year, date.month, date.day, 23, 59, 59)
      
       daily_count = await invoices_collection.count_documents({
           "created_at": {"$gte": date_start, "$lte": date_end}
       })
      
       daily_volume = 0
       daily_invoices = await invoices_collection.find({
           "created_at": {"$gte": date_start, "$lte": date_end}
       }).to_list(length=None)
      
       for invoice in daily_invoices:
           daily_volume += invoice.get("amount", 0)
      
       transaction_trends.append({
           "date": date_start.strftime("%Y-%m-%d"),
           "count": daily_count,
           "volume": daily_volume
       })
  
   # Invoice approval rates
   approval_rates = []
   for i in range(7):
       date = datetime.utcnow() - timedelta(days=i * 30)  # Monthly data
       month_start = datetime(date.year, date.month, 1)
       if date.month == 12:
           month_end = datetime(date.year + 1, 1, 1) - timedelta(days=1)
       else:
           month_end = datetime(date.year, date.month + 1, 1) - timedelta(days=1)
       month_end = datetime(month_end.year, month_end.month, month_end.day, 23, 59, 59)
      
       approved = await invoices_collection.count_documents({
           "updated_at": {"$gte": month_start, "$lte": month_end},
           "status": InvoiceStatus.VALIDATED
       })
      
       rejected = await invoices_collection.count_documents({
           "updated_at": {"$gte": month_start, "$lte": month_end},
           "status": InvoiceStatus.REJECTED
       })
      
       approval_rates.append({
           "month": month_start.strftime("%b"),
           "approved": approved,
           "rejected": rejected
       })
  
   # Risk tier distribution
   tier_a = await invoices_collection.count_documents({"risk_tier": RiskTier.A})
   tier_b = await invoices_collection.count_documents({"risk_tier": RiskTier.B})
   tier_c = await invoices_collection.count_documents({"risk_tier": RiskTier.C})
   tier_d = await invoices_collection.count_documents({"risk_tier": RiskTier.D})
  
   risk_distribution = {
       "A": tier_a,
       "B": tier_b,
       "C": tier_c,
       "D": tier_d
   }
  
   return {
       "user_stats": {
           "total": total_users,
           "business": business_users,
           "investor": investor_users,
           "active": active_users
       },
       "invoice_stats": {
           "total": total_invoices,
           "pending_validation": pending_validation,
           "validated": validated_invoices,
           "funded": funded_invoices,
           "defaulted": defaulted_invoices
       },
       "investment_stats": {
           "total_volume": total_volume,
           "active_investments": active_investments,
           "average_roi": average_roi,
           "trrf": trrf_stats
       },
       "transaction_trends": transaction_trends,
       "approval_rates": approval_rates,
       "risk_distribution": risk_distribution
   }


# User management endpoints
@router.get("/users")
async def get_users(
   skip: int = 0,
   limit: int = 100,
   user_type: Optional[str] = None,
   is_active: Optional[bool] = None,
   kyc_status: Optional[str] = None,
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Get all users with filtering options
   """
   users_collection = get_collection("users")
  
   # Build query
   query = {}
   if user_type:
       query["type"] = user_type
   if is_active is not None:
       query["is_active"] = is_active
   if kyc_status:
       query["kyc_status"] = kyc_status
  
   # Execute query
   cursor = users_collection.find(query).skip(skip).limit(limit)
   users = []
  
   async for user in cursor:
       user["id"] = str(user["_id"])
       del user["_id"]
       if "hashed_password" in user:
           del user["hashed_password"]
       users.append(user)
  
   return users


@router.get("/users/{user_id}")
async def get_user(
   user_id: str,
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Get a specific user by ID
   """
   users_collection = get_collection("users")
   user = await users_collection.find_one({"_id": ObjectId(user_id)})
  
   if not user:
       raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND,
           detail="User not found"
       )
  
   user["id"] = str(user["_id"])
   del user["_id"]
   if "hashed_password" in user:
       del user["hashed_password"]
  
   return user


@router.put("/users/{user_id}")
async def update_user(
   user_id: str,
   user_data: Dict[str, Any],
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Update a user
   """
   users_collection = get_collection("users")
  
   # Don't allow updating email or password through this endpoint
   if "email" in user_data:
       del user_data["email"]
   if "password" in user_data:
       del user_data["password"]
   if "hashed_password" in user_data:
       del user_data["hashed_password"]
  
   user_data["updated_at"] = datetime.utcnow()
  
   # Update user
   result = await users_collection.update_one(
       {"_id": ObjectId(user_id)},
       {"$set": user_data}
   )
  
   if result.matched_count == 0:
       raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND,
           detail="User not found"
       )
  
   # Get updated user
   updated_user = await users_collection.find_one({"_id": ObjectId(user_id)})
   updated_user["id"] = str(updated_user["_id"])
   del updated_user["_id"]
   if "hashed_password" in updated_user:
       del updated_user["hashed_password"]
  
   return updated_user


@router.post("/users/{user_id}/activate")
async def activate_user(
   user_id: str,
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Activate a user
   """
   users_collection = get_collection("users")
  
   result = await users_collection.update_one(
       {"_id": ObjectId(user_id)},
       {"$set": {"is_active": True, "updated_at": datetime.utcnow()}}
   )
  
   if result.matched_count == 0:
       raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND,
           detail="User not found"
       )
  
   return {"success": True, "message": "User activated successfully"}


@router.post("/users/{user_id}/deactivate")
async def deactivate_user(
   user_id: str,
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Deactivate a user
   """
   users_collection = get_collection("users")
  
   result = await users_collection.update_one(
       {"_id": ObjectId(user_id)},
       {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
   )
  
   if result.matched_count == 0:
       raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND,
           detail="User not found"
       )
  
   return {"success": True, "message": "User deactivated successfully"}


@router.post("/users/{user_id}/kyc")
async def update_kyc_status(
   user_id: str,
   data: Dict[str, Any],
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Update KYC status for a user
   """
   users_collection = get_collection("users")
  
   # Validate status
   status = data.get("status")
   if status not in ["verified", "pending", "rejected"]:
       raise HTTPException(
           status_code=400,
           detail="Invalid KYC status"
       )
  
   # Update user
   result = await users_collection.update_one(
       {"_id": ObjectId(user_id)},
       {
           "$set": {
               "kyc_status": status,
               "kyc_notes": data.get("notes"),
               "kyc_updated_at": datetime.utcnow(),
               "kyc_updated_by": current_user["id"],
               "updated_at": datetime.utcnow()
           }
       }
   )
  
   if result.matched_count == 0:
       raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND,
           detail="User not found"
       )
  
   return {"success": True, "message": f"KYC status updated to {status}"}


# Invoice management endpoints
@router.get("/invoices")
async def get_all_invoices(
   skip: int = 0,
   limit: int = 100,
   status: Optional[str] = None,
   risk_tier: Optional[str] = None,
   seller_id: Optional[str] = None,
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Get all invoices with filtering options
   """
   invoices_collection = get_collection("invoices")
  
   # Build query
   query = {}
   if status:
       query["status"] = status
   if risk_tier:
       query["risk_tier"] = risk_tier
   if seller_id:
       query["seller_id"] = ObjectId(seller_id)
  
   # Execute query
   cursor = invoices_collection.find(query).skip(skip).limit(limit)
   invoices = []
  
   async for invoice in cursor:
       invoice["id"] = str(invoice["_id"])
       del invoice["_id"]
       invoice["seller_id"] = str(invoice["seller_id"])
       invoices.append(invoice)
  
   return invoices


@router.get("/invoices/{invoice_id}")
async def get_invoice(
   invoice_id: str,
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Get a specific invoice by ID
   """
   invoices_collection = get_collection("invoices")
   invoice = await invoices_collection.find_one({"_id": ObjectId(invoice_id)})
  
   if not invoice:
       raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND,
           detail="Invoice not found"
       )
  
   invoice["id"] = str(invoice["_id"])
   del invoice["_id"]
   invoice["seller_id"] = str(invoice["seller_id"])
  
   # Get seller details
   users_collection = get_collection("users")
   seller = await users_collection.find_one({"_id": ObjectId(invoice["seller_id"])})
   if seller:
       invoice["seller_name"] = seller.get("name")
       if "business_profile" in seller and seller["business_profile"]:
           invoice["seller_company"] = seller["business_profile"].get("company_name")
  
   return invoice


@router.put("/invoices/{invoice_id}/status")
async def update_invoice_status(
   invoice_id: str,
   data: Dict[str, Any],
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Update invoice status
   """
   invoices_collection = get_collection("invoices")
  
   # Validate status
   status_value = data.get("status")
   if status_value not in [e.value for e in InvoiceStatus]:
       raise HTTPException(
           status_code=status.HTTP_400_BAD_REQUEST,
           detail="Invalid invoice status"
       )
  
   # Update invoice
   result = await invoices_collection.update_one(
       {"_id": ObjectId(invoice_id)},
       {
           "$set": {
               "status": status_value,
               "admin_notes": data.get("notes"),
               "updated_at": datetime.utcnow(),
               "updated_by": current_user["id"]
           }
       }
   )
  
   if result.matched_count == 0:
       raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND,
           detail="Invoice not found"
       )
  
   # Get updated invoice
   updated_invoice = await invoices_collection.find_one({"_id": ObjectId(invoice_id)})
   updated_invoice["id"] = str(updated_invoice["_id"])
   del updated_invoice["_id"]
   updated_invoice["seller_id"] = str(updated_invoice["seller_id"])
  
   return updated_invoice


# Validation endpoints
@router.get("/validation/pending")
async def get_pending_validations(
   skip: int = 0,
   limit: int = 100,
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Get invoices pending validation
   """
   invoices_collection = get_collection("invoices")
  
   # Query for pending validation invoices
   cursor = invoices_collection.find({"status": InvoiceStatus.PENDING_VALIDATION}).skip(skip).limit(limit)
   invoices = []
  
   async for invoice in cursor:
       invoice["id"] = str(invoice["_id"])
       del invoice["_id"]
       invoice["seller_id"] = str(invoice["seller_id"])
      
       # Get seller details
       users_collection = get_collection("users")
       seller = await users_collection.find_one({"_id": ObjectId(invoice["seller_id"])})
       if seller:
           invoice["seller_name"] = seller.get("name")
           if "business_profile" in seller and seller["business_profile"]:
               invoice["seller_company"] = seller["business_profile"].get("company_name")
      
       invoices.append(invoice)
  
   return invoices


@router.post("/validation/{invoice_id}")
async def validate_invoice(
   invoice_id: str,
   validation_data: Dict[str, Any],
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Validate an invoice
   """
   # Get the invoice
   invoices_collection = get_collection("invoices")
   invoice = await invoices_collection.find_one({"_id": ObjectId(invoice_id)})
  
   if not invoice:
       raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND,
           detail="Invoice not found"
       )
  
   if invoice["status"] != InvoiceStatus.PENDING_VALIDATION:
       raise HTTPException(
           status_code=status.HTTP_400_BAD_REQUEST,
           detail="Invoice is not pending validation"
       )
  
   # Process validation
   validation_checks = validation_data.get("validation_checks", [])
   validation_notes = validation_data.get("validation_notes", "")
  
   # Check if any validation check failed
   has_failures = any(check["status"] == "fail" for check in validation_checks)
  
   # Calculate trust score based on validation checks
   if has_failures:
       trust_score = 0
       risk_tier = None
       new_status = InvoiceStatus.REJECTED
   else:
       # Simple trust score calculation
       pass_count = sum(1 for check in validation_checks if check["status"] == "pass")
       warning_count = sum(1 for check in validation_checks if check["status"] == "warning")
       total_checks = len(validation_checks)
      
       if total_checks > 0:
           trust_score = int(((pass_count * 100) + (warning_count * 50)) / total_checks)
       else:
           trust_score = 0
      
       # Determine risk tier
       if trust_score >= 90:
           risk_tier = RiskTier.A
       elif trust_score >= 80:
           risk_tier = RiskTier.B
       elif trust_score >= 70:
           risk_tier = RiskTier.C
       else:
           risk_tier = RiskTier.D
      
       new_status = InvoiceStatus.VALIDATED
  
   # Create validation results
   validation_results = [
       {
           "check_name": check["name"],
           "result": check["status"],
           "message": check["details"] or check["description"]
       }
       for check in validation_checks
   ]
  
   # Update invoice
   await invoices_collection.update_one(
       {"_id": ObjectId(invoice_id)},
       {
           "$set": {
               "status": new_status,
               "trust_score": trust_score,
               "risk_tier": risk_tier,
               "validation_results": validation_results,
               "validation_notes": validation_notes,
               "validated_at": datetime.utcnow(),
               "validated_by": current_user["id"],
               "updated_at": datetime.utcnow()
           }
       }
   )
  
   # Get updated invoice
   updated_invoice = await invoices_collection.find_one({"_id": ObjectId(invoice_id)})
   updated_invoice["id"] = str(updated_invoice["_id"])
   del updated_invoice["_id"]
   updated_invoice["seller_id"] = str(updated_invoice["seller_id"])
  
   return updated_invoice


@router.post("/validation/{invoice_id}/reject")
async def reject_invoice(
   invoice_id: str,
   data: Dict[str, Any],
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Reject an invoice
   """
   # Get the invoice
   invoices_collection = get_collection("invoices")
   invoice = await invoices_collection.find_one({"_id": ObjectId(invoice_id)})
  
   if not invoice:
       raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND,
           detail="Invoice not found"
       )
  
   if invoice["status"] != InvoiceStatus.PENDING_VALIDATION:
       raise HTTPException(
           status_code=status.HTTP_400_BAD_REQUEST,
           detail="Invoice is not pending validation"
       )
  
   reason = data.get("reason", "Rejected by admin")
  
   # Update invoice
   await invoices_collection.update_one(
       {"_id": ObjectId(invoice_id)},
       {
           "$set": {
               "status": InvoiceStatus.REJECTED,
               "validation_results": [
                   {
                       "check_name": "Admin Review",
                       "result": "fail",
                       "message": reason
                   }
               ],
               "validation_notes": reason,
               "validated_at": datetime.utcnow(),
               "validated_by": current_user["id"],
               "updated_at": datetime.utcnow()
           }
       }
   )
  
   # Get updated invoice
   updated_invoice = await invoices_collection.find_one({"_id": ObjectId(invoice_id)})
   updated_invoice["id"] = str(updated_invoice["_id"])
   del updated_invoice["_id"]
   updated_invoice["seller_id"] = str(updated_invoice["seller_id"])
  
   return updated_invoice


# Investment management endpoints
@router.get("/investments")
async def get_all_investments(
   skip: int = 0,
   limit: int = 100,
   status: Optional[str] = None,
   investor_id: Optional[str] = None,
   invoice_id: Optional[str] = None,
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Get all investments with filtering options
   """
   investments_collection = get_collection("investments")
  
   # Build query
   query = {}
   if status:
       query["status"] = status
   if investor_id:
       query["investor_id"] = ObjectId(investor_id)
   if invoice_id:
       query["invoice_id"] = ObjectId(invoice_id)
  
   # Execute query
   cursor = investments_collection.find(query).skip(skip).limit(limit)
   investments = []
  
   async for investment in cursor:
       investment["id"] = str(investment["_id"])
       del investment["_id"]
       investment["investor_id"] = str(investment["investor_id"])
       investment["invoice_id"] = str(investment["invoice_id"])
      
       # Get investor details
       users_collection = get_collection("users")
       investor = await users_collection.find_one({"_id": ObjectId(investment["investor_id"])})
       if investor:
           investment["investor_name"] = investor.get("name")
      
       # Get invoice details
       invoices_collection = get_collection("invoices")
       invoice = await invoices_collection.find_one({"_id": ObjectId(investment["invoice_id"])})
       if invoice:
           investment["invoice_number"] = invoice.get("invoice_number")
           investment["buyer_name"] = invoice.get("buyer_name")
           investment["seller_id"] = str(invoice.get("seller_id"))
          
           # Get seller details
           seller = await users_collection.find_one({"_id": ObjectId(invoice.get("seller_id"))})
           if seller:
               investment["seller_name"] = seller.get("name")
      
       investments.append(investment)
  
   return investments


@router.get("/investments/{investment_id}")
async def get_investment(
   investment_id: str,
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Get a specific investment by ID
   """
   investments_collection = get_collection("investments")
   investment = await investments_collection.find_one({"_id": ObjectId(investment_id)})
  
   if not investment:
       raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND,
           detail="Investment not found"
       )
  
   investment["id"] = str(investment["_id"])
   del investment["_id"]
   investment["investor_id"] = str(investment["investor_id"])
   investment["invoice_id"] = str(investment["invoice_id"])
  
   # Get investor details
   users_collection = get_collection("users")
   investor = await users_collection.find_one({"_id": ObjectId(investment["investor_id"])})
   if investor:
       investment["investor_name"] = investor.get("name")
  
   # Get invoice details
   invoices_collection = get_collection("invoices")
   invoice = await invoices_collection.find_one({"_id": ObjectId(investment["invoice_id"])})
   if invoice:
       investment["invoice_number"] = invoice.get("invoice_number")
       investment["buyer_name"] = invoice.get("buyer_name")
       investment["seller_id"] = str(invoice.get("seller_id"))
      
       # Get seller details
       seller = await users_collection.find_one({"_id": ObjectId(invoice.get("seller_id"))})
       if seller:
           investment["seller_name"] = seller.get("name")
  
   return investment


# TRRF Fund management endpoints
@router.get("/trrf/stats")
async def get_trrf_stats(current_user: Dict[str, Any] = Depends(get_admin_user)):
   """
   Get TRRF fund statistics
   """
   trrf_collection = get_collection("trrf")
   trrf_doc = await trrf_collection.find_one({"_id": "main"})
  
   if not trrf_doc:
       # Create default TRRF document if it doesn't exist
       trrf_doc = {
           "_id": "main",
           "total_pool": 50000000,  # 5 Cr
           "utilized": 12000000,    # 1.2 Cr
           "default_rate": 0.4,
           "industry_avg_default": 1.2,
           "created_at": datetime.utcnow(),
           "updated_at": datetime.utcnow()
       }
       await trrf_collection.insert_one(trrf_doc)
  
   trrf_stats = {
       "total_pool": trrf_doc.get("total_pool", 50000000),
       "utilized": trrf_doc.get("utilized", 12000000),
       "available": trrf_doc.get("total_pool", 50000000) - trrf_doc.get("utilized", 12000000),
       "default_rate": trrf_doc.get("default_rate", 0.4),
       "industry_avg_default": trrf_doc.get("industry_avg_default", 1.2)
   }
  
   return trrf_stats


@router.get("/trrf/disbursals")
async def get_trrf_disbursals(
   skip: int = 0,
   limit: int = 100,
   status: Optional[str] = None,
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Get TRRF fund disbursals
   """
   disbursals_collection = get_collection("trrf_disbursals")
  
   # Build query
   query = {}
   if status:
       query["status"] = status
  
   # Execute query
   cursor = disbursals_collection.find(query).skip(skip).limit(limit)
   disbursals = []
  
   async for disbursal in cursor:
       disbursal["id"] = str(disbursal["_id"])
       del disbursal["_id"]
       disbursals.append(disbursal)
  
   return disbursals


@router.post("/trrf/disbursals/{disbursal_id}/approve")
async def approve_trrf_disbursal(
   disbursal_id: str,
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Approve a TRRF fund disbursal
   """
   disbursals_collection = get_collection("trrf_disbursals")
   disbursal = await disbursals_collection.find_one({"_id": ObjectId(disbursal_id)})
  
   if not disbursal:
       raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND,
           detail="Disbursal not found"
       )
  
   if disbursal["status"] != "pending":
       raise HTTPException(
           status_code=status.HTTP_400_BAD_REQUEST,
           detail="Disbursal is not pending approval"
       )
  
   # Update disbursal status
   await disbursals_collection.update_one(
       {"_id": ObjectId(disbursal_id)},
       {
           "$set": {
               "status": "approved",
               "approved_at": datetime.utcnow(),
               "approved_by": current_user["id"],
               "updated_at": datetime.utcnow()
           }
       }
   )
  
   # Update TRRF fund
   trrf_collection = get_collection("trrf")
   await trrf_collection.update_one(
       {"_id": "main"},
       {"$inc": {"utilized": disbursal["amount"]}}
   )
  
   return {"success": True, "message": "Disbursal approved successfully"}


@router.post("/trrf/disbursals/{disbursal_id}/reject")
async def reject_trrf_disbursal(
   disbursal_id: str,
   data: Dict[str, Any],
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Reject a TRRF fund disbursal
   """
   disbursals_collection = get_collection("trrf_disbursals")
   disbursal = await disbursals_collection.find_one({"_id": ObjectId(disbursal_id)})
  
   if not disbursal:
       raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND,
           detail="Disbursal not found"
       )
  
   if disbursal["status"] != "pending":
       raise HTTPException(
           status_code=status.HTTP_400_BAD_REQUEST,
           detail="Disbursal is not pending approval"
       )
  
   reason = data.get("reason", "Rejected by admin")
  
   # Update disbursal status
   await disbursals_collection.update_one(
       {"_id": ObjectId(disbursal_id)},
       {
           "$set": {
               "status": "rejected",
               "rejection_reason": reason,
               "rejected_at": datetime.utcnow(),
               "rejected_by": current_user["id"],
               "updated_at": datetime.utcnow()
           }
       }
   )
  
   return {"success": True, "message": "Disbursal rejected successfully"}


# Compliance endpoints
@router.get("/compliance/consents")
async def get_consents(
   skip: int = 0,
   limit: int = 100,
   status: Optional[str] = None,
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Get passive consents with filtering options
   """
   consents_collection = get_collection("consents")
  
   # Build query
   query = {}
   if status:
       query["status"] = status
  
   # Execute query
   cursor = consents_collection.find(query).skip(skip).limit(limit)
   consents = []
  
   async for consent in cursor:
       consent["id"] = str(consent["_id"])
       del consent["_id"]
       consent["invoice_id"] = str(consent["invoice_id"])
       consents.append(consent)
  
   return consents


@router.get("/compliance/consents/{consent_id}")
async def get_consent(
   consent_id: str,
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Get a specific consent by ID
   """
   consents_collection = get_collection("consents")
   consent = await consents_collection.find_one({"_id": ObjectId(consent_id)})
  
   if not consent:
       raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND,
           detail="Consent not found"
       )
  
   consent["id"] = str(consent["_id"])
   del consent["_id"]
   consent["invoice_id"] = str(consent["invoice_id"])
  
   return consent


@router.post("/compliance/consents/{consent_id}/remind")
async def send_consent_reminder(
   consent_id: str,
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Send a reminder for a consent
   """
   consents_collection = get_collection("consents")
   consent = await consents_collection.find_one({"_id": ObjectId(consent_id)})
  
   if not consent:
       raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND,
           detail="Consent not found"
       )
  
   if consent["status"] != "pending":
       raise HTTPException(
           status_code=status.HTTP_400_BAD_REQUEST,
           detail="Consent is not pending"
       )
  
   # In a real implementation, this would send an actual notification
   # For now, just log the event
  
   # Add event to consent events
   events = consent.get("events", [])
   events.append({
       "event": "reminder_sent",
       "timestamp": datetime.utcnow(),
       "details": {
           "method": consent.get("notification_method", "email"),
           "sent_by": current_user["id"]
       }
   })
  
   # Update consent
   await consents_collection.update_one(
       {"_id": ObjectId(consent_id)},
       {
           "$set": {
               "events": events,
               "last_reminder_at": datetime.utcnow(),
               "reminder_count": consent.get("reminder_count", 0) + 1,
               "updated_at": datetime.utcnow()
           }
       }
   )
  
   return {"success": True, "message": "Reminder sent successfully"}


@router.get("/compliance/audit-logs")
async def get_audit_logs(
   skip: int = 0,
   limit: int = 100,
   user_id: Optional[str] = None,
   action: Optional[str] = None,
   from_date: Optional[str] = None,
   to_date: Optional[str] = None,
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Get audit logs with filtering options
   """
   audit_logs_collection = get_collection("audit_logs")
  
   # Build query
   query = {}
   if user_id:
       query["user"] = user_id
   if action:
       query["action"] = action
  
   # Date range filter
   if from_date or to_date:
       query["timestamp"] = {}
       if from_date:
           query["timestamp"]["$gte"] = datetime.fromisoformat(from_date)
       if to_date:
           query["timestamp"]["$lte"] = datetime.fromisoformat(to_date)
  
   # Execute query
   cursor = audit_logs_collection.find(query).sort("timestamp", -1).skip(skip).limit(limit)
   logs = []
  
   async for log in cursor:
       log["id"] = str(log["_id"])
       del log["_id"]
       logs.append(log)
  
   return logs


@router.get("/compliance/flags")
async def get_compliance_flags(
   skip: int = 0,
   limit: int = 100,
   status: Optional[str] = None,
   severity: Optional[str] = None,
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Get compliance flags with filtering options
   """
   flags_collection = get_collection("compliance_flags")
  
   # Build query
   query = {}
   if status:
       query["status"] = status
   if severity:
       query["severity"] = severity
  
   # Execute query
   cursor = flags_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
   flags = []
  
   async for flag in cursor:
       flag["id"] = str(flag["_id"])
       del flag["_id"]
       flags.append(flag)
  
   return flags


@router.get("/compliance/flags/{flag_id}")
async def get_compliance_flag(
   flag_id: str,
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Get a specific compliance flag by ID
   """
   flags_collection = get_collection("compliance_flags")
   flag = await flags_collection.find_one({"_id": ObjectId(flag_id)})
  
   if not flag:
       raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND,
           detail="Compliance flag not found"
       )
  
   flag["id"] = str(flag["_id"])
   del flag["_id"]
  
   return flag


@router.put("/compliance/flags/{flag_id}")
async def update_compliance_flag(
   flag_id: str,
   data: Dict[str, Any],
   current_user: Dict[str, Any] = Depends(get_admin_user)
):
   """
   Update a compliance flag
   """
   flags_collection = get_collection("compliance_flags")
   flag = await flags_collection.find_one({"_id": ObjectId(flag_id)})
  
   if not flag:
       raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND,
           detail="Compliance flag not found"
       )
  
   # Update flag
   update_data = {
       "updated_at": datetime.utcnow(),
       "updated_by": current_user["id"]
   }
  
   if "status" in data:
       update_data["status"] = data["status"]
  
   if "assigned_to" in data:
       update_data["assigned_to"] = data["assigned_to"]
  
   if "notes" in data:
       update_data["notes"] = data["notes"]
  
   await flags_collection.update_one(
       {"_id": ObjectId(flag_id)},
       {"$set": update_data}
   )
  
   # Get updated flag
   updated_flag = await flags_collection.find_one({"_id": ObjectId(flag_id)})
   updated_flag["id"] = str(updated_flag["_id"])
   del updated_flag["_id"]
  
   return updated_flag


# System settings endpoints
@router.get("/settings")
async def get_system_settings(current_user: Dict[str, Any] = Depends(get_admin_user)):
   """
   Get all system settings
   """
   settings_collection = get_collection("system_settings")
   settings_doc = await settings_collection.find_one({"_id": "main"})
  
   if not settings_doc:
       # Create default settings if they don't exist
       settings_doc = {
           "_id": "main",
           "general": {
               "platformName": "TEVANI",
               "supportEmail": "support@tevani.com",
               "supportPhone": "+91 9876543210",
               "maintenanceMode": False
           },
           "security": {
               "passwordMinLength": 8,
               "passwordRequireSpecialChar": True,
               "passwordRequireNumber": True,
               "passwordRequireUppercase": True,
               "twoFactorAuthRequired": True,
               "sessionTimeout": 30,
               "maxLoginAttempts": 5
           },
           "riskTier": {
               "tierAThreshold": 90,
               "tierBThreshold": 80,
               "tierCThreshold": 70,
               "tierDThreshold": 0,
               "gstVerificationWeight": 30,
               "buyerHistoryWeight": 25,
               "sellerHistoryWeight": 25,
               "documentQualityWeight": 20
           },
           "trrf": {
               "defaultCoveragePercent": 20,
               "maxCoveragePercent": 40,
               "tierAMultiplier": 0.5,
               "tierBMultiplier": 1.0,
               "tierCMultiplier": 1.5,
               "tierDMultiplier": 2.0
           },
           "notifications": {
               "emailEnabled": True,
               "whatsappEnabled": True,
               "smsEnabled": False,
               "reminderFrequency": 3,
               "maxReminders": 3
           },
           "created_at": datetime.utcnow(),
           "updated_at": datetime.utcnow()
       }
       await settings_collection.insert_one(settings_doc)
  
   # Remove _id field
   if "_id" in settings_doc:
       del settings_doc["_id"]
  
   return settings_doc


@router.put("/settings/{category}")
async def update_system_settings(
   category: str,
   settings: Dict[str, Any],
   current_user: Dict[str, Any] = Depends(get_super_admin_user)
):
   """
   Update system settings for a specific category
   """
   valid_categories = ["general", "security", "riskTier", "trrf", "notifications"]
  
   if category not in valid_categories:
       raise HTTPException(
           status_code=status.HTTP_400_BAD_REQUEST,
           detail=f"Invalid settings category. Must be one of: {', '.join(valid_categories)}"
       )
  
   settings_collection = get_collection("system_settings")
  
   # Update settings
   await settings_collection.update_one(
       {"_id": "main"},
       {
           "$set": {
               category: settings,
               "updated_at": datetime.utcnow(),
               "updated_by": current_user["id"]
           }
       },
       upsert=True
   )
  
   # Log the settings change
   audit_logs_collection = get_collection("audit_logs")
   await audit_logs_collection.insert_one({
       "user": current_user["id"],
       "user_role": current_user.get("admin_role"),
       "action": "system_settings_updated",
       "entity_id": "system",
       "entity_type": "settings",
       "details": f"Updated {category} settings",
       "timestamp": datetime.utcnow(),
       "ip_address": "127.0.0.1"  # In a real app, get this from the request
   })
  
   # Get updated settings
   updated_settings = await settings_collection.find_one({"_id": "main"})
   if "_id" in updated_settings:
       del updated_settings["_id"]
  
   return updated_settings

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import User, UserUpdate, UserType
from app.services.user_service import get_current_user, update_user, list_users

router = APIRouter()

@router.get("/", response_model=List[User])
async def read_users(
    skip: int = 0, 
    limit: int = 100, 
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Retrieve users. Only accessible to admin users in a real application.
    For demo purposes, any authenticated user can access this endpoint.
    """
    users = await list_users(skip=skip, limit=limit)
    return users

@router.get("/me", response_model=User)
async def read_user_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get current user.
    """
    return current_user

@router.put("/me", response_model=User)
async def update_user_me(
    user_update: UserUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Update current user.
    """
    updated_user = await update_user(current_user["id"], user_update.dict(exclude_unset=True))
    return updated_user

@router.get("/{user_id}", response_model=User)
async def read_user(
    user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get a specific user by id.
    """
    # In a real application, you would check permissions here
    # For demo purposes, any authenticated user can access this endpoint
    from app.services.user_service import get_user_by_id
    
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Convert ObjectId to string for the response
    user["id"] = str(user["_id"])
    del user["_id"]
    if "hashed_password" in user:
        del user["hashed_password"]
    
    return user

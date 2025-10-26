from datetime import datetime
from typing import Optional, Dict, Any, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from bson import ObjectId
from app.core.config import settings
from app.core.database import get_collection
from app.core.security import verify_password, get_password_hash
from app.models.user import UserCreate, User, UserInDB, UserType

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """
    Get a user by email
    """
    users_collection = get_collection("users")
    return await users_collection.find_one({"email": email})

async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a user by ID
    """
    users_collection = get_collection("users")
    return await users_collection.find_one({"_id": ObjectId(user_id)})

async def create_user(user_in: UserCreate) -> Dict[str, Any]:
    """
    Create a new user
    """
    users_collection = get_collection("users")
    
    # Check if user with this email already exists
    if await get_user_by_email(user_in.email):
        raise ValueError("Email already registered")
    
    # Create user dict
    user_data = user_in.dict(exclude={"password"})
    user_data["hashed_password"] = get_password_hash(user_in.password)
    user_data["is_active"] = True
    user_data["created_at"] = datetime.utcnow()
    user_data["updated_at"] = user_data["created_at"]
    
    # Insert user into database
    result = await users_collection.insert_one(user_data)
    
    # Get the created user
    created_user = await get_user_by_id(str(result.inserted_id))
    
    # Convert ObjectId to string for the response
    created_user["id"] = str(created_user["_id"])
    del created_user["_id"]
    del created_user["hashed_password"]
    
    return created_user

async def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """
    Authenticate a user
    """
    user = await get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    return user

async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Get the current user from the token
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await get_user_by_id(user_id)
    if user is None:
        raise credentials_exception
    
    # Convert ObjectId to string for the response
    user["id"] = str(user["_id"])
    del user["_id"]
    del user["hashed_password"]
    
    return user

async def list_users(skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
    """
    List users with pagination
    """
    users_collection = get_collection("users")
    cursor = users_collection.find().skip(skip).limit(limit)
    users = []
    
    async for user in cursor:
        user["id"] = str(user["_id"])
        del user["_id"]
        del user["hashed_password"]
        users.append(user)
    
    return users

async def update_user(user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Update a user
    """
    users_collection = get_collection("users")
    
    # Don't allow updating email or password through this function
    if "email" in update_data:
        del update_data["email"]
    if "password" in update_data:
        del update_data["password"]
    
    update_data["updated_at"] = datetime.utcnow()
    
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    
    return await get_user_by_id(user_id)
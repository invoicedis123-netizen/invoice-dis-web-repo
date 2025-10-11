from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pymongo.errors import DuplicateKeyError
from app.core.config import settings
from app.core.security import create_access_token, verify_password, get_password_hash
from app.models.user import UserCreate, User, Token, UserType
from app.services.user_service import (
    get_user_by_email,
    create_user,
    authenticate_user,
    get_current_user,
)

router = APIRouter()

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate):
    """
    Register a new user (MSME/Startup or Investor)
    """
    try:
        # Check if user already exists
        existing_user = await get_user_by_email(user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        
        # Create new user
        user = await create_user(user_in)
        return user
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user["_id"]), expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user["_id"]),
        "user_type": user["type"],
    }

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get current user
    """
    return current_user

# Made with Bob

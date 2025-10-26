from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
import os


app = FastAPI(
   title="TEVANI API",
   description="API for TEVANI - Invoice Financing Platform for MSMEs and Startups",
   version="1.0.0",
   # Disable automatic redirects to prevent losing auth headers
   redirect_slashes=False,
)


# Configure CORS
app.add_middleware(
   CORSMiddleware,
   allow_origins=settings.CORS_ORIGINS,
   allow_credentials=True,
   allow_methods=["*"],
   allow_headers=["*"],
)


# Event handlers for database connection
@app.on_event("startup")
async def startup_db_client():
   from app.core.database import connect_to_mongo
   await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_db_client():
   from app.core.database import close_mongo_connection
   await close_mongo_connection()


# Import and include routers
from app.api.routes import auth, users, invoices, validation, legalbot, admin


app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(invoices.router, prefix="/api/invoices", tags=["Invoices"])
app.include_router(validation.router, prefix="/api/validation", tags=["Validation"])
app.include_router(legalbot.router, prefix="/api/legalbot", tags=["LegalBot"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])


@app.get("/")
async def root():
   return {"message": "Welcome to TEVANI API - Invoice Financing Platform"}


if __name__ == "__main__":
   import uvicorn
   uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)


# Made with Bob






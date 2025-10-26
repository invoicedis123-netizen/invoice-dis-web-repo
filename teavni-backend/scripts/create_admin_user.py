import sys
import os
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime


# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# Import the security module from the app
from app.core.security import get_password_hash
from app.core.config import settings


def create_admin_user():
   """
   Create an admin user in the database
   """
   # MongoDB connection using settings from the app
   client = MongoClient(settings.MONGO_URL)
   db = client[settings.MONGO_DB_NAME]
   users_collection = db["users"]
  
   # Check if admin user already exists
   existing_admin = users_collection.find_one({"email": "admin@tevani.com"})
  
   if existing_admin:
       print("Admin user already exists!")
       return
  
   # Create admin user
   admin_user = {
       "_id": ObjectId(),
       "email": "admin@tevani.com",
       "name": "Admin User",
       "hashed_password": get_password_hash("admin123"),
       "phone": "+919876543210",
       "type": "admin",
       "admin_role": "superuser",
       "is_active": True,
       "created_at": datetime.utcnow(),
       "updated_at": datetime.utcnow()
   }
  
   # Insert admin user
   result = users_collection.insert_one(admin_user)
  
   if result.inserted_id:
       print(f"Admin user created successfully with ID: {result.inserted_id}")
       print("Email: admin@tevani.com")
       print("Password: admin123")
       print("Role: superuser")
   else:
       print("Failed to create admin user")


if __name__ == "__main__":
   create_admin_user()


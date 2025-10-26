import sys
import os
from pymongo import MongoClient


# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


from app.core.config import settings
from app.core.schemas import user_schema


def update_user_schema():
   """
   Update the user collection schema to include admin as a valid user type
   """
   # MongoDB connection using settings from the app
   client = MongoClient(settings.MONGO_URL)
   db = client[settings.MONGO_DB_NAME]
  
   try:
       # Update the schema for the users collection
       db.command({
           "collMod": "users",
           "validator": user_schema["validator"]
       })
       print("Successfully updated the user schema to include admin user type")
   except Exception as e:
       print(f"Error updating schema: {e}")
   finally:
       client.close()


if __name__ == "__main__":
   update_user_schema()

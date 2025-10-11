from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import IndexModel, ASCENDING, DESCENDING, TEXT
from pymongo.errors import CollectionInvalid
import logging
from app.core.config import settings
from app.core.schemas import collection_schemas

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def connect_to_mongo():
    """Create database connection and set up collections with schemas."""
    try:
        # Connect to MongoDB
        db.client = AsyncIOMotorClient(settings.MONGO_URL)
        db.db = db.client[settings.MONGO_DB_NAME]
        logger.info(f"Connected to MongoDB: {settings.MONGO_DB_NAME}")
        
        # Set up collections with schemas and indexes
        await setup_collections()
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise

async def setup_collections():
    """Set up collections with schemas and indexes."""
    for collection_name, (schema, indexes) in collection_schemas.items():
        try:
            # Create collection with schema validation if it doesn't exist
            try:
                await db.db.create_collection(collection_name, **schema)
                logger.info(f"Created collection: {collection_name}")
            except CollectionInvalid:
                # Collection already exists, update the validator
                await db.db.command({
                    "collMod": collection_name,
                    **schema
                })
                logger.info(f"Updated schema for collection: {collection_name}")
            
            # Create indexes
            collection = db.db[collection_name]
            for index in indexes:
                await collection.create_indexes([index])
            
            logger.info(f"Created indexes for collection: {collection_name}")
        except Exception as e:
            logger.error(f"Error setting up collection {collection_name}: {e}")

async def close_mongo_connection():
    """Close database connection."""
    if db.client:
        db.client.close()
        logger.info("MongoDB connection closed")

def get_collection(collection_name: str):
    """Get a collection from the database."""
    return db.db[collection_name]

# Made with Bob

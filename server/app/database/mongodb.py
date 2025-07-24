import os
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    database = None

mongodb = MongoDB()

async def connect_to_mongo():
    """Create database connection"""
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    database_name = os.getenv("DATABASE_NAME", "sentinelai")
    
    try:
        mongodb.client = AsyncIOMotorClient(mongodb_url)
        mongodb.database = mongodb.client[database_name]
        
        # Test the connection
        await mongodb.client.admin.command('ping')
        logger.info(f"Connected to MongoDB at {mongodb_url}")
        
        # Create indexes
        await create_indexes()
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    if mongodb.client:
        mongodb.client.close()
        logger.info("Disconnected from MongoDB")

async def create_indexes():
    """Create database indexes for performance"""
    try:
        # Policies collection indexes
        await mongodb.database.policies.create_index([("organization_id", 1), ("status", 1)])
        await mongodb.database.policies.create_index([("type", 1)])
        await mongodb.database.policies.create_index([("created_at", -1)])
        
        # Users collection indexes
        await mongodb.database.users.create_index([("email", 1)], unique=True)
        await mongodb.database.users.create_index([("organization_id", 1)])
        await mongodb.database.users.create_index([("api_key", 1)], sparse=True)
        
        # Organizations collection indexes
        await mongodb.database.organizations.create_index([("slug", 1)], unique=True)
        
        # Evaluations collection indexes
        await mongodb.database.evaluations.create_index([("organization_id", 1), ("created_at", -1)])
        await mongodb.database.evaluations.create_index([("user_id", 1)])
        await mongodb.database.evaluations.create_index([("status", 1)])
        
        # Evaluation results collection indexes
        await mongodb.database.evaluation_results.create_index([("request_id", 1)])
        await mongodb.database.evaluation_results.create_index([("created_at", -1)])
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"Failed to create indexes: {e}")

def get_database():
    """Get database instance"""
    return mongodb.database
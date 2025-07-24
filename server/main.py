from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os

from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.api.v1 import chat, policies, evaluation

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    logger.info("Starting SentinelAI API server...")
    
    # Connect to MongoDB
    await connect_to_mongo()
    
    yield
    
    # Close MongoDB connection
    await close_mongo_connection()
    logger.info("Shutting down SentinelAI API server...")

app = FastAPI(
    title="SentinelAI API",
    description="Real-time AI governance and policy enforcement platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(chat.router, prefix="/v1")
app.include_router(policies.router, prefix="/v1")
app.include_router(evaluation.router, prefix="/v1")

@app.get("/")
async def root():
    return {"message": "SentinelAI API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}

@app.get("/v1/status")
async def api_status():
    """API status endpoint"""
    return {
        "status": "operational",
        "version": "1.0.0",
        "features": {
            "policy_management": True,
            "content_evaluation": True,
            "real_time_monitoring": True,
            "multi_tenant": True
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
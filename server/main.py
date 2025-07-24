#!/usr/bin/env python3
"""
SentinelAI FastAPI Server
High-performance ML-based policy evaluation and API endpoints
"""

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from typing import List, Optional

import structlog
import uvicorn
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from prometheus_client import make_asgi_app

from app.core.config import get_settings
from app.core.database import init_database, close_database
from app.core.cache import init_cache, close_cache
from app.core.metrics import init_metrics
from app.api.v1 import chat, evaluation, policies, auth, analytics
from app.middleware.auth import AuthMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.logging import LoggingMiddleware

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting SentinelAI FastAPI server")
    
    # Initialize database
    await init_database()
    logger.info("Database initialized")
    
    # Initialize cache
    await init_cache()
    logger.info("Cache initialized")
    
    # Initialize metrics
    init_metrics()
    logger.info("Metrics initialized")
    
    yield
    
    # Shutdown
    logger.info("Shutting down SentinelAI FastAPI server")
    await close_database()
    await close_cache()

# Create FastAPI app
app = FastAPI(
    title="SentinelAI API",
    description="Real-time AI governance and policy enforcement platform",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(AuthMiddleware)

# Add Prometheus metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Include API routers
app.include_router(chat.router, prefix="/v1/chat", tags=["chat"])
app.include_router(evaluation.router, prefix="/v1/evaluation", tags=["evaluation"])
app.include_router(policies.router, prefix="/v1/policies", tags=["policies"])
app.include_router(auth.router, prefix="/v1/auth", tags=["auth"])
app.include_router(analytics.router, prefix="/v1/analytics", tags=["analytics"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "SentinelAI API",
        "version": "0.1.0",
        "status": "operational",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": structlog.get_logger().info("Health check")
    }

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Global HTTP exception handler"""
    logger.error("HTTP exception", status_code=exc.status_code, detail=exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error("Unhandled exception", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "status_code": 500}
    )

if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_config=None,  # Use structlog instead
        access_log=False,  # Use custom logging middleware
    )
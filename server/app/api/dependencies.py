from fastapi import HTTPException, Depends, Header
from typing import Optional
import jwt
import os
import logging

logger = logging.getLogger(__name__)

# Mock JWT secret - in production, use proper secret management
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
JWT_ALGORITHM = "HS256"

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """Extract and validate user from JWT token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    try:
        # Extract token from "Bearer <token>"
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Mock user data - in production, fetch from database
        user = {
            "id": payload.get("user_id", "user_123"),
            "email": payload.get("email", "user@example.com"),
            "name": payload.get("name", "Test User"),
            "organization_id": payload.get("organization_id", "org_123"),
            "role": payload.get("role", "admin")
        }
        
        return user
        
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        logger.error(f"Error validating token: {e}")
        raise HTTPException(status_code=401, detail="Token validation failed")

async def get_organization_id(current_user: dict = Depends(get_current_user)) -> str:
    """Extract organization ID from current user"""
    return current_user["organization_id"]

async def require_admin_role(current_user: dict = Depends(get_current_user)):
    """Require admin role for certain operations"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")
    return current_user
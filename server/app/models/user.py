from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime

class Role(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    ANALYST = "analyst"
    VIEWER = "viewer"

class Organization(BaseModel):
    id: Optional[str] = Field(default=None)
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=50)
    plan: str = Field(default="free")  # free, pro, enterprise
    created_at: datetime = Field(default_factory=datetime.utcnow)
    settings: dict = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class User(BaseModel):
    id: Optional[str] = Field(default=None)
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)
    organization_id: str = Field(...)
    role: Role = Field(default=Role.VIEWER)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    api_key: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)
    organization_id: str = Field(...)
    role: Role = Field(default=Role.VIEWER)

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    role: Optional[Role] = None
    is_active: Optional[bool] = None
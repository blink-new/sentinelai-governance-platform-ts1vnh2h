from enum import Enum
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class PolicyType(str, Enum):
    KEYWORD_FILTER = "keyword_filter"
    PERFORMANCE = "performance"
    CONTENT_SAFETY = "content_safety"
    SEMANTIC = "semantic"

class PolicyStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DRAFT = "draft"

class PolicyConfig(BaseModel):
    """Base configuration for all policy types"""
    pass

class KeywordFilterConfig(PolicyConfig):
    patterns: List[str] = Field(..., description="Regex patterns to match")
    case_sensitive: bool = Field(default=False)
    whole_words_only: bool = Field(default=False)

class PerformanceConfig(PolicyConfig):
    max_response_time_ms: int = Field(default=5000)
    min_quality_score: float = Field(default=0.7)
    max_tokens: int = Field(default=4000)

class ContentSafetyConfig(PolicyConfig):
    toxicity_threshold: float = Field(default=0.8)
    categories: List[str] = Field(default=["hate", "harassment", "violence", "sexual"])
    model_name: str = Field(default="unitary/toxic-bert")

class SemanticConfig(PolicyConfig):
    similarity_threshold: float = Field(default=0.85)
    reference_texts: List[str] = Field(default=[])
    embedding_model: str = Field(default="sentence-transformers/all-MiniLM-L6-v2")

class Policy(BaseModel):
    id: Optional[str] = Field(default=None)
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(default="")
    type: PolicyType
    status: PolicyStatus = Field(default=PolicyStatus.DRAFT)
    config: Dict[str, Any] = Field(default_factory=dict)
    organization_id: str = Field(...)
    created_by: str = Field(...)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    version: int = Field(default=1)
    tags: List[str] = Field(default_factory=list)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class PolicyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(default="")
    type: PolicyType
    config: Dict[str, Any] = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)

class PolicyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    status: Optional[PolicyStatus] = None
    config: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
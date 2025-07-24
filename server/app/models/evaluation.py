from enum import Enum
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class EvaluationStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"

class EvaluationRequest(BaseModel):
    id: Optional[str] = Field(default=None)
    content: str = Field(..., min_length=1)
    policy_ids: List[str] = Field(default_factory=list)
    organization_id: str = Field(...)
    user_id: str = Field(...)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class PolicyEvaluationResult(BaseModel):
    policy_id: str
    policy_name: str
    policy_type: str
    status: EvaluationStatus
    score: float = Field(ge=0.0, le=1.0)
    confidence: float = Field(ge=0.0, le=1.0)
    violation: bool = Field(default=False)
    details: Dict[str, Any] = Field(default_factory=dict)
    execution_time_ms: float = Field(ge=0.0)
    error_message: Optional[str] = None

class EvaluationResult(BaseModel):
    id: Optional[str] = Field(default=None)
    request_id: str = Field(...)
    status: EvaluationStatus
    overall_score: float = Field(ge=0.0, le=1.0)
    has_violations: bool = Field(default=False)
    policy_results: List[PolicyEvaluationResult] = Field(default_factory=list)
    total_execution_time_ms: float = Field(ge=0.0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class EvaluationStats(BaseModel):
    total_evaluations: int = 0
    successful_evaluations: int = 0
    failed_evaluations: int = 0
    blocked_evaluations: int = 0
    average_execution_time_ms: float = 0.0
    violation_rate: float = 0.0
    period_start: datetime
    period_end: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
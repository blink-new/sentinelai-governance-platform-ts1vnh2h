from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import logging

from ...models.evaluation import EvaluationRequest, EvaluationResult
from ...services.evaluation_service import evaluation_service
from ..dependencies import get_current_user, get_organization_id

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/evaluation", tags=["evaluation"])

class EvaluateRequest:
    def __init__(self, content: str, policy_ids: Optional[List[str]] = None):
        self.content = content
        self.policy_ids = policy_ids or []

@router.post("/evaluate", response_model=EvaluationResult)
async def evaluate_content(
    request: EvaluateRequest,
    current_user: dict = Depends(get_current_user),
    organization_id: str = Depends(get_organization_id)
):
    """Evaluate content against policies"""
    try:
        result = await evaluation_service.evaluate_content(
            content=request.content,
            organization_id=organization_id,
            user_id=current_user["id"],
            policy_ids=request.policy_ids
        )
        return result
    except Exception as e:
        logger.error(f"Failed to evaluate content: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate content")

@router.post("/batch", response_model=List[EvaluationResult])
async def evaluate_batch(
    requests: List[EvaluateRequest],
    current_user: dict = Depends(get_current_user),
    organization_id: str = Depends(get_organization_id)
):
    """Evaluate multiple content items in batch"""
    try:
        results = []
        for request in requests:
            result = await evaluation_service.evaluate_content(
                content=request.content,
                organization_id=organization_id,
                user_id=current_user["id"],
                policy_ids=request.policy_ids
            )
            results.append(result)
        return results
    except Exception as e:
        logger.error(f"Failed to evaluate batch: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate batch")
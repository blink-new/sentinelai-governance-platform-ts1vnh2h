from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
import logging

from ...models.policy import Policy, PolicyCreate, PolicyUpdate, PolicyStatus, PolicyType
from ...services.policy_service import policy_service
from ..dependencies import get_current_user, get_organization_id

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/policies", tags=["policies"])

@router.post("/", response_model=Policy)
async def create_policy(
    policy_data: PolicyCreate,
    current_user: dict = Depends(get_current_user),
    organization_id: str = Depends(get_organization_id)
):
    """Create a new policy"""
    try:
        policy = await policy_service.create_policy(
            policy_data=policy_data,
            organization_id=organization_id,
            user_id=current_user["id"]
        )
        return policy
    except Exception as e:
        logger.error(f"Failed to create policy: {e}")
        raise HTTPException(status_code=500, detail="Failed to create policy")

@router.get("/", response_model=List[Policy])
async def list_policies(
    status: Optional[PolicyStatus] = Query(None),
    policy_type: Optional[PolicyType] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    organization_id: str = Depends(get_organization_id)
):
    """List policies with optional filtering"""
    try:
        policies = await policy_service.list_policies(
            organization_id=organization_id,
            status=status,
            policy_type=policy_type.value if policy_type else None,
            skip=skip,
            limit=limit
        )
        return policies
    except Exception as e:
        logger.error(f"Failed to list policies: {e}")
        raise HTTPException(status_code=500, detail="Failed to list policies")

@router.get("/{policy_id}", response_model=Policy)
async def get_policy(
    policy_id: str,
    organization_id: str = Depends(get_organization_id)
):
    """Get a specific policy"""
    try:
        policy = await policy_service.get_policy(policy_id, organization_id)
        if not policy:
            raise HTTPException(status_code=404, detail="Policy not found")
        return policy
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get policy: {e}")
        raise HTTPException(status_code=500, detail="Failed to get policy")

@router.put("/{policy_id}", response_model=Policy)
async def update_policy(
    policy_id: str,
    policy_update: PolicyUpdate,
    organization_id: str = Depends(get_organization_id)
):
    """Update a policy"""
    try:
        policy = await policy_service.update_policy(
            policy_id=policy_id,
            policy_update=policy_update,
            organization_id=organization_id
        )
        if not policy:
            raise HTTPException(status_code=404, detail="Policy not found")
        return policy
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update policy: {e}")
        raise HTTPException(status_code=500, detail="Failed to update policy")

@router.delete("/{policy_id}")
async def delete_policy(
    policy_id: str,
    organization_id: str = Depends(get_organization_id)
):
    """Delete a policy"""
    try:
        success = await policy_service.delete_policy(policy_id, organization_id)
        if not success:
            raise HTTPException(status_code=404, detail="Policy not found")
        return {"message": "Policy deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete policy: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete policy")

@router.post("/{policy_id}/toggle", response_model=Policy)
async def toggle_policy_status(
    policy_id: str,
    organization_id: str = Depends(get_organization_id)
):
    """Toggle policy status between active and inactive"""
    try:
        policy = await policy_service.toggle_policy_status(policy_id, organization_id)
        if not policy:
            raise HTTPException(status_code=404, detail="Policy not found")
        return policy
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to toggle policy status: {e}")
        raise HTTPException(status_code=500, detail="Failed to toggle policy status")
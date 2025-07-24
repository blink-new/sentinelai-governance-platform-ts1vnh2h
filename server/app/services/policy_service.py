from typing import List, Optional, Dict, Any
from bson import ObjectId
from datetime import datetime
import logging

from ..database.mongodb import get_database
from ..models.policy import Policy, PolicyCreate, PolicyUpdate, PolicyStatus

logger = logging.getLogger(__name__)

class PolicyService:
    def __init__(self):
        self.db = get_database()
        self.collection = self.db.policies

    async def create_policy(self, policy_data: PolicyCreate, organization_id: str, user_id: str) -> Policy:
        """Create a new policy"""
        policy_dict = policy_data.dict()
        policy_dict.update({
            "_id": ObjectId(),
            "organization_id": organization_id,
            "created_by": user_id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "version": 1,
            "status": PolicyStatus.DRAFT
        })
        
        result = await self.collection.insert_one(policy_dict)
        policy_dict["id"] = str(result.inserted_id)
        
        logger.info(f"Created policy {policy_dict['name']} for organization {organization_id}")
        return Policy(**policy_dict)

    async def get_policy(self, policy_id: str, organization_id: str) -> Optional[Policy]:
        """Get a policy by ID"""
        policy_doc = await self.collection.find_one({
            "_id": ObjectId(policy_id),
            "organization_id": organization_id
        })
        
        if policy_doc:
            policy_doc["id"] = str(policy_doc["_id"])
            return Policy(**policy_doc)
        return None

    async def list_policies(
        self, 
        organization_id: str, 
        status: Optional[PolicyStatus] = None,
        policy_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Policy]:
        """List policies with optional filtering"""
        query = {"organization_id": organization_id}
        
        if status:
            query["status"] = status
        if policy_type:
            query["type"] = policy_type
            
        cursor = self.collection.find(query).skip(skip).limit(limit).sort("created_at", -1)
        policies = []
        
        async for policy_doc in cursor:
            policy_doc["id"] = str(policy_doc["_id"])
            policies.append(Policy(**policy_doc))
            
        return policies

    async def update_policy(
        self, 
        policy_id: str, 
        policy_update: PolicyUpdate, 
        organization_id: str
    ) -> Optional[Policy]:
        """Update a policy"""
        update_data = {k: v for k, v in policy_update.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        result = await self.collection.update_one(
            {"_id": ObjectId(policy_id), "organization_id": organization_id},
            {"$set": update_data}
        )
        
        if result.modified_count:
            return await self.get_policy(policy_id, organization_id)
        return None

    async def delete_policy(self, policy_id: str, organization_id: str) -> bool:
        """Delete a policy"""
        result = await self.collection.delete_one({
            "_id": ObjectId(policy_id),
            "organization_id": organization_id
        })
        
        return result.deleted_count > 0

    async def get_active_policies(self, organization_id: str) -> List[Policy]:
        """Get all active policies for an organization"""
        return await self.list_policies(
            organization_id=organization_id,
            status=PolicyStatus.ACTIVE
        )

    async def toggle_policy_status(self, policy_id: str, organization_id: str) -> Optional[Policy]:
        """Toggle policy status between active and inactive"""
        policy = await self.get_policy(policy_id, organization_id)
        if not policy:
            return None
            
        new_status = PolicyStatus.INACTIVE if policy.status == PolicyStatus.ACTIVE else PolicyStatus.ACTIVE
        update = PolicyUpdate(status=new_status)
        
        return await self.update_policy(policy_id, update, organization_id)

policy_service = PolicyService()
import asyncio
import time
from typing import List, Dict, Any
import logging
import subprocess
import json
from datetime import datetime

from ..models.evaluation import (
    EvaluationRequest, 
    EvaluationResult, 
    PolicyEvaluationResult, 
    EvaluationStatus
)
from ..models.policy import Policy, PolicyType
from ..services.policy_service import policy_service
from ..evaluators.content_safety import ContentSafetyEvaluator
from ..database.mongodb import get_database

logger = logging.getLogger(__name__)

class EvaluationService:
    def __init__(self):
        self.db = get_database()
        self.content_safety_evaluator = ContentSafetyEvaluator()
        
    async def evaluate_content(
        self, 
        content: str, 
        organization_id: str, 
        user_id: str,
        policy_ids: List[str] = None
    ) -> EvaluationResult:
        """Evaluate content against policies with two-stage pipeline"""
        start_time = time.time()
        
        # Create evaluation request
        request = EvaluationRequest(
            content=content,
            policy_ids=policy_ids or [],
            organization_id=organization_id,
            user_id=user_id
        )
        
        # Get policies to evaluate
        if policy_ids:
            policies = []
            for policy_id in policy_ids:
                policy = await policy_service.get_policy(policy_id, organization_id)
                if policy:
                    policies.append(policy)
        else:
            policies = await policy_service.get_active_policies(organization_id)
        
        if not policies:
            return EvaluationResult(
                request_id=str(request.id),
                status=EvaluationStatus.COMPLETED,
                overall_score=1.0,
                has_violations=False,
                policy_results=[],
                total_execution_time_ms=0.0
            )
        
        # Stage 1: Fast Rust evaluators (keyword_filter, performance)
        rust_policies = [p for p in policies if p.type in [PolicyType.KEYWORD_FILTER, PolicyType.PERFORMANCE]]
        rust_results = await self._evaluate_with_rust(content, rust_policies)
        
        # Early exit if critical violations found
        critical_violations = [r for r in rust_results if r.violation and r.score < 0.3]
        if critical_violations:
            total_time = (time.time() - start_time) * 1000
            return EvaluationResult(
                request_id=str(request.id),
                status=EvaluationStatus.BLOCKED,
                overall_score=min(r.score for r in critical_violations),
                has_violations=True,
                policy_results=rust_results,
                total_execution_time_ms=total_time
            )
        
        # Stage 2: Python ML evaluators (content_safety, semantic)
        python_policies = [p for p in policies if p.type in [PolicyType.CONTENT_SAFETY, PolicyType.SEMANTIC]]
        python_results = await self._evaluate_with_python(content, python_policies)
        
        # Combine results
        all_results = rust_results + python_results
        overall_score = min(r.score for r in all_results) if all_results else 1.0
        has_violations = any(r.violation for r in all_results)
        
        total_time = (time.time() - start_time) * 1000
        
        result = EvaluationResult(
            request_id=str(request.id),
            status=EvaluationStatus.BLOCKED if has_violations else EvaluationStatus.COMPLETED,
            overall_score=overall_score,
            has_violations=has_violations,
            policy_results=all_results,
            total_execution_time_ms=total_time,
            completed_at=datetime.utcnow()
        )
        
        # Store result in database
        await self._store_evaluation_result(result)
        
        logger.info(f"Evaluation completed in {total_time:.2f}ms with {len(all_results)} policies")
        return result
    
    async def _evaluate_with_rust(self, content: str, policies: List[Policy]) -> List[PolicyEvaluationResult]:
        """Evaluate content using Rust CLI for fast policies"""
        results = []
        
        for policy in policies:
            start_time = time.time()
            
            try:
                # Call Rust CLI for evaluation
                cmd = [
                    "cargo", "run", "--manifest-path", "core/Cargo.toml", "--",
                    "evaluate",
                    "--content", content,
                    "--policy-type", policy.type.value,
                    "--config", json.dumps(policy.config)
                ]
                
                process = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                
                stdout, stderr = await process.communicate()
                execution_time = (time.time() - start_time) * 1000
                
                if process.returncode == 0:
                    result_data = json.loads(stdout.decode())
                    
                    results.append(PolicyEvaluationResult(
                        policy_id=str(policy.id),
                        policy_name=policy.name,
                        policy_type=policy.type.value,
                        status=EvaluationStatus.COMPLETED,
                        score=result_data.get("score", 1.0),
                        confidence=result_data.get("confidence", 1.0),
                        violation=result_data.get("violation", False),
                        details=result_data.get("details", {}),
                        execution_time_ms=execution_time
                    ))
                else:
                    logger.error(f"Rust evaluation failed: {stderr.decode()}")
                    results.append(PolicyEvaluationResult(
                        policy_id=str(policy.id),
                        policy_name=policy.name,
                        policy_type=policy.type.value,
                        status=EvaluationStatus.FAILED,
                        score=1.0,
                        confidence=0.0,
                        violation=False,
                        details={},
                        execution_time_ms=execution_time,
                        error_message=stderr.decode()
                    ))
                    
            except Exception as e:
                execution_time = (time.time() - start_time) * 1000
                logger.error(f"Error evaluating with Rust: {e}")
                results.append(PolicyEvaluationResult(
                    policy_id=str(policy.id),
                    policy_name=policy.name,
                    policy_type=policy.type.value,
                    status=EvaluationStatus.FAILED,
                    score=1.0,
                    confidence=0.0,
                    violation=False,
                    details={},
                    execution_time_ms=execution_time,
                    error_message=str(e)
                ))
        
        return results
    
    async def _evaluate_with_python(self, content: str, policies: List[Policy]) -> List[PolicyEvaluationResult]:
        """Evaluate content using Python ML evaluators"""
        results = []
        
        for policy in policies:
            start_time = time.time()
            
            try:
                if policy.type == PolicyType.CONTENT_SAFETY:
                    result = await self.content_safety_evaluator.evaluate(content, policy.config)
                    
                    results.append(PolicyEvaluationResult(
                        policy_id=str(policy.id),
                        policy_name=policy.name,
                        policy_type=policy.type.value,
                        status=EvaluationStatus.COMPLETED,
                        score=result["score"],
                        confidence=result["confidence"],
                        violation=result["violation"],
                        details=result["details"],
                        execution_time_ms=(time.time() - start_time) * 1000
                    ))
                    
                elif policy.type == PolicyType.SEMANTIC:
                    # Placeholder for semantic evaluator
                    results.append(PolicyEvaluationResult(
                        policy_id=str(policy.id),
                        policy_name=policy.name,
                        policy_type=policy.type.value,
                        status=EvaluationStatus.COMPLETED,
                        score=0.9,
                        confidence=0.8,
                        violation=False,
                        details={"similarity_scores": []},
                        execution_time_ms=(time.time() - start_time) * 1000
                    ))
                    
            except Exception as e:
                execution_time = (time.time() - start_time) * 1000
                logger.error(f"Error evaluating with Python: {e}")
                results.append(PolicyEvaluationResult(
                    policy_id=str(policy.id),
                    policy_name=policy.name,
                    policy_type=policy.type.value,
                    status=EvaluationStatus.FAILED,
                    score=1.0,
                    confidence=0.0,
                    violation=False,
                    details={},
                    execution_time_ms=execution_time,
                    error_message=str(e)
                ))
        
        return results
    
    async def _store_evaluation_result(self, result: EvaluationResult):
        """Store evaluation result in database"""
        try:
            result_dict = result.dict()
            await self.db.evaluation_results.insert_one(result_dict)
        except Exception as e:
            logger.error(f"Failed to store evaluation result: {e}")

evaluation_service = EvaluationService()
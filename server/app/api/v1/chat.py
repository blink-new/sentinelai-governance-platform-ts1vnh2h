"""
Chat completions API with real-time policy enforcement
"""

import asyncio
import time
from typing import Dict, Any, Optional, List, AsyncGenerator
import structlog
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
import httpx

from app.core.config import get_settings
from app.core.auth import get_current_user
from app.models.chat import ChatCompletionRequest, ChatCompletionResponse
from app.models.user import User
from app.services.policy_engine import PolicyEngine
from app.services.llm_proxy import LLMProxyService
from app.core.metrics import chat_requests_total, chat_request_duration

logger = structlog.get_logger()
router = APIRouter()

@router.post("/completions")
async def create_chat_completion(
    request: ChatCompletionRequest,
    current_user: User = Depends(get_current_user),
    http_request: Request = None
) -> ChatCompletionResponse:
    """
    Create a chat completion with real-time policy enforcement
    
    This endpoint acts as a proxy to various LLM providers while enforcing
    organizational policies in real-time with sub-10ms evaluation.
    """
    start_time = time.time()
    
    try:
        # Initialize services
        settings = get_settings()
        policy_engine = PolicyEngine()
        llm_proxy = LLMProxyService()
        
        # Get organization policies
        policies = await policy_engine.get_active_policies(current_user.organization_id)
        
        # Extract content for evaluation
        content = ""
        if request.messages:
            content = " ".join([msg.content for msg in request.messages if msg.content])
        
        # Pre-request policy evaluation (fast evaluators only)
        pre_evaluation_start = time.time()
        pre_violations = await policy_engine.evaluate_fast(
            content=content,
            policies=policies,
            user_id=current_user.id,
            organization_id=current_user.organization_id
        )
        pre_evaluation_time = (time.time() - pre_evaluation_start) * 1000
        
        logger.info(
            "Pre-request evaluation completed",
            user_id=current_user.id,
            evaluation_time_ms=pre_evaluation_time,
            violations_found=len(pre_violations)
        )
        
        # Early exit if critical violations found
        critical_violations = [v for v in pre_violations if v.result.severity == "CRITICAL"]
        if critical_violations:
            chat_requests_total.labels(
                organization=current_user.organization_id,
                model=request.model,
                status="blocked"
            ).inc()
            
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Request blocked by policy",
                    "violations": [
                        {
                            "policy": v.policy_name,
                            "message": v.result.message,
                            "severity": v.result.severity
                        } for v in critical_violations
                    ]
                }
            )
        
        # Forward request to LLM provider
        llm_start_time = time.time()
        
        if request.stream:
            # Handle streaming response
            return StreamingResponse(
                _stream_with_policy_check(
                    request, current_user, policies, llm_proxy, policy_engine
                ),
                media_type="text/plain"
            )
        else:
            # Handle non-streaming response
            response = await llm_proxy.create_completion(request)
            llm_time = (time.time() - llm_start_time) * 1000
            
            # Post-response policy evaluation (all evaluators)
            if response.choices and response.choices[0].message:
                response_content = response.choices[0].message.content
                
                # Run comprehensive evaluation in background
                asyncio.create_task(
                    _evaluate_response_comprehensive(
                        content=response_content,
                        policies=policies,
                        user_id=current_user.id,
                        organization_id=current_user.organization_id,
                        request_id=response.id,
                        policy_engine=policy_engine
                    )
                )
            
            # Record metrics
            total_time = (time.time() - start_time) * 1000
            chat_requests_total.labels(
                organization=current_user.organization_id,
                model=request.model,
                status="success"
            ).inc()
            
            chat_request_duration.labels(
                organization=current_user.organization_id,
                model=request.model
            ).observe(total_time / 1000)
            
            logger.info(
                "Chat completion successful",
                user_id=current_user.id,
                model=request.model,
                total_time_ms=total_time,
                llm_time_ms=llm_time,
                pre_evaluation_time_ms=pre_evaluation_time
            )
            
            return response
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Chat completion failed", error=str(e), user_id=current_user.id)
        
        chat_requests_total.labels(
            organization=current_user.organization_id,
            model=request.model,
            status="error"
        ).inc()
        
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

async def _stream_with_policy_check(
    request: ChatCompletionRequest,
    user: User,
    policies: List[Any],
    llm_proxy: LLMProxyService,
    policy_engine: PolicyEngine
) -> AsyncGenerator[str, None]:
    """Stream response with real-time policy checking"""
    
    accumulated_content = ""
    chunk_count = 0
    
    try:
        async for chunk in llm_proxy.create_completion_stream(request):
            chunk_count += 1
            
            # Extract content from chunk
            if hasattr(chunk, 'choices') and chunk.choices:
                delta = chunk.choices[0].delta
                if hasattr(delta, 'content') and delta.content:
                    accumulated_content += delta.content
                    
                    # Periodic policy checking (every 10 chunks or 100 characters)
                    if chunk_count % 10 == 0 or len(accumulated_content) % 100 == 0:
                        violations = await policy_engine.evaluate_fast(
                            content=accumulated_content,
                            policies=policies,
                            user_id=user.id,
                            organization_id=user.organization_id
                        )
                        
                        # Check for critical violations
                        critical_violations = [v for v in violations if v.result.severity == "CRITICAL"]
                        if critical_violations:
                            # Send termination chunk
                            yield f"data: {{'error': 'Stream terminated due to policy violation'}}\n\n"
                            return
            
            # Forward chunk to client
            yield f"data: {chunk.model_dump_json()}\n\n"
            
    except Exception as e:
        logger.error("Streaming failed", error=str(e), user_id=user.id)
        yield f"data: {{'error': 'Stream error: {str(e)}'}}\n\n"
    
    finally:
        # Final comprehensive evaluation
        if accumulated_content:
            asyncio.create_task(
                _evaluate_response_comprehensive(
                    content=accumulated_content,
                    policies=policies,
                    user_id=user.id,
                    organization_id=user.organization_id,
                    request_id=f"stream_{int(time.time())}",
                    policy_engine=policy_engine
                )
            )

async def _evaluate_response_comprehensive(
    content: str,
    policies: List[Any],
    user_id: str,
    organization_id: str,
    request_id: str,
    policy_engine: PolicyEngine
):
    """Run comprehensive policy evaluation in background"""
    try:
        violations = await policy_engine.evaluate_comprehensive(
            content=content,
            policies=policies,
            user_id=user_id,
            organization_id=organization_id
        )
        
        if violations:
            logger.warning(
                "Post-response violations detected",
                user_id=user_id,
                request_id=request_id,
                violations_count=len(violations)
            )
            
            # Store violations for audit and analytics
            await policy_engine.store_violations(violations, request_id)
            
            # Trigger webhooks if configured
            await policy_engine.trigger_webhooks(violations, organization_id)
            
    except Exception as e:
        logger.error(
            "Comprehensive evaluation failed",
            error=str(e),
            user_id=user_id,
            request_id=request_id
        )
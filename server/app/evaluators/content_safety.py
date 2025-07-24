"""
Content Safety Evaluator using ML models for toxicity detection
"""

import asyncio
import time
from typing import Dict, Any, Optional, List
import structlog
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch
from azure.cognitiveservices.language.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential

from app.core.config import get_settings
from app.models.evaluation import EvaluationRequest, EvaluationResult, PolicyResult, ViolationSeverity
from app.models.policy import Policy, ContentSafetyConfig
from .base import BaseEvaluator

logger = structlog.get_logger()

class ContentSafetyEvaluator(BaseEvaluator):
    """ML-based content safety evaluator for toxicity detection"""
    
    def __init__(self):
        self.settings = get_settings()
        self.toxicity_classifier = None
        self.azure_client = None
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize ML models for content safety evaluation"""
        try:
            # Initialize local toxicity classifier
            logger.info("Loading toxicity classification model")
            self.toxicity_classifier = pipeline(
                "text-classification",
                model="unitary/toxic-bert",
                device=0 if torch.cuda.is_available() else -1,
                return_all_scores=True
            )
            logger.info("Toxicity classifier loaded successfully")
            
            # Initialize Azure Content Safety client if configured
            if self.settings.AZURE_CONTENT_SAFETY_KEY and self.settings.AZURE_CONTENT_SAFETY_ENDPOINT:
                self.azure_client = TextAnalyticsClient(
                    endpoint=self.settings.AZURE_CONTENT_SAFETY_ENDPOINT,
                    credential=AzureKeyCredential(self.settings.AZURE_CONTENT_SAFETY_KEY)
                )
                logger.info("Azure Content Safety client initialized")
                
        except Exception as e:
            logger.error("Failed to initialize content safety models", error=str(e))
            raise
    
    async def evaluate(self, request: EvaluationRequest, policy: Policy) -> EvaluationResult:
        """Evaluate content for safety violations"""
        start_time = time.time()
        
        try:
            config = policy.config
            if not isinstance(config, ContentSafetyConfig):
                raise ValueError("Invalid policy config for content safety evaluator")
            
            # Run multiple safety checks in parallel
            tasks = []
            
            # Local toxicity detection
            tasks.append(self._evaluate_toxicity_local(request.content, config))
            
            # Azure Content Safety (if available)
            if self.azure_client:
                tasks.append(self._evaluate_azure_content_safety(request.content, config))
            
            # Category-specific checks
            for category in config.categories:
                tasks.append(self._evaluate_category(request.content, category, config))
            
            # Execute all evaluations concurrently
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Aggregate results
            violations = []
            max_confidence = 0.0
            max_severity = ViolationSeverity.LOW
            
            for result in results:
                if isinstance(result, Exception):
                    logger.warning("Content safety evaluation failed", error=str(result))
                    continue
                
                if result and result.get('violation'):
                    violations.append(result)
                    max_confidence = max(max_confidence, result.get('confidence', 0.0))
                    
                    # Update severity
                    severity = result.get('severity', ViolationSeverity.LOW)
                    if severity.value > max_severity.value:
                        max_severity = severity
            
            execution_time = int((time.time() - start_time) * 1000)
            
            # Determine final result
            if violations:
                policy_result = PolicyResult(
                    violation=True,
                    severity=max_severity,
                    message=f"Content safety violations detected: {len(violations)} issues found",
                    confidence=max_confidence,
                    details={
                        "violations": violations,
                        "categories_checked": config.categories,
                        "threshold": config.toxicity_threshold,
                        "evaluation_methods": ["local_toxicity", "azure_content_safety", "category_specific"]
                    }
                )
            else:
                policy_result = PolicyResult(
                    violation=False,
                    message="Content passed all safety checks",
                    confidence=0.95,
                    details={
                        "categories_checked": config.categories,
                        "threshold": config.toxicity_threshold
                    }
                )
            
            return EvaluationResult(
                request_id=request.id,
                policy_id=policy.id,
                policy_name=policy.name,
                policy_type="content_safety",
                result=policy_result,
                execution_time_ms=execution_time
            )
            
        except Exception as e:
            logger.error("Content safety evaluation failed", error=str(e), request_id=request.id)
            execution_time = int((time.time() - start_time) * 1000)
            
            return EvaluationResult(
                request_id=request.id,
                policy_id=policy.id,
                policy_name=policy.name,
                policy_type="content_safety",
                result=PolicyResult(
                    violation=False,
                    error=f"Evaluation failed: {str(e)}",
                    confidence=0.0
                ),
                execution_time_ms=execution_time
            )
    
    async def _evaluate_toxicity_local(self, content: str, config: ContentSafetyConfig) -> Optional[Dict[str, Any]]:
        """Evaluate toxicity using local BERT model"""
        try:
            # Run inference in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            results = await loop.run_in_executor(
                None, 
                lambda: self.toxicity_classifier(content)
            )
            
            # Find toxicity score
            toxicity_score = 0.0
            for result in results:
                if result['label'] == 'TOXIC':
                    toxicity_score = result['score']
                    break
            
            if toxicity_score > config.toxicity_threshold:
                severity = ViolationSeverity.HIGH if toxicity_score > 0.8 else ViolationSeverity.MEDIUM
                return {
                    'violation': True,
                    'type': 'toxicity',
                    'score': toxicity_score,
                    'threshold': config.toxicity_threshold,
                    'confidence': toxicity_score,
                    'severity': severity,
                    'method': 'local_bert'
                }
            
            return None
            
        except Exception as e:
            logger.warning("Local toxicity evaluation failed", error=str(e))
            return None
    
    async def _evaluate_azure_content_safety(self, content: str, config: ContentSafetyConfig) -> Optional[Dict[str, Any]]:
        """Evaluate content using Azure Content Safety API"""
        try:
            if not self.azure_client:
                return None
            
            # Run Azure API call in thread pool
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.azure_client.analyze_sentiment([content])
            )
            
            # Process Azure response
            for doc in response:
                if hasattr(doc, 'error'):
                    continue
                
                # Check for harmful content categories
                if hasattr(doc, 'categories'):
                    for category in doc.categories:
                        if category.severity > config.toxicity_threshold:
                            return {
                                'violation': True,
                                'type': 'azure_content_safety',
                                'category': category.category,
                                'severity_score': category.severity,
                                'threshold': config.toxicity_threshold,
                                'confidence': category.confidence_score,
                                'severity': ViolationSeverity.HIGH if category.severity > 0.8 else ViolationSeverity.MEDIUM,
                                'method': 'azure_api'
                            }
            
            return None
            
        except Exception as e:
            logger.warning("Azure content safety evaluation failed", error=str(e))
            return None
    
    async def _evaluate_category(self, content: str, category: str, config: ContentSafetyConfig) -> Optional[Dict[str, Any]]:
        """Evaluate content for specific category violations"""
        try:
            # Category-specific keyword matching and pattern detection
            category_patterns = {
                'hate_speech': [
                    r'\b(hate|despise|loathe)\s+\w+\s+(people|group|race|religion)',
                    r'\b(kill|destroy|eliminate)\s+all\s+\w+',
                ],
                'harassment': [
                    r'\b(stupid|idiot|moron|dumb)\b.*\b(you|person)',
                    r'\b(shut\s+up|go\s+away|leave\s+me\s+alone)',
                ],
                'violence': [
                    r'\b(kill|murder|assault|attack|hurt|harm)\b',
                    r'\b(weapon|gun|knife|bomb|explosive)\b',
                ],
                'self_harm': [
                    r'\b(suicide|kill\s+myself|end\s+my\s+life)',
                    r'\b(cut|hurt|harm)\s+myself',
                ]
            }
            
            if category not in category_patterns:
                return None
            
            import re
            patterns = category_patterns[category]
            
            for pattern in patterns:
                if re.search(pattern, content.lower()):
                    return {
                        'violation': True,
                        'type': 'category_specific',
                        'category': category,
                        'pattern_matched': pattern,
                        'confidence': 0.8,
                        'severity': ViolationSeverity.MEDIUM,
                        'method': 'pattern_matching'
                    }
            
            return None
            
        except Exception as e:
            logger.warning("Category evaluation failed", error=str(e), category=category)
            return None
    
    def supports_policy_type(self, policy_type: str) -> bool:
        """Check if this evaluator supports the given policy type"""
        return policy_type == "content_safety"
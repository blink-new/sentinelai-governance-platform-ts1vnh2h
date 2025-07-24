use crate::evaluators::Evaluator;
use crate::models::{
    EvaluationRequest, EvaluationResult, Policy, PolicyType, PolicyConfig, 
    PolicyResult, ViolationSeverity
};
use crate::error::Result;
use async_trait::async_trait;
use chrono::Utc;
use uuid::Uuid;
use std::time::Instant;

pub struct PerformanceEvaluator;

impl PerformanceEvaluator {
    pub fn new() -> Self {
        Self
    }
    
    fn calculate_quality_score(&self, content: &str) -> f64 {
        // Simple quality scoring based on content characteristics
        let mut score = 1.0;
        
        // Penalize very short responses
        if content.len() < 10 {
            score *= 0.3;
        } else if content.len() < 50 {
            score *= 0.7;
        }
        
        // Penalize excessive repetition
        let words: Vec<&str> = content.split_whitespace().collect();
        if words.len() > 0 {
            let unique_words: std::collections::HashSet<&str> = words.iter().cloned().collect();
            let repetition_ratio = unique_words.len() as f64 / words.len() as f64;
            score *= repetition_ratio;
        }
        
        // Penalize excessive capitalization
        let caps_ratio = content.chars().filter(|c| c.is_uppercase()).count() as f64 / content.len() as f64;
        if caps_ratio > 0.3 {
            score *= 0.8;
        }
        
        // Reward proper sentence structure
        let sentence_count = content.matches('.').count() + content.matches('!').count() + content.matches('?').count();
        if sentence_count > 0 {
            score *= 1.1;
        }
        
        score.min(1.0).max(0.0)
    }
    
    fn count_tokens(&self, content: &str) -> u32 {
        // Simple token counting (approximate)
        content.split_whitespace().count() as u32
    }
}

#[async_trait]
impl Evaluator for PerformanceEvaluator {
    async fn evaluate(&self, request: &EvaluationRequest, policy: &Policy) -> Result<EvaluationResult> {
        let start_time = Instant::now();
        
        let config = match &policy.config {
            PolicyConfig::Performance(config) => config,
            _ => return Err(crate::error::Error::Evaluation(
                "Invalid policy config for performance evaluator".to_string()
            )),
        };
        
        let quality_score = self.calculate_quality_score(&request.content);
        let token_count = self.count_tokens(&request.content);
        let execution_time = start_time.elapsed().as_millis() as u64;
        
        let mut violations = Vec::new();
        
        // Check quality score
        if quality_score < config.min_quality_score {
            violations.push(format!(
                "Quality score {} below threshold {}", 
                quality_score, config.min_quality_score
            ));
        }
        
        // Check token count
        if let Some(max_tokens) = config.max_tokens {
            if token_count > max_tokens {
                violations.push(format!(
                    "Token count {} exceeds limit {}", 
                    token_count, max_tokens
                ));
            }
        }
        
        // Check response time (simulated - in real implementation this would be actual response time)
        if execution_time > config.max_response_time_ms {
            violations.push(format!(
                "Response time {}ms exceeds limit {}ms", 
                execution_time, config.max_response_time_ms
            ));
        }
        
        let result = if violations.is_empty() {
            PolicyResult::Pass
        } else {
            let severity = if quality_score < 0.3 || token_count > config.max_tokens.unwrap_or(u32::MAX) * 2 {
                ViolationSeverity::High
            } else {
                ViolationSeverity::Medium
            };
            
            PolicyResult::Violation {
                severity,
                message: format!("Performance violations: {}", violations.join(", ")),
                confidence: 0.9,
                details: Some(serde_json::json!({
                    "quality_score": quality_score,
                    "token_count": token_count,
                    "execution_time_ms": execution_time,
                    "violations": violations
                })),
            }
        };
        
        Ok(EvaluationResult {
            id: Uuid::new_v4().to_string(),
            request_id: request.id.clone(),
            policy_id: policy.id.clone(),
            policy_name: policy.name.clone(),
            policy_type: PolicyType::Performance,
            result,
            execution_time_ms: execution_time,
            timestamp: Utc::now(),
        })
    }
    
    fn supports_policy_type(&self, policy_type: &PolicyType) -> bool {
        matches!(policy_type, PolicyType::Performance)
    }
}
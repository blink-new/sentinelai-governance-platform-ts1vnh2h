use crate::evaluators::Evaluator;
use crate::models::{
    EvaluationRequest, EvaluationResult, Policy, PolicyType, PolicyConfig, 
    PolicyResult, ViolationSeverity
};
use crate::error::Result;
use async_trait::async_trait;
use regex::Regex;
use chrono::Utc;
use uuid::Uuid;
use std::time::Instant;

pub struct KeywordFilterEvaluator {
    // Cache compiled regexes for performance
    regex_cache: dashmap::DashMap<String, Regex>,
}

impl KeywordFilterEvaluator {
    pub fn new() -> Self {
        Self {
            regex_cache: dashmap::DashMap::new(),
        }
    }
    
    fn get_or_compile_regex(&self, pattern: &str, case_sensitive: bool) -> Result<Regex> {
        let cache_key = format!("{}:{}", pattern, case_sensitive);
        
        if let Some(regex) = self.regex_cache.get(&cache_key) {
            return Ok(regex.clone());
        }
        
        let regex_pattern = if case_sensitive {
            pattern.to_string()
        } else {
            format!("(?i){}", pattern)
        };
        
        let regex = Regex::new(&regex_pattern)?;
        self.regex_cache.insert(cache_key, regex.clone());
        Ok(regex)
    }
}

#[async_trait]
impl Evaluator for KeywordFilterEvaluator {
    async fn evaluate(&self, request: &EvaluationRequest, policy: &Policy) -> Result<EvaluationResult> {
        let start_time = Instant::now();
        
        let config = match &policy.config {
            PolicyConfig::KeywordFilter(config) => config,
            _ => return Err(crate::error::Error::Evaluation(
                "Invalid policy config for keyword filter".to_string()
            )),
        };
        
        let mut violations = Vec::new();
        
        for pattern in &config.patterns {
            let regex = self.get_or_compile_regex(pattern, config.case_sensitive)?;
            
            if let Some(captures) = regex.captures(&request.content) {
                let matched_text = captures.get(0).unwrap().as_str();
                violations.push(format!("Pattern '{}' matched: '{}'", pattern, matched_text));
            }
        }
        
        let execution_time = start_time.elapsed().as_millis() as u64;
        
        let result = if violations.is_empty() {
            PolicyResult::Pass
        } else {
            PolicyResult::Violation {
                severity: ViolationSeverity::Medium,
                message: format!("Keyword filter violations: {}", violations.join(", ")),
                confidence: 1.0, // Regex matches are deterministic
                details: Some(serde_json::json!({
                    "violations": violations,
                    "patterns_checked": config.patterns.len(),
                    "case_sensitive": config.case_sensitive
                })),
            }
        };
        
        Ok(EvaluationResult {
            id: Uuid::new_v4().to_string(),
            request_id: request.id.clone(),
            policy_id: policy.id.clone(),
            policy_name: policy.name.clone(),
            policy_type: PolicyType::KeywordFilter,
            result,
            execution_time_ms: execution_time,
            timestamp: Utc::now(),
        })
    }
    
    fn supports_policy_type(&self, policy_type: &PolicyType) -> bool {
        matches!(policy_type, PolicyType::KeywordFilter)
    }
}
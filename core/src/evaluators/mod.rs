pub mod keyword_filter;
pub mod performance;

use crate::models::{EvaluationRequest, EvaluationResult, Policy};
use crate::error::Result;
use async_trait::async_trait;

#[async_trait]
pub trait Evaluator: Send + Sync {
    async fn evaluate(&self, request: &EvaluationRequest, policy: &Policy) -> Result<EvaluationResult>;
    fn supports_policy_type(&self, policy_type: &crate::models::PolicyType) -> bool;
}

pub struct EvaluatorRegistry {
    evaluators: Vec<Box<dyn Evaluator>>,
}

impl EvaluatorRegistry {
    pub fn new() -> Self {
        let mut registry = Self {
            evaluators: Vec::new(),
        };
        
        // Register Rust-based evaluators
        registry.register(Box::new(keyword_filter::KeywordFilterEvaluator::new()));
        registry.register(Box::new(performance::PerformanceEvaluator::new()));
        
        registry
    }
    
    pub fn register(&mut self, evaluator: Box<dyn Evaluator>) {
        self.evaluators.push(evaluator);
    }
    
    pub async fn evaluate(&self, request: &EvaluationRequest, policy: &Policy) -> Result<EvaluationResult> {
        for evaluator in &self.evaluators {
            if evaluator.supports_policy_type(&policy.policy_type) {
                return evaluator.evaluate(request, policy).await;
            }
        }
        
        Err(crate::error::Error::Evaluation(
            format!("No evaluator found for policy type: {:?}", policy.policy_type)
        ))
    }
}
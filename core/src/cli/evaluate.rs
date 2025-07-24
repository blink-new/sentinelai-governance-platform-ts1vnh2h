use crate::error::SentinelError;
use crate::evaluators::{keyword_filter::KeywordFilterEvaluator, performance::PerformanceEvaluator};
use crate::models::{EvaluationRequest, EvaluationResult, PolicyType, ViolationSeverity};
use clap::Args;
use serde_json;
use std::collections::HashMap;
use std::time::Instant;

#[derive(Args)]
pub struct EvaluateArgs {
    /// Content to evaluate
    #[arg(short, long)]
    pub content: String,

    /// Policy ID to evaluate against
    #[arg(short, long)]
    pub policy_id: Option<String>,

    /// Output format (json, yaml, table)
    #[arg(short, long, default_value = "json")]
    pub format: String,

    /// Enable verbose output
    #[arg(short, long)]
    pub verbose: bool,

    /// Evaluation timeout in milliseconds
    #[arg(short, long, default_value = "5000")]
    pub timeout: u64,
}

pub async fn handle_evaluate(args: EvaluateArgs) -> Result<(), SentinelError> {
    let start_time = Instant::now();
    
    println!("🔍 SentinelAI Policy Evaluation");
    println!("Content length: {} characters", args.content.len());
    
    if args.verbose {
        println!("Policy ID: {:?}", args.policy_id);
        println!("Format: {}", args.format);
        println!("Timeout: {}ms", args.timeout);
    }

    // Create evaluation request
    let request = EvaluationRequest {
        content: args.content.clone(),
        policy_ids: args.policy_id.map(|id| vec![id]).unwrap_or_default(),
        metadata: HashMap::new(),
        user_id: "cli-user".to_string(),
        organization_id: "cli-org".to_string(),
    };

    // Run evaluations
    let mut results = Vec::new();

    // Keyword filter evaluation
    let keyword_evaluator = KeywordFilterEvaluator::new();
    if let Ok(result) = keyword_evaluator.evaluate(&request).await {
        results.push(result);
    }

    // Performance evaluation
    let performance_evaluator = PerformanceEvaluator::new();
    if let Ok(result) = performance_evaluator.evaluate(&request).await {
        results.push(result);
    }

    let evaluation_time = start_time.elapsed();

    // Output results
    match args.format.as_str() {
        "json" => output_json(&results, evaluation_time)?,
        "yaml" => output_yaml(&results, evaluation_time)?,
        "table" => output_table(&results, evaluation_time)?,
        _ => return Err(SentinelError::InvalidFormat(args.format)),
    }

    Ok(())
}

fn output_json(results: &[EvaluationResult], duration: std::time::Duration) -> Result<(), SentinelError> {
    let output = serde_json::json!({
        "evaluation_time_ms": duration.as_millis(),
        "total_policies": results.len(),
        "violations": results.iter().filter(|r| r.violation.is_some()).count(),
        "results": results
    });

    println!("{}", serde_json::to_string_pretty(&output)?);
    Ok(())
}

fn output_yaml(results: &[EvaluationResult], duration: std::time::Duration) -> Result<(), SentinelError> {
    println!("evaluation_time_ms: {}", duration.as_millis());
    println!("total_policies: {}", results.len());
    println!("violations: {}", results.iter().filter(|r| r.violation.is_some()).count());
    println!("results:");
    
    for result in results {
        println!("  - policy_id: {}", result.policy_id);
        println!("    policy_type: {:?}", result.policy_type);
        println!("    passed: {}", result.passed);
        println!("    execution_time_ms: {}", result.execution_time_ms);
        
        if let Some(violation) = &result.violation {
            println!("    violation:");
            println!("      severity: {:?}", violation.severity);
            println!("      message: {}", violation.message);
            println!("      rule_id: {}", violation.rule_id);
        }
    }
    
    Ok(())
}

fn output_table(results: &[EvaluationResult], duration: std::time::Duration) -> Result<(), SentinelError> {
    println!("\n📊 Evaluation Summary");
    println!("┌─────────────────────────────────────────────────────────────────┐");
    println!("│ Total Time: {:>8}ms │ Policies: {:>3} │ Violations: {:>3}     │", 
             duration.as_millis(), results.len(), 
             results.iter().filter(|r| r.violation.is_some()).count());
    println!("└─────────────────────────────────────────────────────────────────┘");

    println!("\n📋 Policy Results");
    println!("┌─────────────────────┬──────────────┬────────┬─────────┬──────────────────────┐");
    println!("│ Policy ID           │ Type         │ Status │ Time(ms)│ Violation            │");
    println!("├─────────────────────┼──────────────┼────────┼─────────┼──────────────────────┤");

    for result in results {
        let status = if result.passed { "✅ PASS" } else { "❌ FAIL" };
        let violation_info = if let Some(v) = &result.violation {
            format!("{:?}: {}", v.severity, v.message.chars().take(20).collect::<String>())
        } else {
            "None".to_string()
        };

        println!("│ {:19} │ {:12} │ {:6} │ {:7} │ {:20} │",
                 result.policy_id.chars().take(19).collect::<String>(),
                 format!("{:?}", result.policy_type).chars().take(12).collect::<String>(),
                 status,
                 result.execution_time_ms,
                 violation_info.chars().take(20).collect::<String>());
    }

    println!("└─────────────────────┴──────────────┴────────┴─────────┴──────────────────────┘");

    // Show detailed violations
    let violations: Vec<_> = results.iter().filter(|r| r.violation.is_some()).collect();
    if !violations.is_empty() {
        println!("\n🚨 Violation Details");
        for (i, result) in violations.iter().enumerate() {
            if let Some(violation) = &result.violation {
                println!("\n{}. Policy: {} ({:?})", i + 1, result.policy_id, result.policy_type);
                println!("   Severity: {:?}", violation.severity);
                println!("   Rule: {}", violation.rule_id);
                println!("   Message: {}", violation.message);
                
                if !violation.context.is_empty() {
                    println!("   Context: {:?}", violation.context);
                }
            }
        }
    }

    Ok(())
}
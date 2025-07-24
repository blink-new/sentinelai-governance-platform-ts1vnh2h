use crate::error::SentinelError;
use crate::models::{Policy, PolicyType, PolicyStatus};
use clap::{Args, Subcommand};
use serde_json;
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

#[derive(Args)]
pub struct PolicyArgs {
    #[command(subcommand)]
    pub command: PolicyCommand,
}

#[derive(Subcommand)]
pub enum PolicyCommand {
    /// List all policies
    List {
        /// Filter by policy type
        #[arg(short, long)]
        policy_type: Option<String>,
        
        /// Filter by status
        #[arg(short, long)]
        status: Option<String>,
        
        /// Output format (json, yaml, table)
        #[arg(short, long, default_value = "table")]
        format: String,
    },
    
    /// Create a new policy
    Create {
        /// Policy name
        #[arg(short, long)]
        name: String,
        
        /// Policy description
        #[arg(short, long)]
        description: Option<String>,
        
        /// Policy type (keyword_filter, performance, content_safety, semantic)
        #[arg(short, long)]
        policy_type: String,
        
        /// Policy configuration file (YAML)
        #[arg(short, long)]
        config: PathBuf,
        
        /// Organization ID
        #[arg(short, long, default_value = "cli-org")]
        organization_id: String,
    },
    
    /// Get policy details
    Get {
        /// Policy ID
        policy_id: String,
        
        /// Output format (json, yaml, table)
        #[arg(short, long, default_value = "yaml")]
        format: String,
    },
    
    /// Update an existing policy
    Update {
        /// Policy ID
        policy_id: String,
        
        /// New policy name
        #[arg(short, long)]
        name: Option<String>,
        
        /// New policy description
        #[arg(short, long)]
        description: Option<String>,
        
        /// New policy configuration file (YAML)
        #[arg(short, long)]
        config: Option<PathBuf>,
        
        /// New policy status
        #[arg(short, long)]
        status: Option<String>,
    },
    
    /// Delete a policy
    Delete {
        /// Policy ID
        policy_id: String,
        
        /// Force deletion without confirmation
        #[arg(short, long)]
        force: bool,
    },
    
    /// Validate policy configuration
    Validate {
        /// Policy configuration file (YAML)
        config: PathBuf,
        
        /// Policy type to validate against
        #[arg(short, long)]
        policy_type: Option<String>,
    },
}

pub async fn handle_policy(args: PolicyArgs) -> Result<(), SentinelError> {
    match args.command {
        PolicyCommand::List { policy_type, status, format } => {
            handle_list_policies(policy_type, status, format).await
        }
        PolicyCommand::Create { name, description, policy_type, config, organization_id } => {
            handle_create_policy(name, description, policy_type, config, organization_id).await
        }
        PolicyCommand::Get { policy_id, format } => {
            handle_get_policy(policy_id, format).await
        }
        PolicyCommand::Update { policy_id, name, description, config, status } => {
            handle_update_policy(policy_id, name, description, config, status).await
        }
        PolicyCommand::Delete { policy_id, force } => {
            handle_delete_policy(policy_id, force).await
        }
        PolicyCommand::Validate { config, policy_type } => {
            handle_validate_policy(config, policy_type).await
        }
    }
}

async fn handle_list_policies(
    policy_type_filter: Option<String>,
    status_filter: Option<String>,
    format: String,
) -> Result<(), SentinelError> {
    println!("📋 SentinelAI Policy Management - List Policies");
    
    // Mock policies for CLI demo
    let mut policies = vec![
        Policy {
            id: "pol_keyword_001".to_string(),
            name: "Profanity Filter".to_string(),
            description: Some("Blocks profanity and inappropriate language".to_string()),
            policy_type: PolicyType::KeywordFilter,
            status: PolicyStatus::Active,
            configuration: create_mock_keyword_config(),
            organization_id: "cli-org".to_string(),
            created_by: "cli-user".to_string(),
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
            version: 1,
            tags: vec!["content".to_string(), "safety".to_string()],
        },
        Policy {
            id: "pol_perf_001".to_string(),
            name: "Response Quality".to_string(),
            description: Some("Ensures high-quality AI responses".to_string()),
            policy_type: PolicyType::Performance,
            status: PolicyStatus::Active,
            configuration: create_mock_performance_config(),
            organization_id: "cli-org".to_string(),
            created_by: "cli-user".to_string(),
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
            version: 1,
            tags: vec!["quality".to_string(), "performance".to_string()],
        },
    ];

    // Apply filters
    if let Some(pt) = policy_type_filter {
        let filter_type = match pt.as_str() {
            "keyword_filter" => PolicyType::KeywordFilter,
            "performance" => PolicyType::Performance,
            "content_safety" => PolicyType::ContentSafety,
            "semantic" => PolicyType::Semantic,
            _ => return Err(SentinelError::InvalidPolicyType(pt)),
        };
        policies.retain(|p| p.policy_type == filter_type);
    }

    if let Some(status) = status_filter {
        let filter_status = match status.as_str() {
            "active" => PolicyStatus::Active,
            "inactive" => PolicyStatus::Inactive,
            "draft" => PolicyStatus::Draft,
            _ => return Err(SentinelError::InvalidPolicyStatus(status)),
        };
        policies.retain(|p| p.status == filter_status);
    }

    // Output results
    match format.as_str() {
        "json" => {
            println!("{}", serde_json::to_string_pretty(&policies)?);
        }
        "yaml" => {
            for policy in &policies {
                println!("---");
                println!("id: {}", policy.id);
                println!("name: {}", policy.name);
                println!("type: {:?}", policy.policy_type);
                println!("status: {:?}", policy.status);
                if let Some(desc) = &policy.description {
                    println!("description: {}", desc);
                }
                println!("created_at: {}", policy.created_at.format("%Y-%m-%d %H:%M:%S UTC"));
            }
        }
        "table" => {
            println!("\n📊 Policy Summary ({} policies)", policies.len());
            println!("┌─────────────────────┬─────────────────────┬──────────────┬────────────┬─────────────────────┐");
            println!("│ Policy ID           │ Name                │ Type         │ Status     │ Created             │");
            println!("├─────────────────────┼─────────────────────┼──────────────┼────────────┼─────────────────────┤");

            for policy in &policies {
                println!("│ {:19} │ {:19} │ {:12} │ {:10} │ {:19} │",
                         policy.id.chars().take(19).collect::<String>(),
                         policy.name.chars().take(19).collect::<String>(),
                         format!("{:?}", policy.policy_type).chars().take(12).collect::<String>(),
                         format!("{:?}", policy.status).chars().take(10).collect::<String>(),
                         policy.created_at.format("%Y-%m-%d %H:%M").to_string());
            }

            println!("└─────────────────────┴─────────────────────┴──────────────┴────────────┴─────────────────────┘");
        }
        _ => return Err(SentinelError::InvalidFormat(format)),
    }

    Ok(())
}

async fn handle_create_policy(
    name: String,
    description: Option<String>,
    policy_type: String,
    config_path: PathBuf,
    organization_id: String,
) -> Result<(), SentinelError> {
    println!("🔨 Creating new policy: {}", name);

    // Validate policy type
    let policy_type_enum = match policy_type.as_str() {
        "keyword_filter" => PolicyType::KeywordFilter,
        "performance" => PolicyType::Performance,
        "content_safety" => PolicyType::ContentSafety,
        "semantic" => PolicyType::Semantic,
        _ => return Err(SentinelError::InvalidPolicyType(policy_type)),
    };

    // Read and validate configuration
    let config_content = fs::read_to_string(&config_path)
        .map_err(|e| SentinelError::FileError(format!("Failed to read config file: {}", e)))?;

    let configuration: HashMap<String, serde_json::Value> = serde_yaml::from_str(&config_content)
        .map_err(|e| SentinelError::ConfigError(format!("Invalid YAML configuration: {}", e)))?;

    // Create policy
    let policy = Policy {
        id: format!("pol_{}_{:08x}", policy_type, rand::random::<u32>()),
        name: name.clone(),
        description,
        policy_type: policy_type_enum,
        status: PolicyStatus::Draft,
        configuration,
        organization_id,
        created_by: "cli-user".to_string(),
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
        version: 1,
        tags: vec![],
    };

    println!("✅ Policy created successfully!");
    println!("   ID: {}", policy.id);
    println!("   Name: {}", policy.name);
    println!("   Type: {:?}", policy.policy_type);
    println!("   Status: {:?}", policy.status);
    println!("   Configuration: {} rules loaded", policy.configuration.len());

    Ok(())
}

async fn handle_get_policy(policy_id: String, format: String) -> Result<(), SentinelError> {
    println!("🔍 Getting policy: {}", policy_id);

    // Mock policy retrieval
    let policy = Policy {
        id: policy_id.clone(),
        name: "Sample Policy".to_string(),
        description: Some("A sample policy for demonstration".to_string()),
        policy_type: PolicyType::KeywordFilter,
        status: PolicyStatus::Active,
        configuration: create_mock_keyword_config(),
        organization_id: "cli-org".to_string(),
        created_by: "cli-user".to_string(),
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
        version: 1,
        tags: vec!["demo".to_string()],
    };

    match format.as_str() {
        "json" => {
            println!("{}", serde_json::to_string_pretty(&policy)?);
        }
        "yaml" => {
            println!("id: {}", policy.id);
            println!("name: {}", policy.name);
            println!("description: {:?}", policy.description);
            println!("type: {:?}", policy.policy_type);
            println!("status: {:?}", policy.status);
            println!("organization_id: {}", policy.organization_id);
            println!("created_by: {}", policy.created_by);
            println!("created_at: {}", policy.created_at);
            println!("updated_at: {}", policy.updated_at);
            println!("version: {}", policy.version);
            println!("tags: {:?}", policy.tags);
            println!("configuration:");
            for (key, value) in &policy.configuration {
                println!("  {}: {:?}", key, value);
            }
        }
        "table" => {
            println!("\n📋 Policy Details");
            println!("┌─────────────────────┬─────────────────────────────────────────────────┐");
            println!("│ Field               │ Value                                           │");
            println!("├─────────────────────┼─────────────────────────────────────────────────┤");
            println!("│ ID                  │ {:47} │", policy.id);
            println!("│ Name                │ {:47} │", policy.name);
            println!("│ Type                │ {:47} │", format!("{:?}", policy.policy_type));
            println!("│ Status              │ {:47} │", format!("{:?}", policy.status));
            println!("│ Organization        │ {:47} │", policy.organization_id);
            println!("│ Created By          │ {:47} │", policy.created_by);
            println!("│ Version             │ {:47} │", policy.version);
            println!("└─────────────────────┴─────────────────────────────────────────────────┘");
        }
        _ => return Err(SentinelError::InvalidFormat(format)),
    }

    Ok(())
}

async fn handle_update_policy(
    policy_id: String,
    name: Option<String>,
    description: Option<String>,
    config: Option<PathBuf>,
    status: Option<String>,
) -> Result<(), SentinelError> {
    println!("🔄 Updating policy: {}", policy_id);

    if let Some(new_name) = name {
        println!("   ✓ Name updated to: {}", new_name);
    }

    if let Some(new_desc) = description {
        println!("   ✓ Description updated to: {}", new_desc);
    }

    if let Some(config_path) = config {
        println!("   ✓ Configuration updated from: {:?}", config_path);
    }

    if let Some(new_status) = status {
        println!("   ✓ Status updated to: {}", new_status);
    }

    println!("✅ Policy updated successfully!");

    Ok(())
}

async fn handle_delete_policy(policy_id: String, force: bool) -> Result<(), SentinelError> {
    if !force {
        println!("⚠️  Are you sure you want to delete policy '{}'? (y/N)", policy_id);
        let mut input = String::new();
        std::io::stdin().read_line(&mut input).unwrap();
        
        if !input.trim().to_lowercase().starts_with('y') {
            println!("❌ Deletion cancelled");
            return Ok(());
        }
    }

    println!("🗑️  Deleting policy: {}", policy_id);
    println!("✅ Policy deleted successfully!");

    Ok(())
}

async fn handle_validate_policy(
    config_path: PathBuf,
    policy_type: Option<String>,
) -> Result<(), SentinelError> {
    println!("🔍 Validating policy configuration: {:?}", config_path);

    // Read configuration file
    let config_content = fs::read_to_string(&config_path)
        .map_err(|e| SentinelError::FileError(format!("Failed to read config file: {}", e)))?;

    // Parse YAML
    let configuration: HashMap<String, serde_json::Value> = serde_yaml::from_str(&config_content)
        .map_err(|e| SentinelError::ConfigError(format!("Invalid YAML configuration: {}", e)))?;

    println!("✅ Configuration file is valid YAML");
    println!("   Rules found: {}", configuration.len());

    // Validate against policy type if specified
    if let Some(pt) = policy_type {
        match pt.as_str() {
            "keyword_filter" => validate_keyword_filter_config(&configuration)?,
            "performance" => validate_performance_config(&configuration)?,
            "content_safety" => validate_content_safety_config(&configuration)?,
            "semantic" => validate_semantic_config(&configuration)?,
            _ => return Err(SentinelError::InvalidPolicyType(pt)),
        }
        println!("✅ Configuration is valid for policy type: {}", pt);
    }

    Ok(())
}

// Helper functions for creating mock configurations
fn create_mock_keyword_config() -> HashMap<String, serde_json::Value> {
    let mut config = HashMap::new();
    config.insert("patterns".to_string(), serde_json::json!(["\\b(spam|scam)\\b"]));
    config.insert("case_sensitive".to_string(), serde_json::json!(false));
    config.insert("severity".to_string(), serde_json::json!("high"));
    config
}

fn create_mock_performance_config() -> HashMap<String, serde_json::Value> {
    let mut config = HashMap::new();
    config.insert("min_length".to_string(), serde_json::json!(10));
    config.insert("max_length".to_string(), serde_json::json!(1000));
    config.insert("required_quality_score".to_string(), serde_json::json!(0.7));
    config
}

// Validation functions
fn validate_keyword_filter_config(config: &HashMap<String, serde_json::Value>) -> Result<(), SentinelError> {
    if !config.contains_key("patterns") {
        return Err(SentinelError::ConfigError("Missing required field: patterns".to_string()));
    }
    Ok(())
}

fn validate_performance_config(config: &HashMap<String, serde_json::Value>) -> Result<(), SentinelError> {
    if !config.contains_key("min_length") {
        return Err(SentinelError::ConfigError("Missing required field: min_length".to_string()));
    }
    Ok(())
}

fn validate_content_safety_config(config: &HashMap<String, serde_json::Value>) -> Result<(), SentinelError> {
    if !config.contains_key("toxicity_threshold") {
        return Err(SentinelError::ConfigError("Missing required field: toxicity_threshold".to_string()));
    }
    Ok(())
}

fn validate_semantic_config(config: &HashMap<String, serde_json::Value>) -> Result<(), SentinelError> {
    if !config.contains_key("similarity_threshold") {
        return Err(SentinelError::ConfigError("Missing required field: similarity_threshold".to_string()));
    }
    Ok(())
}
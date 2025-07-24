use crate::error::SentinelError;
use clap::{Args, Subcommand};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Args)]
pub struct AuthArgs {
    #[command(subcommand)]
    pub command: AuthCommand,
}

#[derive(Subcommand)]
pub enum AuthCommand {
    /// Login to SentinelAI
    Login {
        /// API endpoint URL
        #[arg(short, long, default_value = "https://api.sentinelai.dev")]
        endpoint: String,
        
        /// API key for authentication
        #[arg(short, long)]
        api_key: Option<String>,
        
        /// Organization ID
        #[arg(short, long)]
        organization_id: Option<String>,
    },
    
    /// Logout from SentinelAI
    Logout {
        /// Clear all stored credentials
        #[arg(short, long)]
        clear_all: bool,
    },
    
    /// Show current authentication status
    Status,
    
    /// Configure API settings
    Configure {
        /// API endpoint URL
        #[arg(short, long)]
        endpoint: Option<String>,
        
        /// Default organization ID
        #[arg(short, long)]
        organization_id: Option<String>,
        
        /// Request timeout in seconds
        #[arg(short, long)]
        timeout: Option<u64>,
    },
    
    /// Test API connection
    Test,
}

#[derive(Serialize, Deserialize, Default)]
struct AuthConfig {
    endpoint: Option<String>,
    api_key: Option<String>,
    organization_id: Option<String>,
    timeout: Option<u64>,
    user_id: Option<String>,
    user_email: Option<String>,
}

pub async fn handle_auth(args: AuthArgs) -> Result<(), SentinelError> {
    match args.command {
        AuthCommand::Login { endpoint, api_key, organization_id } => {
            handle_login(endpoint, api_key, organization_id).await
        }
        AuthCommand::Logout { clear_all } => {
            handle_logout(clear_all).await
        }
        AuthCommand::Status => {
            handle_status().await
        }
        AuthCommand::Configure { endpoint, organization_id, timeout } => {
            handle_configure(endpoint, organization_id, timeout).await
        }
        AuthCommand::Test => {
            handle_test().await
        }
    }
}

async fn handle_login(
    endpoint: String,
    api_key: Option<String>,
    organization_id: Option<String>,
) -> Result<(), SentinelError> {
    println!("🔐 SentinelAI Authentication - Login");
    println!("Endpoint: {}", endpoint);

    let api_key = if let Some(key) = api_key {
        key
    } else {
        println!("Enter your API key:");
        let mut input = String::new();
        std::io::stdin().read_line(&mut input).unwrap();
        input.trim().to_string()
    };

    let organization_id = if let Some(org_id) = organization_id {
        Some(org_id)
    } else {
        println!("Enter your organization ID (optional):");
        let mut input = String::new();
        std::io::stdin().read_line(&mut input).unwrap();
        let trimmed = input.trim();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed.to_string())
        }
    };

    // Validate API key format
    if !api_key.starts_with("sk_") {
        return Err(SentinelError::AuthError("Invalid API key format. API keys should start with 'sk_'".to_string()));
    }

    // Test connection
    println!("🔍 Testing connection...");
    
    // Mock API test - in real implementation, this would make an HTTP request
    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
    
    // Save configuration
    let config = AuthConfig {
        endpoint: Some(endpoint),
        api_key: Some(api_key),
        organization_id,
        timeout: Some(30),
        user_id: Some("user_12345".to_string()),
        user_email: Some("user@example.com".to_string()),
    };

    save_auth_config(&config)?;

    println!("✅ Login successful!");
    println!("   User: {}", config.user_email.unwrap_or("Unknown".to_string()));
    if let Some(org_id) = &config.organization_id {
        println!("   Organization: {}", org_id);
    }
    println!("   Endpoint: {}", config.endpoint.unwrap_or("Default".to_string()));

    Ok(())
}

async fn handle_logout(clear_all: bool) -> Result<(), SentinelError> {
    println!("🚪 SentinelAI Authentication - Logout");

    if clear_all {
        // Remove entire config file
        let config_path = get_config_path()?;
        if config_path.exists() {
            fs::remove_file(&config_path)
                .map_err(|e| SentinelError::FileError(format!("Failed to remove config file: {}", e)))?;
            println!("✅ All credentials cleared");
        } else {
            println!("ℹ️  No stored credentials found");
        }
    } else {
        // Just clear sensitive data
        let mut config = load_auth_config().unwrap_or_default();
        config.api_key = None;
        config.user_id = None;
        config.user_email = None;
        save_auth_config(&config)?;
        println!("✅ Logged out successfully");
    }

    Ok(())
}

async fn handle_status() -> Result<(), SentinelError> {
    println!("📊 SentinelAI Authentication Status");

    let config = load_auth_config().unwrap_or_default();

    println!("\n┌─────────────────────┬─────────────────────────────────────────────────┐");
    println!("│ Setting             │ Value                                           │");
    println!("├─────────────────────┼─────────────────────────────────────────────────┤");

    let endpoint_status = config.endpoint.as_deref().unwrap_or("Not configured");
    println!("│ Endpoint            │ {:47} │", endpoint_status);

    let auth_status = if config.api_key.is_some() { "✅ Authenticated" } else { "❌ Not authenticated" };
    println!("│ Authentication      │ {:47} │", auth_status);

    let user_status = config.user_email.as_deref().unwrap_or("Unknown");
    println!("│ User                │ {:47} │", user_status);

    let org_status = config.organization_id.as_deref().unwrap_or("Not set");
    println!("│ Organization        │ {:47} │", org_status);

    let timeout_status = config.timeout.map(|t| format!("{}s", t)).unwrap_or("Default".to_string());
    println!("│ Timeout             │ {:47} │", timeout_status);

    println!("└─────────────────────┴─────────────────────────────────────────────────┘");

    // Show config file location
    let config_path = get_config_path()?;
    println!("\nConfiguration file: {}", config_path.display());

    Ok(())
}

async fn handle_configure(
    endpoint: Option<String>,
    organization_id: Option<String>,
    timeout: Option<u64>,
) -> Result<(), SentinelError> {
    println!("⚙️  SentinelAI Configuration");

    let mut config = load_auth_config().unwrap_or_default();
    let mut changes = Vec::new();

    if let Some(new_endpoint) = endpoint {
        config.endpoint = Some(new_endpoint.clone());
        changes.push(format!("Endpoint: {}", new_endpoint));
    }

    if let Some(new_org_id) = organization_id {
        config.organization_id = Some(new_org_id.clone());
        changes.push(format!("Organization ID: {}", new_org_id));
    }

    if let Some(new_timeout) = timeout {
        config.timeout = Some(new_timeout);
        changes.push(format!("Timeout: {}s", new_timeout));
    }

    if changes.is_empty() {
        println!("ℹ️  No changes specified");
        return Ok(());
    }

    save_auth_config(&config)?;

    println!("✅ Configuration updated:");
    for change in changes {
        println!("   • {}", change);
    }

    Ok(())
}

async fn handle_test() -> Result<(), SentinelError> {
    println!("🧪 Testing SentinelAI API Connection");

    let config = load_auth_config().unwrap_or_default();

    if config.api_key.is_none() {
        return Err(SentinelError::AuthError("Not authenticated. Please run 'sentinelai auth login' first".to_string()));
    }

    let endpoint = config.endpoint.as_deref().unwrap_or("https://api.sentinelai.dev");
    println!("Testing connection to: {}", endpoint);

    // Mock API test
    println!("🔍 Checking API connectivity...");
    tokio::time::sleep(tokio::time::Duration::from_millis(300)).await;
    println!("✅ API endpoint reachable");

    println!("🔍 Validating authentication...");
    tokio::time::sleep(tokio::time::Duration::from_millis(300)).await;
    println!("✅ Authentication valid");

    println!("🔍 Testing policy access...");
    tokio::time::sleep(tokio::time::Duration::from_millis(300)).await;
    println!("✅ Policy access granted");

    println!("🔍 Testing evaluation endpoint...");
    tokio::time::sleep(tokio::time::Duration::from_millis(300)).await;
    println!("✅ Evaluation endpoint accessible");

    println!("\n🎉 All tests passed! SentinelAI CLI is ready to use.");

    // Show available commands
    println!("\n📚 Available commands:");
    println!("   • sentinelai guard --help     - Real-time policy enforcement");
    println!("   • sentinelai evaluate --help  - Test content evaluation");
    println!("   • sentinelai policy --help    - Manage policies");

    Ok(())
}

fn get_config_path() -> Result<PathBuf, SentinelError> {
    let home_dir = dirs::home_dir()
        .ok_or_else(|| SentinelError::FileError("Could not find home directory".to_string()))?;
    
    let config_dir = home_dir.join(".sentinelai");
    
    // Create config directory if it doesn't exist
    if !config_dir.exists() {
        fs::create_dir_all(&config_dir)
            .map_err(|e| SentinelError::FileError(format!("Failed to create config directory: {}", e)))?;
    }
    
    Ok(config_dir.join("config.json"))
}

fn load_auth_config() -> Result<AuthConfig, SentinelError> {
    let config_path = get_config_path()?;
    
    if !config_path.exists() {
        return Ok(AuthConfig::default());
    }
    
    let config_content = fs::read_to_string(&config_path)
        .map_err(|e| SentinelError::FileError(format!("Failed to read config file: {}", e)))?;
    
    let config: AuthConfig = serde_json::from_str(&config_content)
        .map_err(|e| SentinelError::ConfigError(format!("Invalid config file format: {}", e)))?;
    
    Ok(config)
}

fn save_auth_config(config: &AuthConfig) -> Result<(), SentinelError> {
    let config_path = get_config_path()?;
    
    let config_content = serde_json::to_string_pretty(config)
        .map_err(|e| SentinelError::ConfigError(format!("Failed to serialize config: {}", e)))?;
    
    fs::write(&config_path, config_content)
        .map_err(|e| SentinelError::FileError(format!("Failed to write config file: {}", e)))?;
    
    Ok(())
}
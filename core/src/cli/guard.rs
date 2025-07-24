use clap::Args;
use crate::config::Config;
use crate::error::Result;
use crate::proxy::LLMProxy;
use tracing::{info, error};

#[derive(Args)]
pub struct GuardCommand {
    /// Port to run the proxy server on
    #[arg(short, long, default_value = "8080")]
    port: u16,
    
    /// Host to bind to
    #[arg(long, default_value = "127.0.0.1")]
    host: String,
    
    /// Organization ID for policy enforcement
    #[arg(short, long)]
    organization: Option<String>,
    
    /// Specific policies to enforce (comma-separated)
    #[arg(short = 'P', long)]
    policies: Option<String>,
    
    /// Enable early exit optimization
    #[arg(long, default_value = "true")]
    early_exit: bool,
}

impl GuardCommand {
    pub async fn execute(&self, config: &Config) -> Result<()> {
        info!("Starting SentinelAI Guard proxy on {}:{}", self.host, self.port);
        
        let proxy = LLMProxy::new(config.clone()).await?;
        
        let policies = if let Some(policy_list) = &self.policies {
            policy_list.split(',').map(|s| s.trim().to_string()).collect()
        } else {
            Vec::new()
        };
        
        proxy.start_server(
            &self.host,
            self.port,
            self.organization.clone(),
            policies,
            self.early_exit,
        ).await?;
        
        Ok(())
    }
}
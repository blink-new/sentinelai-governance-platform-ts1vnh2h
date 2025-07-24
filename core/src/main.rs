use clap::{Parser, Subcommand};
use sentinelai_core::{
    auth::AuthManager,
    cli::{GuardCommand, EvaluateCommand, PolicyCommand, AuthCommand},
    config::Config,
    error::Result,
};
use tracing::{info, error};
use tracing_subscriber;

#[derive(Parser)]
#[command(name = "sentinelai")]
#[command(about = "SentinelAI - Real-time AI governance and policy enforcement")]
#[command(version = "0.1.0")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
    
    #[arg(short, long, global = true)]
    config: Option<String>,
    
    #[arg(short, long, global = true)]
    verbose: bool,
}

#[derive(Subcommand)]
enum Commands {
    /// Real-time policy enforcement with LLM proxy
    Guard(GuardCommand),
    /// Development testing with multiple output formats
    Evaluate(EvaluateCommand),
    /// CRUD operations for policies
    Policy(PolicyCommand),
    /// User authentication
    Auth(AuthCommand),
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();
    
    // Initialize tracing
    let subscriber = tracing_subscriber::fmt()
        .with_max_level(if cli.verbose { 
            tracing::Level::DEBUG 
        } else { 
            tracing::Level::INFO 
        })
        .finish();
    tracing::subscriber::set_global_default(subscriber)?;
    
    info!("Starting SentinelAI CLI v0.1.0");
    
    // Load configuration
    let config = Config::load(cli.config.as_deref()).await?;
    
    // Execute command
    match cli.command {
        Commands::Guard(cmd) => cmd.execute(&config).await,
        Commands::Evaluate(cmd) => cmd.execute(&config).await,
        Commands::Policy(cmd) => cmd.execute(&config).await,
        Commands::Auth(cmd) => cmd.execute(&config).await,
    }
}
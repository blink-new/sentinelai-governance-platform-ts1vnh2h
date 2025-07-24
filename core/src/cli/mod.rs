pub mod guard;
pub mod evaluate;
pub mod policy;
pub mod auth;

use clap::{Parser, Subcommand};
use crate::error::SentinelError;

#[derive(Parser)]
#[command(name = "sentinelai")]
#[command(about = "SentinelAI CLI - Real-time AI governance and policy enforcement")]
#[command(version = "1.0.0")]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Real-time policy enforcement with LLM proxy
    Guard(guard::GuardArgs),
    
    /// Evaluate content against policies
    Evaluate(evaluate::EvaluateArgs),
    
    /// Manage policies (CRUD operations)
    Policy(policy::PolicyArgs),
    
    /// Authentication and configuration
    Auth(auth::AuthArgs),
}

pub async fn run_cli() -> Result<(), SentinelError> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Guard(args) => guard::handle_guard(args).await,
        Commands::Evaluate(args) => evaluate::handle_evaluate(args).await,
        Commands::Policy(args) => policy::handle_policy(args).await,
        Commands::Auth(args) => auth::handle_auth(args).await,
    }
}
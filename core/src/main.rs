use sentinelai_core::cli::run_cli;
use tracing_subscriber;

#[tokio::main]
async fn main() {
    // Initialize logging
    tracing_subscriber::fmt::init();

    // Print banner
    println!("🛡️  SentinelAI CLI v1.0.0");
    println!("   Real-time AI governance and policy enforcement");
    println!();

    if let Err(e) = run_cli().await {
        eprintln!("❌ Error: {}", e);
        std::process::exit(1);
    }
}
use thiserror::Error;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Error, Debug)]
pub enum Error {
    #[error("Configuration error: {0}")]
    Config(String),
    
    #[error("Authentication error: {0}")]
    Auth(String),
    
    #[error("Policy error: {0}")]
    Policy(String),
    
    #[error("Evaluation error: {0}")]
    Evaluation(String),
    
    #[error("Network error: {0}")]
    Network(#[from] reqwest::Error),
    
    #[error("Database error: {0}")]
    Database(#[from] mongodb::error::Error),
    
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    
    #[error("YAML error: {0}")]
    Yaml(#[from] serde_yaml::Error),
    
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("Regex error: {0}")]
    Regex(#[from] regex::Error),
    
    #[error("Tracing error: {0}")]
    Tracing(#[from] tracing::subscriber::SetGlobalDefaultError),
    
    #[error("Generic error: {0}")]
    Generic(String),
}
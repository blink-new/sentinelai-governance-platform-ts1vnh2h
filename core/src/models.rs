use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Policy {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub policy_type: PolicyType,
    pub config: PolicyConfig,
    pub enabled: bool,
    pub organization_id: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub created_by: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum PolicyType {
    #[serde(rename = "keyword_filter")]
    KeywordFilter,
    #[serde(rename = "performance")]
    Performance,
    #[serde(rename = "content_safety")]
    ContentSafety,
    #[serde(rename = "semantic")]
    Semantic,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum PolicyConfig {
    KeywordFilter(KeywordFilterConfig),
    Performance(PerformanceConfig),
    ContentSafety(ContentSafetyConfig),
    Semantic(SemanticConfig),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeywordFilterConfig {
    pub patterns: Vec<String>,
    pub case_sensitive: bool,
    pub action: ViolationAction,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceConfig {
    pub max_response_time_ms: u64,
    pub min_quality_score: f64,
    pub max_tokens: Option<u32>,
    pub action: ViolationAction,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContentSafetyConfig {
    pub toxicity_threshold: f64,
    pub categories: Vec<String>,
    pub action: ViolationAction,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SemanticConfig {
    pub similarity_threshold: f64,
    pub reference_texts: Vec<String>,
    pub action: ViolationAction,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ViolationAction {
    #[serde(rename = "block")]
    Block,
    #[serde(rename = "warn")]
    Warn,
    #[serde(rename = "log")]
    Log,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvaluationRequest {
    pub id: String,
    pub content: String,
    pub context: Option<String>,
    pub policies: Vec<String>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvaluationResult {
    pub id: String,
    pub request_id: String,
    pub policy_id: String,
    pub policy_name: String,
    pub policy_type: PolicyType,
    pub result: PolicyResult,
    pub execution_time_ms: u64,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PolicyResult {
    Pass,
    Violation {
        severity: ViolationSeverity,
        message: String,
        confidence: f64,
        details: Option<serde_json::Value>,
    },
    Error {
        message: String,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ViolationSeverity {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub email: String,
    pub name: String,
    pub organization_id: String,
    pub role: UserRole,
    pub created_at: DateTime<Utc>,
    pub last_login: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum UserRole {
    Admin,
    Manager,
    Analyst,
    Viewer,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Organization {
    pub id: String,
    pub name: String,
    pub plan: SubscriptionPlan,
    pub usage_limits: UsageLimits,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SubscriptionPlan {
    Free,
    Pro,
    Enterprise,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageLimits {
    pub evaluations_per_month: u64,
    pub policies_limit: u32,
    pub users_limit: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatCompletionRequest {
    pub model: String,
    pub messages: Vec<ChatMessage>,
    pub temperature: Option<f64>,
    pub max_tokens: Option<u32>,
    pub stream: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatCompletionResponse {
    pub id: String,
    pub object: String,
    pub created: u64,
    pub model: String,
    pub choices: Vec<ChatChoice>,
    pub usage: Option<Usage>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatChoice {
    pub index: u32,
    pub message: ChatMessage,
    pub finish_reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Usage {
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
}
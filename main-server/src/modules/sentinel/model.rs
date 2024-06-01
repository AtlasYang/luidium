use serde::{Deserialize, Serialize};
use uuid::Uuid;

pub const AUTHORITY_CLASS_ADMIN: &str = "admin";
pub const AUTHORITY_CLASS_OWNER: &str = "owner";
pub const AUTHORITY_CLASS_COLLABORATOR: &str = "collaborator";
pub const AUTHORITY_CLASS_VIEWER: &str = "viewer";

pub const USAGE_CAP_APPLICATION_FREE_TIER: i32 = 3;
pub const USAGE_CAP_VERSION_FREE_TIER: i32 = 3;
pub const USAGE_CAP_BLOCK_FREE_TIER: i32 = 10;

pub const USAGE_CAP_APPLICATION_PRO_TIER: i32 = 1000;
pub const USAGE_CAP_VERSION_PRO_TIER: i32 = 3;
pub const USAGE_CAP_BLOCK_PRO_TIER: i32 = 20;

pub const USAGE_CAP_APPLICATION_ENTERPRISE_TIER: i32 = 10000;
pub const USAGE_CAP_VERSION_ENTERPRISE_TIER: i32 = 100;
pub const USAGE_CAP_BLOCK_ENTERPRISE_TIER: i32 = 1000;

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub name: String,
    pub tier: i32,
    pub image_url: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct SentinelBaseResponse {
    pub success: Option<bool>,
    pub error: Option<String>,
}

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct TokenResponse {
    pub session_token: Option<String>,
    pub error: Option<String>,
}

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct ValidateTokenResponse {
    pub user_id: Option<Uuid>,
    pub error: Option<String>,
}

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct UserResponse {
    pub user: Option<User>,
    pub error: Option<String>,
}

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct TokenRequest {
    pub session_token: String,
}

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct UserLoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct UserRegisterRequest {
    pub email: String,
    pub password: String,
    pub name: String,
    pub image_url: String,
}

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct UserUpdateRequest {
    pub email: String,
    pub password: String,
    pub name: String,
    pub image_url: String,
}

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct UsageCapApplication {
    pub user_id: Uuid,
    pub remaining: i32,
}

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct UsageCapVersion {
    pub user_id: Uuid,
    pub application_id: Uuid,
    pub remaining: i32,
}

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct UsageCapBlock {
    pub user_id: Uuid,
    pub application_id: Uuid,
    pub version: String,
    pub remaining: i32,
}

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct Authority {
    pub user_id: Uuid,
    pub entity_id: Uuid,
    pub class: String,
}

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct AuthorityResponse {
    pub error: Option<String>,
    pub authority: Option<Authority>,
    pub authorities: Option<Vec<Authority>>,
}

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct Log {
    user_id: Uuid,
    application_id: Uuid,
    block_id: Uuid,
    level: String,
    r#type: String,
    message: String,
    timestamp: String,
}

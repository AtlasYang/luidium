use scylla::FromRow;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Clone, Default, Debug, FromRow, Deserialize, Serialize)]
pub struct CliToken {
    pub token: String,
    pub user_id: Uuid,
}

#[derive(Clone, Default, Debug, FromRow, Deserialize, Serialize)]
pub struct RunByCliRequest {
    pub token: String,
    pub app_name: String,
    pub version: String,
    pub block_name: String,
}

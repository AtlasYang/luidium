use scylla::FromRow;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

pub const BLOCK_TYPE_STORAGE: &str = "storage";
pub const BLOCK_TYPE_DATABASE: &str = "database";
pub const BLOCK_TYPE_SERVER: &str = "server";
pub const BLOCK_TYPE_WEB: &str = "web";

pub const BLOCK_STATUS_FAILED: &str = "failed";
pub const BLOCK_STATUS_STOPPED: &str = "stopped";
pub const BLOCK_STATUS_READY: &str = "ready";
pub const BLOCK_STATUS_PENDING: &str = "pending";
pub const BLOCK_STATUS_RUNNING: &str = "running";
pub const BLOCK_STATUS_BUILDING: &str = "building";

pub const BLOCK_ACTION_BUILD: &str = "build";
pub const BLOCK_ACTION_RUN: &str = "run";
pub const BLOCK_ACTION_BUILD_AND_RUN: &str = "build_and_run";
pub const BLOCK_ACTION_STOP: &str = "stop";
pub const BLOCK_ACTION_REMOVE: &str = "remove";

#[derive(Clone, Default, Debug, FromRow, Deserialize, Serialize)]
pub struct Block {
    pub id: Uuid,
    pub application_id: Uuid,
    pub block_type: String,
    pub description: String,
    pub dns_record_id: String,
    pub external_port: i32,
    pub external_rootdomain: String,
    pub external_subdomain: String,
    pub is_active: bool,
    pub is_external: bool,
    pub name: String,
    pub status: String,
    pub version: String,
}

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct BlockCreateRequest {
    pub user_id: String,
    pub block: Block,
}

#[derive(Clone, Default, Debug, Serialize, Deserialize)]
pub struct BuilderServerRequest {
    pub user_id: String,
    pub application_id: String,
    pub block_id: String,
    pub bucket: String,
    pub version: String,
    pub block_name: String,
    pub action: String,
}

#[derive(Clone, Default, Debug, FromRow, Deserialize, Serialize)]
pub struct Port {
    pub data: i32,
    pub block_id: Option<Uuid>,
    pub is_available: bool,
}

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct CreateVolumeRequest {
    pub bucket: String,
    pub version: String,
    pub block_name: String,
}

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct CreateVolumeResponse {
    pub error: Option<String>,
    pub volume_name: Option<String>,
}

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct LuidiumConfig {
    pub block_name: String,
    pub framework: String,
    pub port_binding: String,
    pub volume_binding: String,
    pub environment_variables: Vec<String>,
    pub ignore_files: Vec<String>,
}

use scylla::FromRow;
use serde::{Deserialize, Serialize};

#[derive(Clone, Default, Debug, FromRow, Deserialize, Serialize)]
pub struct FileConfig {
    pub bucket_name: String,
    pub version: String,
    pub block_name: String,
    pub file_name: String,
}

#[derive(Clone, Default, Debug, FromRow, Deserialize, Serialize)]
pub struct BucketConfig {
    pub bucket_name: String,
}

pub const STORAGE_ACTION_CREATE_BUCKET: &str = "create-bucket";
pub const STORAGE_ACTION_LIST_OBJECT: &str = "list-object";
pub const STORAGE_ACTION_READ_OBJECT: &str = "read-object";
pub const STORAGE_ACTION_COPY_FOLDER: &str = "copy-folder";
pub const STORAGE_ACTION_DELETE_OBJECT: &str = "delete-object";
pub const STORAGE_ACTION_DELETE_FOLDER: &str = "delete-folder";
pub const STORAGE_ACTION_DELETE_FOLDER_EXCEPT_CONFIG: &str = "delete-folder-except-config";
pub const STORAGE_ACTION_DELETE_BUCKET: &str = "delete-bucket";

#[derive(Clone, Default, Debug, FromRow, Deserialize, Serialize)]
pub struct StorageRequest {
    pub action: String,
    pub bucket: String,
    pub object_key: String,
}

#[derive(Clone, Default, Debug, FromRow, Deserialize, Serialize)]
pub struct StorageResponseListObject {
    pub object_keys: Vec<String>,
}

#[derive(Clone, Default, Debug, FromRow, Deserialize, Serialize)]
pub struct StorageResponse {
    pub message: String,
}

#[derive(Clone, Default, Debug, FromRow, Deserialize, Serialize)]
pub struct StorageRequestMul {
    pub action: String,
    pub bucket: String,
    pub object_keys: Vec<String>,
    pub token: String,
}

#[derive(Clone, Default, Debug, FromRow, Deserialize, Serialize)]
pub struct CopyTemplateRequest {
    pub bucket_name: String,
    pub object_key: String,
    pub template_id: String,
}

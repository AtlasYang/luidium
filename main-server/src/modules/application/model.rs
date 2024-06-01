use scylla::FromRow;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Clone, Default, Debug, FromRow, Deserialize, Serialize)]
pub struct Application {
    pub id: Uuid,
    pub active_version: String,
    pub app_displayname: String,
    pub app_id: String,
    pub app_name: String,
    pub created_at: String,
    pub description: String,
    pub image_url: String,
    pub is_active: bool,
    pub user_id: Uuid,
    pub version_list: Vec<String>,
}

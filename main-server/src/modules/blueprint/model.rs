use scylla::FromRow;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Clone, Default, Debug, FromRow, Deserialize, Serialize)]
pub struct BlueprintNode {
    pub block_id: Uuid,
    pub application_id: Uuid,
    pub version: String,
    pub x_pos: i32,
    pub y_pos: i32,
}

#[derive(Clone, Default, Debug, FromRow, Deserialize, Serialize)]
pub struct BlueprintEdge {
    pub id: Uuid,
    pub application_id: Uuid,
    pub version: String,
    pub source_block_id: Uuid,
    pub target_block_id: Uuid,
}

#[derive(Clone, Default, Debug, FromRow, Deserialize, Serialize)]
pub struct BlueprintRequest {
    pub application_id: Uuid,
    pub version: String,
}

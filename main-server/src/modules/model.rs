use scylla::FromRow;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Clone, Default, Debug, FromRow, Deserialize, Serialize)]
pub struct SingleStringRequest {
    pub content: String,
}

#[derive(Clone, Default, Debug, FromRow, Deserialize, Serialize)]
pub struct SingleUuidRequest {
    pub content: Uuid,
}

#[derive(Clone, Default, Debug, FromRow, Deserialize, Serialize)]
pub struct SingleBoolRequest {
    pub content: bool,
}
#[derive(Clone, Default, Debug, FromRow, Deserialize, Serialize)]
pub struct SingleBoolResponse {
    pub success: bool,
}

#[derive(Clone, Default, Debug, FromRow, Deserialize, Serialize)]
pub struct SingleStringResponse {
    pub content: String,
}

#[derive(Clone, Default, Debug, FromRow, Deserialize, Serialize)]
pub struct SingleUuidResponse {
    pub content: Uuid,
}

#[derive(Clone, Default, Debug, FromRow, Deserialize, Serialize)]
pub struct SingleNumberResponse {
    pub content: i32,
}

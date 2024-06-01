use crate::modules::{
    auth::handler::UserId,
    model::{SingleBoolResponse, SingleNumberResponse},
};
use axum::{extract::Path, Extension, Json};
use reqwest::StatusCode;
use uuid::Uuid;

use super::{
    model::{Authority, Log, User},
    service::{
        create_authority, delete_authority, get_authority_by_entity, get_usage_cap_application,
        get_usage_cap_block, get_usage_cap_version, get_user_by_email, read_logs_with_user_id,
        read_logs_with_user_id_and_application_id, read_logs_with_user_id_and_block_id,
    },
};

pub async fn handle_get_authority_by_entity(
    Path(entity_id): Path<Uuid>,
) -> (StatusCode, Json<Vec<Authority>>) {
    let res = get_authority_by_entity(entity_id).await;
    match res {
        Ok(authorities) => (StatusCode::OK, Json(authorities)),
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, Json(vec![])),
    }
}

pub async fn handle_create_authority(Json(data): Json<Authority>) -> (StatusCode, Json<Authority>) {
    match create_authority(data.user_id, data.entity_id, &data.class).await {
        Ok(res) => {
            if res.error.is_some() {
                (StatusCode::INTERNAL_SERVER_ERROR, Json(data))
            } else {
                (StatusCode::OK, Json(data))
            }
        }
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, Json(data)),
    }
}

pub async fn handle_delete_authority(
    Path((user_id, entity_id)): Path<(Uuid, Uuid)>,
) -> (StatusCode, Json<SingleBoolResponse>) {
    match delete_authority(user_id, entity_id).await {
        Ok(res) => {
            if res.error.is_some() {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(SingleBoolResponse { success: false }),
                )
            } else {
                (StatusCode::OK, Json(SingleBoolResponse { success: true }))
            }
        }
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleBoolResponse { success: false }),
        ),
    }
}

pub async fn handle_get_user_by_email(Path(email): Path<String>) -> (StatusCode, Json<Vec<User>>) {
    (
        StatusCode::OK,
        Json(get_user_by_email(&email).await.unwrap_or(vec![])),
    )
}

pub async fn handle_get_log_by_user_id(
    Extension(user_id): Extension<UserId>,
) -> (StatusCode, Json<Vec<Log>>) {
    (
        StatusCode::OK,
        Json(read_logs_with_user_id(user_id.get()).await),
    )
}

pub async fn handle_get_log_by_user_id_and_application_id(
    Extension(user_id): Extension<UserId>,
    Path(application_id): Path<Uuid>,
) -> (StatusCode, Json<Vec<Log>>) {
    (
        StatusCode::OK,
        Json(read_logs_with_user_id_and_application_id(user_id.get(), application_id).await),
    )
}

pub async fn handle_get_log_by_user_id_and_block_id(
    Extension(user_id): Extension<UserId>,
    Path(block_id): Path<Uuid>,
) -> (StatusCode, Json<Vec<Log>>) {
    (
        StatusCode::OK,
        Json(read_logs_with_user_id_and_block_id(user_id.get(), block_id).await),
    )
}

pub async fn handle_get_usage_cap_application(
    Extension(user_id): Extension<UserId>,
) -> (StatusCode, Json<SingleNumberResponse>) {
    match get_usage_cap_application(user_id.get()).await {
        Ok(res) => (
            StatusCode::OK,
            Json(SingleNumberResponse {
                content: res.remaining,
            }),
        ),
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleNumberResponse { content: 0 }),
        ),
    }
}

pub async fn handle_get_usage_cap_version(
    Extension(user_id): Extension<UserId>,
    Path(application_id): Path<Uuid>,
) -> (StatusCode, Json<SingleNumberResponse>) {
    match get_usage_cap_version(user_id.get(), application_id).await {
        Ok(res) => (
            StatusCode::OK,
            Json(SingleNumberResponse {
                content: res.remaining,
            }),
        ),
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleNumberResponse { content: 0 }),
        ),
    }
}

pub async fn handle_get_usage_cap_block(
    Extension(user_id): Extension<UserId>,
    Path(application_id): Path<Uuid>,
    Path(version): Path<String>,
) -> (StatusCode, Json<SingleNumberResponse>) {
    match get_usage_cap_block(user_id.get(), application_id, &version).await {
        Ok(res) => (
            StatusCode::OK,
            Json(SingleNumberResponse {
                content: res.remaining,
            }),
        ),
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleNumberResponse { content: 0 }),
        ),
    }
}

use axum::{
    extract::{Path, State},
    Extension, Json,
};
use reqwest::StatusCode;
use uuid::Uuid;

use crate::{
    modules::{
        auth::handler::UserId,
        model::{SingleStringResponse, SingleUuidRequest},
        sentinel::{model::UserResponse, service::get_user_by_id},
    },
    AppState,
};

use super::{
    model::CliToken,
    service::{create_cli_token, delete_cli_token, get_cli_tokens_by_user_id, validate_cli_token},
};

pub async fn handle_create_cli_token(
    State(app_state): State<AppState>,
    Extension(user_id): Extension<UserId>,
) -> (StatusCode, Json<SingleStringResponse>) {
    let token = match create_cli_token(&app_state, user_id.get()).await {
        Some(token) => token,
        None => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Failed to create CLI token".to_string(),
                }),
            )
        }
    };
    (
        StatusCode::OK,
        Json(SingleStringResponse { content: token }),
    )
}

pub async fn handle_get_cli_tokens_by_user_id(
    State(app_state): State<AppState>,
    Extension(user_id): Extension<UserId>,
) -> (StatusCode, Json<Vec<CliToken>>) {
    let tokens = match get_cli_tokens_by_user_id(&app_state, user_id.get()).await {
        Some(tokens) => tokens,
        None => return (StatusCode::INTERNAL_SERVER_ERROR, Json(vec![])),
    };

    (StatusCode::OK, Json(tokens))
}

pub async fn handle_delete_cli_token(
    State(app_state): State<AppState>,
    Path(token): Path<String>,
) -> (StatusCode, Json<SingleStringResponse>) {
    match delete_cli_token(&app_state, token).await {
        true => (
            StatusCode::OK,
            Json(SingleStringResponse {
                content: "OK".to_string(),
            }),
        ),
        false => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleStringResponse {
                content: "Failed to delete CLI token".to_string(),
            }),
        ),
    }
}

pub async fn handle_validate_cli_token(
    State(app_state): State<AppState>,
    Path(token): Path<String>,
) -> (StatusCode, Json<SingleStringResponse>) {
    let token = match validate_cli_token(&app_state, token).await {
        Some(token) => token,
        None => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Invalid cli token".to_string(),
                }),
            )
        }
    };

    let user_data = match get_user_by_id(token.user_id).await {
        Ok(res) => res.user.unwrap(),
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "User information not found".to_string(),
                }),
            )
        }
    };

    (
        StatusCode::OK,
        Json(SingleStringResponse {
            content: format!("User authenticated: {}", user_data.email),
        }),
    )
}

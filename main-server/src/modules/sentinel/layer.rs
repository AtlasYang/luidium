use super::handler::{
    handle_create_authority, handle_delete_authority, handle_get_authority_by_entity,
    handle_get_log_by_user_id, handle_get_log_by_user_id_and_application_id,
    handle_get_log_by_user_id_and_block_id, handle_get_usage_cap_application,
    handle_get_usage_cap_block, handle_get_usage_cap_version, handle_get_user_by_email,
};
use crate::{modules::auth::handler::validate_user_token, AppState};
use axum::{
    middleware,
    routing::{delete, get, post},
    Router,
};

pub fn get_sentinel_layer() -> Router<AppState> {
    Router::new()
        .route("/authority/:entity_id", get(handle_get_authority_by_entity))
        .route("/authority/create", post(handle_create_authority))
        .route(
            "/authority/:user_id/:entity_id",
            delete(handle_delete_authority),
        )
        .route("/search_user/:email", get(handle_get_user_by_email))
        .route("/log", get(handle_get_log_by_user_id))
        .route(
            "/log/application/:application_id",
            get(handle_get_log_by_user_id_and_application_id),
        )
        .route(
            "/log/block/:block_id",
            get(handle_get_log_by_user_id_and_block_id),
        )
        .route("/usage_cap", get(handle_get_usage_cap_application))
        .route(
            "/usage_cap/:application_id",
            get(handle_get_usage_cap_version),
        )
        .route(
            "/usage_cap/:application_id/:version",
            get(handle_get_usage_cap_block),
        )
        .layer(middleware::from_fn(validate_user_token))
}

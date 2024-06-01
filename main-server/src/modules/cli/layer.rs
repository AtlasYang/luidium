use crate::{modules::auth::handler::validate_user_token, AppState};
use axum::{
    middleware,
    routing::{delete, get, post},
    Router,
};

use super::handler::{
    handle_create_cli_token, handle_delete_cli_token, handle_get_cli_tokens_by_user_id,
    handle_validate_cli_token,
};

pub fn get_cli_layer() -> Router<AppState> {
    Router::new()
        .route("/validate/:token", get(handle_validate_cli_token))
        .nest(
            "/",
            Router::new()
                .route("/create", post(handle_create_cli_token))
                .route("/read", get(handle_get_cli_tokens_by_user_id))
                .route("/:token", delete(handle_delete_cli_token))
                .layer(middleware::from_fn(validate_user_token)),
        )
}

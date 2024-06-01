use super::handler::{
    handle_build_and_run_block, handle_build_block, handle_create_block, handle_create_volume,
    handle_delete_block, handle_get_luidium_config, handle_read_all_blocks_by_application_id,
    handle_read_all_blocks_by_application_id_and_version, handle_read_block, handle_run_block,
    handle_run_by_cli, handle_stop_block, handle_update_block, handle_update_block_status,
};
use crate::{modules::auth::handler::validate_user_token, AppState};
use axum::{
    middleware,
    routing::{delete, get, patch, post},
    Router,
};

pub fn get_block_layer() -> Router<AppState> {
    Router::new()
        .route("/run_by_cli", post(handle_run_by_cli))
        .route("/update_status/:id", patch(handle_update_block_status))
        .nest(
            "/",
            Router::new()
                .route("/build/:id", post(handle_build_block))
                .route("/run/:id", post(handle_run_block))
                .route("/build_and_run/:id", post(handle_build_and_run_block))
                .route("/stop/:id", post(handle_stop_block))
                .route("/create", post(handle_create_block))
                .route("/:id", get(handle_read_block))
                .route(
                    "/read",
                    post(handle_read_all_blocks_by_application_id_and_version),
                )
                .route(
                    "/read/application/:application_id",
                    get(handle_read_all_blocks_by_application_id),
                )
                .route("/update", patch(handle_update_block))
                .route("/:id", delete(handle_delete_block))
                .route("/config/:id", get(handle_get_luidium_config))
                .route("/create_volume", post(handle_create_volume))
                .layer(middleware::from_fn(validate_user_token)),
        )
}

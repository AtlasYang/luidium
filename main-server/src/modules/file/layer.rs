use super::handler::{
    handle_clear_folder, handle_copy_from_template, handle_delete_folder, handle_get_all_files,
    handle_get_all_files_in_bucket, handle_read_object,
};
use crate::AppState;
use axum::{
    routing::{get, post},
    Router,
};

pub fn get_file_layer() -> Router<AppState> {
    Router::new()
        .route("/browse/:bucket_name", get(handle_get_all_files_in_bucket))
        .route(
            "/browse/:bucket_name/*object_key",
            get(handle_get_all_files),
        )
        .route("/read/:bucket_name/*object_key", get(handle_read_object))
        .route(
            "/delete_folder/:bucket_name/*object_key",
            post(handle_delete_folder),
        )
        .route(
            "/clear_folder/:bucket_name/*object_key",
            post(handle_clear_folder),
        )
        .route("/copy_template", post(handle_copy_from_template))
}

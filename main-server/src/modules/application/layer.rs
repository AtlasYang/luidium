use super::handler::{
    handle_check_app_name_duplicate, handle_create_application, handle_create_application_version,
    handle_delete_application, handle_delete_application_version,
    handle_get_application_id_by_app_name, handle_read_application_by_id,
    handle_read_applications_by_user_id, handle_update_application_active_version,
    handle_update_application_description, handle_update_application_displayname,
    handle_update_application_is_active,
};
use crate::AppState;
use axum::{
    routing::{delete, get, post},
    Router,
};

pub fn get_application_layer() -> Router<AppState> {
    Router::new()
        .route("/", get(handle_read_applications_by_user_id))
        .route("/create", post(handle_create_application))
        .route("/:id", get(handle_read_application_by_id))
        .route(
            "/update/displayname/:id",
            post(handle_update_application_displayname),
        )
        .route(
            "/update/active_version/:id",
            post(handle_update_application_active_version),
        )
        .route(
            "/create_version/:id",
            post(handle_create_application_version),
        )
        .route(
            "/delete_version/:id",
            post(handle_delete_application_version),
        )
        .route(
            "/update/is_active/:id",
            post(handle_update_application_is_active),
        )
        .route(
            "/update/description/:id",
            post(handle_update_application_description),
        )
        .route(
            "/check_appname_duplicate/:app_name",
            get(handle_check_app_name_duplicate),
        )
        .route(
            "/idfrom/:app_name",
            get(handle_get_application_id_by_app_name),
        )
        .route("/:id", delete(handle_delete_application))
}

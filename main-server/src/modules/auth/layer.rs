use crate::AppState;
use axum::{
    routing::{get, post},
    Router,
};

use super::handler::{
    handle_check_email_duplicate, handle_get_user_by_id, handle_login_user, handle_logout_user,
    handle_register_user, handle_validate_token,
};

pub fn get_auth_layer() -> Router<AppState> {
    Router::new()
        .route("/login", post(handle_login_user))
        .route("/logout", get(handle_logout_user))
        .route("/register", post(handle_register_user))
        .route("/validate", get(handle_validate_token))
        .route("/user/:id", get(handle_get_user_by_id))
        .route("/check/:email", get(handle_check_email_duplicate))
}

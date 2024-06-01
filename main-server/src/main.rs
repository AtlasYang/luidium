mod modules;
mod util;

use crate::modules::auth::handler::validate_user_token;
use axum::{http::HeaderValue, middleware, Router};
use http::header::{
    ACCEPT, ACCESS_CONTROL_ALLOW_CREDENTIALS, ACCESS_CONTROL_ALLOW_ORIGIN,
    ACCESS_CONTROL_REQUEST_HEADERS, AUTHORIZATION, CONTENT_TYPE,
};
use modules::application::layer::get_application_layer;
use modules::auth::layer::get_auth_layer;
use modules::block::layer::get_block_layer;
use modules::blueprint::layer::get_blueprint_layer;
use modules::cli::layer::get_cli_layer;
use modules::file::layer::get_file_layer;
use modules::sentinel::layer::get_sentinel_layer;
use scylla::Session;
use std::{env, sync::Arc};
use tokio::sync::Mutex;
use tower_cookies::CookieManagerLayer;
use tower_http::cors::CorsLayer;
use util::get_main_db_session;

#[derive(Clone)]
pub struct AppState {
    main_db_session: Arc<Mutex<Session>>,
}

#[tokio::main]
async fn main() {
    let main_db_session = get_main_db_session().await;
    let app_state = AppState {
        main_db_session: Arc::new(Mutex::new(main_db_session)),
    };

    let auth_layer = get_auth_layer();
    let application_layer = get_application_layer();
    let block_layer = get_block_layer();
    let blueprint_layer = get_blueprint_layer();
    let file_layer = get_file_layer();
    let sentinel_layer = get_sentinel_layer();
    let cli_layer = get_cli_layer();

    let cors_layer = CorsLayer::new()
        .allow_credentials(true)
        .allow_headers(vec![
            ACCESS_CONTROL_ALLOW_CREDENTIALS,
            ACCESS_CONTROL_ALLOW_ORIGIN,
            ACCESS_CONTROL_REQUEST_HEADERS,
            AUTHORIZATION,
            CONTENT_TYPE,
            ACCEPT,
        ])
        .allow_methods(vec![
            http::Method::GET,
            http::Method::POST,
            http::Method::PUT,
            http::Method::DELETE,
            http::Method::OPTIONS,
            http::Method::PATCH,
        ])
        .allow_origin([
            "http://localhost:3000".parse::<HeaderValue>().unwrap(),
            "https://app.luidium.com".parse::<HeaderValue>().unwrap(),
            "https://www.luidium.com".parse::<HeaderValue>().unwrap(),
            "https://luidium.com".parse::<HeaderValue>().unwrap(),
            "http://app.luidium.com".parse::<HeaderValue>().unwrap(),
            "http://www.luidium.com".parse::<HeaderValue>().unwrap(),
            "http://luidium.com".parse::<HeaderValue>().unwrap(),
        ]);

    let app = Router::new()
        .nest("/auth", auth_layer)
        .nest("/block", block_layer)
        .nest("/cli", cli_layer)
        .nest(
            "/",
            Router::new()
                .nest("/application", application_layer)
                .nest("/blueprint", blueprint_layer)
                .nest("/file", file_layer)
                .nest("/sentinel", sentinel_layer)
                .layer(middleware::from_fn(validate_user_token)),
        )
        .with_state(app_state)
        .layer(CookieManagerLayer::new())
        .layer(cors_layer);

    let uri = env::var("MAIN_SERVER_LISTEN_HOST").unwrap();
    let listener = tokio::net::TcpListener::bind(&uri).await.unwrap();
    println!("Server is running on: {}", uri);

    axum::serve(listener, app).await.unwrap();
}

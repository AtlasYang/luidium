use crate::modules::{
    model::{SingleBoolResponse, SingleStringResponse},
    sentinel::{
        model::{
            TokenRequest, User, UserLoginRequest, UserRegisterRequest,
            USAGE_CAP_APPLICATION_FREE_TIER,
        },
        service::{
            check_email_duplicate, create_usage_cap_appcliation, get_user_by_id, login_user,
            logout_user, register_user, validate_token,
        },
    },
};
use axum::{
    body::Body,
    extract::Path,
    http::{HeaderValue, Response},
    middleware::Next,
    response::IntoResponse,
    Json,
};
use reqwest::{header::SET_COOKIE, StatusCode};
use tower_cookies::{cookie::SameSite, Cookie, Cookies};
use uuid::Uuid;

// structs for extensions
#[derive(Clone)]
pub struct UserId(Uuid);
impl UserId {
    pub fn get(&self) -> Uuid {
        self.0
    }
}

pub async fn validate_user_token(
    cookies: Cookies,
    mut request: axum::extract::Request<Body>,
    next: Next,
) -> Result<axum::response::Response, StatusCode> {
    let session_token = cookies.get("session").map(|c| c.value().to_string());

    println!(
        "Session Token: {:?}",
        session_token.clone().unwrap_or_default()
    );

    let req = TokenRequest {
        session_token: session_token.unwrap_or_default(),
    };

    let valid = validate_token(req).await.unwrap();
    if valid.error.is_some() {
        return Err(StatusCode::UNAUTHORIZED);
    }
    let user_id = valid.user_id.unwrap_or_default();
    request.extensions_mut().insert(UserId(user_id));

    let response = next.run(request).await;
    Ok(response)
}

pub async fn handle_register_user(
    Json(data): Json<UserRegisterRequest>,
) -> (StatusCode, Json<SingleBoolResponse>) {
    let new_user_id: Uuid = match register_user(data).await {
        Ok(res) => res.content,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleBoolResponse { success: false }),
            );
        }
    };

    match create_usage_cap_appcliation(new_user_id, USAGE_CAP_APPLICATION_FREE_TIER).await {
        Ok(res) => {
            if res.error.is_some() {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(SingleBoolResponse { success: false }),
                );
            }
            (StatusCode::OK, Json(SingleBoolResponse { success: true }))
        }
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleBoolResponse { success: false }),
        ),
    }
}

pub async fn handle_login_user(Json(data): Json<UserLoginRequest>) -> impl IntoResponse {
    println!("Login request: {:?}", data);
    let login_res = login_user(data).await.unwrap();

    if login_res.error.is_some() {
        return Response::builder()
            .status(StatusCode::INTERNAL_SERVER_ERROR)
            .body(String::from("Wrong Credentials"))
            .unwrap();
    }

    let mut response = Response::builder()
        .status(StatusCode::OK)
        .body(String::from("OK"))
        .unwrap();

    if let Some(session_token) = login_res.session_token {
        let cookie_string = Cookie::build(Cookie::new("session", session_token))
            .path("/")
            .secure(true)
            .same_site(SameSite::None)
            .http_only(true)
            .to_string();
        response
            .headers_mut()
            .append(SET_COOKIE, HeaderValue::from_str(&cookie_string).unwrap());
    }

    response
}

pub async fn handle_logout_user(cookies: Cookies) -> impl IntoResponse {
    let session_token = cookies.get("session").map(|c| c.value().to_string());

    let req = TokenRequest {
        session_token: session_token.unwrap_or_default(),
    };

    let valid = validate_token(req).await.unwrap();

    if valid.error.is_some() {
        return Response::builder()
            .status(StatusCode::UNAUTHORIZED)
            .body(String::from("Unauthorized"))
            .unwrap();
    }

    let user_id = valid.user_id.unwrap_or_default();
    match logout_user(user_id).await {
        Ok(_) => (),
        Err(_) => {
            return Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .body(String::from("Internal Server Error"))
                .unwrap();
        }
    }

    let mut response = Response::builder()
        .status(StatusCode::OK)
        .body(String::from("OK"))
        .unwrap();

    let cookie_string = Cookie::build(Cookie::new("session", ""))
        .path("/")
        .secure(true)
        .same_site(SameSite::None)
        .http_only(true)
        .to_string();
    response
        .headers_mut()
        .append(SET_COOKIE, HeaderValue::from_str(&cookie_string).unwrap());

    response
}

pub async fn handle_validate_token(cookies: Cookies) -> (StatusCode, Json<SingleStringResponse>) {
    let sessino_token = cookies.get("session").map(|c| c.value().to_string());

    let req = TokenRequest {
        session_token: sessino_token.unwrap_or_default(),
    };

    let valid = validate_token(req).await.unwrap();

    if valid.error.is_some() {
        return (
            StatusCode::UNAUTHORIZED,
            Json(SingleStringResponse {
                content: "Unauthorized".to_string(),
            }),
        );
    }

    (
        StatusCode::OK,
        Json(SingleStringResponse {
            content: valid.user_id.unwrap_or_default().to_string(),
        }),
    )
}

pub async fn handle_get_user_by_id(Path(id): Path<Uuid>) -> (StatusCode, Json<User>) {
    let response = get_user_by_id(id).await.unwrap();
    if response.error.is_some() {
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(User::default()));
    }
    (StatusCode::OK, Json(response.user.unwrap_or_default()))
}

pub async fn handle_check_email_duplicate(
    Path(email): Path<String>,
) -> (StatusCode, Json<SingleBoolResponse>) {
    match check_email_duplicate(&email).await {
        Ok(res) => (StatusCode::OK, Json(SingleBoolResponse { success: res })),
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleBoolResponse { success: false }),
        ),
    }
}

use super::model::Application;
use super::service::{
    check_app_name_duplicate, create_application, create_application_version, delete_application,
    delete_application_version, get_application_id_by_app_id, get_application_id_by_app_name,
    read_application_by_id, read_applications_by_user_id, update_application_active_version,
    update_application_description, update_application_displayname, update_application_is_active,
};
use crate::modules::auth::handler::UserId;
use crate::modules::file::service::{create_bucket, delete_bucket};
use crate::modules::model::{
    SingleBoolRequest, SingleBoolResponse, SingleStringRequest, SingleStringResponse,
};
use crate::modules::sentinel::model::{
    AUTHORITY_CLASS_OWNER, USAGE_CAP_BLOCK_FREE_TIER, USAGE_CAP_VERSION_FREE_TIER,
};
use crate::modules::sentinel::service::{
    check_authority_writable, create_authority, create_usage_cap_block, create_usage_cap_version,
    delete_all_usage_cap, delete_authority, get_usage_cap_application, get_usage_cap_version,
    update_usage_cap_application, update_usage_cap_version,
};
use crate::AppState;
use axum::extract::State;
use axum::Extension;
use axum::{extract::Path, Json};
use reqwest::StatusCode;
use uuid::Uuid;

pub async fn handle_create_application(
    State(app_state): State<AppState>,
    Extension(user_id): Extension<UserId>,
    Json(data): Json<Application>,
) -> (StatusCode, Json<SingleStringResponse>) {
    let usage_cap = match get_usage_cap_application(user_id.get()).await {
        Ok(usage_cap) => usage_cap.remaining,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Failed to get usage cap".to_string(),
                }),
            )
        }
    };
    if usage_cap <= 0 {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleStringResponse {
                content: "Usage cap exceeded".to_string(),
            }),
        );
    }

    let res = check_app_name_duplicate(&app_state, data.app_name.clone()).await;
    if res {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleStringResponse {
                content: "Application name already exists".to_string(),
            }),
        );
    }

    match update_usage_cap_application(user_id.get(), usage_cap - 1).await {
        Ok(_) => (),
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Failed to update usage cap".to_string(),
                }),
            )
        }
    }

    let mut payload = data.clone();
    payload.user_id = user_id.get();
    let new_application_id = create_application(&app_state, payload.clone()).await;
    if new_application_id.is_empty() {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleStringResponse {
                content: "Failed to create application".to_string(),
            }),
        );
    }

    match create_authority(
        user_id.get(),
        Uuid::parse_str(&new_application_id).unwrap(),
        AUTHORITY_CLASS_OWNER,
    )
    .await
    {
        Ok(res) => {
            if res.error.is_some() {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(SingleStringResponse {
                        content: "Failed to create authority".to_string(),
                    }),
                );
            }
        }
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Failed to create authority".to_string(),
                }),
            )
        }
    }

    match create_usage_cap_version(
        user_id.get(),
        Uuid::parse_str(&new_application_id).unwrap(),
        USAGE_CAP_VERSION_FREE_TIER - 1,
    )
    .await
    {
        Ok(res) => {
            if res.error.is_some() {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(SingleStringResponse {
                        content: "Failed to create usage cap version".to_string(),
                    }),
                );
            }
        }
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Failed to create usage cap version".to_string(),
                }),
            )
        }
    }

    match create_usage_cap_block(
        user_id.get(),
        Uuid::parse_str(&new_application_id).unwrap(),
        &payload.active_version,
        USAGE_CAP_BLOCK_FREE_TIER,
    )
    .await
    {
        Ok(res) => {
            if res.error.is_some() {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(SingleStringResponse {
                        content: "Failed to create usage cap block".to_string(),
                    }),
                );
            }
        }
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Failed to create usage cap block".to_string(),
                }),
            )
        }
    }

    match create_bucket(payload.app_name).await {
        true => (),
        false => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Failed to create bucket".to_string(),
                }),
            )
        }
    }

    (
        StatusCode::OK,
        Json(SingleStringResponse {
            content: new_application_id,
        }),
    )
}

pub async fn handle_read_applications_by_user_id(
    State(app_state): State<AppState>,
    Extension(user_id): Extension<UserId>,
) -> (StatusCode, Json<Vec<Application>>) {
    match read_applications_by_user_id(&app_state, user_id.get()).await {
        Some(applications) => (StatusCode::OK, Json(applications)),
        None => (StatusCode::OK, Json(vec![])),
    }
}

pub async fn handle_read_application_by_id(
    State(app_state): State<AppState>,
    Path(id): Path<Uuid>,
) -> (StatusCode, Json<Application>) {
    match read_application_by_id(&app_state, id).await {
        Some(application) => (StatusCode::OK, Json(application)),
        None => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(Application::default()),
        ),
    }
}

pub async fn handle_update_application_displayname(
    State(app_state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(data): Json<SingleStringRequest>,
) -> (StatusCode, Json<SingleBoolResponse>) {
    match update_application_displayname(&app_state, id, data.content).await {
        true => (StatusCode::OK, Json(SingleBoolResponse { success: true })),
        false => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleBoolResponse { success: false }),
        ),
    }
}

pub async fn handle_create_application_version(
    State(app_state): State<AppState>,
    Extension(user_id): Extension<UserId>,
    Path(id): Path<Uuid>,
    Json(data): Json<SingleStringRequest>,
) -> (StatusCode, Json<SingleStringResponse>) {
    let usage_cap = match get_usage_cap_version(user_id.get(), id).await {
        Ok(usage_cap) => usage_cap.remaining,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Failed to get usage cap".to_string(),
                }),
            );
        }
    };

    if usage_cap <= 0 {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleStringResponse {
                content: "Usage cap exceeded".to_string(),
            }),
        );
    }

    match update_usage_cap_version(user_id.get(), id, usage_cap - 1).await {
        Ok(_) => (),
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Failed to update usage cap".to_string(),
                }),
            );
        }
    }

    match create_usage_cap_block(user_id.get(), id, &data.content, USAGE_CAP_BLOCK_FREE_TIER).await
    {
        Ok(res) => {
            if res.error.is_some() {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(SingleStringResponse {
                        content: "Failed to create usage cap for block".to_string(),
                    }),
                );
            }
        }
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Failed to create usage cap for block".to_string(),
                }),
            );
        }
    }

    match create_application_version(&app_state, id, data.content).await {
        true => (
            StatusCode::OK,
            Json(SingleStringResponse {
                content: "Created application version".to_string(),
            }),
        ),
        false => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleStringResponse {
                content: "Failed to create application version".to_string(),
            }),
        ),
    }
}

pub async fn handle_delete_application_version(
    State(app_state): State<AppState>,
    Extension(user_id): Extension<UserId>,
    Path(id): Path<Uuid>,
    Json(data): Json<SingleStringRequest>,
) -> (StatusCode, Json<SingleStringResponse>) {
    let usage_cap = match get_usage_cap_version(user_id.get(), id).await {
        Ok(usage_cap) => usage_cap.remaining,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Failed to get usage cap".to_string(),
                }),
            );
        }
    };

    match update_usage_cap_version(user_id.get(), id, usage_cap + 1).await {
        Ok(_) => (),
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Failed to update usage cap".to_string(),
                }),
            );
        }
    }

    match delete_application_version(&app_state, id, data.content).await {
        true => (
            StatusCode::OK,
            Json(SingleStringResponse {
                content: "Deleted application version".to_string(),
            }),
        ),
        false => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleStringResponse {
                content: "Failed to delete application version".to_string(),
            }),
        ),
    }
}

pub async fn handle_update_application_active_version(
    State(app_state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(data): Json<SingleStringRequest>,
) -> (StatusCode, Json<SingleBoolResponse>) {
    match update_application_active_version(&app_state, id, data.content).await {
        true => (StatusCode::OK, Json(SingleBoolResponse { success: true })),
        false => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleBoolResponse { success: false }),
        ),
    }
}

pub async fn handle_update_application_is_active(
    State(app_state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(data): Json<SingleBoolRequest>,
) -> (StatusCode, Json<SingleBoolResponse>) {
    match update_application_is_active(&app_state, id, data.content).await {
        true => (StatusCode::OK, Json(SingleBoolResponse { success: true })),
        false => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleBoolResponse { success: false }),
        ),
    }
}

pub async fn handle_update_application_description(
    State(app_state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(data): Json<SingleStringRequest>,
) -> (StatusCode, Json<SingleBoolResponse>) {
    match update_application_description(&app_state, id, data.content).await {
        true => (StatusCode::OK, Json(SingleBoolResponse { success: true })),
        false => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleBoolResponse { success: false }),
        ),
    }
}

pub async fn handle_check_app_name_duplicate(
    State(app_state): State<AppState>,
    Path(app_name): Path<String>,
) -> (StatusCode, Json<SingleBoolResponse>) {
    (
        StatusCode::OK,
        Json(SingleBoolResponse {
            success: check_app_name_duplicate(&app_state, app_name).await,
        }),
    )
}

pub async fn handle_get_application_id_by_app_name(
    State(app_state): State<AppState>,
    Extension(user_id): Extension<UserId>,
    Path(app_name): Path<String>,
) -> (StatusCode, Json<SingleStringResponse>) {
    match get_application_id_by_app_name(&app_state, app_name).await {
        Some(id) => {
            match check_authority_writable(&app_state, user_id.get(), id).await {
                Ok(res) => {
                    if !res {
                        return (
                            StatusCode::INTERNAL_SERVER_ERROR,
                            Json(SingleStringResponse {
                                content: "Forbidden access".to_string(),
                            }),
                        );
                    }
                }
                Err(_) => {
                    return (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(SingleStringResponse {
                            content: "Failed to check authority".to_string(),
                        }),
                    )
                }
            }
            (
                StatusCode::OK,
                Json(SingleStringResponse {
                    content: id.to_string(),
                }),
            )
        }
        None => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleStringResponse {
                content: "".to_string(),
            }),
        ),
    }
}

pub async fn handle_delete_application(
    State(app_state): State<AppState>,
    Extension(user_id): Extension<UserId>,
    Path(id): Path<Uuid>,
) -> (StatusCode, Json<SingleStringResponse>) {
    match check_authority_writable(&app_state, user_id.get(), id).await {
        Ok(res) => {
            if !res {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(SingleStringResponse {
                        content: "Forbidden access".to_string(),
                    }),
                );
            }
        }
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Failed to check authority".to_string(),
                }),
            )
        }
    }

    let usage_cap = match get_usage_cap_application(user_id.get()).await {
        Ok(usage_cap) => usage_cap.remaining,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Failed to get usage cap".to_string(),
                }),
            )
        }
    };

    match update_usage_cap_application(user_id.get(), usage_cap + 1).await {
        Ok(_) => (),
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Failed to update usage cap".to_string(),
                }),
            )
        }
    }

    match delete_authority(user_id.get(), id).await {
        Ok(res) => {
            if res.error.is_some() {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(SingleStringResponse {
                        content: "Failed to delete authority".to_string(),
                    }),
                );
            }
        }
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Failed to delete authority".to_string(),
                }),
            )
        }
    }

    match delete_all_usage_cap(user_id.get()).await {
        Ok(res) => {
            if res.error.is_some() {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(SingleStringResponse {
                        content: "Failed to delete usage cap".to_string(),
                    }),
                );
            }
        }
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Failed to delete usage cap".to_string(),
                }),
            )
        }
    }

    let application_data = match read_application_by_id(&app_state, id).await {
        Some(application_data) => application_data,
        None => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Failed to read application".to_string(),
                }),
            )
        }
    };

    let res = delete_application(&app_state, id).await;
    if !res {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleStringResponse {
                content: "Failed to delete application".to_string(),
            }),
        );
    }

    match delete_bucket(application_data.app_name).await {
        true => (),
        false => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Failed to delete bucket".to_string(),
                }),
            )
        }
    }

    (
        StatusCode::OK,
        Json(SingleStringResponse {
            content: "Deleted application".to_string(),
        }),
    )
}

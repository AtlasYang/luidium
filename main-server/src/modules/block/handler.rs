use super::{
    model::{
        Block, BuilderServerRequest, CreateVolumeRequest, LuidiumConfig, BLOCK_ACTION_BUILD,
        BLOCK_ACTION_BUILD_AND_RUN, BLOCK_ACTION_REMOVE, BLOCK_ACTION_RUN, BLOCK_ACTION_STOP,
        BLOCK_STATUS_PENDING, BLOCK_STATUS_READY, BLOCK_TYPE_WEB,
    },
    service::{
        check_block_name_duplicate, check_block_name_duplicate_strict, create_block, delete_block,
        generate_nginx_conf_block_name, produce_builder_server_request,
        read_all_blocks_by_application_id, read_all_blocks_by_application_id_and_version,
        read_block, read_block_by_version_and_name, update_block, update_block_status,
    },
};
use crate::{
    modules::{
        application::service::{
            get_application_id_by_app_name, read_application_by_id, update_application_is_active,
        },
        auth::handler::UserId,
        block::{
            model::{BLOCK_TYPE_DATABASE, BLOCK_TYPE_STORAGE},
            service::create_volume,
        },
        blueprint::model::BlueprintRequest,
        cli::{model::RunByCliRequest, service::validate_cli_token},
        file::service::{delete_folder, read_object_to_string},
        model::{SingleBoolResponse, SingleStringResponse},
        sentinel::{
            model::AUTHORITY_CLASS_OWNER,
            service::{
                check_authority_writable, create_authority, delete_authority, get_usage_cap_block,
                update_usage_cap_block,
            },
        },
    },
    util::{
        create_dns_record, generate_nginx_conf, remove_dns_record, remove_nginx_conf, DnsDomain,
    },
    AppState,
};
use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Extension, Json,
};
use reqwest::StatusCode;
use tracing_subscriber::fmt::format;
use uuid::Uuid;

pub async fn handle_build_block(
    State(app_state): State<AppState>,
    Extension(user_id): Extension<UserId>,
    Path(id): Path<Uuid>,
) -> (StatusCode, Json<SingleBoolResponse>) {
    match check_authority_writable(&app_state, user_id.get(), id).await {
        Ok(res) => {
            if res {
                ()
            } else {
                println!("Authority is not writable");
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(SingleBoolResponse { success: false }),
                );
            }
        }
        Err(_) => {
            println!("Error checking authority");
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleBoolResponse { success: false }),
            );
        }
    }

    match update_block_status(&app_state, id, BLOCK_STATUS_PENDING.to_string()).await {
        true => (),
        false => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleBoolResponse { success: false }),
            );
        }
    }

    let block_data = read_block(&app_state, id).await.unwrap();
    let application_data = read_application_by_id(&app_state, block_data.application_id)
        .await
        .unwrap();

    let payload = BuilderServerRequest {
        user_id: user_id.get().to_string(),
        application_id: application_data.id.to_string(),
        block_id: block_data.id.to_string(),
        bucket: application_data.app_name,
        version: block_data.version,
        block_name: block_data.name,
        action: String::from(BLOCK_ACTION_BUILD),
    };

    (
        StatusCode::OK,
        Json(SingleBoolResponse {
            success: produce_builder_server_request(payload).await,
        }),
    )
}

pub async fn handle_run_block(
    State(app_state): State<AppState>,
    Extension(user_id): Extension<UserId>,
    Path(id): Path<Uuid>,
) -> (StatusCode, Json<SingleBoolResponse>) {
    match check_authority_writable(&app_state, user_id.get(), id).await {
        Ok(res) => {
            if res {
                ()
            } else {
                println!("Authority is not writable");
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(SingleBoolResponse { success: false }),
                );
            }
        }
        Err(_) => {
            println!("Error checking authority");
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleBoolResponse { success: false }),
            );
        }
    }

    match update_block_status(&app_state, id, BLOCK_STATUS_PENDING.to_string()).await {
        true => (),
        false => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleBoolResponse { success: false }),
            );
        }
    }

    let block_data = read_block(&app_state, id).await.unwrap();
    let application_data = read_application_by_id(&app_state, block_data.application_id)
        .await
        .unwrap();

    let payload = BuilderServerRequest {
        user_id: user_id.get().to_string(),
        application_id: application_data.id.to_string(),
        block_id: block_data.id.to_string(),
        bucket: application_data.app_name,
        version: block_data.version,
        block_name: block_data.name,
        action: String::from(BLOCK_ACTION_RUN),
    };

    (
        StatusCode::OK,
        Json(SingleBoolResponse {
            success: produce_builder_server_request(payload).await,
        }),
    )
}

pub async fn handle_build_and_run_block(
    State(app_state): State<AppState>,
    Extension(user_id): Extension<UserId>,
    Path(id): Path<Uuid>,
) -> (StatusCode, Json<SingleBoolResponse>) {
    match check_authority_writable(&app_state, user_id.get(), id).await {
        Ok(res) => {
            if res {
                ()
            } else {
                println!("Authority is not writable");
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(SingleBoolResponse { success: false }),
                );
            }
        }
        Err(_) => {
            println!("Error checking authority");
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleBoolResponse { success: false }),
            );
        }
    }

    match update_block_status(&app_state, id, BLOCK_STATUS_PENDING.to_string()).await {
        true => (),
        false => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleBoolResponse { success: false }),
            );
        }
    }

    let block_data = read_block(&app_state, id).await.unwrap();
    let application_data = read_application_by_id(&app_state, block_data.application_id)
        .await
        .unwrap();

    let payload = BuilderServerRequest {
        user_id: user_id.get().to_string(),
        application_id: application_data.id.to_string(),
        block_id: block_data.id.to_string(),
        bucket: application_data.app_name,
        version: block_data.version,
        block_name: block_data.name,
        action: String::from(BLOCK_ACTION_BUILD_AND_RUN),
    };

    (
        StatusCode::OK,
        Json(SingleBoolResponse {
            success: produce_builder_server_request(payload).await,
        }),
    )
}

pub async fn handle_stop_block(
    State(app_state): State<AppState>,
    Extension(user_id): Extension<UserId>,
    Path(id): Path<Uuid>,
) -> (StatusCode, Json<SingleBoolResponse>) {
    match check_authority_writable(&app_state, user_id.get(), id).await {
        Ok(res) => {
            if res {
                ()
            } else {
                println!("Authority is not writable");
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(SingleBoolResponse { success: false }),
                );
            }
        }
        Err(_) => {
            println!("Error checking authority");
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleBoolResponse { success: false }),
            );
        }
    }

    let block_data = read_block(&app_state, id).await.unwrap();
    let application_data = read_application_by_id(&app_state, block_data.application_id)
        .await
        .unwrap();

    let payload = BuilderServerRequest {
        user_id: user_id.get().to_string(),
        application_id: application_data.id.to_string(),
        block_id: block_data.id.to_string(),
        bucket: application_data.app_name,
        version: block_data.version,
        block_name: block_data.name,
        action: String::from(BLOCK_ACTION_STOP),
    };

    (
        StatusCode::OK,
        Json(SingleBoolResponse {
            success: produce_builder_server_request(payload).await,
        }),
    )
}

pub async fn handle_run_by_cli(
    State(app_state): State<AppState>,
    Json(data): Json<RunByCliRequest>,
) -> (StatusCode, Json<SingleStringResponse>) {
    let token_data = match validate_cli_token(&app_state, data.token).await {
        Some(data) => data,
        None => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Invalid token".to_string(),
                }),
            );
        }
    };

    let application_id = match get_application_id_by_app_name(&app_state, data.app_name).await {
        Some(id) => id,
        None => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Application not found".to_string(),
                }),
            );
        }
    };

    let block_data = match read_block_by_version_and_name(
        &app_state,
        application_id,
        data.version,
        data.block_name,
    )
    .await
    {
        Some(data) => data,
        None => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Block not found".to_string(),
                }),
            );
        }
    };

    match check_authority_writable(&app_state, token_data.user_id, block_data.id).await {
        Ok(res) => {
            if res {
                ()
            } else {
                println!("Authority is not writable");
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(SingleStringResponse {
                        content: "You do not have permission to run this block".to_string(),
                    }),
                );
            }
        }
        Err(_) => {
            println!("Error checking authority");
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Error checking authority".to_string(),
                }),
            );
        }
    }

    let application_data = read_application_by_id(&app_state, block_data.application_id)
        .await
        .unwrap();

    let payload = BuilderServerRequest {
        user_id: token_data.user_id.to_string(),
        application_id: application_data.id.to_string(),
        block_id: block_data.id.to_string(),
        bucket: application_data.app_name,
        version: block_data.version,
        block_name: block_data.name,
        action: String::from(BLOCK_ACTION_BUILD_AND_RUN),
    };

    produce_builder_server_request(payload).await;

    (
        StatusCode::OK,
        Json(SingleStringResponse {
            content: "Block is being built and run".to_string(),
        }),
    )
}

pub async fn handle_create_block(
    State(app_state): State<AppState>,
    Extension(user_id): Extension<UserId>,
    Json(data): Json<Block>,
) -> (StatusCode, Json<SingleStringResponse>) {
    // check authority for application
    match check_authority_writable(&app_state, user_id.get(), data.application_id).await {
        Ok(res) => {
            if res {
                ()
            } else {
                println!("Authority is not writable");
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(SingleStringResponse {
                        content: "Authority is not writable".to_string(),
                    }),
                );
            }
        }
        Err(_) => {
            println!("Error checking authority");
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Error checking authority".to_string(),
                }),
            );
        }
    }

    // check remaining usage cap
    let usage_cap: i32 =
        match get_usage_cap_block(user_id.get(), data.application_id, &data.version).await {
            Ok(cap) => cap.remaining,
            Err(_) => {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(SingleStringResponse {
                        content: "Error checking usage cap".to_string(),
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
    // check block name duplicate, if type is web, it should not be duplicated in the same application no matter the version
    let res = match data.block_type.as_str() {
        BLOCK_TYPE_WEB => {
            check_block_name_duplicate_strict(&app_state, data.application_id, data.name.clone())
                .await
        }
        _ => {
            check_block_name_duplicate(
                &app_state,
                data.application_id,
                data.version.clone(),
                data.name.clone(),
            )
            .await
        }
    };

    if res {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleStringResponse {
                content: "Block name already exists".to_string(),
            }),
        );
    }

    match update_usage_cap_block(
        user_id.get(),
        data.application_id,
        &data.version,
        usage_cap - 1,
    )
    .await
    {
        Ok(_) => (),
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Error updating usage cap".to_string(),
                }),
            );
        }
    }
    let application_data = read_application_by_id(&app_state, data.application_id)
        .await
        .unwrap();
    let nginx_conf_block_name = generate_nginx_conf_block_name(
        &application_data.app_name,
        &data.name,
        &data.version,
        &data.block_type,
    );

    let subdomain = match data.external_subdomain.as_str() {
        "" => nginx_conf_block_name.clone(),
        _ => {
            if application_data.is_active == false {
                update_application_is_active(&app_state, data.application_id, true).await;
                data.external_subdomain.clone()
            } else {
                nginx_conf_block_name.clone()
            }
        }
    };

    let dns_record_id = match create_dns_record(
        DnsDomain {
            use_defalt: true,
            default_domain_index: Some(1),
            custom_zone_id: None,
            custom_cloudflare_token: None,
            custom_domain: None,
        },
        subdomain.clone(),
    )
    .await
    {
        Ok(res) => res,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Error creating DNS record".to_string(),
                }),
            )
        }
    };

    println!("DNS Record ID: {}", dns_record_id);

    let mut payload = data.clone();
    payload.status = BLOCK_STATUS_READY.to_string();
    payload.dns_record_id = dns_record_id;
    payload.external_subdomain = subdomain.clone();
    let (new_block_id, assigned_port) = create_block(&app_state, payload).await;

    generate_nginx_conf(
        &subdomain,
        assigned_port.to_string().as_str(),
        &nginx_conf_block_name,
        1,
    );

    if new_block_id.is_empty() {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleStringResponse {
                content: "Error creating block".to_string(),
            }),
        );
    }

    match create_authority(
        user_id.get(),
        Uuid::parse_str(&new_block_id).unwrap(),
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

    (
        StatusCode::OK,
        Json(SingleStringResponse {
            content: new_block_id,
        }),
    )
}

pub async fn handle_read_all_blocks_by_application_id_and_version(
    State(app_state): State<AppState>,
    Json(data): Json<BlueprintRequest>,
) -> (StatusCode, Json<Vec<Block>>) {
    match read_all_blocks_by_application_id_and_version(
        &app_state,
        data.application_id,
        data.version,
    )
    .await
    {
        Some(blocks) => (StatusCode::OK, Json(blocks)),
        None => (StatusCode::OK, Json(vec![])),
    }
}

pub async fn handle_read_all_blocks_by_application_id(
    State(app_state): State<AppState>,
    Path(application_id): Path<Uuid>,
) -> (StatusCode, Json<Vec<Block>>) {
    match read_all_blocks_by_application_id(&app_state, application_id).await {
        Some(blocks) => (StatusCode::OK, Json(blocks)),
        None => (StatusCode::OK, Json(vec![])),
    }
}

pub async fn handle_read_block(
    State(app_state): State<AppState>,
    Path(id): Path<Uuid>,
) -> (StatusCode, Json<Block>) {
    match read_block(&app_state, id).await {
        Some(block) => (StatusCode::OK, Json(block)),
        None => (StatusCode::INTERNAL_SERVER_ERROR, Json(Block::default())),
    }
}

pub async fn handle_update_block(
    State(app_state): State<AppState>,
    Json(data): Json<Block>,
) -> (StatusCode, Json<SingleBoolResponse>) {
    match update_block(&app_state, data).await {
        true => (StatusCode::OK, Json(SingleBoolResponse { success: true })),
        false => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleBoolResponse { success: false }),
        ),
    }
}

pub async fn handle_update_block_status(
    State(app_state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(data): Json<SingleStringResponse>,
) -> (StatusCode, Json<SingleBoolResponse>) {
    match update_block_status(&app_state, id, data.content).await {
        true => (StatusCode::OK, Json(SingleBoolResponse { success: true })),
        false => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleBoolResponse { success: false }),
        ),
    }
}

pub async fn handle_delete_block(
    State(app_state): State<AppState>,
    Extension(user_id): Extension<UserId>,
    Path(id): Path<Uuid>,
) -> (StatusCode, Json<SingleStringResponse>) {
    match check_authority_writable(&app_state, user_id.get(), id).await {
        Ok(res) => {
            if res {
                ()
            } else {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(SingleStringResponse {
                        content: "Authority is not writable".to_string(),
                    }),
                );
            }
        }
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Error checking authority".to_string(),
                }),
            );
        }
    }

    let block_data = match read_block(&app_state, id).await {
        Some(data) => data,
        None => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Block not found".to_string(),
                }),
            );
        }
    };

    let application_data = read_application_by_id(&app_state, block_data.application_id)
        .await
        .unwrap();
    let nginx_conf_block_name = generate_nginx_conf_block_name(
        &application_data.app_name,
        &block_data.name,
        &block_data.version,
        &block_data.block_type,
    );

    if block_data.external_subdomain == application_data.app_name {
        update_application_is_active(&app_state, block_data.application_id, false).await;
    }

    remove_nginx_conf(&nginx_conf_block_name, 1);
    // remove_dns_record(
    //     DnsDomain {
    //         use_defalt: true,
    //         default_domain_index: Some(1),
    //         custom_zone_id: None,
    //         custom_cloudflare_token: None,
    //         custom_domain: None,
    //     },
    //     block_data.dns_record_id,
    // )
    // .await;

    let payload = BuilderServerRequest {
        user_id: user_id.get().to_string(),
        application_id: application_data.id.to_string(),
        block_id: block_data.id.to_string(),
        bucket: application_data.app_name.clone(),
        version: block_data.version.clone(),
        block_name: block_data.name.clone(),
        action: String::from(BLOCK_ACTION_REMOVE),
    };

    produce_builder_server_request(payload).await;

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

    let usage_cap = match get_usage_cap_block(
        user_id.get(),
        block_data.application_id,
        &block_data.version,
    )
    .await
    {
        Ok(cap) => cap.remaining,
        Err(e) => {
            println!("Error checking usage cap: {}", e.to_string());
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Error checking usage cap".to_string(),
                }),
            );
        }
    };

    match update_usage_cap_block(
        user_id.get(),
        block_data.application_id,
        &block_data.version,
        usage_cap + 1,
    )
    .await
    {
        Ok(_) => (),
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Error updating usage cap".to_string(),
                }),
            );
        }
    }

    delete_folder(
        application_data.app_name,
        format!("{}/{}", block_data.version, block_data.name),
        false,
    )
    .await;

    match delete_block(&app_state, id).await {
        true => (),
        false => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SingleStringResponse {
                    content: "Error deleting block".to_string(),
                }),
            );
        }
    }

    remove_dns_record(
        DnsDomain {
            use_defalt: true,
            default_domain_index: Some(1),
            custom_zone_id: None,
            custom_cloudflare_token: None,
            custom_domain: None,
        },
        block_data.dns_record_id,
    )
    .await;

    (
        StatusCode::OK,
        Json(SingleStringResponse {
            content: "Block deleted".to_string(),
        }),
    )
}

pub async fn handle_get_luidium_config(
    State(app_state): State<AppState>,
    Extension(user_id): Extension<UserId>,
    Path(id): Path<Uuid>,
) -> (StatusCode, Json<Option<LuidiumConfig>>) {
    let block_data = match read_block(&app_state, id).await {
        Some(data) => data,
        None => {
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(None));
        }
    };

    let application_data = match read_application_by_id(&app_state, block_data.application_id).await
    {
        Some(data) => data,
        None => {
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(None));
        }
    };

    let config_path = format!(
        "{}/{}/luidium-config.json",
        block_data.version, block_data.name
    );

    let config = match serde_json::from_str::<LuidiumConfig>(
        &read_object_to_string(application_data.app_name, config_path).await,
    ) {
        Ok(x) => x,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(None)),
    };

    (StatusCode::OK, Json(Some(config)))
}

pub async fn handle_create_volume(
    Json(data): Json<CreateVolumeRequest>,
) -> (StatusCode, Json<SingleStringResponse>) {
    match create_volume(data.bucket, data.version, data.block_name).await {
        Some(name) => (StatusCode::OK, Json(SingleStringResponse { content: name })),
        None => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleStringResponse {
                content: "Error creating volume".to_string(),
            }),
        ),
    }
}

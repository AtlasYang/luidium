use axum::{
    extract::{Path, State},
    Json,
};
use reqwest::StatusCode;
use uuid::Uuid;

use crate::{modules::model::SingleBoolResponse, AppState};

use super::{
    model::{BlueprintEdge, BlueprintNode, BlueprintRequest},
    service::{
        create_blueprint_edge, create_blueprint_node, delete_blueprint_edge, delete_blueprint_node,
        read_all_blueprint_edges, read_all_blueprint_nodes, update_blueprint_node_pos,
    },
};

pub async fn handle_create_blueprint_node(
    State(app_state): State<AppState>,
    Json(data): Json<BlueprintNode>,
) -> (StatusCode, Json<SingleBoolResponse>) {
    match create_blueprint_node(&app_state, data).await {
        true => (StatusCode::OK, Json(SingleBoolResponse { success: true })),
        false => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleBoolResponse { success: false }),
        ),
    }
}

pub async fn handle_read_all_blueprint_nodes(
    State(app_state): State<AppState>,
    Json(data): Json<BlueprintRequest>,
) -> (StatusCode, Json<Vec<BlueprintNode>>) {
    match read_all_blueprint_nodes(&app_state, data.application_id, data.version).await {
        Some(nodes) => (StatusCode::OK, Json(nodes)),
        None => (StatusCode::INTERNAL_SERVER_ERROR, Json(vec![])),
    }
}

pub async fn handle_update_blueprint_node_pos(
    State(app_state): State<AppState>,
    Json(data): Json<BlueprintNode>,
) -> (StatusCode, Json<SingleBoolResponse>) {
    match update_blueprint_node_pos(&app_state, data).await {
        true => (StatusCode::OK, Json(SingleBoolResponse { success: true })),
        false => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleBoolResponse { success: false }),
        ),
    }
}

pub async fn handle_delete_blueprint_node(
    State(app_state): State<AppState>,
    Path(id): Path<Uuid>,
) -> (StatusCode, Json<SingleBoolResponse>) {
    match delete_blueprint_node(&app_state, id).await {
        true => (StatusCode::OK, Json(SingleBoolResponse { success: true })),
        false => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleBoolResponse { success: false }),
        ),
    }
}

pub async fn handle_create_blueprint_edge(
    State(app_state): State<AppState>,
    Json(data): Json<BlueprintEdge>,
) -> (StatusCode, Json<SingleBoolResponse>) {
    match create_blueprint_edge(&app_state, data).await {
        true => (StatusCode::OK, Json(SingleBoolResponse { success: true })),
        false => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleBoolResponse { success: false }),
        ),
    }
}

pub async fn handle_read_all_blueprint_edges(
    State(app_state): State<AppState>,
    Json(data): Json<BlueprintRequest>,
) -> (StatusCode, Json<Vec<BlueprintEdge>>) {
    match read_all_blueprint_edges(&app_state, data.application_id, data.version).await {
        Some(edges) => (StatusCode::OK, Json(edges)),
        None => (StatusCode::INTERNAL_SERVER_ERROR, Json(vec![])),
    }
}

pub async fn handle_delete_blueprint_edge(
    State(app_state): State<AppState>,
    Path(id): Path<Uuid>,
) -> (StatusCode, Json<SingleBoolResponse>) {
    match delete_blueprint_edge(&app_state, id).await {
        true => (StatusCode::OK, Json(SingleBoolResponse { success: true })),
        false => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleBoolResponse { success: false }),
        ),
    }
}

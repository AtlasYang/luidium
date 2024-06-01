use crate::modules::model::{SingleBoolResponse, SingleStringResponse};

use super::{
    model::{CopyTemplateRequest, FileConfig},
    service::{
        copy_from_template, delete_folder, get_all_files_in_bucket_by_object_key,
        read_object_to_string,
    },
};
use axum::{extract::Path, Json};
use reqwest::StatusCode;

pub async fn handle_get_all_files_in_bucket(
    Path(bucket_name): Path<String>,
) -> (StatusCode, Json<Vec<FileConfig>>) {
    (
        StatusCode::OK,
        Json(get_all_files_in_bucket_by_object_key(bucket_name, "".to_string()).await),
    )
}

pub async fn handle_get_all_files(
    Path((bucket_name, object_key)): Path<(String, String)>,
) -> (StatusCode, Json<Vec<FileConfig>>) {
    (
        StatusCode::OK,
        Json(get_all_files_in_bucket_by_object_key(bucket_name, object_key).await),
    )
}

pub async fn handle_delete_folder(
    Path((bucket_name, object_key)): Path<(String, String)>,
) -> (StatusCode, Json<SingleBoolResponse>) {
    match delete_folder(bucket_name, object_key, false).await {
        true => (StatusCode::OK, Json(SingleBoolResponse { success: true })),
        false => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleBoolResponse { success: false }),
        ),
    }
}

pub async fn handle_clear_folder(
    Path((bucket_name, object_key)): Path<(String, String)>,
) -> (StatusCode, Json<SingleBoolResponse>) {
    match delete_folder(bucket_name, object_key, true).await {
        true => (StatusCode::OK, Json(SingleBoolResponse { success: true })),
        false => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(SingleBoolResponse { success: false }),
        ),
    }
}

pub async fn handle_read_object(
    Path((bucket_name, object_key)): Path<(String, String)>,
) -> (StatusCode, Json<SingleStringResponse>) {
    (
        StatusCode::OK,
        Json(SingleStringResponse {
            content: read_object_to_string(bucket_name, object_key).await,
        }),
    )
}

pub async fn handle_copy_from_template(
    Json(data): Json<CopyTemplateRequest>,
) -> (StatusCode, Json<SingleBoolResponse>) {
    (
        StatusCode::OK,
        Json(SingleBoolResponse {
            success: copy_from_template(data.bucket_name, data.object_key, data.template_id).await,
        }),
    )
}

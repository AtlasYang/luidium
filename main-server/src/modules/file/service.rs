use crate::modules::{file::model::STORAGE_ACTION_COPY_FOLDER, model::SingleStringResponse};

use super::model::{
    FileConfig, StorageRequest, StorageRequestMul, StorageResponseListObject,
    STORAGE_ACTION_CREATE_BUCKET, STORAGE_ACTION_DELETE_BUCKET, STORAGE_ACTION_DELETE_FOLDER,
    STORAGE_ACTION_DELETE_FOLDER_EXCEPT_CONFIG, STORAGE_ACTION_LIST_OBJECT,
    STORAGE_ACTION_READ_OBJECT,
};
use std::env;

pub async fn get_all_files_in_bucket_by_object_key(
    bucket_name: String,
    object_key: String,
) -> Vec<FileConfig> {
    let mut result = vec![];

    let storage_server_host = env::var("STORAGE_SERVER_HOST").unwrap();
    let url = format!("http://{}/storage/single", storage_server_host);
    let req = StorageRequest {
        action: STORAGE_ACTION_LIST_OBJECT.to_string(),
        bucket: bucket_name.clone(),
        object_key,
    };

    let client = reqwest::Client::new();
    let res = client
        .post(&url)
        .header("Content-Type", "application/json")
        .json(&req)
        .send()
        .await
        .unwrap();

    if res.status().is_success() {
        let body = res.text().await.unwrap();
        let files: StorageResponseListObject = serde_json::from_str(&body).unwrap();
        files.object_keys.iter().for_each(|x| {
            result.push(file_dir_to_file_config(x.to_string(), bucket_name.clone()));
        });
    }

    result
}

pub async fn delete_files_by_object_key(bucket_name: String, object_keys: String) -> bool {
    let storage_server_host = env::var("STORAGE_SERVER_HOST").unwrap();
    let url = format!("http://{}/storage/single", storage_server_host);
    let req = StorageRequest {
        action: STORAGE_ACTION_DELETE_BUCKET.to_string(),
        bucket: bucket_name.clone(),
        object_key: object_keys,
    };

    let client = reqwest::Client::new();
    let res = client
        .post(&url)
        .header("Content-Type", "application/json")
        .json(&req)
        .send()
        .await
        .unwrap();

    res.status().is_success()
}

pub async fn read_object_to_string(bucket_name: String, object_key: String) -> String {
    let storage_server_host = env::var("STORAGE_SERVER_HOST").unwrap();
    let url = format!("http://{}/storage/single", storage_server_host);
    let req = StorageRequest {
        action: STORAGE_ACTION_READ_OBJECT.to_string(),
        bucket: bucket_name.clone(),
        object_key,
    };

    let client = reqwest::Client::new();
    let res = client
        .post(&url)
        .header("Content-Type", "application/json")
        .json(&req)
        .send()
        .await
        .unwrap();

    match serde_json::from_str::<SingleStringResponse>(&res.text().await.unwrap()) {
        Ok(x) => x.content,
        Err(_) => "".to_string(),
    }
}

pub async fn create_bucket(bucket_name: String) -> bool {
    let storage_server_host = env::var("STORAGE_SERVER_HOST").unwrap();
    let url = format!("http://{}/storage/single", storage_server_host);
    let req = StorageRequest {
        action: STORAGE_ACTION_CREATE_BUCKET.to_string(),
        bucket: bucket_name.clone(),
        object_key: "".to_string(),
    };

    let client = reqwest::Client::new();
    let res = client
        .post(&url)
        .header("Content-Type", "application/json")
        .json(&req)
        .send()
        .await
        .unwrap();

    res.status().is_success()
}

pub async fn delete_folder(bucket_name: String, object_key: String, except_config: bool) -> bool {
    let storage_server_host = env::var("STORAGE_SERVER_HOST").unwrap();
    let url = format!("http://{}/storage/single", storage_server_host);
    let req = StorageRequest {
        action: match except_config {
            true => STORAGE_ACTION_DELETE_FOLDER_EXCEPT_CONFIG.to_string(),
            false => STORAGE_ACTION_DELETE_FOLDER.to_string(),
        },
        bucket: bucket_name.clone(),
        object_key,
    };

    let client = reqwest::Client::new();
    let res = client
        .post(&url)
        .header("Content-Type", "application/json")
        .json(&req)
        .send()
        .await
        .unwrap();

    res.status().is_success()
}

pub async fn delete_bucket(bucket_name: String) -> bool {
    let storage_server_host = env::var("STORAGE_SERVER_HOST").unwrap();
    let url = format!("http://{}/storage/single", storage_server_host);
    let req = StorageRequest {
        action: STORAGE_ACTION_DELETE_BUCKET.to_string(),
        bucket: bucket_name.clone(),
        object_key: "".to_string(),
    };

    let client = reqwest::Client::new();
    let res = client
        .post(&url)
        .header("Content-Type", "application/json")
        .json(&req)
        .send()
        .await
        .unwrap();

    res.status().is_success()
}

pub async fn copy_from_template(
    bucket_name: String,
    object_key: String,
    template_id: String,
) -> bool {
    let storage_server_host = env::var("STORAGE_SERVER_HOST").unwrap();
    let url = format!("http://{}/storage/multiple", storage_server_host);
    let req = StorageRequestMul {
        action: STORAGE_ACTION_COPY_FOLDER.to_string(),
        bucket: bucket_name.clone(),
        object_keys: vec![template_id, object_key],
        token: "".to_string(),
    };

    let client = reqwest::Client::new();
    let res = client
        .post(&url)
        .header("Content-Type", "application/json")
        .json(&req)
        .send()
        .await
        .unwrap();

    res.status().is_success()
}

fn file_dir_to_file_config(s: String, bucket_name: String) -> FileConfig {
    let parts: Vec<String> = s.split('/').map(|x| x.to_string()).collect();

    match parts.len() {
        1 => FileConfig {
            bucket_name: bucket_name.clone(),
            version: parts[0].clone(),
            block_name: "".to_string(),
            file_name: "".to_string(),
        },
        2 => FileConfig {
            bucket_name: bucket_name.clone(),
            version: parts[0].clone(),
            block_name: parts[1].clone(),
            file_name: "".to_string(),
        },
        3 => FileConfig {
            bucket_name: bucket_name.clone(),
            version: parts[0].clone(),
            block_name: parts[1].clone(),
            file_name: parts[2].clone(),
        },
        _ => {
            let file_name_parts: Vec<String> = parts[2..].to_vec();
            FileConfig {
                bucket_name: bucket_name.clone(),
                version: parts[0].clone(),
                block_name: parts[1].clone(),
                file_name: file_name_parts.join("/"),
            }
        }
    }
}

use super::model::{
    Block, CreateVolumeRequest, CreateVolumeResponse, Port, BLOCK_TYPE_DATABASE, BLOCK_TYPE_SERVER,
    BLOCK_TYPE_STORAGE, BLOCK_TYPE_WEB,
};
use crate::{modules::block::model::BuilderServerRequest, util::get_main_db_session, AppState};
use rdkafka::{
    producer::{FutureProducer, FutureRecord},
    ClientConfig,
};
use scylla::prepared_statement::PreparedStatement;
use std::{env, time::Duration};
use uuid::Uuid;

pub async fn create_block(app_state: &AppState, block: Block) -> (String, i32) {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("INSERT INTO blocks (id, application_id, block_type, description, dns_record_id, external_port, external_rootdomain, external_subdomain, is_active, is_external, name, status, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .await
        .unwrap();

    let random_uuid = Uuid::new_v4();
    let assigned_port = get_available_port(random_uuid.clone()).await;

    if assigned_port == -1 {
        return ("".to_string(), -1);
    }

    let res = session
        .execute(
            &query,
            (
                random_uuid,
                block.application_id,
                block.block_type,
                block.description,
                block.dns_record_id,
                assigned_port,
                block.external_rootdomain,
                block.external_subdomain,
                block.is_active,
                block.is_external,
                block.name,
                block.status,
                block.version,
            ),
        )
        .await;

    match res {
        Ok(_) => (random_uuid.to_string(), assigned_port),
        Err(_) => ("".to_string(), -1),
    }
}

pub async fn read_all_blocks_by_application_id_and_version(
    app_state: &AppState,
    application_id: Uuid,
    version: String,
) -> Option<Vec<Block>> {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("SELECT * FROM blocks WHERE application_id = ? AND version = ? ALLOW FILTERING")
        .await
        .unwrap();

    let res = session.execute(&query, (application_id, version)).await;

    let rows = match res {
        Ok(rows) => rows,
        Err(_) => return None,
    };

    let rows = rows.rows_typed::<Block>().unwrap();
    Some(rows.into_iter().map(|r| r.unwrap()).collect())
}

pub async fn read_all_blocks_by_application_id(
    app_state: &AppState,
    application_id: Uuid,
) -> Option<Vec<Block>> {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("SELECT * FROM blocks WHERE application_id = ? ALLOW FILTERING")
        .await
        .unwrap();

    let res = session.execute(&query, (application_id,)).await;

    let rows = match res {
        Ok(rows) => rows,
        Err(_) => return None,
    };

    let rows = rows.rows_typed::<Block>().unwrap();
    Some(rows.into_iter().map(|r| r.unwrap()).collect())
}

pub async fn read_block(app_state: &AppState, block_id: Uuid) -> Option<Block> {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("SELECT * FROM blocks WHERE id = ? LIMIT 1")
        .await
        .unwrap();

    let res = session.execute(&query, (block_id,)).await;

    let rows = match res {
        Ok(rows) => rows,
        Err(_) => return None,
    };

    let rows = rows
        .rows_typed::<Block>()
        .unwrap()
        .into_iter()
        .map(|r| r.unwrap())
        .collect::<Vec<Block>>();

    match rows.len() {
        0 => None,
        _ => Some(rows[0].clone()),
    }
}

pub async fn read_block_by_version_and_name(
    app_state: &AppState,
    application_id: Uuid,
    version: String,
    block_name: String,
) -> Option<Block> {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare(
            "SELECT * FROM blocks WHERE application_id = ? AND version = ? AND name = ? ALLOW FILTERING",
        )
        .await
        .unwrap();

    let res = session
        .execute(&query, (application_id, version, block_name))
        .await;

    let rows = match res {
        Ok(rows) => rows,
        Err(_) => return None,
    };

    let rows = rows
        .rows_typed::<Block>()
        .unwrap()
        .into_iter()
        .map(|r| r.unwrap())
        .collect::<Vec<Block>>();

    match rows.len() {
        0 => None,
        _ => Some(rows[0].clone()),
    }
}

pub async fn update_block(app_state: &AppState, block: Block) -> bool {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("UPDATE blocks SET description = ?, dns_record_id = ?, external_port = ?, external_rootdomain = ?, external_subdomain = ?, is_active = ?, is_external = ?, name = ? WHERE id = ?")
        .await
        .unwrap();

    let res = session
        .execute(
            &query,
            (
                block.description,
                block.dns_record_id,
                block.external_port,
                block.external_rootdomain,
                block.external_subdomain,
                block.is_active,
                block.is_external,
                block.name,
                block.id,
            ),
        )
        .await;

    match res {
        Ok(_) => true,
        Err(_) => false,
    }
}

pub async fn update_block_status(app_state: &AppState, block_id: Uuid, status: String) -> bool {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("UPDATE blocks SET status = ? WHERE id = ? IF EXISTS")
        .await
        .unwrap();

    let res = session.execute(&query, (status, block_id)).await;

    match res {
        Ok(_) => true,
        Err(_) => false,
    }
}

pub async fn delete_block(app_state: &AppState, block_id: Uuid) -> bool {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("DELETE FROM blocks WHERE id = ?")
        .await
        .unwrap();

    let res = session.execute(&query, (block_id,)).await;

    free_port(block_id).await;

    match res {
        Ok(_) => true,
        Err(_) => false,
    }
}

pub async fn check_block_name_duplicate(
    app_state: &AppState,
    application_id: Uuid,
    version: String,
    block_name: String,
) -> bool {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("SELECT * FROM blocks WHERE application_id = ? AND version = ? AND name = ? ALLOW FILTERING")
        .await
        .unwrap();

    let res = session
        .execute(&query, (application_id, version, block_name))
        .await;

    let rows = match res {
        Ok(rows) => rows,
        Err(_) => return false,
    };

    let rows = rows.rows_typed::<Block>().unwrap();
    let blocks = rows.into_iter().map(|r| r.unwrap()).collect::<Vec<Block>>();

    blocks.len() > 0
}

pub async fn check_block_name_duplicate_strict(
    app_state: &AppState,
    application_id: Uuid,
    block_name: String,
) -> bool {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("SELECT * FROM blocks WHERE application_id = ? AND name = ? ALLOW FILTERING")
        .await
        .unwrap();

    let res = session.execute(&query, (application_id, block_name)).await;

    let rows = match res {
        Ok(rows) => rows,
        Err(_) => return false,
    };

    let rows = rows.rows_typed::<Block>().unwrap();
    let blocks = rows.into_iter().map(|r| r.unwrap()).collect::<Vec<Block>>();

    blocks.len() > 0
}

pub async fn get_available_port(block_id: Uuid) -> i32 {
    let session = get_main_db_session().await;

    let query: PreparedStatement = session
        .prepare("SELECT * FROM ports WHERE is_available = true LIMIT 1")
        .await
        .unwrap();

    let res = session.execute(&query, ()).await;

    let rows = match res {
        Ok(rows) => rows,
        Err(_) => return -1,
    };

    let rows = rows.rows_typed::<Port>().unwrap();
    let port = rows.into_iter().map(|r| r.unwrap()).collect::<Vec<Port>>()[0].clone();

    let query: PreparedStatement = session
        .prepare("UPDATE ports SET is_available = false, block_id = ? WHERE data = ?")
        .await
        .unwrap();

    let res = session.execute(&query, (block_id, port.data)).await;

    match res {
        Ok(_) => port.data,
        Err(_) => -1,
    }
}

pub async fn free_port(block_id: Uuid) -> bool {
    let session = get_main_db_session().await;
    let query: PreparedStatement = session
        .prepare("SELECT * FROM ports WHERE block_id = ? LIMIT 1 ALLOW FILTERING")
        .await
        .unwrap();

    let res = session.execute(&query, (block_id,)).await;

    let rows = match res {
        Ok(rows) => rows,
        Err(_) => return false,
    };

    let rows = rows.rows_typed::<Port>().unwrap();
    let port = rows.into_iter().map(|r| r.unwrap()).collect::<Vec<Port>>()[0].clone();

    let query: PreparedStatement = session
        .prepare("UPDATE ports SET is_available = true, block_id = null WHERE data = ?")
        .await
        .unwrap();

    let res = session.execute(&query, (port.data,)).await;

    match res {
        Ok(_) => true,
        Err(_) => false,
    }
}

pub async fn create_volume(
    bucket_name: String,
    version: String,
    block_name: String,
) -> Option<String> {
    let builder_server_host = env::var("BUILDER_SERVER_HOST").unwrap();
    let url = format!("http://{}/create_volume", builder_server_host);
    let req = CreateVolumeRequest {
        bucket: bucket_name.clone(),
        version: version.clone(),
        block_name: block_name.clone(),
    };

    let client = reqwest::Client::new();
    let res = client
        .post(&url)
        .header("Content-Type", "application/json")
        .json(&req)
        .send()
        .await
        .unwrap();

    match res.json::<CreateVolumeResponse>().await {
        Ok(res) => {
            if res.error.is_some() {
                None
            } else {
                res.volume_name
            }
        }
        Err(_) => None,
    }
}

pub async fn produce_builder_server_request(storage_server_request: BuilderServerRequest) -> bool {
    let topic = env::var("KAFKA_TOPIC").unwrap();
    let brokers = env::var("KAFKA_BROKER_HOST").unwrap();

    let producer: &FutureProducer = &ClientConfig::new()
        .set("bootstrap.servers", brokers)
        .set("message.timeout.ms", "5000")
        .create()
        .expect("Producer creation error");

    let delivery_status = producer
        .send(
            FutureRecord::<String, Vec<u8>>::to(topic.as_str())
                .payload(&serde_json::to_vec(&storage_server_request).unwrap())
                .key(&storage_server_request.block_id),
            Duration::from_secs(0),
        )
        .await;

    match delivery_status {
        Ok(_) => true,
        Err(_) => false,
    }
}

pub fn generate_nginx_conf_block_name(
    app_name: &str,
    block_name: &str,
    version: &str,
    block_type: &str,
) -> String {
    let v = version.replace(".", "-");
    match block_type {
        BLOCK_TYPE_STORAGE => format!("{}-v{}-{}-storage", app_name, v, block_name),
        BLOCK_TYPE_DATABASE => format!("{}-v{}-{}-db", app_name, v, block_name),
        BLOCK_TYPE_SERVER => format!("{}-v{}-{}-api", app_name, v, block_name),
        BLOCK_TYPE_WEB => format!("{}-{}", app_name, block_name),
        _ => "".to_string(),
    }
}

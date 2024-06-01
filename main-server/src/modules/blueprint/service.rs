use scylla::prepared_statement::PreparedStatement;
use uuid::Uuid;

use crate::AppState;

use super::model::{BlueprintEdge, BlueprintNode};

pub async fn create_blueprint_node(app_state: &AppState, blueprint_node: BlueprintNode) -> bool {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("INSERT INTO blueprint_nodes (block_id, application_id, version, x_pos, y_pos) VALUES (?, ?, ?, ?, ?)")
        .await
        .unwrap();

    let res = session
        .execute(
            &query,
            (
                blueprint_node.block_id,
                blueprint_node.application_id,
                blueprint_node.version,
                blueprint_node.x_pos,
                blueprint_node.y_pos,
            ),
        )
        .await;

    match res {
        Ok(_) => true,
        Err(_) => false,
    }
}

pub async fn read_all_blueprint_nodes(
    app_state: &AppState,
    application_id: Uuid,
    version: String,
) -> Option<Vec<BlueprintNode>> {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("SELECT * FROM blueprint_nodes WHERE application_id = ? AND version = ? ALLOW FILTERING")
        .await
        .unwrap();

    let rows = session.execute(&query, (application_id, version)).await;
    let rows = match rows {
        Ok(rows) => rows,
        Err(_) => return None,
    };

    let row = rows.rows_typed::<BlueprintNode>().unwrap();
    Some(row.into_iter().map(|r| r.unwrap()).collect())
}

pub async fn update_blueprint_node_pos(
    app_state: &AppState,
    blueprint_node: BlueprintNode,
) -> bool {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("UPDATE blueprint_nodes SET x_pos = ?, y_pos = ? WHERE block_id = ? AND application_id = ? AND version = ?")
        .await
        .unwrap();

    let res = session
        .execute(
            &query,
            (
                blueprint_node.x_pos,
                blueprint_node.y_pos,
                blueprint_node.block_id,
                blueprint_node.application_id,
                blueprint_node.version,
            ),
        )
        .await;

    match res {
        Ok(_) => true,
        Err(_) => false,
    }
}

pub async fn delete_blueprint_node(app_state: &AppState, block_id: Uuid) -> bool {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("DELETE FROM blueprint_nodes WHERE block_id = ?")
        .await
        .unwrap();

    let res = session.execute(&query, (block_id,)).await;

    match res {
        Ok(_) => true,
        Err(_) => false,
    }
}

pub async fn create_blueprint_edge(app_state: &AppState, blueprint_edge: BlueprintEdge) -> bool {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("INSERT INTO blueprint_edges (id, application_id, version, source_block_id, target_block_id) VALUES (uuid(), ?, ?, ?, ?)")
        .await
        .unwrap();

    let res = session
        .execute(
            &query,
            (
                blueprint_edge.application_id,
                blueprint_edge.version,
                blueprint_edge.source_block_id,
                blueprint_edge.target_block_id,
            ),
        )
        .await;

    match res {
        Ok(_) => true,
        Err(_) => false,
    }
}

pub async fn read_all_blueprint_edges(
    app_state: &AppState,
    application_id: Uuid,
    version: String,
) -> Option<Vec<BlueprintEdge>> {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("SELECT * FROM blueprint_edges WHERE application_id = ? AND version = ? ALLOW FILTERING")
        .await
        .unwrap();

    let rows = session.execute(&query, (application_id, version)).await;
    let rows = match rows {
        Ok(rows) => rows,
        Err(_) => return None,
    };

    let row = rows.rows_typed::<BlueprintEdge>().unwrap();
    Some(row.into_iter().map(|r| r.unwrap()).collect())
}

pub async fn delete_blueprint_edge(app_state: &AppState, id: Uuid) -> bool {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("DELETE FROM blueprint_edges WHERE id = ?")
        .await
        .unwrap();

    let res = session.execute(&query, (id,)).await;

    match res {
        Ok(_) => true,
        Err(_) => false,
    }
}

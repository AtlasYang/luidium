use openssl::sha::Sha256;
use rand::{distributions::Alphanumeric, thread_rng, Rng};
use scylla::prepared_statement::PreparedStatement;
use uuid::Uuid;

use crate::AppState;

use super::model::CliToken;

fn generate_cli_token(user_id: Uuid, random_length: usize) -> String {
    let mut hasher = Sha256::new();
    hasher.update(user_id.as_bytes());
    let hash_result = hasher.finish();
    let mut hash_string = String::new();
    for byte in hash_result.iter() {
        hash_string.push_str(&format!("{:02x}", byte));
    }

    let random_string: String = thread_rng()
        .sample_iter(&Alphanumeric)
        .take(random_length)
        .map(char::from)
        .collect();

    format!("{}{}", &hash_string[..16], random_string)
}

pub async fn create_cli_token(app_state: &AppState, user_id: Uuid) -> Option<String> {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("INSERT INTO cli_tokens (cli_token, user_id) VALUES (?, ?)")
        .await
        .unwrap();

    let new_token: String = generate_cli_token(user_id, 16);

    let res = session.execute(&query, (new_token.clone(), user_id)).await;

    match res {
        Ok(_) => Some(new_token),
        Err(_) => None,
    }
}

pub async fn get_cli_tokens_by_user_id(
    app_state: &AppState,
    user_id: Uuid,
) -> Option<Vec<CliToken>> {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("SELECT * FROM cli_tokens WHERE user_id = ?")
        .await
        .unwrap();

    let rows = session.execute(&query, (user_id,)).await;

    let rows = match rows {
        Ok(rows) => rows,
        Err(_) => return None,
    };

    let row = rows.rows_typed::<CliToken>().unwrap();
    Some(row.into_iter().map(|r| r.unwrap()).collect())
}

pub async fn validate_cli_token(app_state: &AppState, token: String) -> Option<CliToken> {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("SELECT * FROM cli_tokens WHERE cli_token = ?")
        .await
        .unwrap();

    let rows = session.execute(&query, (token,)).await;
    let rows = match rows {
        Ok(rows) => rows,
        Err(_) => return None,
    };
    let row = rows.rows_typed::<CliToken>().unwrap();
    let mut row = row
        .into_iter()
        .map(|r| r.unwrap())
        .collect::<Vec<CliToken>>();

    if row.len() == 0 {
        return None;
    }

    Some(row.remove(0))
}

pub async fn delete_cli_token(app_state: &AppState, token: String) -> bool {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("DELETE FROM cli_tokens WHERE cli_token = ?")
        .await
        .unwrap();

    let res = session.execute(&query, (token,)).await;

    match res {
        Ok(_) => true,
        Err(_) => false,
    }
}

use super::model::Application;
use crate::AppState;
use scylla::prepared_statement::PreparedStatement;
use uuid::Uuid;

pub async fn create_application(app_state: &AppState, application: Application) -> String {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("INSERT INTO applications (id, user_id, app_id, app_name, app_displayname, version_list, active_version, is_active, description, created_at, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .await
        .unwrap();

    let random_uuid = Uuid::new_v4();

    let res = session
        .execute(
            &query,
            (
                random_uuid,
                application.user_id,
                application.app_id,
                application.app_name,
                application.app_displayname,
                application.version_list,
                application.active_version,
                application.is_active,
                application.description,
                application.created_at,
                application.image_url,
            ),
        )
        .await;

    match res {
        Ok(_) => random_uuid.to_string(),
        Err(_) => "".to_string(),
    }
}

pub async fn read_applications_by_user_id(
    app_state: &AppState,
    user_id: Uuid,
) -> Option<Vec<Application>> {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("SELECT * FROM applications WHERE user_id = ?")
        .await
        .unwrap();
    let rows = session.execute(&query, (user_id,)).await;
    let rows = match rows {
        Ok(rows) => rows,
        Err(_) => return None,
    };
    let row = rows.rows_typed::<Application>().unwrap();
    Some(row.into_iter().map(|r| r.unwrap()).collect())
}

pub async fn read_application_by_id(app_state: &AppState, id: Uuid) -> Option<Application> {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("SELECT * FROM applications WHERE id = ? LIMIT 1")
        .await
        .unwrap();
    let res = session.execute(&query, (id,)).await;

    let rows = match res {
        Ok(rows) => rows,
        Err(_) => return None,
    };

    let rows = rows
        .rows_typed::<Application>()
        .unwrap()
        .into_iter()
        .map(|r| r.unwrap())
        .collect::<Vec<Application>>();

    match rows.len() {
        0 => None,
        _ => Some(rows[0].clone()),
    }
}

pub async fn update_application_displayname(
    app_state: &AppState,
    id: Uuid,
    app_displayname: String,
) -> bool {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("UPDATE applications SET app_displayname = ? WHERE id = ?")
        .await
        .unwrap();
    let res = session.execute(&query, (app_displayname, id)).await;
    match res {
        Ok(_) => true,
        Err(_) => false,
    }
}

pub async fn create_application_version(app_state: &AppState, id: Uuid, version: String) -> bool {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("UPDATE applications SET version_list = version_list + [?] WHERE id = ?")
        .await
        .unwrap();
    let res = session.execute(&query, (version, id)).await;
    match res {
        Ok(_) => true,
        Err(_) => false,
    }
}

pub async fn delete_application_version(app_state: &AppState, id: Uuid, version: String) -> bool {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("UPDATE applications SET version_list = version_list - [?] WHERE id = ?")
        .await
        .unwrap();
    let res = session.execute(&query, (version, id)).await;
    match res {
        Ok(_) => true,
        Err(_) => false,
    }
}

pub async fn update_application_active_version(
    app_state: &AppState,
    id: Uuid,
    active_version: String,
) -> bool {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("UPDATE applications SET active_version = ? WHERE id = ?")
        .await
        .unwrap();
    let res = session.execute(&query, (active_version, id)).await;
    match res {
        Ok(_) => true,
        Err(_) => false,
    }
}

pub async fn update_application_is_active(app_state: &AppState, id: Uuid, is_active: bool) -> bool {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("UPDATE applications SET is_active = ? WHERE id = ?")
        .await
        .unwrap();
    let res = session.execute(&query, (is_active, id)).await;
    match res {
        Ok(_) => true,
        Err(_) => false,
    }
}

pub async fn update_application_description(
    app_state: &AppState,
    id: Uuid,
    description: String,
) -> bool {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("UPDATE applications SET description = ? WHERE id = ?")
        .await
        .unwrap();
    let res = session.execute(&query, (description, id)).await;
    match res {
        Ok(_) => true,
        Err(_) => false,
    }
}

pub async fn check_app_name_duplicate(app_state: &AppState, app_name: String) -> bool {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("SELECT * FROM applications WHERE app_name = ?")
        .await
        .unwrap();
    let rows = session.execute(&query, (app_name,)).await;
    let rows = match rows {
        Ok(rows) => rows,
        Err(_) => return false,
    };
    let row = rows.rows_typed::<Application>().unwrap();
    let length = row
        .into_iter()
        .map(|r| r.unwrap_or(Application::default()))
        .collect::<Vec<Application>>()
        .len();

    length > 0
}

pub async fn get_application_id_by_app_id(app_state: &AppState, app_id: String) -> Option<Uuid> {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("SELECT * FROM applications WHERE app_id = ? ALLOW FILTERING")
        .await
        .unwrap();
    let rows = session.execute(&query, (app_id,)).await;
    let rows = match rows {
        Ok(rows) => rows,
        Err(_) => return None,
    };
    let mut row = rows.rows_typed::<Application>().unwrap().into_iter();
    match row.next() {
        Some(Ok(r)) => Some(r.id),
        _ => None,
    }
}

pub async fn get_application_id_by_app_name(
    app_state: &AppState,
    app_name: String,
) -> Option<Uuid> {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("SELECT * FROM applications WHERE app_name = ? ALLOW FILTERING")
        .await
        .unwrap();
    let rows = session.execute(&query, (app_name,)).await;
    let rows = match rows {
        Ok(rows) => rows,
        Err(_) => return None,
    };
    let mut row = rows.rows_typed::<Application>().unwrap().into_iter();
    match row.next() {
        Some(Ok(r)) => Some(r.id),
        _ => None,
    }
}

pub async fn delete_application(app_state: &AppState, id: Uuid) -> bool {
    let session = app_state.main_db_session.lock().await;
    let query: PreparedStatement = session
        .prepare("DELETE FROM applications WHERE id = ?")
        .await
        .unwrap();
    let res = session.execute(&query, (id,)).await;
    match res {
        Ok(_) => true,
        Err(_) => false,
    }
}

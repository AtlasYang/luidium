use scylla::{Session, SessionBuilder};
use std::env;

pub async fn get_main_db_session() -> Session {
    let uri = env::var("MAIN_DB_HOST").unwrap();

    let session: Session = SessionBuilder::new()
        .known_node(&uri)
        .use_keyspace("ks_admin", true)
        .build()
        .await
        .expect("session should be created");

    println!("Connected to ScyllaDB at {}", uri);

    session
}

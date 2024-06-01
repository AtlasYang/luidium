use crate::AppState;
use axum::{
    routing::{delete, patch, post},
    Router,
};

use super::handler::{
    handle_create_blueprint_edge, handle_create_blueprint_node, handle_delete_blueprint_edge,
    handle_delete_blueprint_node, handle_read_all_blueprint_edges, handle_read_all_blueprint_nodes,
    handle_update_blueprint_node_pos,
};

pub fn get_blueprint_layer() -> Router<AppState> {
    Router::new()
        .route("/node/create", post(handle_create_blueprint_node))
        .route("/node", post(handle_read_all_blueprint_nodes))
        .route("/node/update/pos", patch(handle_update_blueprint_node_pos))
        .route("/node/:id", delete(handle_delete_blueprint_node))
        .route("/edge/create", post(handle_create_blueprint_edge))
        .route("/edge", post(handle_read_all_blueprint_edges))
        .route("/edge/:id", delete(handle_delete_blueprint_edge))
}

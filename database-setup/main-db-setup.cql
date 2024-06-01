CREATE TABLE applications (
    id uuid PRIMARY KEY,
    active_version text,
    app_displayname text,
    app_id text,
    app_name text,
    created_at text,
    description text,
    image_url text,
    is_active boolean,
    user_id uuid,
    version_list list<text>
)
CREATE INDEX applications_app_name_idx ON applications (app_name);
CREATE INDEX applications_is_active_idx ON applications (is_active);
CREATE INDEX applications_user_id_idx ON applications (user_id);

CREATE TABLE blocks (
    id uuid PRIMARY KEY,
    application_id uuid,
    block_type text,
    description text,
    dns_record_id text,
    external_port int,
    external_rootdomain text,
    external_subdomain text,
    is_active boolean,
    is_external boolean,
    name text,
    status text,
    version text
)
CREATE INDEX blocks_application_id_idx ON blocks (application_id);
CREATE INDEX blocks_version_idx ON blocks (version);

CREATE TABLE blueprint_edges (
    id uuid PRIMARY KEY,
    application_id uuid,
    source_block_id uuid,
    target_block_id uuid,
    version text
)
CREATE INDEX blueprint_edges_application_id_idx ON blueprint_edges (application_id);
CREATE INDEX blueprint_edges_target_block_id_idx ON blueprint_edges (target_block_id);
CREATE INDEX blueprint_edges_version_idx ON blueprint_edges (version);

CREATE TABLE blueprint_nodes (
    block_id uuid PRIMARY KEY,
    application_id uuid,
    version text,
    x_pos int,
    y_pos int
)
CREATE INDEX blueprint_nodes_application_id_idx ON blueprint_nodes (application_id);
CREATE INDEX blueprint_nodes_version_idx ON blueprint_nodes (version);

CREATE TABLE ports (
    data int PRIMARY KEY,
    block_id uuid,
    is_available boolean
)
CREATE INDEX ports_is_available_idx ON ports (is_available);

CREATE TABLE cli_tokens (
    cli_token text PRIMARY KEY,
    user_id uuid
);
CREATE INDEX cli_tokens_user_id_idx ON cli_tokens (user_id);
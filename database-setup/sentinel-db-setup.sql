-- PostgreSQL database setup for Sentinel DB

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    tier INTEGER NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    token TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS usage_cap_application (
    user_id UUID NOT NULL,
    remaining INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS usage_cap_version (
    user_id UUID NOT NULL,
    application_id UUID NOT NULL,
    remaining INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS usage_cap_block (
    user_id UUID NOT NULL,
    application_id UUID NOT NULL,
    version TEXT NOT NULL,
    remaining INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS authority (
    user_id UUID NOT NULL,
    entity_id UUID NOT NULL,
    class TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS logs (
    user_id UUID,
    application_id UUID,
    block_id UUID,
    level TEXT NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX ON logs (user_id);
CREATE INDEX ON logs (user_id, application_id);
CREATE INDEX ON logs (user_id, block_id);
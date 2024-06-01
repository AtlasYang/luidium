package lib

import (
	"time"

	"github.com/google/uuid"
)

const (
	BlockStatusFailed   = "failed"
	BlockStatusStopped  = "stopped"
	BlockStatusReady    = "ready"
	BlockStatusPending  = "pending"
	BlockStatusRunning  = "running"
	BlockStatusBuilding = "building"

	BlockActionBuild       = "build"
	BlockActionRun         = "run"
	BlockActionBuildAndRun = "build_and_run"
	BlockActionStop        = "stop"
	BlockActionRemove      = "remove"
)

type Log struct {
	UserID        uuid.UUID `json:"user_id"`
	ApplicationID uuid.UUID `json:"application_id"`
	BlockID       uuid.UUID `json:"block_id"`
	Level         string    `json:"level"`
	Type          string    `json:"type"`
	Message       string    `json:"message"`
	Timestamp     time.Time `json:"timestamp"`
}

type StorageServerRequest struct {
	UserID        uuid.UUID `json:"user_id"`
	ApplicationID uuid.UUID `json:"application_id"`
	BlockID       uuid.UUID `json:"block_id"`
	Bucket        string    `json:"bucket"`
	Version       string    `json:"version"`
	Blockname     string    `json:"block_name"`
	Action        string    `json:"action"`
}

type CreateVolumeRequest struct {
	Bucket    string `json:"bucket"`
	Version   string `json:"version"`
	BlockName string `json:"block_name"`
}

type LuidiumConfig struct {
	BlockName            string   `json:"block_name"`
	Framework            string   `json:"framework"`
	PortBinding          string   `json:"port_binding"`
	VolumeBinding        string   `json:"volume_binding"`
	EnvironmentVariables []string `json:"environment_variables"`
	IgnoreFiles          []string `json:"ignore_files"`
}

type SingleStringRequest struct {
	Content string `json:"content"`
}

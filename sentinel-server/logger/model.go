package logger

import (
	"time"

	"github.com/google/uuid"
)

const (
	LogSuccess = "SUCCESS"
	LogInfo    = "INFO"
	LogError   = "ERROR"
	LogWarn    = "WARN"
	LogFatal   = "FATAL"
)

const (
	LogTypeUser        = "USER"
	LogTypeAuthority   = "AUTHORITY"
	LogTypeApplication = "APPLICATION"
	LogTypeGeneral     = "GENERAL"
	LogTypeEtc         = "ETC"
)

type Log struct {
	UserID        uuid.UUID     `json:"user_id"`
	ApplicationID uuid.NullUUID `json:"application_id"`
	BlockID       uuid.NullUUID `json:"block_id"`
	Level         string        `json:"level"`
	Type          string        `json:"type"`
	Message       string        `json:"message"`
	Timestamp     time.Time     `json:"timestamp"`
}

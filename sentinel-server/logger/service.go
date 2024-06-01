package logger

import (
	"context"
	"fmt"

	"luidium.com/sentinel-server/session"

	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type LoggerService interface {
	CreateLog(userID uuid.UUID, level string, logType string, message string) error
	ReadLog(userID uuid.UUID) ([]*Log, error)
	CreateApplicationLog(userID uuid.UUID, applicationID uuid.UUID, level string, logType string, message string) error
	ReadApplicationLog(userID uuid.UUID, applicationID uuid.UUID) ([]*Log, error)
	CreateBlockLog(userID uuid.UUID, applicationID uuid.UUID, blockID uuid.UUID, level string, logType string, message string) error
	ReadBlockLog(userID uuid.UUID, blockID uuid.UUID) ([]*Log, error)
}

type loggerService struct {
	ctx context.Context
	db  *pgxpool.Pool
}

func NewLoggerService(c *context.Context) LoggerService {
	db := session.GetDatabaseClient(c)
	return &loggerService{ctx: *c, db: db}
}

func (s *loggerService) CreateLog(userID uuid.UUID, level string, logType string, message string) error {
	conn, err := s.db.Exec(s.ctx, "INSERT INTO logs (user_id, level, type, message, timestamp) VALUES ($1, $2, $3, $4, NOW())", userID, level, logType, message)
	if err != nil {
		return err
	}
	if conn.RowsAffected() == 0 {
		return nil
	}
	return nil
}

func (s *loggerService) CreateApplicationLog(userID uuid.UUID, applicationID uuid.UUID, level string, logType string, message string) error {
	conn, err := s.db.Exec(s.ctx, "INSERT INTO logs (user_id, application_id, level, type, message, timestamp) VALUES ($1, $2, $3, $4, $5, NOW())", userID, applicationID, level, logType, message)
	if err != nil {
		return err
	}
	if conn.RowsAffected() == 0 {
		return nil
	}
	return nil
}

func (s *loggerService) CreateBlockLog(userID uuid.UUID, applicationID uuid.UUID, blockID uuid.UUID, level string, logType string, message string) error {
	conn, err := s.db.Exec(s.ctx, "INSERT INTO logs (user_id, application_id, block_id, level, type, message, timestamp) VALUES ($1, $2, $3, $4, $5, $6, NOW())", userID, applicationID, blockID, level, logType, message)
	if err != nil {
		return err
	}
	if conn.RowsAffected() == 0 {
		return nil
	}
	return nil
}

func (s *loggerService) ReadLog(userID uuid.UUID) ([]*Log, error) {
	var logs []*Log
	err := pgxscan.Select(s.ctx, s.db, &logs, "SELECT * FROM logs WHERE user_id = $1", userID)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	if len(logs) == 0 {
		return []*Log{}, nil
	}
	return logs, nil
}

func (s *loggerService) ReadApplicationLog(userID uuid.UUID, applicationID uuid.UUID) ([]*Log, error) {
	var logs []*Log
	pgxscan.Select(s.ctx, s.db, &logs, "SELECT * FROM logs WHERE user_id = $1 AND application_id = $2", userID, applicationID)
	if len(logs) == 0 {
		return []*Log{}, nil
	}
	return logs, nil
}

func (s *loggerService) ReadBlockLog(userID uuid.UUID, blockID uuid.UUID) ([]*Log, error) {
	var logs []*Log
	pgxscan.Select(s.ctx, s.db, &logs, "SELECT * FROM logs WHERE user_id = $1 AND block_id = $2", userID, blockID)
	if len(logs) == 0 {
		return []*Log{}, nil
	}
	return logs, nil
}

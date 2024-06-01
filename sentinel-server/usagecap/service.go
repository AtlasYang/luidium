package usagecap

import (
	"context"

	"luidium.com/sentinel-server/session"

	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UsageCapService interface {
	GetUsageCapApplication(userID uuid.UUID) (*UsageCapApplication, error)
	GetUsageCapVersion(userID uuid.UUID, applicationID uuid.UUID) (*UsageCapVersion, error)
	GetUsageCapBlock(userID uuid.UUID, applicationID uuid.UUID, version string) (*UsageCapBlock, error)
	UpdateUsageCapApplication(userID uuid.UUID, remaining int) error
	UpdateUsageCapVersion(userID uuid.UUID, applicationID uuid.UUID, remaining int) error
	UpdateUsageCapBlock(userID uuid.UUID, applicationID uuid.UUID, version string, remaining int) error
	CreateUsageCapApplication(userID uuid.UUID, remaining int) error
	CreateUsageCapVersion(userID uuid.UUID, applicationID uuid.UUID, remaining int) error
	CreateUsageCapBlock(userID uuid.UUID, applicationID uuid.UUID, version string, remaining int) error
	DeleteAllUsageCap(userID uuid.UUID) error
}

type usageCapService struct {
	ctx context.Context
	db  *pgxpool.Pool
}

func NewUsageCapService(c *context.Context) UsageCapService {
	db := session.GetDatabaseClient(c)
	return &usageCapService{ctx: *c, db: db}
}

func (s *usageCapService) GetUsageCapApplication(userID uuid.UUID) (*UsageCapApplication, error) {
	var usageCapApplication []*UsageCapApplication
	pgxscan.Select(s.ctx, s.db, &usageCapApplication, "SELECT * FROM usage_cap_application WHERE user_id = $1", userID)
	if len(usageCapApplication) == 0 {
		return nil, nil
	}
	return usageCapApplication[0], nil
}

func (s *usageCapService) GetUsageCapVersion(userID uuid.UUID, applicationID uuid.UUID) (*UsageCapVersion, error) {
	var usageCapVersion []*UsageCapVersion
	pgxscan.Select(s.ctx, s.db, &usageCapVersion, "SELECT * FROM usage_cap_version WHERE user_id = $1 AND application_id = $2", userID, applicationID)
	if len(usageCapVersion) == 0 {
		return nil, nil
	}
	return usageCapVersion[0], nil
}

func (s *usageCapService) GetUsageCapBlock(userID uuid.UUID, applicationID uuid.UUID, version string) (*UsageCapBlock, error) {
	var usageCapBlock []*UsageCapBlock
	pgxscan.Select(s.ctx, s.db, &usageCapBlock, "SELECT * FROM usage_cap_block WHERE user_id = $1 AND application_id = $2 AND version = $3", userID, applicationID, version)
	if len(usageCapBlock) == 0 {
		return nil, nil
	}
	return usageCapBlock[0], nil
}

func (s *usageCapService) UpdateUsageCapApplication(userID uuid.UUID, remaining int) error {
	conn, err := s.db.Exec(s.ctx, "UPDATE usage_cap_application SET remaining = $1 WHERE user_id = $2", remaining, userID)
	if err != nil {
		return err
	}
	if conn.RowsAffected() == 0 {
		return nil
	}
	return nil
}

func (s *usageCapService) UpdateUsageCapVersion(userID uuid.UUID, applicationID uuid.UUID, remaining int) error {
	conn, err := s.db.Exec(s.ctx, "UPDATE usage_cap_version SET remaining = $1 WHERE user_id = $2 AND application_id = $3", remaining, userID, applicationID)
	if err != nil {
		return err
	}
	if conn.RowsAffected() == 0 {
		return nil
	}
	return nil
}

func (s *usageCapService) UpdateUsageCapBlock(userID uuid.UUID, applicationID uuid.UUID, version string, remaining int) error {
	conn, err := s.db.Exec(s.ctx, "UPDATE usage_cap_block SET remaining = $1 WHERE user_id = $2 AND application_id = $3 AND version = $4", remaining, userID, applicationID, version)
	if err != nil {
		return err
	}
	if conn.RowsAffected() == 0 {
		return nil
	}
	return nil
}

func (s *usageCapService) CreateUsageCapApplication(userID uuid.UUID, remaining int) error {
	conn, err := s.db.Exec(s.ctx, "INSERT INTO usage_cap_application (user_id, remaining) VALUES ($1, $2)", userID, remaining)
	if err != nil {
		return err
	}
	if conn.RowsAffected() == 0 {
		return nil
	}
	return nil
}

func (s *usageCapService) CreateUsageCapVersion(userID uuid.UUID, applicationID uuid.UUID, remaining int) error {
	conn, err := s.db.Exec(s.ctx, "INSERT INTO usage_cap_version (user_id, application_id, remaining) VALUES ($1, $2, $3)", userID, applicationID, remaining)
	if err != nil {
		return err
	}
	if conn.RowsAffected() == 0 {
		return nil
	}
	return nil
}

func (s *usageCapService) CreateUsageCapBlock(userID uuid.UUID, applicationID uuid.UUID, version string, remaining int) error {
	conn, err := s.db.Exec(s.ctx, "INSERT INTO usage_cap_block (user_id, application_id, version, remaining) VALUES ($1, $2, $3, $4)", userID, applicationID, version, remaining)
	if err != nil {
		return err
	}
	if conn.RowsAffected() == 0 {
		return nil
	}
	return nil
}

func (s *usageCapService) DeleteAllUsageCap(userID uuid.UUID) error {
	_, err := s.db.Exec(s.ctx, "DELETE FROM usage_cap_version WHERE user_id = $1", userID)
	if err != nil {
		return err
	}
	_, err = s.db.Exec(s.ctx, "DELETE FROM usage_cap_block WHERE user_id = $1", userID)
	if err != nil {
		return err
	}
	return nil
}

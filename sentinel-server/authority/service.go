package authority

import (
	"context"

	"luidium.com/sentinel-server/session"

	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AuthorityService interface {
	CreateAuthority(userID uuid.UUID, entityID uuid.UUID, class string) error
	GetAuthority(userID uuid.UUID, entityID uuid.UUID) (*Authority, error)
	GetAllAuthorityByEntityID(entityID uuid.UUID) ([]*Authority, error)
	UpdateAuthority(userID uuid.UUID, entityID uuid.UUID, class string) error
	CheckReadAuthority(userID uuid.UUID, entityID uuid.UUID) (bool, error)
	CheckWriteAuthority(userID uuid.UUID, entityID uuid.UUID) (bool, error)
	DeleteAuthority(userID uuid.UUID, entityID uuid.UUID) error
}

type authorityService struct {
	ctx context.Context
	db  *pgxpool.Pool
}

func NewAuthorityService(c *context.Context) AuthorityService {
	db := session.GetDatabaseClient(c)
	return &authorityService{ctx: *c, db: db}
}

func (s *authorityService) CreateAuthority(userID uuid.UUID, entityID uuid.UUID, class string) error {
	conn, err := s.db.Exec(s.ctx, "INSERT INTO authority (user_id, entity_id, class) VALUES ($1, $2, $3)", userID, entityID, class)
	if err != nil {
		return err
	}
	if conn.RowsAffected() == 0 {
		return nil
	}
	return nil
}

func (s *authorityService) GetAuthority(userID uuid.UUID, entityID uuid.UUID) (*Authority, error) {
	var authority []*Authority
	pgxscan.Select(s.ctx, s.db, &authority, "SELECT * FROM authority WHERE user_id = $1 AND entity_id = $2", userID, entityID)
	if len(authority) == 0 {
		return nil, nil
	}
	return authority[0], nil
}

func (s *authorityService) GetAllAuthorityByEntityID(entityID uuid.UUID) ([]*Authority, error) {
	var authority []*Authority
	pgxscan.Select(s.ctx, s.db, &authority, "SELECT * FROM authority WHERE entity_id = $1", entityID)
	if len(authority) == 0 {
		return nil, nil
	}
	return authority, nil
}

func (s *authorityService) UpdateAuthority(userID uuid.UUID, entityID uuid.UUID, class string) error {
	conn, err := s.db.Exec(s.ctx, "UPDATE authority SET class = $1 WHERE user_id = $2 AND entity_id = $3", class, userID, entityID)
	if err != nil {
		return err
	}
	if conn.RowsAffected() == 0 {
		return nil
	}
	return nil
}

func (s *authorityService) CheckReadAuthority(userID uuid.UUID, entityID uuid.UUID) (bool, error) {
	conn, err := s.db.Exec(s.ctx, "SELECT * FROM authority WHERE user_id = $1 AND entity_id = $2", userID, entityID)
	if err != nil {
		return false, err
	}
	if conn.RowsAffected() == 0 {
		return false, nil
	}
	return true, nil
}

func (s *authorityService) CheckWriteAuthority(userID uuid.UUID, entityID uuid.UUID) (bool, error) {
	var authority []*Authority
	pgxscan.Select(s.ctx, s.db, &authority, "SELECT * FROM authority WHERE user_id = $1 AND entity_id = $2", userID, entityID)
	if len(authority) == 0 {
		return false, nil
	}
	if authority[0].Class == AuthorityClassViewer {
		return false, nil
	}
	return true, nil
}

func (s *authorityService) DeleteAuthority(userID uuid.UUID, entityID uuid.UUID) error {
	conn, err := s.db.Exec(s.ctx, "DELETE FROM authority WHERE user_id = $1 AND entity_id = $2", userID, entityID)
	if err != nil {
		return err
	}
	if conn.RowsAffected() == 0 {
		return nil
	}
	return nil
}

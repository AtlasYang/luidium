package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"

	"luidium.com/sentinel-server/session"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	RegisterUser(user UserRegister) (uuid.UUID, error)
	LoginUser(user UserLogin) (string, error)
	LogoutUser(userID string) (bool, error)
	ValidateToken(token string) (uuid.UUID, error)
	GetUser(userID string) (UserResponse, error)
	SearchUser(email string) ([]UserResponse, error)
	CheckEmailDuplicate(email string) (bool, error)
	UpdateUser(userID string, user UserUpdate) (bool, error)
	DeleteUser(userID string) (bool, error)
}

type authService struct {
	ctx context.Context
	db  *pgxpool.Pool
}

func NewAuthService(c *context.Context) AuthService {
	db := session.GetDatabaseClient(c)
	return &authService{ctx: *c, db: db}
}

func (s *authService) RegisterUser(user UserRegister) (uuid.UUID, error) {
	// check if email already exists
	var u = uuid.New()

	var email string
	err := s.db.QueryRow(s.ctx, "SELECT email FROM users WHERE email = $1", user.Email).Scan(&email)
	if err == nil {
		return u, fmt.Errorf("email already exists")
	}

	hashed_password, err := hashPassword(user.Password)
	if err != nil {
		return u, err
	}

	conn, err := s.db.Exec(s.ctx, "INSERT INTO users (id, email, password, name, image_url, tier, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, 0, NOW(), NOW())", u, user.Email, hashed_password, user.Name, user.Imageurl)
	if err != nil {
		return u, err
	}
	if conn.RowsAffected() == 0 {
		return u, nil
	}
	return u, nil
}

func (s *authService) LoginUser(user UserLogin) (string, error) {
	var u User
	var hashed_password string
	err := s.db.QueryRow(s.ctx, "SELECT password FROM users WHERE email = $1", user.Email).Scan(&hashed_password)

	if err != nil {
		return "", err
	}

	err = comparePassword(hashed_password, user.Password)
	if err != nil {
		return "", err
	}

	err2 := s.db.QueryRow(s.ctx, "SELECT id, email, password, name, tier, image_url FROM users WHERE email = $1 AND password = $2", user.Email, hashed_password).Scan(&u.ID, &u.Email, &u.Password, &u.Name, &u.Tier, &u.Imageurl)
	if err2 != nil {
		return "", err2
	}

	session_token, err := generateSessionToken()
	if err != nil {
		return "", err
	}

	conn, err := s.db.Exec(s.ctx, "INSERT INTO sessions (id, user_id, token) VALUES (gen_random_uuid(), $1, $2)", u.ID, session_token)
	if err != nil {
		return "", err
	}
	if conn.RowsAffected() == 0 {
		return "", nil
	}

	return session_token, nil
}

func (s *authService) LogoutUser(userID string) (bool, error) {
	conn, err := s.db.Exec(s.ctx, "DELETE FROM sessions WHERE user_id = $1", userID)
	if err != nil {
		return false, err
	}
	if conn.RowsAffected() == 0 {
		return false, nil
	}
	return true, nil
}

func (s *authService) ValidateToken(token string) (uuid.UUID, error) {
	var session Session
	err := s.db.QueryRow(s.ctx, "SELECT user_id FROM sessions WHERE token = $1", token).Scan(&session.UserID)
	if err != nil {
		return uuid.UUID{}, err
	}
	return session.UserID, nil
}

func (s *authService) GetUser(userID string) (UserResponse, error) {
	var u User
	err := s.db.QueryRow(s.ctx, "SELECT * FROM users WHERE id = $1", userID).Scan(&u.ID, &u.Email, &u.Password, &u.Name, &u.Tier, &u.Imageurl, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return UserResponse{}, err
	}
	return UserResponse{ID: u.ID, Email: u.Email, Name: u.Name, Tier: u.Tier, Imageurl: u.Imageurl, CreatedAt: u.CreatedAt, UpdatedAt: u.UpdatedAt}, nil
}

func (s *authService) SearchUser(email string) ([]UserResponse, error) {
	var users []UserResponse
	rows, err := s.db.Query(s.ctx, "SELECT * FROM users WHERE email LIKE $1", email+"%")
	if err != nil {
		return users, err
	}
	defer rows.Close()
	for rows.Next() {
		var u User
		err := rows.Scan(&u.ID, &u.Email, &u.Password, &u.Name, &u.Tier, &u.Imageurl, &u.CreatedAt, &u.UpdatedAt)
		if err != nil {
			return users, err
		}
		users = append(users, UserResponse{ID: u.ID, Email: u.Email, Name: u.Name, Tier: u.Tier, Imageurl: u.Imageurl, CreatedAt: u.CreatedAt, UpdatedAt: u.UpdatedAt})
	}
	return users, nil
}

func (s *authService) CheckEmailDuplicate(email string) (bool, error) {
	var e string
	err := s.db.QueryRow(s.ctx, "SELECT email FROM users WHERE email = $1", email).Scan(&e)
	if err != nil {
		return false, nil
	}
	return true, nil
}

func (s *authService) UpdateUser(userID string, user UserUpdate) (bool, error) {
	hashed_password, err := hashPassword(user.Password)
	if err != nil {
		return false, err
	}

	conn, err := s.db.Exec(s.ctx, "UPDATE users SET email = $1, password = $2, name = $3, image_url = $4, updated_at = NOW() WHERE id = $5", user.Email, hashed_password, user.Name, user.Imageurl, userID)
	if err != nil {
		return false, err
	}
	if conn.RowsAffected() == 0 {
		return false, nil
	}
	return true, nil
}

func (s *authService) DeleteUser(userID string) (bool, error) {
	conn, err := s.db.Exec(s.ctx, "DELETE FROM users WHERE id = $1 CASCADE", userID)
	if err != nil {
		return false, err
	}
	if conn.RowsAffected() == 0 {
		return false, nil
	}
	return true, nil
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func comparePassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

func generateSessionToken() (string, error) {
	b := make([]byte, 48)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

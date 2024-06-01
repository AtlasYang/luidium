package auth

import (
	"os"
	"time"

	"github.com/google/uuid"
)

const (
	AuthUserTable     = "users"
	AuthSessionsTable = "sessions"
)

var SecretKey = []byte(os.Getenv("JWT_SECRET_KEY"))

type User struct {
	ID        uuid.UUID `json:"id"`
	Email     string    `json:"email"`
	Password  string    `json:"password"`
	Name      string    `json:"name"`
	Tier      int       `json:"tier"`
	Imageurl  string    `json:"image_url"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Token struct {
	SessionToken string `json:"session_token"`
}

type UserLogin struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UserRegister struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
	Imageurl string `json:"image_url"`
}

type UserUpdate struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
	Imageurl string `json:"image_url"`
}

type UserResponse struct {
	ID        uuid.UUID `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	Tier      int       `json:"tier"`
	Imageurl  string    `json:"image_url"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Session struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"user_id"`
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}

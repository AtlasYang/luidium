package session

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

func GetDatabaseClient(c *context.Context) *pgxpool.Pool {
	connHost := os.Getenv("SENTINEL_DB_CONNECTION")
	dbpool, err := pgxpool.New(*c, connHost)

	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
		os.Exit(1)
	}

	return dbpool
}

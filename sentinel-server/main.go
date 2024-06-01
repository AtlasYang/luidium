package main

import (
	"context"

	"luidium.com/sentinel-server/auth"
	"luidium.com/sentinel-server/authority"
	"luidium.com/sentinel-server/logger"
	"luidium.com/sentinel-server/usagecap"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	ctx := context.Background()

	auth.SetupAuthRoute(&ctx, router)
	authority.SetupAuthorityRoutes(&ctx, router)
	usagecap.SetupUsageCapRoutes(&ctx, router)
	logger.SetupLoggerRoutes(&ctx, router)

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"PUT", "POST", "GET", "OPTIONS"},
	}))

	router.Run(":8090")
}

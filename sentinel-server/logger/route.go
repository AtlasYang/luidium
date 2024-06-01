package logger

import (
	"context"

	"github.com/gin-gonic/gin"
)

func SetupLoggerRoutes(c *context.Context, router *gin.Engine) {
	loggerService := NewLoggerService(c)
	loggerController := NewLoggerController(loggerService)

	loggerRoutes := router.Group("/logger")
	{
		loggerRoutes.POST("/", loggerController.CreateLog)
		loggerRoutes.POST("/application", loggerController.CreateApplicationLog)
		loggerRoutes.POST("/block", loggerController.CreateBlockLog)
		loggerRoutes.GET("/:userID", loggerController.ReadLog)
		loggerRoutes.GET("/:userID/application/:applicationID", loggerController.ReadApplicationLog)
		loggerRoutes.GET("/:userID/block/:blockID", loggerController.ReadBlockLog)
	}
}

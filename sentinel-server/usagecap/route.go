package usagecap

import (
	"context"

	"github.com/gin-gonic/gin"
)

func SetupUsageCapRoutes(c *context.Context, router *gin.Engine) {
	usageCapService := NewUsageCapService(c)
	usageCapController := NewUsageCapController(usageCapService)

	usageCapRoutes := router.Group("/usagecap")
	{
		usageCapRoutes.GET("/application/:userID", usageCapController.GetUsageCapApplication)
		usageCapRoutes.GET("/version/:userID/:applicationID", usageCapController.GetUsageCapVersion)
		usageCapRoutes.GET("/block/:userID/:applicationID/:version", usageCapController.GetUsageCapBlock)

		usageCapRoutes.POST("/application", usageCapController.CreateUsageCapApplication)
		usageCapRoutes.POST("/version", usageCapController.CreateUsageCapVersion)
		usageCapRoutes.POST("/block", usageCapController.CreateUsageCapBlock)

		usageCapRoutes.PUT("/application", usageCapController.UpdateUsageCapApplication)
		usageCapRoutes.PUT("/version", usageCapController.UpdateUsageCapVersion)
		usageCapRoutes.PUT("/block", usageCapController.UpdateUsageCapBlock)

		usageCapRoutes.DELETE("/:userID", usageCapController.DeleteAllUsageCap)
	}
}

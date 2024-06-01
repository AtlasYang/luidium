package authority

import (
	"context"

	"github.com/gin-gonic/gin"
)

func SetupAuthorityRoutes(c *context.Context, router *gin.Engine) {
	authorityService := NewAuthorityService(c)
	authorityController := NewAuthorityController(authorityService)

	authorityRoutes := router.Group("/authority")
	{
		authorityRoutes.POST("/", authorityController.CreateAuthority)
		authorityRoutes.PUT("/", authorityController.UpdateAuthority)
		authorityRoutes.GET("/entity/:entityID", authorityController.GetAllAuthorityByEntityID)
		authorityRoutes.GET("/:userID/:entityID", authorityController.GetAuthority)
		authorityRoutes.GET("/read/:userID/:entityID", authorityController.CheckReadAuthority)
		authorityRoutes.GET("/write/:userID/:entityID", authorityController.CheckWriteAuthority)
		authorityRoutes.DELETE("/:userID/:entityID", authorityController.DeleteAuthority)
	}
}

package auth

import (
	"context"

	"github.com/gin-gonic/gin"
)

func SetupAuthRoute(c *context.Context, router *gin.Engine) {
	authService := NewAuthService(c)
	authController := NewAuthController(authService)

	authRoutes := router.Group("/auth")
	{
		authRoutes.POST("/register", authController.RegisterUser)
		authRoutes.POST("/login", authController.LoginUser)
		authRoutes.POST("/logout/:userID", authController.LogoutUser)
		authRoutes.POST("/validate", authController.ValidateToken)
		authRoutes.GET("/user/:userID", authController.GetUser)
		authRoutes.GET("/search/:email", authController.SearchUsers)
		authRoutes.GET("/check/:email", authController.CheckEmailDuplicate)
		authRoutes.PUT("/user/:userID", authController.UpdateUser)
		authRoutes.DELETE("/user/:userID", authController.DeleteUser)
	}
}

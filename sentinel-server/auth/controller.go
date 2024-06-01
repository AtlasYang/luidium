package auth

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuthController struct {
	authService AuthService
}

func NewAuthController(authService AuthService) *AuthController {
	return &AuthController{authService: authService}
}

func (c *AuthController) RegisterUser(ctx *gin.Context) {
	var user UserRegister
	if err := ctx.ShouldBindJSON(&user); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"content": err.Error()})
		return
	}

	userID, err := c.authService.RegisterUser(user)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"content": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"content": userID})
}

func (c *AuthController) LoginUser(ctx *gin.Context) {
	var user UserLogin
	if err := ctx.ShouldBindJSON(&user); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	sessionToken, err := c.authService.LoginUser(user)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"session_token": sessionToken})
}

func (c *AuthController) LogoutUser(ctx *gin.Context) {
	userID := ctx.Param("userID")

	success, err := c.authService.LogoutUser(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"success": success})
}

func (c *AuthController) ValidateToken(ctx *gin.Context) {
	var token Token
	if err := ctx.ShouldBindJSON(&token); err != nil {
		fmt.Println(err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	fmt.Println("ValidateToken recieved token: ", token)

	userID, err := c.authService.ValidateToken(token.SessionToken)
	if err != nil {
		fmt.Println(err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"user_id": userID})
}

func (c *AuthController) GetUser(ctx *gin.Context) {
	userID := ctx.Param("userID")

	user, err := c.authService.GetUser(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"user": user})
}

func (c *AuthController) SearchUsers(ctx *gin.Context) {
	email := ctx.Param("email")

	users, err := c.authService.SearchUser(email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, []UserResponse{})
		return
	}

	ctx.JSON(http.StatusOK, users)
}

func (c *AuthController) CheckEmailDuplicate(ctx *gin.Context) {
	email := ctx.Param("email")

	duplicate, err := c.authService.CheckEmailDuplicate(email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"success": duplicate})
}

func (c *AuthController) UpdateUser(ctx *gin.Context) {
	userID := ctx.Param("userID")
	var user UserUpdate
	if err := ctx.ShouldBindJSON(&user); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	success, err := c.authService.UpdateUser(userID, user)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"success": success})
}

func (c *AuthController) DeleteUser(ctx *gin.Context) {
	userID := ctx.Param("userID")

	success, err := c.authService.DeleteUser(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"success": success})
}

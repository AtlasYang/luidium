package usagecap

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UsageCapController struct {
	usageCapService UsageCapService
}

func NewUsageCapController(usageCapService UsageCapService) *UsageCapController {
	return &UsageCapController{usageCapService: usageCapService}
}

func (uc *UsageCapController) GetUsageCapApplication(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("userID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	usageCapApplication, err := uc.usageCapService.GetUsageCapApplication(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, usageCapApplication)
}

func (uc *UsageCapController) GetUsageCapVersion(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("userID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	applicationID, err := uuid.Parse(c.Param("applicationID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	usageCapVersion, err := uc.usageCapService.GetUsageCapVersion(userID, applicationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, usageCapVersion)
}

func (uc *UsageCapController) GetUsageCapBlock(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("userID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	applicationID, err := uuid.Parse(c.Param("applicationID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	version := c.Param("version")

	usageCapBlock, err := uc.usageCapService.GetUsageCapBlock(userID, applicationID, version)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, usageCapBlock)
}

func (uc *UsageCapController) UpdateUsageCapApplication(c *gin.Context) {
	var usageCapApplication UsageCapApplication

	if err := c.ShouldBindJSON(&usageCapApplication); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := uc.usageCapService.UpdateUsageCapApplication(usageCapApplication.UserID, usageCapApplication.Remaining)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Usage cap application updated"})
}

func (uc *UsageCapController) UpdateUsageCapVersion(c *gin.Context) {
	var usageCapVersion UsageCapVersion

	if err := c.ShouldBindJSON(&usageCapVersion); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := uc.usageCapService.UpdateUsageCapVersion(usageCapVersion.UserID, usageCapVersion.ApplicationID, usageCapVersion.Remaining)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Usage cap version updated"})
}

func (uc *UsageCapController) UpdateUsageCapBlock(c *gin.Context) {
	var usageCapBlock UsageCapBlock

	if err := c.ShouldBindJSON(&usageCapBlock); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := uc.usageCapService.UpdateUsageCapBlock(usageCapBlock.UserID, usageCapBlock.ApplicationID, usageCapBlock.Version, usageCapBlock.Remaining)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Usage cap block updated"})
}

func (uc *UsageCapController) CreateUsageCapApplication(c *gin.Context) {
	var usageCapApplication UsageCapApplication
	if err := c.ShouldBindJSON(&usageCapApplication); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := uc.usageCapService.CreateUsageCapApplication(usageCapApplication.UserID, usageCapApplication.Remaining)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Usage cap application created"})
}

func (uc *UsageCapController) CreateUsageCapVersion(c *gin.Context) {
	var usageCapVersion UsageCapVersion
	if err := c.ShouldBindJSON(&usageCapVersion); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := uc.usageCapService.CreateUsageCapVersion(usageCapVersion.UserID, usageCapVersion.ApplicationID, usageCapVersion.Remaining)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Usage cap version created"})
}

func (uc *UsageCapController) CreateUsageCapBlock(c *gin.Context) {
	var usageCapBlock UsageCapBlock
	if err := c.ShouldBindJSON(&usageCapBlock); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := uc.usageCapService.CreateUsageCapBlock(usageCapBlock.UserID, usageCapBlock.ApplicationID, usageCapBlock.Version, usageCapBlock.Remaining)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Usage cap block created"})
}

func (uc *UsageCapController) DeleteAllUsageCap(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("userID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = uc.usageCapService.DeleteAllUsageCap(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "All usage cap data deleted"})
}

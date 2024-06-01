package logger

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type LoggerController struct {
	loggerService LoggerService
}

func NewLoggerController(loggerService LoggerService) *LoggerController {
	return &LoggerController{loggerService: loggerService}
}

func (lc *LoggerController) CreateLog(c *gin.Context) {
	var log Log
	err := c.ShouldBindJSON(&log)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = lc.loggerService.CreateLog(log.UserID, log.Level, log.Type, log.Message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"log": log})
}

func (lc *LoggerController) ReadLog(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("userID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, nil)
		return
	}

	logs, err := lc.loggerService.ReadLog(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, nil)
		return
	}

	c.JSON(http.StatusOK, logs)
}

func (lc *LoggerController) CreateApplicationLog(c *gin.Context) {
	var log Log
	err := c.ShouldBindJSON(&log)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = lc.loggerService.CreateApplicationLog(log.UserID, log.ApplicationID.UUID, log.Level, log.Type, log.Message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"log": log})
}

func (lc *LoggerController) ReadApplicationLog(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("userID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, nil)
		return
	}

	applicationID, err := uuid.Parse(c.Param("applicationID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, nil)
		return
	}

	logs, err := lc.loggerService.ReadApplicationLog(userID, applicationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, nil)
		return
	}

	c.JSON(http.StatusOK, logs)
}

func (lc *LoggerController) CreateBlockLog(c *gin.Context) {
	var log Log
	err := c.ShouldBindJSON(&log)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = lc.loggerService.CreateBlockLog(log.UserID, log.ApplicationID.UUID, log.BlockID.UUID, log.Level, log.Type, log.Message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"log": log})
}

func (lc *LoggerController) ReadBlockLog(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("userID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, nil)
		return
	}

	blockID, err := uuid.Parse(c.Param("blockID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, nil)
		return
	}

	logs, err := lc.loggerService.ReadBlockLog(userID, blockID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, nil)
		return
	}

	c.JSON(http.StatusOK, logs)
}

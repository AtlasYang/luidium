package main

import (
	"builder/storage-server/lib"
	"builder/storage-server/session"
	"encoding/json"
	"fmt"
	"net/http"
	"path"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()
	minioClient := session.GetStorageClient()

	router.GET("/storage/config/:bucket/*object_key", func(c *gin.Context) {
		bucket := c.Param("bucket")
		objectKey := c.Param("object_key")
		config, err := lib.ReadObjectByte(minioClient, bucket, objectKey+"/luidium-config.json")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Config not found"})
		}

		var luidiumConfig lib.LuidiumConfig
		if err := json.Unmarshal(config, &luidiumConfig); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid config"})
		}

		c.JSON(http.StatusOK, luidiumConfig)
	})

	router.GET("/storage/download/:bucket/*object_key", func(c *gin.Context) {
		bucket := c.Param("bucket")
		objectKey := c.Param("object_key")
		objectByte, err := lib.ReadObjectByte(minioClient, bucket, objectKey)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Object not found"})
		}
		contentType := lib.GetMimeType(objectKey)
		fileName := path.Base(objectKey)

		c.Header("Content-Disposition", "attachment; filename="+fileName)
		c.Header("Content-Type", contentType)
		c.Header("ACCESS-CONTROL-ALLOW-ORIGIN", "https://app.luidium.com")

		_, err = c.Writer.Write(objectByte)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to send file"})
			return
		}

		c.Status(http.StatusOK)
	})

	router.PUT("/storage/upload/:bucket/*object_key", func(c *gin.Context) {
		bucket := c.Param("bucket")
		objectKey := c.Param("object_key")
		file, _, err := c.Request.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		defer file.Close()

		contentType := lib.GetMimeType(objectKey)
		var fileSize int64
		size, err := strconv.Atoi(c.Request.FormValue("size"))
		if err != nil {
			fileSize = -1
		} else {
			fileSize = int64(size)
		}
		fmt.Println("Request received with file size: ", fileSize)
		if lib.PutObject(minioClient, bucket, objectKey, file, contentType, fileSize) {
			c.Header("ACCESS-CONTROL-ALLOW-ORIGIN", "https://app.luidium.com")
			c.JSON(http.StatusOK, gin.H{"message": "Object uploaded"})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Object not uploaded"})
		}
	})

	router.POST("/storage/single", func(c *gin.Context) {
		fmt.Println("Request received with body (single): ", c.Request.Body)
		var body lib.StorageRequest
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		switch body.Action {
		case lib.StorageActionCreateBucket:
			if lib.CreateBucket(minioClient, body.Bucket) {
				c.JSON(http.StatusOK, gin.H{"message": "Bucket created"})
			} else {
				c.JSON(http.StatusBadRequest, gin.H{"message": "Bucket not created"})
			}

		case lib.StorageActionListObject:
			objectKeys := lib.ListObject(minioClient, body.Bucket, body.ObjectKey)
			if objectKeys == nil {
				c.JSON(http.StatusBadRequest, gin.H{"message": "Object not found"})
			} else {
				c.JSON(http.StatusOK, gin.H{"object_keys": objectKeys})
			}

		case lib.StorageActionReadObject:
			objectContent, err := lib.ReadObject(minioClient, body.Bucket, body.ObjectKey)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"message": "Object not found"})
			} else {
				c.JSON(http.StatusOK, gin.H{"content": objectContent})
			}

		case lib.StorageActionDeleteObject:
			if lib.DeleteObject(minioClient, body.Bucket, body.ObjectKey) {
				c.JSON(http.StatusOK, gin.H{"message": "Object deleted"})
			} else {
				c.JSON(http.StatusBadRequest, gin.H{"message": "Object not deleted"})
			}

		case lib.StorageActionDeleteFolder:
			objectKeys := lib.ListObject(minioClient, body.Bucket, body.ObjectKey)
			fmt.Println("Object keys: ", objectKeys)
			if objectKeys == nil {
				c.JSON(http.StatusBadRequest, gin.H{"message": "Folder not found"})
			} else {
				for _, objectKey := range objectKeys {
					if !lib.DeleteObject(minioClient, body.Bucket, objectKey) {
						c.JSON(http.StatusBadRequest, gin.H{"message": "Folder not deleted"})
						return
					}
				}
				c.JSON(http.StatusOK, gin.H{"message": "Folder deleted"})
			}

		case lib.StorageActionDeleteFolderExceptConfig:
			configName := body.ObjectKey + "/luidium-config.json"
			objectKeys := lib.ListObject(minioClient, body.Bucket, body.ObjectKey)
			fmt.Println("Object keys: ", objectKeys)
			if objectKeys == nil {
				c.JSON(http.StatusBadRequest, gin.H{"message": "Folder not found"})
			} else {
				for _, objectKey := range objectKeys {
					if objectKey != configName {
						if !lib.DeleteObject(minioClient, body.Bucket, objectKey) {
							c.JSON(http.StatusBadRequest, gin.H{"message": "Folder not deleted"})
							return
						}
					}
				}
				c.JSON(http.StatusOK, gin.H{"message": "Folder deleted"})
			}

		case lib.StorageActionDeleteBucket:
			if lib.DeleteBucket(minioClient, body.Bucket) {
				c.JSON(http.StatusOK, gin.H{"message": "Bucket deleted"})
			} else {
				c.JSON(http.StatusBadRequest, gin.H{"message": "Bucket not deleted"})
			}

		default:
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid action"})
		}
	})

	router.POST("/storage/multiple", func(c *gin.Context) {
		fmt.Println("Request received with body (multiple): ", c.Request.Body)
		var body lib.StorageRequestMul
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		switch body.Action {
		case lib.StorageActionDeleteObject:
			for _, objectKey := range body.ObjectKeys {
				if !lib.DeleteObject(minioClient, body.Bucket, objectKey) {
					c.JSON(http.StatusBadRequest, gin.H{"message": "Object not deleted"})
					return
				}
			}
			c.JSON(http.StatusOK, gin.H{"message": "Objects deleted"})

		case lib.StorageActionCopyFolder:
			srcBucket := "luidium-templates"
			destBucket := body.Bucket
			srcObjectKey := body.ObjectKeys[0]
			destObjectKey := body.ObjectKeys[1]

			if lib.CopyFolder(minioClient, srcBucket, srcObjectKey, destBucket, destObjectKey) {
				c.JSON(http.StatusOK, gin.H{"message": "Folder copied"})
			} else {
				c.JSON(http.StatusBadRequest, gin.H{"message": "Folder not copied"})
			}

		default:
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid action"})
		}
	})

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "https://app.luidium.com"},
		AllowMethods:     []string{"PUT", "POST", "OPTIONS", "GET", "DELETE"},
		AllowCredentials: true,
		AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization"},
		ExposeHeaders:    []string{"Content-Length", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers", "Access-Control-Allow-Methods", "Access-Control-Allow-Credentials"},
	}))

	router.Run(":8080")
}

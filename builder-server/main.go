package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"luidium.com/builder-server/lib"
	"luidium.com/builder-server/session"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()
	minioClient := session.GetStorageClient()

	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers": os.Getenv("KAFKA_BROKER_HOST"),
		"group.id":          os.Getenv("KAFKA_CONSUMER_GROUP"),
		"auto.offset.reset": "earliest",
	})
	if err != nil {
		panic(err)
	}

	c.SubscribeTopics([]string{os.Getenv("KAFKA_TOPIC")}, nil)
	workerCount, err := strconv.Atoi(os.Getenv("WORKER_COUNT"))
	if err != nil {
		panic(err)
	}

	msgChan := make(chan *kafka.Message, workerCount)

	for i := 0; i < workerCount; i++ {
		go func() {
			for msg := range msgChan {
				var req lib.StorageServerRequest
				err := json.Unmarshal(msg.Value, &req)
				if err != nil {
					lib.UpdateBlockStatus(req.BlockID.String(), lib.BlockStatusFailed)
					continue
				}

				if req.Action == lib.BlockActionStop {
					success := lib.StopAndRemoveContainer(req.UserID, req.ApplicationID, req.BlockID, req.Bucket, req.Version, req.Blockname)
					if !success {
						lib.UpdateBlockStatus(req.BlockID.String(), lib.BlockStatusFailed)
						continue
					}
					lib.UpdateBlockStatus(req.BlockID.String(), lib.BlockStatusStopped)
				}

				if req.Action == lib.BlockActionRemove {
					lib.StopAndRemoveContainerAndVolume(req.UserID, req.ApplicationID, req.BlockID, req.Bucket, req.Version, req.Blockname)
				}

				if req.Action == lib.BlockActionBuild || req.Action == lib.BlockActionBuildAndRun {
					lib.UpdateBlockStatus(req.BlockID.String(), lib.BlockStatusBuilding)
					success := lib.DownloadBlockAsset(minioClient, req.UserID, req.ApplicationID, req.BlockID, req.Bucket, req.Version, req.Blockname)
					if !success {
						lib.UpdateBlockStatus(req.BlockID.String(), lib.BlockStatusFailed)
						continue
					}

					success = lib.BuildImageFromBlockAsset(minioClient, req.UserID, req.ApplicationID, req.BlockID, req.Bucket, req.Version, req.Blockname)
					if !success {
						lib.UpdateBlockStatus(req.BlockID.String(), lib.BlockStatusFailed)
						continue
					}

					if req.Action == lib.BlockActionBuild {
						lib.UpdateBlockStatus(req.BlockID.String(), lib.BlockStatusReady)
					} else {
						lib.UpdateBlockStatus(req.BlockID.String(), lib.BlockStatusPending)
					}
				}

				if req.Action == lib.BlockActionRun || req.Action == lib.BlockActionBuildAndRun {
					success := lib.DownloadAndRunBlockImage(minioClient, req.UserID, req.ApplicationID, req.BlockID, req.Bucket, req.Version, req.Blockname)
					if !success {
						lib.UpdateBlockStatus(req.BlockID.String(), lib.BlockStatusFailed)
						continue
					}
					lib.UpdateBlockStatus(req.BlockID.String(), lib.BlockStatusRunning)
				}

			}
		}()
	}

	go func() {
		for {
			msg, err := c.ReadMessage(time.Second)
			if err == nil {
				msgChan <- msg
			} else if !err.(kafka.Error).IsTimeout() {
				fmt.Printf("Consumer error: %v (%v)\n", err, msg)
			}
		}
	}()

	router.POST("/stop_and_remove_container", func(c *gin.Context) {
		var body lib.StorageServerRequest
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		success := lib.StopAndRemoveContainer(body.UserID, body.ApplicationID, body.BlockID, body.Bucket, body.Version, body.Blockname)
		if !success {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to stop and remove container"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	router.POST("/create_volume", func(c *gin.Context) {
		var body lib.CreateVolumeRequest
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		volumeName, err := lib.CreateVolume(body.Bucket, body.Version, body.BlockName)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create volume"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"volume_name": volumeName})
	})

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"PUT", "POST"},
	}))

	router.Run(":8080")
}

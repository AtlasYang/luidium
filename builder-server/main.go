package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"sync"
	"syscall"
	"time"

	"luidium.com/builder-server/lib"
	"luidium.com/builder-server/session"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
)

func main() {
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()
	minioClient := session.GetStorageClient()

	kafkaBroker := os.Getenv("KAFKA_BROKER_HOST")
	consumerGroup := os.Getenv("KAFKA_CONSUMER_GROUP")
	kafkaTopic := os.Getenv("KAFKA_TOPIC")
	workerCount, err := strconv.Atoi(os.Getenv("WORKER_COUNT"))
	if err != nil {
		log.Fatalf("Invalid WORKER_COUNT: %v", err)
	}

	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers": kafkaBroker,
		"group.id":          consumerGroup,
		"auto.offset.reset": "earliest",
	})
	if err != nil {
		log.Fatalf("Failed to create Kafka consumer: %v", err)
	}
	defer c.Close()

	c.SubscribeTopics([]string{kafkaTopic}, nil)

	msgChan := make(chan *kafka.Message, workerCount)
	var wg sync.WaitGroup

	for i := 0; i < workerCount; i++ {
		wg.Add(1)
		go worker(msgChan, minioClient, &wg)
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	go func() {
		for {
			select {
			case <-ctx.Done():
				close(msgChan)
				return
			default:
				msg, err := c.ReadMessage(time.Second)
				if err == nil {
					msgChan <- msg
				} else if !err.(kafka.Error).IsTimeout() {
					log.Printf("Consumer error: %v (%v)\n", err, msg)
				}
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

	server := &http.Server{
		Addr:    ":8080",
		Handler: router,
	}

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("HTTP server ListenAndServe: %v", err)
		}
	}()

	<-ctx.Done()
	stop()
	log.Println("Shutting down gracefully...")

	ctxShutDown, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctxShutDown); err != nil {
		log.Fatalf("HTTP server Shutdown: %v", err)
	}

	wg.Wait()
	log.Println("Server exited")
}

func worker(msgChan chan *kafka.Message, minioClient *minio.Client, wg *sync.WaitGroup) {
	defer wg.Done()
	for msg := range msgChan {
		var req lib.StorageServerRequest
		err := json.Unmarshal(msg.Value, &req)
		if err != nil {
			lib.UpdateBlockStatus(req.BlockID.String(), lib.BlockStatusFailed)
			continue
		}

		handleRequest(req, minioClient)
	}
}

func handleRequest(req lib.StorageServerRequest, minioClient *minio.Client) {
	if req.Action == lib.BlockActionStop {
		success := lib.StopAndRemoveContainer(req.UserID, req.ApplicationID, req.BlockID, req.Bucket, req.Version, req.Blockname)
		if !success {
			lib.UpdateBlockStatus(req.BlockID.String(), lib.BlockStatusFailed)
			return
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
			return
		}

		success = lib.BuildImageFromBlockAsset(minioClient, req.UserID, req.ApplicationID, req.BlockID, req.Bucket, req.Version, req.Blockname)
		if !success {
			lib.UpdateBlockStatus(req.BlockID.String(), lib.BlockStatusFailed)
			return
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
			return
		}
		lib.UpdateBlockStatus(req.BlockID.String(), lib.BlockStatusRunning)
	}
}

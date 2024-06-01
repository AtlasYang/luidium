package lib

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/google/uuid"
)

func LogSentinelServer(log Log) {
	uri := "http://" + os.Getenv("SENTINEL_SERVER_HOST") + "/logger/block"
	jsonStr, err := json.Marshal(log)
	if err != nil {
		fmt.Println(err)
	}
	req, err := http.NewRequest("POST", uri, bytes.NewBuffer(jsonStr))
	if err != nil {
		fmt.Println(err)
	}
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
	}

	fmt.Println(resp.Status)
	fmt.Println(resp.Body)
	defer resp.Body.Close()
}

func GenerateInvalidBlockDataLog(userID uuid.UUID, applicationID uuid.UUID, blockID uuid.UUID, bucketName string, version string, blockName string, errText string) {
	LogSentinelServer(Log{
		UserID:        userID,
		ApplicationID: applicationID,
		BlockID:       blockID,
		Level:         LogError,
		Type:          LogTypeBlock,
		Message:       fmt.Sprintf("Finding block data for application [[%s]], version [%s], block [%s] failed with error: %s", bucketName, version, blockName, errText),
		Timestamp:     time.Now(),
	})
}

func GenerateInvalidBlockImageLog(userID uuid.UUID, applicationID uuid.UUID, blockID uuid.UUID, bucketName string, version string, blockName string, errText string) {
	LogSentinelServer(Log{
		UserID:        userID,
		ApplicationID: applicationID,
		BlockID:       blockID,
		Level:         LogError,
		Type:          LogTypeBlock,
		Message:       fmt.Sprintf("Finding block image for application [%s], version [%s], block [%s] failed with error: %s", bucketName, version, blockName, errText),
		Timestamp:     time.Now(),
	})
}

func GenerateBuildFailedLog(userID uuid.UUID, applicationID uuid.UUID, blockID uuid.UUID, bucketName string, version string, blockName string, errText string) {
	LogSentinelServer(Log{
		UserID:        userID,
		ApplicationID: applicationID,
		BlockID:       blockID,
		Level:         LogError,
		Type:          LogTypeBlock,
		Message:       fmt.Sprintf("Building image for application [%s], version [%s], block [%s] failed with error: %s", bucketName, version, blockName, errText),
		Timestamp:     time.Now(),
	})
}

func GenerateRunFailedLog(userID uuid.UUID, applicationID uuid.UUID, blockID uuid.UUID, bucketName string, version string, blockName string, errText string) {
	LogSentinelServer(Log{
		UserID:        userID,
		ApplicationID: applicationID,
		BlockID:       blockID,
		Level:         LogError,
		Type:          LogTypeBlock,
		Message:       fmt.Sprintf("Running image for application [%s], version [%s], block [%s] failed with error: %s", bucketName, version, blockName, errText),
		Timestamp:     time.Now(),
	})
}

func GenerateBuildImageSuccessLog(userID uuid.UUID, applicationID uuid.UUID, blockID uuid.UUID, bucketName string, version string, blockName string) {
	LogSentinelServer(Log{
		UserID:        userID,
		ApplicationID: applicationID,
		BlockID:       blockID,
		Level:         LogSuccess,
		Type:          LogTypeBlock,
		Message:       fmt.Sprintf("Building image for application [%s], version [%s], block [%s] success", bucketName, version, blockName),
		Timestamp:     time.Now(),
	})
}

func GenerateRunImageLog(userID uuid.UUID, applicationID uuid.UUID, blockID uuid.UUID, bucketName string, version string, blockName string) {
	LogSentinelServer(Log{
		UserID:        userID,
		ApplicationID: applicationID,
		BlockID:       blockID,
		Level:         LogInfo,
		Type:          LogTypeBlock,
		Message:       fmt.Sprintf("Running image for application [%s], version [%s], block [%s] success", bucketName, version, blockName),
		Timestamp:     time.Now(),
	})
}

func GenerateStopContainerLog(userID uuid.UUID, applicationID uuid.UUID, blockID uuid.UUID, bucketName string, version string, blockName string) {
	LogSentinelServer(Log{
		UserID:        userID,
		ApplicationID: applicationID,
		BlockID:       blockID,
		Level:         LogInfo,
		Type:          LogTypeBlock,
		Message:       fmt.Sprintf("Stopping container for application [%s], version [%s], block [%s] success", bucketName, version, blockName),
		Timestamp:     time.Now(),
	})
}

func GenerateStopContainerFailLog(userID uuid.UUID, applicationID uuid.UUID, blockID uuid.UUID, bucketName string, version string, blockName string, errText string) {
	LogSentinelServer(Log{
		UserID:        userID,
		ApplicationID: applicationID,
		BlockID:       blockID,
		Level:         LogError,
		Type:          LogTypeBlock,
		Message:       fmt.Sprintf("Stopping container for application [%s], version [%s], block [%s] failed with error: %s", bucketName, version, blockName, errText),
		Timestamp:     time.Now(),
	})
}

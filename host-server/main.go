package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type CloudflareRequest struct {
	Url       string `json:"url"`
	Token     string `json:"token"`
	Name      string `json:"name"`
	IpAddress string `json:"ip_address"`
}

type CloudflareRemoveRequest struct {
	Url   string `json:"url"`
	Token string `json:"token"`
}

func main() {
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	router.POST("/", func(c *gin.Context) {
		fmt.Println("Request received")

		var req CloudflareRequest
		err := c.BindJSON(&req)
		if err != nil {
			fmt.Println(err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		record_id, err := SendRequest(&req)
		if err != nil {
			fmt.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"record_id": record_id})
	})

	router.DELETE("/", func(c *gin.Context) {
		fmt.Println("Remove request received")

		var req CloudflareRemoveRequest
		err := c.BindJSON(&req)
		if err != nil {
			fmt.Println(err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err = SendRemoveRequest(&req)
		if err != nil {
			fmt.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Record removed"})
	})

	router.Run(":10013")
}

func SendRequest(cfr *CloudflareRequest) (string, error) {
	method := "POST"
	payload := strings.NewReader(`{
	  "content": "` + cfr.IpAddress + `",
	  "name": "` + cfr.Name + `",
	  "proxied": true,
	  "type": "A",
	  "comment": "Luidium Apps",
	  "tags": [],
	  "ttl": 3600
	}`)

	client := &http.Client{}
	req, err := http.NewRequest(method, cfr.Url, payload)

	if err != nil {
		fmt.Println(err)
		return "", err
	}
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("X-Auth-Email", "")
	req.Header.Add("Authorization", "Bearer "+cfr.Token)

	res, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	if res.StatusCode != 200 {
		fmt.Println(string(body))
		return "", fmt.Errorf("error: %d", res.StatusCode)
	}

	var response map[string]interface{}
	err = json.Unmarshal(body, &response)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	return response["result"].(map[string]interface{})["id"].(string), nil
}

func SendRemoveRequest(cfr *CloudflareRemoveRequest) error {
	method := "DELETE"

	client := &http.Client{}
	req, err := http.NewRequest(method, cfr.Url, nil)

	if err != nil {
		fmt.Println(err)
		return err
	}
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("X-Auth-Email", "")
	req.Header.Add("Authorization", "Bearer "+cfr.Token)

	res, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
		return err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Println(err)
		return err
	}

	if res.StatusCode != 200 {
		fmt.Println(string(body))
		return fmt.Errorf("error: %d", res.StatusCode)
	}

	return nil
}

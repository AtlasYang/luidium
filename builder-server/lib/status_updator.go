package lib

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

func UpdateBlockStatus(blockID string, status string) {
	uri := "http://" + os.Getenv("MAIN_SERVER_HOST") + "/block/update_status/" + blockID
	fmt.Println("sending request to: ", uri)
	jsonStr, err := json.Marshal(SingleStringRequest{Content: status})
	if err != nil {
		fmt.Println(err)
	}
	req, err := http.NewRequest("PATCH", uri, bytes.NewBuffer(jsonStr))
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

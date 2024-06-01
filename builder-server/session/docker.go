package session

import (
	"fmt"

	docker "github.com/fsouza/go-dockerclient"
)

func GetDockerClient() *docker.Client {
	client, err := docker.NewClient("unix:///var/run/docker.sock")
	if err != nil {
		fmt.Println("Error: ", err)
		panic(err)
	}

	return client
}

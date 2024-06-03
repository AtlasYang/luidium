package lib

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"

	"luidium.com/builder-server/session"

	docker "github.com/fsouza/go-dockerclient"
	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
)

func DownloadBlockAsset(client *minio.Client, userID uuid.UUID, applicationID uuid.UUID, blockID uuid.UUID, bucketName string, version string, blockName string) bool {
	objectsBasePath := version + "/" + blockName
	localPath := "./assets/" + bucketName + "/"
	var objectKeys []string
	doneCh := make(chan struct{})
	defer close(doneCh)

	for object := range client.ListObjects(context.Background(), bucketName, minio.ListObjectsOptions{
		Prefix:    objectsBasePath,
		Recursive: true,
	}) {
		if object.Err != nil {
			GenerateInvalidBlockDataLog(userID, applicationID, blockID, bucketName, version, blockName, object.Err.Error())
			return false
		}
		// ignore "image.tar" file
		if object.Key == objectsBasePath+"/"+blockName+"-image.tar" {
			continue
		}

		objectKeys = append(objectKeys, object.Key)
	}

	for _, objectKey := range objectKeys {
		objectPath := localPath + "/" + objectKey
		if err := client.FGetObject(context.Background(), bucketName, objectKey, objectPath, minio.GetObjectOptions{}); err != nil {
			GenerateInvalidBlockDataLog(userID, applicationID, blockID, bucketName, version, blockName, err.Error())
			return false
		}
	}

	return true
}

func BuildImageFromBlockAsset(client *minio.Client, userID uuid.UUID, applicationID uuid.UUID, blockID uuid.UUID, bucketName string, version string, blockName string) bool {
	defer os.RemoveAll("./assets/" + bucketName + "/" + version + "/" + blockName)

	dockerClient := session.GetDockerClient()
	imageName := bucketName + "-" + version + "-" + blockName

	if err := dockerClient.BuildImage(docker.BuildImageOptions{
		Name:         imageName,
		ContextDir:   "./assets/" + bucketName + "/" + version + "/" + blockName,
		NetworkMode:  "host",
		Dockerfile:   "Dockerfile",
		OutputStream: os.Stdout,
	}); err != nil {
		GenerateBuildFailedLog(userID, applicationID, blockID, bucketName, version, blockName, err.Error())
		return false
	}

	reader, writer := io.Pipe()
	go func() {
		defer writer.Close()
		err := dockerClient.ExportImage(docker.ExportImageOptions{
			Name:         imageName,
			OutputStream: writer,
		})
		if err != nil {
			fmt.Println(err)
		}
	}()

	objectStat, err := client.PutObject(context.Background(), bucketName, version+"/"+blockName+"/"+blockName+"-image.tar", reader, -1, minio.PutObjectOptions{ContentType: "application/x-tar"})
	if err != nil {
		fmt.Println(err)
		return false
	}

	fmt.Println(objectStat)

	// dockerClient.PruneImages(docker.PruneImagesOptions{})
	dockerClient.RemoveImageExtended(imageName, docker.RemoveImageOptions{Force: true, NoPrune: false})
	GenerateBuildImageSuccessLog(userID, applicationID, blockID, bucketName, version, blockName)
	return true
}

func DownloadAndRunBlockImage(client *minio.Client, userID uuid.UUID, applicationID uuid.UUID, blockID uuid.UUID, bucketName string, version string, blockName string) bool {
	dockerClient := session.GetDockerClient()
	imageName := bucketName + "-" + version + "-" + blockName

	dockerClient.StopContainer(imageName, 0)
	dockerClient.RemoveContainer(docker.RemoveContainerOptions{
		ID:            imageName,
		RemoveVolumes: false,
	})

	configObj, err := client.GetObject(context.Background(), bucketName, version+"/"+blockName+"/luidium-config.json", minio.GetObjectOptions{})
	if err != nil {
		GenerateInvalidBlockDataLog(userID, applicationID, blockID, bucketName, version, blockName, err.Error())
		return false
	}

	configObjInfo, err := configObj.Stat()
	if err != nil {
		GenerateInvalidBlockDataLog(userID, applicationID, blockID, bucketName, version, blockName, err.Error())
		return false
	}
	configText := make([]byte, configObjInfo.Size)
	if _, err := configObj.Read(configText); err != nil && err.Error() != "EOF" {
		GenerateInvalidBlockDataLog(userID, applicationID, blockID, bucketName, version, blockName, err.Error())
		return false
	}

	fmt.Println("Config Text: ", string(configText))

	var config LuidiumConfig
	if err := json.Unmarshal(configText, &config); err != nil {
		GenerateInvalidBlockDataLog(userID, applicationID, blockID, bucketName, version, blockName, err.Error())
		return false
	}

	fmt.Println("Parsed Luidium Config: ", config)

	imageObj, err := client.GetObject(context.Background(), bucketName, version+"/"+blockName+"/"+blockName+"-image.tar", minio.GetObjectOptions{})
	if err != nil {
		GenerateInvalidBlockImageLog(userID, applicationID, blockID, bucketName, version, blockName, err.Error())
		return false
	}

	if err := dockerClient.LoadImage(docker.LoadImageOptions{InputStream: imageObj}); err != nil {
		fmt.Println(err)
		return false
	}

	portBinding := config.PortBinding
	volumeBinding := map[string]struct{}{}
	if config.VolumeBinding != "" {
		volumeBinding = map[string]struct{}{
			config.VolumeBinding: {},
		}
	}
	hostPort, containerPort := strings.Split(portBinding, ":")[0], strings.Split(portBinding, ":")[1]
	con, err := dockerClient.CreateContainer(docker.CreateContainerOptions{
		Name: imageName,
		Config: &docker.Config{
			Volumes: volumeBinding,
			Env:     config.EnvironmentVariables,
			Image:   imageName,
			ExposedPorts: map[docker.Port]struct{}{
				docker.Port(containerPort + "/tcp"): {},
			},
		},
		HostConfig: &docker.HostConfig{
			PortBindings: map[docker.Port][]docker.PortBinding{
				docker.Port(containerPort + "/tcp"): {
					{
						HostIP:   "0.0.0.0",
						HostPort: hostPort,
					},
					{
						HostIP:   "::",
						HostPort: hostPort,
					},
				},
			},
		},
	})

	if err != nil {
		fmt.Println(err.Error())
		GenerateRunFailedLog(userID, applicationID, blockID, bucketName, version, blockName, err.Error())
		return false
	}

	if err := dockerClient.StartContainer(con.ID, nil); err != nil {
		fmt.Println(err)
		return false
	}

	// delete image
	dockerClient.RemoveImageExtended(imageName, docker.RemoveImageOptions{
		Force:   true,
		NoPrune: false,
	})

	GenerateRunImageLog(userID, applicationID, blockID, bucketName, version, blockName)
	return true
}

func StopAndRemoveContainer(userID uuid.UUID, applicationID uuid.UUID, blockID uuid.UUID, bucketName string, version string, blockName string) bool {
	dockerClient := session.GetDockerClient()
	imageName := bucketName + "-" + version + "-" + blockName

	if err := dockerClient.StopContainer(imageName, 0); err != nil {
		GenerateStopContainerFailLog(userID, applicationID, blockID, bucketName, version, blockName, err.Error())
		fmt.Println(err)
	}

	if _, err := dockerClient.PruneImages(docker.PruneImagesOptions{}); err != nil {
		GenerateStopContainerFailLog(userID, applicationID, blockID, bucketName, version, blockName, err.Error())
		fmt.Println(err)
	}

	if err := dockerClient.RemoveContainer(docker.RemoveContainerOptions{
		ID:            imageName,
		RemoveVolumes: false,
	}); err != nil {
		GenerateStopContainerFailLog(userID, applicationID, blockID, bucketName, version, blockName, err.Error())
		fmt.Println(err)
	}

	GenerateStopContainerLog(userID, applicationID, blockID, bucketName, version, blockName)
	return true
}

func StopAndRemoveContainerAndVolume(userID uuid.UUID, applicationID uuid.UUID, blockID uuid.UUID, bucketName string, version string, blockName string) bool {
	dockerClient := session.GetDockerClient()
	imageName := bucketName + "-" + version + "-" + blockName

	if err := dockerClient.StopContainer(imageName, 0); err != nil {
		GenerateStopContainerFailLog(userID, applicationID, blockID, bucketName, version, blockName, err.Error())
		fmt.Println(err)
	}

	if err := dockerClient.RemoveContainer(docker.RemoveContainerOptions{
		ID:            imageName,
		RemoveVolumes: true,
	}); err != nil {
		GenerateStopContainerFailLog(userID, applicationID, blockID, bucketName, version, blockName, err.Error())
		fmt.Println(err)
	}

	if _, err := dockerClient.PruneImages(docker.PruneImagesOptions{}); err != nil {
		GenerateStopContainerFailLog(userID, applicationID, blockID, bucketName, version, blockName, err.Error())
		fmt.Println(err)
	}

	volumeName := bucketName + "-" + version + "-" + blockName
	if err := dockerClient.RemoveVolumeWithOptions(docker.RemoveVolumeOptions{
		Name:  volumeName,
		Force: true,
	}); err != nil {
		GenerateStopContainerFailLog(userID, applicationID, blockID, bucketName, version, blockName, err.Error())
	}

	GenerateStopContainerLog(userID, applicationID, blockID, bucketName, version, blockName)
	return true
}

func CreateVolume(bucketName string, version string, blockName string) (string, error) {
	dockerClient := session.GetDockerClient()
	volumeName := bucketName + "-" + version + "-" + blockName

	if _, err := dockerClient.CreateVolume(docker.CreateVolumeOptions{
		Name: volumeName,
	}); err != nil {
		return "", err
	}

	return volumeName, nil
}

// TODO: Implement ContainerStat struct and GetContainerStat function using Websocket and Streaming API
// func GetContainerStat(bucketName string, version string, blockName string) (ContainerStat, error) {}

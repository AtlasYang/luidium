package lib

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"mime/multipart"

	"github.com/minio/minio-go/v7"
)

const EXPIRY = 3600 * 24 * 1000000

func CreateBucket(client *minio.Client, bucketName string) bool {
	if err := client.MakeBucket(context.Background(), bucketName, minio.MakeBucketOptions{Region: "us-east-1"}); err != nil {
		return false
	}
	return true
}

func ListObject(client *minio.Client, bucketName string, objectKey string) []string {
	var objectKeys []string
	doneCh := make(chan struct{})
	defer close(doneCh)

	for object := range client.ListObjects(context.Background(), bucketName, minio.ListObjectsOptions{Prefix: objectKey, Recursive: true}) {
		if object.Err != nil {
			return nil
		}
		objectKeys = append(objectKeys, object.Key)
	}

	return objectKeys
}

func ReadObject(client *minio.Client, bucketName string, objectKey string) (string, error) {
	object, err := client.GetObject(context.Background(), bucketName, objectKey, minio.GetObjectOptions{})
	if err != nil {
		return "", err
	}

	defer object.Close()

	var buf bytes.Buffer
	_, err = io.Copy(&buf, object)
	if err != nil {
		return "", err
	}

	return buf.String(), nil
}

func CopyFolder(client *minio.Client, srcBucketName string, srcObjectKey string, destBucketName string, destObjectKey string) bool {
	doneCh := make(chan struct{})
	defer close(doneCh)

	for object := range client.ListObjects(context.Background(), srcBucketName, minio.ListObjectsOptions{Prefix: srcObjectKey, Recursive: true}) {
		if object.Err != nil {
			return false
		}

		objectKey := object.Key
		objectKey = destObjectKey + objectKey[len(srcObjectKey):]

		if _, err := client.CopyObject(context.Background(), minio.CopyDestOptions{
			Bucket: destBucketName,
			Object: objectKey,
		}, minio.CopySrcOptions{
			Bucket: srcBucketName,
			Object: object.Key,
		}); err != nil {
			return false
		}
	}

	return true
}

func DeleteObject(client *minio.Client, bucketName string, objectKey string) bool {
	if err := client.RemoveObject(context.Background(), bucketName, objectKey, minio.RemoveObjectOptions{
		ForceDelete: true,
	}); err != nil {
		return false
	}
	return true
}

func PutObject(client *minio.Client, bucketName string, objectKey string, file multipart.File, contentType string, fileSize int64) bool {
	_, err := client.PutObject(context.Background(), bucketName, objectKey, file, fileSize, minio.PutObjectOptions{ContentType: contentType})
	if err != nil {
		fmt.Println(err)
	}
	return err == nil
}

func DeleteBucket(client *minio.Client, bucketName string) bool {
	if err := client.RemoveBucketWithOptions(context.Background(), bucketName, minio.RemoveBucketOptions{
		ForceDelete: true,
	}); err != nil {
		return false
	}
	return true
}

func ReadObjectByte(client *minio.Client, bucketName string, objectKey string) ([]byte, error) {
	object, err := client.GetObject(context.Background(), bucketName, objectKey, minio.GetObjectOptions{})
	if err != nil {
		return nil, err
	}

	var buf bytes.Buffer
	defer object.Close()
	_, err = io.Copy(&buf, object)
	if err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

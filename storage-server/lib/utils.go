package lib

import (
	"mime"
	"path/filepath"
)

func FileObjectKey(version string, blockName string, fileName string) string {
	return version + "/" + blockName + "/" + fileName
}

func GetMimeType(fileName string) string {
	ext := filepath.Ext(fileName)
	mimeType := mime.TypeByExtension(ext)
	if mimeType == "" {
		return "application/octet-stream"
	}
	return mimeType
}

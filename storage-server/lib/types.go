package lib

const (
	StorageActionCreateBucket             = "create-bucket"
	StorageActionListObject               = "list-object"
	StorageActionReadObject               = "read-object"
	StorageActionCopyFolder               = "copy-folder"
	StorageActionDeleteObject             = "delete-object"
	StorageActionDeleteFolder             = "delete-folder"
	StorageActionDeleteFolderExceptConfig = "delete-folder-except-config"
	StorageActionDeleteBucket             = "delete-bucket"
)

type StorageRequest struct {
	Action    string `json:"action"`
	Bucket    string `json:"bucket"`
	ObjectKey string `json:"object_key"`
}

type StorageRequestMul struct {
	Action     string   `json:"action"`
	Bucket     string   `json:"bucket"`
	ObjectKeys []string `json:"object_keys"`
	Token      string   `json:"token"`
}

type LuidiumConfig struct {
	BlockName            string   `json:"block_name"`
	Framework            string   `json:"framework"`
	PortBinding          string   `json:"port_binding"`
	VolumeBinding        string   `json:"volume_binding"`
	EnvironmentVariables []string `json:"environment_variables"`
	IgnoreFiles          []string `json:"ignore_files"`
}

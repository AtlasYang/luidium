export const StorageActionCreateBucket = "create-bucket";
export const StorageActionListObject = "list-object";
export const StorageActionDeleteObject = "delete-object";
export const StorageActionBuild = "build";
export const StorageActionRunImage = "run-image";

export interface StorageRequest {
  action: string;
  bucket: string;
  object_key: string;
}

export interface StorageRequestMul {
  action: string;
  bucket: string;
  object_keys: string[];
  token: string;
}

export interface FileConfig {
  bucket_name: string;
  version: string;
  block_name: string;
  file_name: string;
}

export interface BucketConfig {
  bucket_name: string;
}

export interface LuidiumConfig {
  block_name: string;
  framework: string;
  port_binding: string;
  volume_binding: string;
  environment_variables: string[];
  ignore_files: string[];
}

export interface CopyTemplateRequest {
  bucket_name: string;
  object_key: string;
  template_id: string;
}

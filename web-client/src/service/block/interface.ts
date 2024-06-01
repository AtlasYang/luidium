export const BLOCK_TYPE_STORAGE = "storage";
export const BLOCK_TYPE_DATABASE = "database";
export const BLOCK_TYPE_SERVER = "server";
export const BLOCK_TYPE_WEB = "web";

export const BLOCK_STATUS_FAILED = "failed";
export const BLOCK_STATUS_STOPPED = "stopped";
export const BLOCK_STATUS_READY = "ready";
export const BLOCK_STATUS_PENDING = "pending";
export const BLOCK_STATUS_RUNNING = "running";
export const BLOCK_STATUS_BUILDING = "building";

export const BLOCK_ACTION_BUILD = "build";
export const BLOCK_ACTION_RUN = "run";
export const BLOCK_ACTION_BUILD_AND_RUN = "build_and_run";
export const BLOCK_ACTION_STOP = "stop";

export interface Block {
  id: string;
  application_id: string;
  block_type: string;
  description: string;
  dns_record_id: string;
  external_port: number;
  external_rootdomain: string;
  external_subdomain: string;
  is_active: boolean;
  is_external: boolean;
  name: string;
  status: string;
  version: string;
}

export function getBlockForCreate({
  application_id,
  block_type,
  description,
  name,
  version,
  fixedSubdomain,
}: {
  application_id: string;
  block_type: string;
  description: string;
  name: string;
  version: string;
  fixedSubdomain: string;
}): Block {
  const defaultUuid = "00000000-0000-0000-0000-000000000000";
  return {
    id: defaultUuid,
    application_id,
    block_type,
    description,
    dns_record_id: "",
    external_port: 0,
    external_rootdomain: "",
    external_subdomain: fixedSubdomain,
    is_active: false,
    is_external: true,
    name,
    status: BLOCK_STATUS_READY,
    version,
  };
}

export interface CreateVolumeRequest {
  bucket: string;
  version: string;
  block_name: string;
}

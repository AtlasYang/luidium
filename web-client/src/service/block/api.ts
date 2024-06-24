import { mainInstance } from "../main-server-interceptor";
import { SingleBoolResponse, SingleStringResponse } from "../interface";
import { Block, CreateVolumeRequest } from "./interface";

export async function buildAndRunBlock({ blockId }: { blockId: string }) {
  const result = await mainInstance.post(`/block/build_and_run/${blockId}`);
  return result.data as SingleBoolResponse;
}

export async function buildBlock({ blockId }: { blockId: string }) {
  const result = await mainInstance.post(`/block/build/${blockId}`);
  return result.data as SingleBoolResponse;
}

export async function runBlock({ blockId }: { blockId: string }) {
  const result = await mainInstance.post(`/block/run/${blockId}`);
  return result.data as SingleBoolResponse;
}

export async function stopBlock({ blockId }: { blockId: string }) {
  const result = await mainInstance.post(`/block/stop/${blockId}`);
  return result.data as SingleBoolResponse;
}

export async function createBlock({ blockData }: { blockData: Block }) {
  try {
    const result = await mainInstance.post("/block/create", blockData);
    return {
      success: true,
      content: result.data.content,
    };
  } catch (error: any) {
    return {
      success: false,
      content: error.response.data.content,
    };
  }
}

export async function getBlock(blockId: string) {
  try {
    const result = await mainInstance.get(`/block/${blockId}`);
    return {
      success: true,
      content: result.data as Block,
    };
  } catch (error: any) {
    return {
      success: false,
      content: error.response.data.content,
    };
  }
}

export async function getBlocksByApplicationIdAndVersion({
  applicationId,
  version,
}: {
  applicationId: string;
  version: string;
}) {
  const result = await mainInstance.post(`/block/read`, {
    application_id: applicationId,
    version,
  });
  return result.data as Block[];
}

export async function updateBlock({ blockData }: { blockData: Block }) {
  const result = await mainInstance.patch(`/block/update`, blockData);
  return result.data as SingleBoolResponse;
}

export async function deleteBlock(blockId: string) {
  try {
    const result = await mainInstance.delete(`/block/${blockId}`);
    return {
      success: true,
      content: result.data.content,
    };
  } catch (error: any) {
    return {
      success: false,
      content: error.response.data.content,
    };
  }
}

export async function createVolume({
  bucket,
  version,
  block_name,
}: {
  bucket: string;
  version: string;
  block_name: string;
}) {
  const payload: CreateVolumeRequest = {
    bucket,
    version,
    block_name,
  };
  const result = await mainInstance.post(`/block/create_volume`, payload);
  if (result.status !== 200) {
    throw new Error(result.data.content);
  }
  return result.data as SingleStringResponse;
}

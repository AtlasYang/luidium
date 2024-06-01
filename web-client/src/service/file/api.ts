import { SingleStringResponse } from "../interface";
import { mainInstance } from "../main-server-interceptor";
import { uploadFile } from "../storage/api";
import { FileConfig, LuidiumConfig, CopyTemplateRequest } from "./interface";

export async function listFiles({
  bucketName,
  path,
}: {
  bucketName: string;
  path: string;
}) {
  const result = await mainInstance.get(`/file/browse/${bucketName}/${path}`);
  return result.data as FileConfig[];
}

export async function readFile({
  bucketName,
  path,
}: {
  bucketName: string;
  path: string;
}) {
  const result = await mainInstance.get(`/file/read/${bucketName}/${path}`);
  return result.data as SingleStringResponse;
}

export async function readLuidiumConfig({
  bucketName,
  version,
  blockName,
}: {
  bucketName: string;
  version: string;
  blockName: string;
}) {
  const path = `${version}/${blockName}/luidium-config.json`;
  const result = await mainInstance.get(`/file/read/${bucketName}/${path}`);
  const { content: configText } = result.data as SingleStringResponse;
  return JSON.parse(configText) as LuidiumConfig;
}

export async function uploadLuidiumConfig({
  bucketName,
  version,
  blockName,
  conf,
}: {
  bucketName: string;
  version: string;
  blockName: string;
  conf: LuidiumConfig;
}) {
  const fileName = `${version}/${blockName}/luidium-config.json`;
  const file = new File([JSON.stringify(conf)], fileName, {
    type: "application/json",
  });
  await uploadFile({ file, bucketName, path: fileName });
}

export async function clearFolder({
  bucketName,
  version,
  blockName,
}: {
  bucketName: string;
  version: string;
  blockName: string;
}) {
  const path = `${version}/${blockName}`;
  await mainInstance.post(`/file/clear_folder/${bucketName}/${path}`);
}

export async function copyTemplate({
  bucketName,
  version,
  blockName,
  templateId,
}: {
  bucketName: string;
  version: string;
  blockName: string;
  templateId: string;
}) {
  const payload: CopyTemplateRequest = {
    bucket_name: bucketName,
    object_key: `${version}/${blockName}`,
    template_id: templateId,
  };
  await mainInstance.post(`/file/copy_template`, payload);
}

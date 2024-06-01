import { uploadFile } from "@/service/storage/api";

export async function uploadFileAndGetUrl(file: File) {
  const fileName = Date.now() + "-" + file.name;
  await uploadFile({
    file,
    bucketName: "luidium-assets",
    path: fileName,
  });
  return `https://storage.luidium.lighterlinks.io/luidium-assets/${fileName}`;
}

import { storageInstance } from "../storage-server-interceptor";

export async function uploadFile({
  file,
  bucketName,
  path,
}: {
  file: File;
  bucketName: string;
  path: string;
}) {
  const formData = new FormData();
  formData.append("size", file.size.toString());
  formData.append("file", file);
  storageInstance
    .put("/storage/upload/" + bucketName + "/" + path, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);
    });
}

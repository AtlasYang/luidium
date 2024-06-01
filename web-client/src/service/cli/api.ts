import { mainInstance } from "../main-server-interceptor";
import { SingleStringResponse } from "../interface";
import { CliToken } from "./interface";

export async function createCliToken() {
  const res = await mainInstance.post(`/cli/create`);
  if (res.status !== 200) {
    return null;
  }

  return res.data as SingleStringResponse;
}

export async function readAllCliToken() {
  const res = await mainInstance.get(`/cli/read`);
  if (res.status !== 200) {
    return [];
  }

  return res.data as CliToken[];
}

export async function deleteCliToken(token: string) {
  const res = await mainInstance.delete(`/cli/${token}`);
  if (res.status !== 200) {
    return false;
  }

  return res.data as SingleStringResponse;
}

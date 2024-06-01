import { mainInstance } from "../main-server-interceptor";
import {
  SingleBoolResponse,
  SingleBoolRequest,
  SingleStringResponse,
  SingleNumberResponse,
} from "../interface";
import { Authority, Log } from "./interface";
import { User } from "../user/interface";
import { getUserInfo } from "../auth/auth-api";

export async function readAllCollaborators({
  applicationId,
}: {
  applicationId: string;
}) {
  const res = await mainInstance.get(`/sentinel/authority/${applicationId}`);
  if (res.status !== 200) {
    return [];
  }
  const authorities: Authority[] = res.data;
  const users: User[] = [];
  for (const authority of authorities) {
    const user = await getUserInfo(authority.user_id);
    users.push(user);
  }
  return users;
}

export async function searchUserWithEmail({ email }: { email: string }) {
  const res = await mainInstance.get(`/sentinel/search_user/${email}`);
  if (res.status !== 200) {
    return [];
  }
  return res.data as User[];
}

export async function getUserLogs() {
  const res = await mainInstance.get(`/sentinel/log`);
  if (res.status !== 200) {
    return [];
  }
  return res.data as Log[];
}

export async function getApplicationLogs({
  applicationId,
}: {
  applicationId: string;
}) {
  const res = await mainInstance.get(
    `/sentinel/log/application/${applicationId}`
  );
  if (res.status !== 200) {
    return [];
  }
  return res.data as Log[];
}

export async function getBlockLogs({ blockId }: { blockId: string }) {
  const res = await mainInstance.get(`/sentinel/log/block/${blockId}`);
  if (res.status !== 200) {
    return [];
  }
  return res.data as Log[];
}

export async function getUsageCapApplication() {
  try {
    const res = await mainInstance.get(`/sentinel/usage_cap`);
    return res.data as SingleNumberResponse;
  } catch (e: any) {
    return { content: 0 };
  }
}

export async function getUsageCapVersion({
  applicationId,
}: {
  applicationId: string;
}) {
  try {
    const res = await mainInstance.get(`/sentinel/usage_cap/${applicationId}`);
    return res.data as SingleNumberResponse;
  } catch (e: any) {
    return { content: 0 };
  }
}

export async function getUsageCapBlock({
  applicationId,
  version,
}: {
  applicationId: string;
  version: string;
}) {
  try {
    const res = await mainInstance.get(
      `/sentinel/usage_cap/${applicationId}/${version}`
    );
    return res.data as SingleNumberResponse;
  } catch (e: any) {
    return { content: 0 };
  }
}

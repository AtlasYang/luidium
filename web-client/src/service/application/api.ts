import { mainInstance } from "../main-server-interceptor";
import {
  SingleBoolResponse,
  SingleBoolRequest,
  SingleStringResponse,
} from "../interface";
import { Application } from "./interface";
import renderForbiddenAccess from "@/utils/renderForbiddenAccess";

export async function createApplication({
  applicationData,
}: {
  applicationData: Application;
}) {
  try {
    const result = await mainInstance.post(
      "/application/create",
      applicationData
    );
    console.log(result);
    return { isSuccess: true, applicationId: result.data.content };
  } catch (e: any) {
    if (e.response.status === 401) renderForbiddenAccess();
    return { isSuccess: false, applicationId: e.response.data.content };
  }
}

export async function getApplicationsByUserId() {
  const result = await mainInstance.get("/application");
  return result.data as Application[];
}

export async function getApplication(applicationId: string) {
  const result = await mainInstance.get(`/application/${applicationId}`);
  return result.data as Application;
}

export async function updateApplicationIsActive({
  applicationId,
  isActive,
}: {
  applicationId: string;
  isActive: boolean;
}) {
  const result = await mainInstance.post(
    `/application/update/is_active/${applicationId}`,
    { content: isActive }
  );
  return result.data as SingleBoolResponse;
}

export async function updateApplicationActiveVersion({
  applicationId,
  activeVersion,
}: {
  applicationId: string;
  activeVersion: string;
}) {
  try {
    const result = await mainInstance.post(
      `/application/update/active_version/${applicationId}`,
      {
        content: activeVersion,
      }
    );
    return {
      success: true,
      message: result.data.content,
    };
  } catch (e: any) {
    if (e.response.status === 401) renderForbiddenAccess();
    return {
      success: false,
      message: e.response.data.content,
    };
  }
}

export async function updateApplicationDescription({
  applicationId,
  description,
}: {
  applicationId: string;
  description: string;
}) {
  const result = await mainInstance.post(
    `/application/update/description/${applicationId}`,
    {
      content: description,
    }
  );
  return result.data as SingleBoolResponse;
}

export async function updateApplicationDisplayName({
  applicationId,
  appDisplayName,
}: {
  applicationId: string;
  appDisplayName: string;
}) {
  const result = await mainInstance.post(
    `/application/update/displayname/${applicationId}`,
    {
      content: appDisplayName,
    }
  );
  return result.data as SingleBoolResponse;
}

export async function addApplicationVersion({
  applicationId,
  version,
}: {
  applicationId: string;
  version: string;
}) {
  try {
    const result = await mainInstance.post(
      `/application/create_version/${applicationId}`,
      {
        content: version,
      }
    );
    return {
      success: true,
      message: result.data.content,
    };
  } catch (e: any) {
    if (e.response.status === 401) renderForbiddenAccess();
    return {
      success: false,
      message: e.response.data.content,
    };
  }
}

export async function removeApplicationVersion({
  applicationId,
  version,
}: {
  applicationId: string;
  version: string;
}) {
  try {
    const result = await mainInstance.post(
      `/application/delete_version/${applicationId}`,
      {
        content: version,
      }
    );
    return {
      success: true,
      message: result.data.content,
    };
  } catch (e: any) {
    if (e.response.status === 401) renderForbiddenAccess();
    return {
      success: false,
      message: e.response.data.content,
    };
  }
}

export async function deleteApplication(applicationId: string) {
  const result = await mainInstance.delete(`/application/${applicationId}`);
  if (result.status !== 200) {
    return {
      isSuccess: false,
      message: "Failed to delete application",
    };
  }
  return {
    isSuccess: true,
    message: result.data.content,
  };
}

export async function checkAppNameDuplication(appName: string) {
  const result = await mainInstance.get(
    `/application/check_appname_duplicate/${appName}`
  );
  return result.data as SingleBoolResponse;
}

export async function getApplicationIdByAppName(appName: string) {
  try {
    const result = await mainInstance.get(`/application/idfrom/${appName}`);
    return result.data as SingleStringResponse;
  } catch (e: any) {
    if (e.response?.status === 401) renderForbiddenAccess();
    return { content: "" };
  }
}

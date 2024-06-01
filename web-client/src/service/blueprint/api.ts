import { mainInstance } from "../main-server-interceptor";
import { SingleBoolResponse } from "../interface";
import { BlueprintNode, BlueprintEdge, BlueprintRequest } from "./interface";

export async function createBlueprintNode({
  blueprintNodeData,
}: {
  blueprintNodeData: BlueprintNode;
}) {
  const result = await mainInstance.post(
    "/blueprint/node/create",
    blueprintNodeData
  );
  return result.data as SingleBoolResponse;
}

export async function getAllBlueprintNodes({
  applicationId,
  version,
}: {
  applicationId: string;
  version: string;
}) {
  const result = await mainInstance.post("/blueprint/node", {
    application_id: applicationId,
    version,
  });
  return result.data as BlueprintNode[];
}

export async function updateBlueprintNodePos({
  blueprintNodeData,
}: {
  blueprintNodeData: BlueprintNode;
}) {
  const result = await mainInstance.patch(
    "/blueprint/node/update/pos",
    blueprintNodeData
  );
  return result.data as SingleBoolResponse;
}

export async function deleteBlueprintNode({
  blueprintNodeId,
}: {
  blueprintNodeId: string;
}) {
  const result = await mainInstance.delete(
    `/blueprint/node/${blueprintNodeId}`
  );
  return result.data as SingleBoolResponse;
}

export async function createBlueprintEdge({
  blueprintEdgeData,
}: {
  blueprintEdgeData: BlueprintEdge;
}) {
  const result = await mainInstance.post(
    "/blueprint/edge/create",
    blueprintEdgeData
  );
  return result.data as SingleBoolResponse;
}

export async function getAllBlueprintEdges({
  applicationId,
  version,
}: {
  applicationId: string;
  version: string;
}) {
  const result = await mainInstance.post("/blueprint/edge", {
    application_id: applicationId,
    version,
  });
  return result.data as BlueprintEdge[];
}

export async function deleteBlueprintEdge({
  blueprintEdgeId,
}: {
  blueprintEdgeId: string;
}) {
  const result = await mainInstance.delete(
    `/blueprint/edge/${blueprintEdgeId}`
  );
  return result.data as SingleBoolResponse;
}

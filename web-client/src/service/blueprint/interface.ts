export interface BlueprintNode {
  block_id: string;
  application_id: string;
  version: string;
  x_pos: number;
  y_pos: number;
}

export interface BlueprintEdge {
  id: string;
  application_id: string;
  version: string;
  source_block_id: string;
  target_block_id: string;
}

export interface BlueprintRequest {
  application_id: string;
  version: string;
}

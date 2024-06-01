export const AUTHORITY_CLASS_ADMIN = "admin";
export const AUTHORITY_CLASS_OWNER = "owner";
export const AUTHORITY_CLASS_COLLABORATOR = "collaborator";
export const AUTHORITY_CLASS_VIEWER = "viewer";

export interface Authority {
  user_id: string;
  entity_id: string;
  class: string;
}
export interface Log {
  user_id: string;
  application_id: string;
  block_id: string;
  level: string;
  type: string;
  message: string;
  timestamp: string;
}

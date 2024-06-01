import { databaseSchemaConfig } from "./database";

export interface neo4jSchemaConfig extends databaseSchemaConfig {
  node: nodeConfig[];
  relationship: relationshipConfig[];
}

export interface nodeConfig {
  nodeType: string;
  properties: {
    [key: string]: string;
  };
}

export interface relationshipConfig {
  relationshipType: string;
  sourceNodeType: string;
  targetNodeType: string;
  properties: {
    [key: string]: string;
  };
}

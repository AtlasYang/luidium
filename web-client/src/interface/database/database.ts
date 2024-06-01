export interface databaseConfig {
  name: string;
  type: "postgreSQL" | "neo4j";
  version: string;
  externalPort: number;
  schemaConfig: databaseSchemaConfig;
}

export interface databaseSchemaConfig {
  name: string;
}

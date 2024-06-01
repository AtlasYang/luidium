export interface serverConfig {
  name: string;
  type: "nest" | "axum";
  version: string;
  externalPort: number;
  schemaConfig: serverSchemaConfig;
}

export interface serverSchemaConfig {
  name: string;
}

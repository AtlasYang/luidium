export interface webConfig {
  name: string;
  type: "react" | "next";
  version: string;
  externalPort: number;
  schemaConfig: webSchemaConfig;
}

export interface webSchemaConfig {
  name: string;
}

import { serverSchemaConfig } from "./server";

export interface nestSchemaConfig extends serverSchemaConfig {
  controllers: string[];
}

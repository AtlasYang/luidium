import { webSchemaConfig } from "./web";

export interface nextSchemaConfig extends webSchemaConfig {
  routes: string[];
}

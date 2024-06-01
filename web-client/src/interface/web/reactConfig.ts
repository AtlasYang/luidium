import { webSchemaConfig } from "./web";

export interface reactSchemaConfig extends webSchemaConfig {
  routes: string[];
}

import { serverConfig } from "./server";
import { nestSchemaConfig } from "./nestConfig";

export const sampleNestConfig: serverConfig = {
  name: "nest.js server",
  type: "nest",
  version: "0.18.2",
  externalPort: 10002,
  schemaConfig: {
    name: "sampleNestSchema",
    controllers: ["sampleController"],
  } as nestSchemaConfig,
};

export const sampleAxumConfig: serverConfig = {
  name: "Axum server",
  type: "axum",
  version: "0.1.0",
  externalPort: 10002,
  schemaConfig: {
    name: "sampleAxumSchema",
    controllers: ["sampleController"],
  } as nestSchemaConfig,
};

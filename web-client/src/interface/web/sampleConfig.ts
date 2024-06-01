import { nextSchemaConfig } from "./nextConfig";
import { reactSchemaConfig } from "./reactConfig";
import { webConfig } from "./web";

export const sampleNextConfig: webConfig = {
  name: "next.js web",
  type: "next",
  version: "10.0.7",
  externalPort: 10003,
  schemaConfig: {
    name: "sampleNextSchema",
    routes: ["sampleRoute"],
  } as nextSchemaConfig,
};

export const sampleReactConfig: webConfig = {
  name: "react web",
  type: "react",
  version: "17.0.1",
  externalPort: 10004,
  schemaConfig: {
    name: "sampleReactSchema",
    routes: ["sampleRoute"],
  } as reactSchemaConfig,
};

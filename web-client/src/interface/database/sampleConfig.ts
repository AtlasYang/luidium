import { databaseConfig } from "./database";
import { neo4jSchemaConfig } from "./neo4jConfig";

export const sampleNeo4jConfig: databaseConfig = {
  name: "sampleNeo4j",
  type: "neo4j",
  version: "4.0.0",
  externalPort: 10001,
  schemaConfig: {
    name: "sampleNeo4jSchema",
    node: [
      {
        nodeType: "Person",
        properties: {
          id: "randomUUID()",
          name: "$name",
          age: "$age",
        },
      },
      {
        nodeType: "Company",
        properties: {
          id: "randomUUID()",
          name: "$name",
          location: "$location",
        },
      },
      {
        nodeType: "Product",
        properties: {
          id: "randomUUID()",
          name: "$name",
          price: "$price",
        },
      },
    ],
    relationship: [
      {
        relationshipType: "WORKS_FOR",
        sourceNodeType: "Person",
        targetNodeType: "Company",
        properties: {
          id: "randomUUID()",
          position: "$position",
        },
      },
      {
        relationshipType: "PURCHASED",
        sourceNodeType: "Person",
        targetNodeType: "Product",
        properties: {
          id: "randomUUID()",
          quantity: "$quantity",
        },
      },
    ],
  } as neo4jSchemaConfig,
};

export const samplePostgreSQLConfig: databaseConfig = {
  name: "samplePostgreSQL",
  type: "postgreSQL",
  version: "4.0.0",
  externalPort: 10001,
  schemaConfig: {
    name: "sampleNeo4jSchema",
  },
};

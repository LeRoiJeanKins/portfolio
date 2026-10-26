import swaggerJsdoc from "swagger-jsdoc";
import { swaggerSpec } from "../config/swagger";

jest.mock("swagger-jsdoc");

describe("swaggerSpec config", () => {
  it("appelle swaggerJsdoc avec la bonne config", () => {
    swaggerSpec();
    expect(swaggerJsdoc).toHaveBeenCalledWith({
      definition: {
        openapi: "3.0.0",
        info: {
          title: "Mon API Géniale",
          version: "1.0.0",
          description: "Documentation générée automatiquement via Swagger",
        },
      },
      apis: ["./src/routes/*.ts"],
    });
  });
});
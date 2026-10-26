import request from "supertest";
import express from "express";
import { errorHandler } from "../middlewares/errorHandler";

describe("Error Handler Middleware", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();

    // Empêche les console.error pendant les tests
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Retourne le bon status et message", async () => {
    app.get("/error", (req, res, next) => {
      next({
        status: 400,
        message: "Erreur test",
      });
    });

    app.use(errorHandler);

    const response = await request(app).get("/error");

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      error: "Erreur test",
    });
  });

  test("Retourne 500 par défaut", async () => {
    app.get("/error500", (req, res, next) => {
      next({});
    });

    app.use(errorHandler);

    const response = await request(app).get("/error500");

    expect(response.status).toBe(500);

    expect(response.body).toEqual({
      error: "Internal Server Error",
    });
  });
});
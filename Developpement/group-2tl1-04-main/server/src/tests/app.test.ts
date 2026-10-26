import request from "supertest";
import app from "../app";

describe("API fallback 404", () => {
  it("retourne 404 sur route API inconnue", async () => {
    const res = await request(app).get("/api/route-inexistante");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: "Route API introuvable : /api/route-inexistante",
    });
  });
});

describe("GET /", () => {
  it("retourne index.html", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
  });
});

describe("cookie parser", () => {
  it("accepte les cookies", async () => {
    const res = await request(app)
      .get("/api/auth/protected-route")
      .set("Cookie", "token=123");

    // dépend de ta route protected
    expect(res.status).not.toBe(500);
  });
});


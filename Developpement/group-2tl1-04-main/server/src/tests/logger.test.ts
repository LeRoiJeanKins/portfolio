import { requestLogger } from "../middlewares/logger";

describe("requestLogger", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("log la requête et appelle next()", () => {
    const req = {
      method: "GET",
      url: "/test",
    } as any;

    const res = {} as any;
    const next = jest.fn();

    requestLogger(req, res, next);

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("GET /test")
    );

    expect(next).toHaveBeenCalled();
  });
});
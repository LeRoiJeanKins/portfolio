import { authMiddleware } from "../middlewares/authMiddleware";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

const mockReq = (token?: string) =>
  ({
    headers: token ? { authorization: `Bearer ${token}` } : {},
    cookies: token ? { token } : {},
  } as any);

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe("authMiddleware", () => {
  beforeEach(() => jest.clearAllMocks());

  it("appelle next() si le token est valide", () => {
    const decoded = { id: 1, mail: "test@test.com" };
    (jwt.verify as jest.Mock).mockReturnValue(decoded);

    const req = mockReq("valid-token");
    const res = mockRes();

    authMiddleware(req, res, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith("valid-token", expect.any(String));
    expect(req.user).toEqual(decoded);
    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("retourne 401 si aucun token", () => {
    const req = mockReq();
    const res = mockRes();

    authMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized: No token" });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("retourne 401 si le token est invalide", () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("invalid token");
    });

    const req = mockReq("bad-token");
    const res = mockRes();

    authMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized: Invalid token" });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("retourne 401 si le token est expiré", () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("jwt expired");
    });

    const req = mockReq("expired-token");
    const res = mockRes();

    authMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
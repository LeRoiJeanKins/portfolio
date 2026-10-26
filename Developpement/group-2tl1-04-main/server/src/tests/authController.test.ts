import AuthController from "../controllers/authController";
import { AuthService } from "../services/authService";

jest.mock("../services/authService");

const mockReq = (body: object) => ({ body } as any);

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
};

describe("AuthController.register", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retourne 201 et l'utilisateur créé", async () => {
    const fakeUser = { id: 1, mail: "test@test.com" };
    (AuthService.register as jest.Mock).mockResolvedValue(fakeUser);

    const req = mockReq({ mail: "test@test.com", password: "pass123" });
    const res = mockRes();

    await AuthController.register(req, res);

    expect(AuthService.register).toHaveBeenCalledWith("test@test.com", "pass123");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "User created successfully",
      user: fakeUser,
    });
  });

  it("retourne 400 si AuthService.register lance une erreur", async () => {
    (AuthService.register as jest.Mock).mockRejectedValue(new Error("Mail déjà utilisé"));

    const req = mockReq({ mail: "test@test.com", password: "pass123" });
    const res = mockRes();

    await AuthController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Mail déjà utilisé" });
  });
});

describe("AuthController.login", () => {
  beforeEach(() => jest.clearAllMocks());

  it("pose le cookie et retourne l'utilisateur si login OK", async () => {
    const fakeUser = { id: 1, mail: "test@test.com" };
    const fakeToken = "jwt-token-abc";
    (AuthService.login as jest.Mock).mockResolvedValue({ token: fakeToken, user: fakeUser });

    const req = mockReq({ mail: "test@test.com", password: "pass123" });
    const res = mockRes();

    await AuthController.login(req, res);

    expect(AuthService.login).toHaveBeenCalledWith("test@test.com", "pass123");
    expect(res.cookie).toHaveBeenCalledWith("token", fakeToken, expect.any(Object));
    expect(res.json).toHaveBeenCalledWith({
      message: "Login successful",
      token: fakeToken,
      user: fakeUser,
    });
  });

  it("retourne 401 si les identifiants sont incorrects", async () => {
    (AuthService.login as jest.Mock).mockRejectedValue(new Error("Identifiants invalides"));

    const req = mockReq({ mail: "test@test.com", password: "mauvais" });
    const res = mockRes();

    await AuthController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Identifiants invalides" });
    expect(res.cookie).not.toHaveBeenCalled();
  });
});

describe("AuthController.logout", () => {
  it("efface le cookie et retourne un message", () => {
    const req = {} as any;
    const res = mockRes();
    res.clearCookie = jest.fn().mockReturnValue(res);

    AuthController.logout(req, res);

    expect(res.clearCookie).toHaveBeenCalledWith("token");
    expect(res.json).toHaveBeenCalledWith({ message: "Logged out" });
  });
});
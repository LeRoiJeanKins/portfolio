import { createUser, getAllUser, getUserById, deleteUser } from "../controllers/userController";
import Utilisateur from "../models/Utilisateur";
import * as UserService from "../services/UserService";
import bcrypt from "bcrypt";

jest.mock("../models/Utilisateur");
jest.mock("../services/UserService");
jest.mock("bcrypt");

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = (body: object = {}, params: object = {}) =>
  ({ body, params } as any);

// ─────────────────────────────────────────────
// createUser
// ─────────────────────────────────────────────

describe("createUser", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retourne 400 si des champs sont manquants", async () => {
    const res = mockRes();
    await createUser(mockReq({ lastname: "Doe", firstname: "John" }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Champs manquants" });
    expect(Utilisateur.create).not.toHaveBeenCalled();
  });

  it("retourne 400 si tous les champs sont absents", async () => {
    const res = mockRes();
    await createUser(mockReq({}), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("hash le mot de passe et crée l'utilisateur", async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
    const fakeUser = { id: 1, nom_user: "Doe" };
    (Utilisateur.create as jest.Mock).mockResolvedValue(fakeUser);

    const res = mockRes();
    await createUser(
      mockReq({ lastname: "Doe", firstname: "John", mail: "j@j.com", password: "secret" }),
      res
    );

    expect(bcrypt.hash).toHaveBeenCalledWith("secret", 10);
    expect(Utilisateur.create).toHaveBeenCalledWith({
      nom_user: "Doe",
      prenom_user: "John",
      mail_user: "j@j.com",
      mdp_user: "hashed-password",
      id_liste_stat: expect.any(Number),
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeUser);
  });

  it("ne stocke jamais le mot de passe en clair", async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
    (Utilisateur.create as jest.Mock).mockResolvedValue({});

    const res = mockRes();
    await createUser(
      mockReq({ lastname: "Doe", firstname: "John", mail: "j@j.com", password: "secret" }),
      res
    );

    const callArgs = (Utilisateur.create as jest.Mock).mock.calls[0][0];
    expect(callArgs.mdp_user).not.toBe("secret");
    expect(callArgs.mdp_user).toBe("hashed-password");
  });

  it("retourne 500 en cas d'erreur", async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");
    (Utilisateur.create as jest.Mock).mockRejectedValue(new Error("DB crash"));

    const res = mockRes();
    await createUser(
      mockReq({ lastname: "Doe", firstname: "John", mail: "j@j.com", password: "secret" }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────
// getAllUser
// ─────────────────────────────────────────────

describe("getAllUser", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retourne 200 et la liste des utilisateurs", async () => {
    const fakeUsers = [{ id: 1 }, { id: 2 }];
    (Utilisateur.findAll as jest.Mock).mockResolvedValue(fakeUsers);

    const res = mockRes();
    await getAllUser(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeUsers);
  });

  it("retourne 500 en cas d'erreur", async () => {
    (Utilisateur.findAll as jest.Mock).mockRejectedValue(new Error("DB error"));

    const res = mockRes();
    await getAllUser(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────
// getUserById
// ─────────────────────────────────────────────

describe("getUserById", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retourne l'utilisateur si trouvé", async () => {
    const fakeUser = { id: 1, nom_user: "Doe" };
    (UserService.getUserById as jest.Mock).mockResolvedValue(fakeUser);

    const res = mockRes();
    await getUserById(mockReq({}, { id: "1" }), res);

    expect(UserService.getUserById).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(fakeUser);
  });

  it("retourne 404 si l'utilisateur n'existe pas", async () => {
    (UserService.getUserById as jest.Mock).mockResolvedValue(null);

    const res = mockRes();
    await getUserById(mockReq({}, { id: "99" }), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Utilisateur non trouvé" });
  });

  it("retourne 500 en cas d'erreur", async () => {
    (UserService.getUserById as jest.Mock).mockRejectedValue(new Error("DB error"));

    const res = mockRes();
    await getUserById(mockReq({}, { id: "1" }), res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────
// deleteUser
// ─────────────────────────────────────────────

describe("deleteUser", () => {
  beforeEach(() => jest.clearAllMocks());

  it("supprime l'utilisateur et retourne un message", async () => {
    (UserService.deleteUser as jest.Mock).mockResolvedValue(true);

    const res = mockRes();
    await deleteUser(mockReq({}, { id: "1" }), res);

    expect(UserService.deleteUser).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith({ message: "Utilisateur supprimé" });
  });

  it("retourne 404 si l'utilisateur n'existe pas", async () => {
    (UserService.deleteUser as jest.Mock).mockResolvedValue(false);

    const res = mockRes();
    await deleteUser(mockReq({}, { id: "99" }), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Utilisateur non trouvé" });
  });

  it("retourne 500 en cas d'erreur", async () => {
    (UserService.deleteUser as jest.Mock).mockRejectedValue(new Error("DB error"));

    const res = mockRes();
    await deleteUser(mockReq({}, { id: "1" }), res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
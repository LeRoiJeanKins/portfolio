import { getAllQuestions, createQuestion, deleteQuestion } from "../controllers/questionController";
import Question from "../models/Question";

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

jest.mock("../models/Question");

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = (body: object = {}, params: object = {}, file?: object) =>
  ({ body, params, file } as any);

describe("getAllQuestions", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retourne 200 et la liste des questions", async () => {
    const fakeQuestions = [{ id: 1, ennonce: "Q1" }, { id: 2, ennonce: "Q2" }];
    (Question.findAll as jest.Mock).mockResolvedValue(fakeQuestions);

    const res = mockRes();
    await getAllQuestions(mockReq(), res);

    expect(Question.findAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeQuestions);
  });

  it("retourne 500 en cas d'erreur", async () => {
    (Question.findAll as jest.Mock).mockRejectedValue(new Error("DB error"));

    const res = mockRes();
    await getAllQuestions(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
  });
});

describe("createQuestion", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retourne 400 si des champs sont manquants", async () => {
    const res = mockRes();
    // manque reponse et categorie
    await createQuestion(
      mockReq({ ennonce: "Question?" }, {}, { path: "uploads/img.png" }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Champs manquants" });
    expect(Question.create).not.toHaveBeenCalled();
  });

  it("retourne 400 si aucune pièce jointe", async () => {
    const res = mockRes();
    await createQuestion(
      mockReq({ ennonce: "Q?", reponse: "R", categorie: "C" }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Champs manquants" });
  });

  it("crée la question et retourne 201", async () => {
    const fakeQuestion = { id: 1, ennonce: "Q?", reponse: "R", categorie: "C" };
    (Question.create as jest.Mock).mockResolvedValue(fakeQuestion);

    const res = mockRes();
    await createQuestion(
      mockReq(
        { ennonce: "Q?", reponse: "R", categorie: "C" },
        {},
        { path: "uploads/img.png" }
      ),
      res
    );

    expect(Question.create).toHaveBeenCalledWith({
      ennonce: "Q?",
      pieceJointe: "uploads/img.png",
      reponse: "R",
      categorie: "C",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeQuestion);
  });

  it("normalise les backslashes Windows en slashes", async () => {
    (Question.create as jest.Mock).mockResolvedValue({});

    const res = mockRes();
    await createQuestion(
      mockReq(
        { ennonce: "Q?", reponse: "R", categorie: "C" },
        {},
        { path: "uploads\\img.png" }
      ),
      res
    );

    expect(Question.create).toHaveBeenCalledWith(
      expect.objectContaining({ pieceJointe: "uploads/img.png" })
    );
  });

  it("retourne 500 en cas d'erreur DB", async () => {
    (Question.create as jest.Mock).mockRejectedValue(new Error("DB crash"));

    const res = mockRes();
    await createQuestion(
      mockReq(
        { ennonce: "Q?", reponse: "R", categorie: "C" },
        {},
        { path: "uploads/img.png" }
      ),
      res
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "DB crash" });
  });
});

describe("deleteQuestion", () => {
  beforeEach(() => jest.clearAllMocks());

  it("supprime la question et retourne un message", async () => {
    (Question.destroy as jest.Mock).mockResolvedValue(1);

    const res = mockRes();
    await deleteQuestion(mockReq({}, { id: "3" }), res);

    expect(Question.destroy).toHaveBeenCalledWith({ where: { id: 3 } });
    expect(res.json).toHaveBeenCalledWith({ message: "Question supprimé" });
  });

  it("retourne 404 si la question n'existe pas", async () => {
    (Question.destroy as jest.Mock).mockResolvedValue(0);

    const res = mockRes();
    await deleteQuestion(mockReq({}, { id: "99" }), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Question non trouvé" });
  });

  it("retourne 500 en cas d'erreur DB", async () => {
    (Question.destroy as jest.Mock).mockRejectedValue(new Error("DB error"));

    const res = mockRes();
    await deleteQuestion(mockReq({}, { id: "1" }), res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
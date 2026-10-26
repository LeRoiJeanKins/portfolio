import { checkIdParam } from "../middlewares/checkIdParam";

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

const mockReq = (id: any) =>
  ({ params: { id } } as any);

describe("checkIdParam", () => {
  beforeEach(() => jest.clearAllMocks());

  it("appelle next() pour un id valide", () => {
    checkIdParam(mockReq("5"), mockRes(), mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it("appelle next() pour id = 1", () => {
    checkIdParam(mockReq("1"), mockRes(), mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it("retourne 400 pour id = 0", () => {
    const res = mockRes();
    checkIdParam(mockReq("0"), res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "ID invalide" });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("retourne 400 pour un id négatif", () => {
    const res = mockRes();
    checkIdParam(mockReq("-3"), res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("retourne 400 pour une chaîne non numérique", () => {
    const res = mockRes();
    checkIdParam(mockReq("abc"), res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("retourne 400 si id est undefined", () => {
    const res = mockRes();
    checkIdParam(mockReq(undefined), res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("utilise le premier élément si id est un tableau valide", () => {
    checkIdParam(mockReq(["7", "8"]), mockRes(), mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it("retourne 400 si id est un tableau avec valeur invalide", () => {
    const res = mockRes();
    checkIdParam(mockReq(["abc"]), res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
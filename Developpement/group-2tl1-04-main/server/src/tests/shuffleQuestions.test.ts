import {
  shuffleQuestions,
} from "../utils/gameUtils";

describe("shuffleQuestions", () => {
  const sample = [
    { id: 1, ennonce: "Q1" },
    { id: 2, ennonce: "Q2" },
    { id: 3, ennonce: "Q3" },
    { id: 4, ennonce: "Q4" },
    { id: 5, ennonce: "Q5" },
  ];

  it("retourne un tableau de même longueur", () => {
    expect(shuffleQuestions(sample)).toHaveLength(sample.length);
  });

  it("ne modifie pas le tableau original", () => {
    const copy = [...sample];
    shuffleQuestions(sample);
    expect(sample).toEqual(copy);
  });

  it("contient les mêmes éléments que l'original", () => {
    const result = shuffleQuestions(sample);
    expect(result).toEqual(expect.arrayContaining(sample));
    expect(sample).toEqual(expect.arrayContaining(result));
  });

  it("retourne un tableau vide si l'entrée est vide", () => {
    expect(shuffleQuestions([])).toEqual([]);
  });

  it("retourne le même élément pour un tableau à 1 élément", () => {
    expect(shuffleQuestions([{ id: 1 }])).toEqual([{ id: 1 }]);
  });

  it("produit au moins une permutation différente sur N tirages (probabiliste)", () => {
    // Avec 5 éléments, la prob d'avoir toujours le même ordre sur 20 tirages = (1/120)^20 ≈ 0
    const results = Array.from({ length: 20 }, () =>
      shuffleQuestions(sample).map((q) => q.id).join(",")
    );
    const original = sample.map((q) => q.id).join(",");
    const hasAtLeastOneDiff = results.some((r) => r !== original);
    expect(hasAtLeastOneDiff).toBe(true);
  });
});
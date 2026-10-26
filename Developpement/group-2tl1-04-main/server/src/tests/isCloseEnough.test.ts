import {
  isCloseEnough,
} from "../utils/gameUtils";




describe("isCloseEnough", () => {
  // Règle : réponse ≤ 4 → distance doit être 0
  it("exige une correspondance exacte pour les réponses très courtes (≤4 chars)", () => {
    expect(isCloseEnough("oui", "oui")).toBe(true);
    expect(isCloseEnough("oui", "Oui")).toBe(true);  // insensible à la casse
    expect(isCloseEnough("oui", "ouu")).toBe(false); // distance 1, mais ≤4
    expect(isCloseEnough("non", "mon")).toBe(false);
  });

  it("tolère 1 erreur pour les réponses de longueur 5-7", () => {
    expect(isCloseEnough("paris", "paris")).toBe(true);
    expect(isCloseEnough("pariss", "paris")).toBe(true);  // 1 insertion
    expect(isCloseEnough("pari", "paris")).toBe(true);   // 1 suppression
    expect(isCloseEnough("bariss", "paris")).toBe(false); // distance 2
  });

  it("tolère 2 erreurs pour les réponses de longueur ≥8", () => {
    expect(isCloseEnough("napoleon", "napoleon")).toBe(true);
    expect(isCloseEnough("napoléon", "napoleon")).toBe(true);  // 1 diff
    expect(isCloseEnough("napolean", "napoleon")).toBe(true);  // 1 substitution
    expect(isCloseEnough("napleaon", "napoleon")).toBe(true);  // 2 ops
    expect(isCloseEnough("napleaons", "napoleon")).toBe(false); // 3 ops
  });

  it("ignore les espaces en début/fin", () => {
    expect(isCloseEnough("  paris  ", "paris")).toBe(true);
    expect(isCloseEnough("paris", "  paris  ")).toBe(true);
  });

  it("est insensible à la casse", () => {
    expect(isCloseEnough("PARIS", "paris")).toBe(true);
    expect(isCloseEnough("Napoleon", "napoleon")).toBe(true);
  });
});
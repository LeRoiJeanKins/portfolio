
import {
  levenshtein,
} from "../utils/gameUtils";

describe("levenshtein", () => {
  it("retourne 0 pour deux chaînes identiques", () => {
    expect(levenshtein("chat", "chat")).toBe(0);
  });

  it("retourne 0 pour deux chaînes vides", () => {
    expect(levenshtein("", "")).toBe(0);
  });

  it("retourne la longueur de b si a est vide", () => {
    expect(levenshtein("", "hello")).toBe(5);
  });

  it("retourne la longueur de a si b est vide", () => {
    expect(levenshtein("world", "")).toBe(5);
  });

  it("détecte une substitution simple", () => {
    expect(levenshtein("chat", "chats")).toBe(1); // insertion
    expect(levenshtein("chien", "chein")).toBe(2); // transposition (2 ops)
  });

  it("calcule la distance correcte entre deux mots proches", () => {
    expect(levenshtein("kitten", "sitting")).toBe(3);
  });

  it("est sensible à la casse", () => {
    expect(levenshtein("Chat", "chat")).toBe(1);
  });
});
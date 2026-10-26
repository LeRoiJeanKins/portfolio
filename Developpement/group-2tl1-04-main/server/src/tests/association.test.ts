import Utilisateur from "../models/Utilisateur";
import ListeStat from "../models/ListeStat";
import Salon from "../models/Salon";
import Partie from "../models/Partie";
import Question from "../models/Question";

import "../models/associations"; // IMPORTANT: charge les relations

describe("Sequelize associations", () => {
  it("Utilisateur a une association avec ListeStat", () => {
    expect(Utilisateur.associations).toHaveProperty("ListeStat");
  });

  it("ListeStat a une association avec Utilisateur", () => {
    expect(ListeStat.associations).toHaveProperty("Utilisateur");
  });

  it("Utilisateur a many-to-many avec Salon", () => {
    expect(Utilisateur.associations).toHaveProperty("Salons");
  });

  it("Salon a many-to-many avec Utilisateur", () => {
    expect(Salon.associations).toHaveProperty("Utilisateurs");
  });

  it("Partie appartient à Salon", () => {
    expect(Partie.associations).toHaveProperty("Salon");
  });

  it("Question appartient à Partie (many-to-many)", () => {
    expect(Question.associations).toHaveProperty("Parties");
  });
});
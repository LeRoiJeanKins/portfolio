import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Utilisateur from "../models/Utilisateur";
import ListeStat from "../models/ListeStat";

const JWT_SECRET = process.env.JWT_SECRET ?? "secret";

export class AuthService {

  static async register(username: string, password: string) {
    const existing = await Utilisateur.findOne({
      where: { mail_user: username },
    });

    if (existing) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const stat = await ListeStat.create({
      nbr_parties: 0,
      nbr_victoires: 0,
      nbr_bonnes_reponses: 0,
      nbr_mauvaises_reponse: 0,
      nbr_de_buzz: 0,
      temps_moyen_reponse: 0,
    });

    console.log("stat créée:", stat.getDataValue("id_liste_stat"));

    const user = await Utilisateur.create({
      nom_user: "inconnu",
      prenom_user: "inconnu",
      mail_user: username,
      mdp_user: hashedPassword,
      id_liste_stat: stat.getDataValue("id_liste_stat"),
    });

    console.log("user créé avec id_liste_stat:", user.getDataValue("id_liste_stat"));

    return {
      id: user.getDataValue("id_user"),
      mail: user.getDataValue("mail_user"),
    };
  }

  static async login(username: string, password: string) {
    const user = await Utilisateur.findOne({
      where: { mail_user: username },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isValid = await bcrypt.compare(password, user.getDataValue("mdp_user"));

    if (!isValid) {
      throw new Error("Invalid password");
    }

    const token = jwt.sign(
      {
        id: user.getDataValue("id_user"),
        mail: user.getDataValue("mail_user"),
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return {
      token,
      user: {
        id: user.getDataValue("id_user"),
        mail: user.getDataValue("mail_user"),
      },
    };
  }
}
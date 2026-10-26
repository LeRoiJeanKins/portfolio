import type { Request, Response } from "express";
import Utilisateur from "../models/Utilisateur";
import ListeStat from "../models/ListeStat";
import * as UserService from "../services/UserService";
import bcrypt from "bcrypt";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { lastname, firstname, mail, password } = req.body;

    if (!lastname || !firstname || !mail || !password) {
      return res.status(400).json({ error: "Champs manquants" });
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

    const user = await Utilisateur.create({
      nom_user: lastname,
      prenom_user: firstname,
      mail_user: mail,
      mdp_user: hashedPassword,
      id_liste_stat: stat.getDataValue("id_liste_stat"),
    });

    res.status(201).json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllUser = async (req: Request, res: Response) => {
  try {
    const utilisateurs = await Utilisateur.findAll();
    res.status(200).json(utilisateurs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const user = await UserService.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await UserService.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json({ message: "Utilisateur supprimé" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
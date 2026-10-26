import { Router } from "express";
import AuthController from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
import Utilisateur from "../models/Utilisateur";
import ListeStat from "../models/ListeStat";

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: API d'authentification
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: john
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: L'utilisateur existe déjà
 */
router.post("/register", AuthController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Connexion utilisateur et création du cookie JWT
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: john
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Identifiants invalides
 */
router.post("/login", AuthController.login);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Récupérer l'utilisateur actuellement connecté
 *     description: Retourne les informations complètes de l'utilisateur authentifié via le token JWT (cookie).
 *     tags:
 *       - Auth
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Utilisateur authentifié récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_user:
 *                   type: integer
 *                   example: 1
 *                 nom_user:
 *                   type: string
 *                   example: Doe
 *                 prenom_user:
 *                   type: string
 *                   example: John
 *                 mail_user:
 *                   type: string
 *                   example: john@demo.com
 *       401:
 *         description: Non autorisé - token manquant ou invalide
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // 1. Sécurité absolue : si le user n'existe pas dans la requête, on stoppe direct en 401
    if (!(req as any).user || !(req as any).user.id) {
      return res.status(401).json({ error: "Unauthorized: Session invalide" });
    }

    // 2. On récupère l'ID en toute sécurité
    const userId = (req as any).user.id;

    const user = await Utilisateur.findByPk(userId, {
      include: [{ model: ListeStat, as: "ListeStat" }],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Erreur dans /auth/me :", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Déconnexion utilisateur et suppression du cookie
 *     tags:
 *       - Auth
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
router.post("/logout", authMiddleware, (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
});
router.post("/fix-stats", async (req, res) => {
  const users = await Utilisateur.findAll({ where: { id_liste_stat: null } });
  for (const user of users) {
    const stat = await ListeStat.create({
      nbr_parties: 0,
      nbr_victoires: 0,
      nbr_bonnes_reponses: 0,
      nbr_mauvaises_reponse: 0,
      nbr_de_buzz: 0,
      temps_moyen_reponse: 0,
    });
    await user.update({ id_liste_stat: stat.getDataValue("id_liste_stat") });
  }
  res.json({ message: `${users.length} utilisateurs mis à jour` });
});
export default router;
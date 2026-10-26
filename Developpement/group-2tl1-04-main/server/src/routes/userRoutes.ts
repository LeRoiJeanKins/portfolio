import { Router } from 'express';
import * as userController from "../controllers/userController";
import { checkIdParam } from '../middlewares/checkIdParam';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crée un nouvel utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lastname:
 *                 type: string
 *               firstname:
 *                 type: string
 *               mail:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *       400:
 *         description: Champs manquants
 */

router.post('/', userController.createUser);

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     tags:
 *       - Users
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *       401:
 *         description: Non autorisé
 */
router.get('/', userController.getAllUser)

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID
 *     tags:
 *       - Users
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *       404:
 *         description: Utilisateur non trouvé
 *       401:
 *         description: Non autorisé
 */
router.get("/:id", userController.getUserById);

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags:
 *       - Users
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Utilisateur non trouvé
 */
router.delete("/:id", userController.deleteUser);

router.options("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://91.134.138.136:5173");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
  return res.sendStatus(204);
});

router.options("/:id", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://91.134.138.136:5173");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
  return res.sendStatus(204);
});

export default router;
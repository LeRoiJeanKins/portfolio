import { Router, type Request, type Response } from 'express';
import * as userController from "../controllers/userController";
import { checkIdParam } from "../middlewares/checkIdParam";

const router = Router();

interface User {
    id: number;
    name: string;
}

const users: User[] = [
    { id: 1, prenom: "Lucas", nom: "Desbeek" },
    { id: 2, prenom: "Manon", nom: "Colard" },
];

router.get("/", userController.getAllUsers);

router.post('/', (req: Request, res: Response) => {
    if (!req.body) {
        return res.status(400).json({ error: "Body missing" });
    }

    const { prenom, nom } = req.body;

    const newUser: User = {
        id: users.length + 1,
        name: prenom + " " + nom
    };

    users.push(newUser);
    res.status(201).json(newUser);
});

router.delete('/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        users.splice(index, 1); 
        res.status(200).json({ message: "Utilisateur supprimé" });
    } else {
        res.status(404).json({ message: "Utilisateur non trouvé" });
    }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupère la liste des utilisateurs
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Succès
 */
router.get("/", userController.getAllUsers);

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
 *               prenom:
 *                 type: string
 *               nom:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *       400:
 *         description: Champs manquants
 */
router.post("/", userController.createUser);

router.delete("/:id", checkIdParam, userController.deleteUser);

export default router;

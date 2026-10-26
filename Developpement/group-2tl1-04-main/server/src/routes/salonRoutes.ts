import { Router } from 'express';
import Salon from '../models/Salon';

const router = Router();

router.get("/:nom", async (req, res) => {
  try {
    const salon = await Salon.findOne({
      where: { nom_salon: req.params.nom },
    });

    if (!salon) {
      return res.status(404).json({ exists: false });
    }

    res.json({ exists: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nom_salon } = req.body;
    const salon = await Salon.create({ nom_salon, statut_salon: "en attente" });
    res.status(201).json(salon);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
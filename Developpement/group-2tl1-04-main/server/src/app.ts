import express, { type Request, type Response } from "express";
import questionTypeRouter from "./routes/questionRoutes";
import authRoutes from "./routes/authRoutes";
import "./models/Utilisateur";
import "./models/associations";
import { errorHandler } from "./middlewares/errorHandler";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import cors from "cors";
import path from "path";

import "dotenv/config";
import { requestLogger } from "./middlewares/logger";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes";
import salonRoutes from "./routes/salonRoutes";

const app = express();

// ==========================================
// 1. MIDDLEWARES DE CONFIGURATION (Priorité Haute)
// ==========================================
app.use(cors({
  origin: "http://91.134.138.136:5173",
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(requestLogger);

// 🔥 Déplacé en haut : Pour voir ABSOLUMENT toutes les requêtes arrivant sur le serveur
app.use((req, res, next) => {
  console.log("👉 HIT SERVEUR :", req.method, req.url);
  next();
});

// CORS global pour les requêtes de pré-vérification OPTIONS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://91.134.138.136:5173");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// ==========================================
// 2. DOSSIERS STATIQUES & DOCUMENTATION
// ==========================================
app.use(express.static(path.join(__dirname, "../public")));
app.use('/uploads', express.static('uploads'));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ==========================================
// 3. ROUTES DE L'API
// ==========================================
app.use("/api/question", questionTypeRouter);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/salons", salonRoutes);

// Pour valider le mot de passe admin
app.post('/mdp', (req, res) => {
  const secret = req.body.password;
  if (secret === process.env.API_MDP) {
    return res.json({ success: true });
  }
  res.json({ success: false });
});

console.log("🚀 TOUTES LES ROUTES API ONT ÉTÉ CHARGÉES");

// ==========================================
// 4. GESTION DES 404 & FALLBACKS (Sécurité)
// ==========================================

// Route racine pour servir le HTML public
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// 🔥 SÉCURITÉ CRUCIALE : Si une route commence par /api mais n'existe pas,
// on renvoie un JSON 404 au lieu de renvoyer le fichier HTML par défaut !
app.use("/api", (req, res) => {
  console.log("❌ API 404 sur l'URL :", req.originalUrl);
  res.status(404).json({ error: `Route API introuvable : ${req.originalUrl}` });
});

// Middleware global de capture d'erreurs (TOUJOURS EN DERNIER)
app.use(errorHandler);

export default app;